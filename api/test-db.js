import { supabaseAdmin } from './_utils/supabase.js';
import { withCors } from './_utils/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Testing database connectivity...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (connectionError) {
      console.error('Connection error:', connectionError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: connectionError.message 
      });
    }

    console.log('Database connection successful');
    console.log('Available tables:', connectionTest?.map(t => t.table_name));

    // Test 2: Check if videos table exists and is accessible
    const { data: videosTest, error: videosError } = await supabaseAdmin
      .from('videos')
      .select('id')
      .limit(1);

    // Test 3: Check if clips table exists and is accessible
    const { data: clipsTest, error: clipsError } = await supabaseAdmin
      .from('clips')
      .select('id')
      .limit(1);

    // Test 4: Check environment variables
    const envTest = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
    };

    res.json({
      message: 'Database test completed',
      results: {
        connection: 'SUCCESS',
        tables: connectionTest?.map(t => t.table_name) || [],
        videos_table: {
          exists: !videosError,
          error: videosError?.message || null,
          accessible: !!videosTest
        },
        clips_table: {
          exists: !clipsError,
          error: clipsError?.message || null,
          accessible: !!clipsTest
        },
        environment: envTest
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    });
  }
}

export default withCors(handler); 