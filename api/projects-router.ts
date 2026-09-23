// api/projects-router.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Service Role Key must be provided!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = (req.url || '').split('?')[0];
  const urlParts = url.split('/').filter(Boolean);
  const path = '/' + urlParts.slice(0, 2).join('/'); // /api/projects or /api/gallery

  // Robustly parse the request body in case the environment delivers it as a string
  let parsedBody = req.body;
  if (parsedBody && typeof parsedBody === 'string') {
    try { parsedBody = JSON.parse(parsedBody); } catch (e) {}
  } else if (Buffer.isBuffer(parsedBody)) {
    try { parsedBody = JSON.parse(parsedBody.toString('utf8')); } catch (e) {}
  }
  req.body = parsedBody || {};

  try {
    // 1. Projects (/api/projects)
    if (path === '/api/projects') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('lab_projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      if (req.method === 'POST' && urlParts.length === 2) {
        const body = { ...req.body };
        if (body.image && !body.image_url) body.image_url = body.image;
        const { data, error } = await supabase.from('lab_projects').insert(body).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    if (path === '/api/projects' && urlParts.length > 2) {
      const id = urlParts[2];
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('lab_projects').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'PUT') {
        const { data, error } = await supabase.from('lab_projects').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('lab_projects').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Deleted' });
      }
    }

    // 2. Gallery (/api/gallery)
    if (path === '/api/gallery') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      if (req.method === 'POST' && urlParts.length === 2) {
        const body = req.body;
        if (Array.isArray(body)) {
          console.log(`[Gallery] Bulk inserting ${body.length} items`);
          const { data, error } = await supabase.from('gallery').insert(body).select();
          if (error) throw error;
          return res.status(201).json(data);
        } else {
          const { data, error } = await supabase.from('gallery').insert(body).select().single();
          if (error) throw error;
          return res.status(201).json(data);
        }
      }
    }

    if (path === '/api/gallery' && urlParts.length > 2) {
      const id = urlParts[2];
      if (req.method === 'PUT') {
        const { data, error } = await supabase.from('gallery').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Deleted' });
      }
    }

    // 3. CMS Pages (/api/cms-pages)
    if (path === '/api/cms-pages') {
      if (req.method === 'GET') {
        const { name } = req.query;
        if (name) {
          const { data, error } = await supabase.from('cms_pages').select('content').eq('page_name', name).single();
          if (error && error.code !== 'PGRST116') throw error;
          return res.status(200).json(data || { content: {} });
        }
        const { data, error } = await supabase.from('cms_pages').select('*');
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      if (req.method === 'POST') {
        const { page_name, content, updated_by } = req.body;
        const { data, error } = await supabase.from('cms_pages').upsert(
          { page_name, content, updated_by, updated_at: new Date().toISOString() },
          { onConflict: 'page_name' }
        ).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    // 4. PDF Reviews (/api/pdf-reviews)
    if (path === '/api/pdf-reviews') {
      if (req.method === 'GET') {
        const { staffId, isAdmin } = req.query;
        let q = supabase.from('pdf_reviews').select('*').order('created_at', { ascending: false });
        if (isAdmin !== 'true' && staffId) {
          q = q.eq('uploaded_by', staffId);
        }
        const { data, error } = await supabase.from('pdf_reviews').select('*').order('created_at', { ascending: false });
        // Re-apply filter logic properly for the final query if needed, or just use variable 'q'
        const { data: finalData, error: finalError } = await q;
        if (finalError) throw finalError;
        return res.status(200).json(finalData || []);
      }
      if (req.method === 'POST') {
        const { data, error } = await supabase.from('pdf_reviews').insert(req.body).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    if (path === '/api/pdf-reviews' && urlParts.length > 2) {
      const id = urlParts[2];
      if (req.method === 'PUT') {
        const { data, error } = await supabase.from('pdf_reviews').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    // 5. Events (/api/events)
    if (path === '/api/events') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      if (req.method === 'POST' && urlParts.length === 2) {
        const body = { ...req.body };
        // Map banner_url to banner_image if it comes from the frontend, but don't send banner_url to DB
        if (body.banner_url) body.banner_image = body.banner_url;
        delete body.banner_url;
        
        if (!body.title) return res.status(400).json({ error: 'Title is required' });
        
        const { data, error } = await supabase.from('events').insert(body).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    if (path === '/api/events' && urlParts.length > 2) {
      const id = urlParts[2];

      // POST /api/events/register
      if (id === 'register' && req.method === 'POST') {
        const { event_id, ...regData } = req.body;
        console.log(`[Events] Registering user ${regData.user_id} for event ${event_id}`);
        
        try {
          const { data, error: regError } = await supabase
            .from('event_registrations')
            .insert({ event_id, ...regData })
            .select()
            .single();

          if (regError) {
            console.error(`[Events] Registration insert error:`, regError);
            return res.status(400).json({ error: regError.message });
          }

          // Increment registered count
          const { error: updateError } = await supabase.rpc('increment_event_registration', { event_id_param: event_id });
          
          if (updateError) {
            console.warn(`[Events] Could not increment count via RPC, falling back to manual:`, updateError);
            const { data: event } = await supabase.from('events').select('registered_count').eq('id', event_id).single();
            await supabase.from('events').update({ registered_count: (event?.registered_count || 0) + 1 }).eq('id', event_id);
          }

          return res.status(201).json(data);
        } catch (err: any) {
          console.error(`[Events] Unexpected registration error:`, err);
          return res.status(500).json({ error: 'Internal Server Error', details: err.message });
        }
      }

      // GET /api/events/:id/registrations
      if (urlParts.length === 4 && urlParts[3] === 'registrations') {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (req.method === 'GET') {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'PUT') {
        const body = { ...req.body };
        // Map banner_url to banner_image if it comes from the frontend, but don't send banner_url to DB
        if (body.banner_url) body.banner_image = body.banner_url;
        delete body.banner_url;

        const { data, error } = await supabase.from('events').update(body).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Deleted' });
      }
    }

    return res.status(404).json({ error: 'Not Found', url, path });
  } catch (err: any) {
    console.error('Projects-Router error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
