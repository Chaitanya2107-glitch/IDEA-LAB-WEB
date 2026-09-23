import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const path = req.url?.split('?')[0];
    console.log(`[AuthHelper] ${req.method} ${path}`);

    let parsedBody = req.body;
    if (parsedBody && typeof parsedBody === 'string') {
      try { parsedBody = JSON.parse(parsedBody); } catch (e) {}
    } else if (Buffer.isBuffer(parsedBody)) {
      try { parsedBody = JSON.parse(parsedBody.toString('utf8')); } catch (e) {}
    }
    req.body = parsedBody || {};

    // 1. Sync User Handler (/api/auth/sync)
    if (path?.endsWith('/sync') && req.method === 'POST') {
      const { uid, email, name, avatar, role } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ error: "Missing uid or email" });
      }

      // Check if this email belongs to a staff member
      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .single();

      if (staff) {
        // If they are staff, they MUST be verified
        if (staff.is_verified === false) {
           return res.status(403).json({ 
             error: "Account pending approval", 
             message: "Your staff account has not been verified by an administrator yet." 
           });
        }
        
        // Update staff firebase_uid if not set
        if (staff.firebase_uid !== uid) {
          await supabase.from('staff').update({ firebase_uid: uid }).eq('id', staff.id);
        }

        // Create JWT for staff
        const token = jwt.sign({ uid, email, role: 'staff' }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({ token, staff });
      }

      // If not staff, proceed as regular user
      // Upsert into public.users
      const { data: user, error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: uid,
          email,
          name: name || email.split('@')[0],
          avatar,
          role: role || 'USER',
          tenant_id: 'reva-idea-lab', // default
          is_profile_complete: true
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Create JWT
      const token = jwt.sign({ uid, email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({ token, user });
    }

    // 2. Sync Staff Handler (/api/auth/staff-sync)
    if (path?.endsWith('/staff-sync') && req.method === 'POST') {
      const { uid, email } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ error: "Missing uid or email" });
      }

      // Find staff by email
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .single();

      if (staffError || !staff) {
        return res.status(404).json({ error: "Staff profile not found for this email" });
      }

      // Check if staff is verified
      if (staff.is_verified === false) {
        return res.status(403).json({ 
          error: "Account pending approval", 
          message: "Your staff account has not been verified by an administrator yet." 
        });
      }

      // Update firebase_uid
      await supabase
        .from('staff')
        .update({ firebase_uid: uid })
        .eq('email', email);

      // Create JWT
      const token = jwt.sign({ uid, email, role: 'staff' }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({ token, staff });
    }

    // 3. Update Staff Verification Handler
    if (path?.match(/\/api\/staff\/[^\/]+\/verify/) && req.method === 'PUT') {
      const id = path.split('/')[3];
      const { is_verified } = req.body;

      const { data, error } = await supabase
        .from('staff')
        .update({ is_verified })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // 4. Get User Profile Handler (/api/user/me)
    if (path?.endsWith('/me') && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Try fetching as user
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.uid)
        .single();

      if (user) return res.status(200).json({ user });

      // Try fetching as staff
      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('firebase_uid', decoded.uid)
        .single();

      if (staff) {
        // If staff is suddenly unverified (e.g. revoked), block them
        if (staff.is_verified === false) {
           return res.status(403).json({ error: "Account verification revoked" });
        }
        return res.status(200).json({ staff });
      }

      return res.status(404).json({ error: "User not found" });
    }

    return res.status(404).json({ error: "Not Found", path });
  } catch (err: any) {
    console.error("Auth helper error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
