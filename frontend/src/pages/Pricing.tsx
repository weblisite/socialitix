import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  SparklesIcon,
  CreditCardIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

interface Usage {
  period: string;
  videosUploaded: number;
  clipsCreated: number;
  storageUsed: number;
  limits: {
    videosPerMonth: number;
    clipsPerVideo: number;
    maxVideoLength: number;
    exportQuality: string;
  };
}

export function Pricing() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  // Fetch plans and subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available plans
        const plansResponse = await fetch('/api/subscriptions/plans');
        const plansData = await plansResponse.json();
        setPlans(plansData.plans || []);

        // Fetch current subscription if authenticated
        if (isAuthenticated) {
          const [subscriptionResponse, usageResponse] = await Promise.all([
            fetch('/api/subscriptions/current', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch('/api/subscriptions/usage', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
          ]);

          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            setCurrentSubscription(subscriptionData.subscription);
          }

          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            setUsage(usageData.usage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleUpgrade = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login?redirect=pricing';
      return;
    }

    setProcessingPlan(planId);
    
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.floor(monthlyPrice * 12 * 0.8); // 20% discount for yearly
  };

  const getCurrentPlanId = () => {
    return currentSubscription?.planId || 'free';
  };

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlanId() === planId;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Plan</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Transform your long-form videos into viral clips with AI-powered insights. 
            Start free, upgrade when you're ready to scale.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingInterval === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingInterval === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Yearly
            </span>
            {billingInterval === 'yearly' && (
              <span className="ml-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Current Usage (if authenticated) */}
        {isAuthenticated && usage && (
          <div className="bg-slate-800 rounded-xl p-6 mb-12">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-500" />
              Current Usage ({usage.period})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {usage.videosUploaded}
                  {usage.limits.videosPerMonth !== -1 && (
                    <span className="text-slate-400 text-base">/{usage.limits.videosPerMonth}</span>
                  )}
                </div>
                <div className="text-sm text-slate-400 mb-2">Videos Uploaded</div>
                {usage.limits.videosPerMonth !== -1 && (
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(usage.videosUploaded, usage.limits.videosPerMonth) >= 90 
                          ? 'bg-red-500' 
                          : getUsagePercentage(usage.videosUploaded, usage.limits.videosPerMonth) >= 75 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${getUsagePercentage(usage.videosUploaded, usage.limits.videosPerMonth)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{usage.clipsCreated}</div>
                <div className="text-sm text-slate-400 mb-2">Clips Created</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{usage.storageUsed.toFixed(1)} GB</div>
                <div className="text-sm text-slate-400 mb-2">Storage Used</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>

            {usage.limits.videosPerMonth !== -1 && 
             getUsagePercentage(usage.videosUploaded, usage.limits.videosPerMonth) >= 90 && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-300">
                  You're approaching your monthly video limit. Consider upgrading to continue uploading.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0</div>
              <p className="text-slate-400">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">3 videos per month</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">2 clips per video</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Basic AI analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">720p export quality</span>
              </li>
              <li className="flex items-center gap-3">
                <XMarkIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span className="text-sm text-slate-500">Custom branding</span>
              </li>
            </ul>

            <button
              disabled={isCurrentPlan('free')}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                isCurrentPlan('free')
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {isCurrentPlan('free') ? 'Current Plan' : 'Get Started Free'}
            </button>
          </div>

          {/* Paid Plans */}
          {plans.map((plan) => {
            const isPopular = plan.id === 'pro-monthly';
            const price = billingInterval === 'yearly' ? getYearlyPrice(plan.price) : plan.price;
            const displayPrice = billingInterval === 'yearly' ? Math.floor(price / 12) : price;
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 ${
                  isPopular
                    ? 'bg-gradient-to-b from-purple-900/50 to-slate-800 border-2 border-purple-500'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    ${displayPrice}
                    <span className="text-lg text-slate-400 font-normal">/mo</span>
                  </div>
                  {billingInterval === 'yearly' && (
                    <div className="text-sm text-green-400 mb-2">
                      ${price}/year (save ${plan.price * 12 - price})
                    </div>
                  )}
                  <p className="text-slate-400">
                    {plan.name === 'Basic' && 'Great for individuals'}
                    {plan.name === 'Pro' && 'Perfect for creators'}
                    {plan.name === 'Enterprise' && 'For teams & agencies'}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan(plan.id) || processingPlan === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrentPlan(plan.id)
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : processingPlan === plan.id
                      ? 'bg-purple-600 text-white cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {processingPlan === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : isCurrentPlan(plan.id) ? (
                    'Current Plan'
                  ) : (
                    <>
                      Upgrade Now
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Can I change my plan anytime?</h3>
              <p className="text-slate-400">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">What payment methods do you accept?</h3>
              <p className="text-slate-400">
                We accept all major credit cards, PayPal, and other payment methods through our secure payment processor Polar.sh.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Is there a free trial?</h3>
              <p className="text-slate-400">
                Yes! Our free plan lets you try Socialitix with 3 videos per month. 
                No credit card required to get started.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">What happens to my videos if I cancel?</h3>
              <p className="text-slate-400">
                Your videos and clips remain accessible for 30 days after cancellation. 
                You can download them or reactivate your subscription during this period.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Do you offer refunds?</h3>
              <p className="text-slate-400">
                We offer a 14-day money-back guarantee for all paid plans. 
                Contact our support team if you're not satisfied.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-12 border border-purple-500/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Viral Content?</h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using AI to transform their videos into viral clips.
            </p>
            <button
              onClick={() => handleUpgrade('pro-monthly')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <CreditCardIcon className="w-5 h-5" />
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 