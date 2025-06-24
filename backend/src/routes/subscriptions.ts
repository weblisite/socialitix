import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2024-06-20'
});

// Subscription tiers configuration
const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      videosPerMonth: 5,
      maxVideoSize: 100 * 1024 * 1024, // 100MB
      maxVideoDuration: 300, // 5 minutes
      clipsPerVideo: 3,
      aiAnalysis: true,
      priority: 'low'
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1999, // $19.99 in cents
    priceId: 'price_pro_monthly',
    limits: {
      videosPerMonth: 50,
      maxVideoSize: 500 * 1024 * 1024, // 500MB
      maxVideoDuration: 1800, // 30 minutes
      clipsPerVideo: 10,
      aiAnalysis: true,
      priority: 'normal',
      advancedFeatures: true
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999, // $49.99 in cents
    priceId: 'price_enterprise_monthly',
    limits: {
      videosPerMonth: -1, // unlimited
      maxVideoSize: 2 * 1024 * 1024 * 1024, // 2GB
      maxVideoDuration: 7200, // 2 hours
      clipsPerVideo: -1, // unlimited
      aiAnalysis: true,
      priority: 'high',
      advancedFeatures: true,
      customBranding: true,
      apiAccess: true
    }
  }
};

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Get subscription tiers
router.get('/tiers', async (req, res) => {
  try {
    res.json({
      tiers: Object.values(SUBSCRIPTION_TIERS).map(tier => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        limits: tier.limits,
        features: {
          videosPerMonth: tier.limits.videosPerMonth === -1 ? 'Unlimited' : tier.limits.videosPerMonth,
          maxVideoSize: `${Math.round(tier.limits.maxVideoSize / (1024 * 1024))}MB`,
          maxVideoDuration: `${Math.round(tier.limits.maxVideoDuration / 60)} minutes`,
          clipsPerVideo: tier.limits.clipsPerVideo === -1 ? 'Unlimited' : tier.limits.clipsPerVideo,
          aiAnalysis: tier.limits.aiAnalysis,
          advancedFeatures: tier.limits.advancedFeatures || false,
          customBranding: tier.limits.customBranding || false,
          apiAccess: tier.limits.apiAccess || false
        }
      }))
    });
  } catch (error) {
    logger.error('Failed to fetch subscription tiers:', error);
    res.status(500).json({ error: 'Failed to fetch subscription tiers' });
  }
});

// Get user's current subscription
router.get('/current', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's subscription from database
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error('Failed to fetch user subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    const currentTier = subscription?.tier || 'free';
    const tierConfig = SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS];

    // Get usage statistics
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, created_at, file_size, duration')
      .eq('user_id', userId);

    if (videosError) {
      logger.error('Failed to fetch user videos for usage:', videosError);
    }

    // Calculate current month usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyVideos = videos?.filter(video => 
      new Date(video.created_at) >= currentMonth
    ) || [];

    const usage = {
      videosThisMonth: monthlyVideos.length,
      totalStorageUsed: videos?.reduce((sum, video) => sum + (video.file_size || 0), 0) || 0
    };

    res.json({
      subscription: {
        tier: currentTier,
        status: subscription?.status || 'active',
        currentPeriodEnd: subscription?.current_period_end,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
        stripeSubscriptionId: subscription?.stripe_subscription_id
      },
      limits: tierConfig.limits,
      usage,
      isWithinLimits: {
        videos: tierConfig.limits.videosPerMonth === -1 || usage.videosThisMonth < tierConfig.limits.videosPerMonth,
        storage: usage.totalStorageUsed < tierConfig.limits.maxVideoSize * 10 // Allow 10x storage buffer
      }
    });

  } catch (error) {
    logger.error('Failed to fetch current subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create checkout session for subscription
router.post('/checkout', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { tier } = req.body;

    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    if (tier === 'free') {
      return res.status(400).json({ error: 'Cannot checkout for free tier' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        userId,
        tier
      },
      subscription_data: {
        metadata: {
          userId,
          tier
        }
      }
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    logger.error('Failed to create checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle Stripe webhooks
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    logger.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler error' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel at period end in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update database
    await supabase
      .from('user_subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', userId);

    res.json({ 
      success: true, 
      message: 'Subscription will be cancelled at the end of the current period' 
    });

  } catch (error) {
    logger.error('Failed to cancel subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook handlers
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    logger.error('Missing metadata in checkout session');
    return;
  }

  // Get the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // Save subscription to database
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      tier,
      status: subscription.status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    });

  logger.info('Subscription created:', { userId, tier, subscriptionId: subscription.id });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    logger.error('Missing userId in subscription metadata');
    return;
  }

  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id);

  logger.info('Subscription updated:', { userId, subscriptionId: subscription.id });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      tier: 'free'
    })
    .eq('stripe_subscription_id', subscription.id);

  logger.info('Subscription deleted:', { subscriptionId: subscription.id });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info('Payment succeeded:', { invoiceId: invoice.id });
  // Could update payment history, send confirmation emails, etc.
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  logger.error('Payment failed:', { invoiceId: invoice.id });
  // Could send payment failure notifications, retry logic, etc.
}

// Utility function to check if user can perform action based on limits
export async function checkUserLimits(userId: string, action: 'upload' | 'clip' | 'analyze', metadata?: any) {
  try {
    // Get user's subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();

    const tier = subscription?.tier || 'free';
    const limits = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS].limits;

    switch (action) {
      case 'upload':
        // Check monthly video limit
        if (limits.videosPerMonth !== -1) {
          const currentMonth = new Date();
          currentMonth.setDate(1);
          currentMonth.setHours(0, 0, 0, 0);

          const { data: monthlyVideos } = await supabase
            .from('videos')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', currentMonth.toISOString());

          if (monthlyVideos && monthlyVideos.length >= limits.videosPerMonth) {
            return { allowed: false, reason: 'Monthly video limit exceeded' };
          }
        }

        // Check file size limit
        if (metadata?.fileSize && metadata.fileSize > limits.maxVideoSize) {
          return { allowed: false, reason: 'File size exceeds limit' };
        }

        // Check duration limit
        if (metadata?.duration && metadata.duration > limits.maxVideoDuration) {
          return { allowed: false, reason: 'Video duration exceeds limit' };
        }

        break;

      case 'clip':
        // Check clips per video limit
        if (limits.clipsPerVideo !== -1 && metadata?.existingClips >= limits.clipsPerVideo) {
          return { allowed: false, reason: 'Clips per video limit exceeded' };
        }
        break;

      case 'analyze':
        if (!limits.aiAnalysis) {
          return { allowed: false, reason: 'AI analysis not available in this tier' };
        }
        break;
    }

    return { allowed: true };

  } catch (error) {
    logger.error('Error checking user limits:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
}

export default router;
