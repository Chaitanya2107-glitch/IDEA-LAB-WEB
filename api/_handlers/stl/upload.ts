// api/_handlers/stl/upload.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This is a backend processing handler
  // For now, let's keep it simple and just provide a success message or handle specialized uploads if needed.
  // The frontend currently uploads directly to Supabase storage.
  
  if (req.method === 'POST') {
    return res.status(200).json({ message: 'STL processing endpoint active' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
