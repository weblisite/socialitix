const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Authentication helper
async function authenticateUser(event) {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader) {
      // For development, return a default user
      if (process.env.NODE_ENV === 'development') {
        return { userId: 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61' };
      }
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Try Supabase auth first
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user && !error) {
      return { userId: user.id };
    }

    // Fallback to JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      const decoded = jwt.verify(token, jwtSecret);
      return { userId: decoded.userId || decoded.sub };
    }

    return null;
  } catch (error) {
    console.error('Auth error:', error);
    // For development, return a default user
    if (process.env.NODE_ENV === 'development') {
      return { userId: 'eb5f1e41-b42a-48d0-9bda-05e8be30ae61' };
    }
    return null;
  }
}

// Response helpers
function successResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      data
    })
  };
}

function errorResponse(message, statusCode = 400) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  };
}

// CORS helpers
function handleCors(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }
  return null;
}

function addCorsHeaders(response) {
  return {
    ...response,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    }
  };
}

module.exports = {
  supabase,
  authenticateUser,
  successResponse,
  errorResponse,
  handleCors,
  addCorsHeaders
}; 