// api/auth-heavy.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

// Initialize Firebase Admin (Singleton-ish)
if (!admin.apps.length) {
  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (rawKey) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(rawKey);
      } catch(e) {
        // Handle cases where the key might have real newlines from .env parsing instead of escaped ones
        const cleanedKey = rawKey.replace(/\n/g, '\\n');
        serviceAccount = JSON.parse(cleanedKey);
      }
      
      if (serviceAccount.project_id) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully');
      }
    } else {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY is missing');
    }
  } catch (err) {
    console.error('Firebase Admin Init Error:', err);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url?.split('?')[0];

  let parsedBody = req.body;
  if (parsedBody && typeof parsedBody === 'string') {
    try { parsedBody = JSON.parse(parsedBody); } catch (e) {}
  } else if (Buffer.isBuffer(parsedBody)) {
    try { parsedBody = JSON.parse(parsedBody.toString('utf8')); } catch (e) {}
  }
  req.body = parsedBody || {};

  try {
    // 1. Create Staff (/api/auth/create-staff)
    if (path?.endsWith('/create-staff') && req.method === 'POST') {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!admin.apps.length) {
        return res.status(500).json({ error: 'Firebase Admin not configured' });
      }

      // Create in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      // Create in Supabase public.staff
      const { data: staff, error: pgError } = await supabase
        .from('staff')
        .insert({
          id: crypto.randomUUID(), // Assuming UUID
          firebase_uid: userRecord.uid,
          name,
          email,
          role: role.toLowerCase(),
          tenant_id: 'reva-idea-lab'
        })
        .select()
        .single();

      if (pgError) {
        // Rollback Firebase user if DB insert fails
        await admin.auth().deleteUser(userRecord.uid);
        throw pgError;
      }

      return res.status(201).json({ message: 'Staff created successfully', staff });
    }

    return res.status(404).json({ error: 'Not Found', path });
  } catch (err: any) {
    console.error('Auth-Heavy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
