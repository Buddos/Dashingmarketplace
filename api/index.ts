import { handler as netlifyHandler } from "../netlify/functions/api";

export default async function handler(req: any, res: any) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Construct Netlify-style event
  const event = {
    path: req.url,
    httpMethod: req.method,
    headers: req.headers,
    queryStringParameters: req.query,
    body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : null,
  };

  try {
    const result = await netlifyHandler(event as any, {} as any);
    
    // Set headers from result
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
    }

    res.status(result.statusCode).send(result.body);
  } catch (error: any) {
    console.error("Vercel adapter error:", error);
    res.status(500).json({ error: error.message });
  }
}
