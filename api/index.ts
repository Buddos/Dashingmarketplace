import { VercelRequest, VercelResponse } from "@vercel/node";
import { handler as netlifyHandler } from "./_handler";

export default async function (req: VercelRequest, res: VercelResponse) {
  // Convert Vercel request to Netlify-like event
  const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
  
  const event = {
    httpMethod: req.method || "GET",
    path: url.pathname,
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: req.headers as Record<string, string>,
    body: (req.method === 'GET' || req.method === 'DELETE') ? null : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})),
  };

  try {
    console.log(`[Vercel] ${req.method} ${event.path}`);
    const result = await netlifyHandler(event as any, {} as any);
    console.log(`[Vercel] Handler response: ${result.statusCode}`);
    
    // Set headers from result
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
    }

    res.status(result.statusCode).send(result.body);
  } catch (error: any) {
    console.error("[Vercel] Adapter crashed:", error);
    res.status(500).json({ error: error.message });
  }
}
