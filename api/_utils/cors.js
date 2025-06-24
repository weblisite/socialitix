export function setCorsHeaders(res, req) {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://socialitix.vercel.app', 'https://www.socialitix.com', 'https://socialitix.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  return res;
}

export function withCors(handler) {
  return async (req, res) => {
    setCorsHeaders(res, req);
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return handler(req, res);
  };
} 