// api/lab-router.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Helper to map camelCase (frontend) to snake_case (DB) */
function mapPayload(body: any) {
  const mapping: Record<string, string> = {
    totalQuantity: 'total_quantity',
    availableQuantity: 'available_quantity',
    costPerUnit: 'cost_per_unit',
    image_url: 'image_url',
    is_rentable: 'is_rentable',
    asset_id: 'asset_id',
    specification: 'specification',
    brand: 'brand',
    location: 'location',
    status: 'status',
    billNumber: 'bill_number',
    purchaseOrder: 'purchase_order',
    purchaseDate: 'purchase_date',
    invoiceUrl: 'invoice_url',
    bookingDate: 'date',
    startTime: 'start_time',
    endTime: 'end_time',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  const newBody = { ...body };
  
  // Attach hardcoded tenant_id if missing
  if (!newBody.tenant_id) {
    newBody.tenant_id = 'reva-idea-lab';
  }

  // If sessionType exists but no DB column, prepend it to purpose
  if (body.sessionType && body.purpose) {
    newBody.purpose = `[${body.sessionType}] ${body.purpose}`;
    delete newBody.sessionType;
  }

  // Normalize: Convert all empty strings to null for DB compatibility
  for (const key in newBody) {
    if (newBody[key] === '') {
      newBody[key] = null;
    }
  }

  for (const [camel, snake] of Object.entries(mapping)) {
    if (body[camel] !== undefined) {
      newBody[snake] = body[camel] === '' ? null : body[camel];
      if (camel !== snake) delete newBody[camel];
    }
  }

  // Ensure numeric types (only if not null)
  if (newBody.total_quantity !== null && newBody.total_quantity !== undefined) newBody.total_quantity = Number(newBody.total_quantity);
  if (newBody.available_quantity !== null && newBody.available_quantity !== undefined) newBody.available_quantity = Number(newBody.available_quantity);
  if (newBody.cost_per_unit !== null && newBody.cost_per_unit !== undefined) newBody.cost_per_unit = Number(newBody.cost_per_unit);
  if (newBody.attendees !== null && newBody.attendees !== undefined) newBody.attendees = Number(newBody.attendees);
  
  return newBody;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url?.split('?')[0];
  const urlParts = path?.split('/') || [];
  
  let parsedBody = req.body;
  if (parsedBody && typeof parsedBody === 'string') {
    try { parsedBody = JSON.parse(parsedBody); } catch (e) {}
  } else if (Buffer.isBuffer(parsedBody)) {
    try { parsedBody = JSON.parse(parsedBody.toString('utf8')); } catch (e) {}
  }
  req.body = parsedBody || {};
  
  try {
    // 1. Inventory GET/POST (/api/inventory)
    if (path === '/api/inventory' || path === '/api/inventory/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('inventory').select('*').order('name');
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const payload = mapPayload(req.body);
        const { data, error } = await supabase.from('inventory').insert(payload).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    // 2. Inventory PUT/DELETE/BATCH-DELETE
    if (path === '/api/inventory/batch-delete' && req.method === 'DELETE') {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'IDs array required' });
      }
      const { error } = await supabase.from('inventory').delete().in('id', ids);
      if (error) throw error;
      return res.status(200).json({ message: `Deleted ${ids.length} items` });
    }

    if (path?.startsWith('/api/inventory/') && urlParts.length > 3) {
      const id = urlParts[3];
      if (req.method === 'PUT') {
        const payload = mapPayload(req.body);
        const { data, error } = await supabase.from('inventory').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Deleted' });
      }
    }

    // 3. Slots (/api/slots)
    if (path === '/api/slots' || path === '/api/slots/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('slot_bookings').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const payload = mapPayload(req.body);
        const { data, error } = await supabase.from('slot_bookings').insert(payload).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      if (req.method === 'PUT') {
        const { id } = req.query;
        const { data, error } = await supabase.from('slot_bookings').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    if (path?.endsWith('/slots/blocked')) {
      const { data, error } = await supabase.from('blocked_dates').select('date');
      if (error) throw error;
      return res.status(200).json(data.map(d => d.date));
    }

    // 4. Indents (/api/indents)
    if (path === '/api/indents' || path === '/api/indents/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('indents').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const body = { ...req.body, tenant_id: 'reva-idea-lab' };
        const { data, error } = await supabase.from('indents').insert(body).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    // 5. Notifications (/api/notifications)
    if (path === '/api/notifications' || path === '/api/notifications/') {
      const { data, error } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // 6. Machine Usage Stats (/api/stats/machine-usage)
    if (path?.endsWith('/stats/machine-usage')) {
      const { data, error } = await supabase.from('machine_usage').select('*');
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // 7. Users Management (/api/users)
    if (path === '/api/users' || path === '/api/users/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('users').select('*').order('name');
        if (error) throw error;
        return res.status(200).json(data);
      }
    }
    if (path?.startsWith('/api/users/') && urlParts.length > 3) {
      const id = urlParts[3];
      if (req.method === 'PUT') {
        const { data, error } = await supabase.from('users').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'User removed' });
      }
    }

    // 8. Staff Management (/api/staff)
    if (path === '/api/staff' || path === '/api/staff/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('staff').select('*').order('name');
        if (error) throw error;
        return res.status(200).json(data);
      }
    }
    // Profile update for current staff
    if (path === '/api/staff/profile' && req.method === 'PUT') {
      const { id, ...updates } = req.body;
      const { data, error } = await supabase.from('staff').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (path?.startsWith('/api/staff/') && urlParts.length > 3) {
      const id = urlParts[3];
      if (req.method === 'PUT') {
        const { data, error } = await supabase.from('staff').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('staff').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Staff removed' });
      }
    }

    // 9. History Logs (/api/history)
    if (path === '/api/history' || path === '/api/history/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('history_logs').select('*').order('timestamp', { ascending: false }).limit(100);
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const { data, error } = await supabase.from('history_logs').insert(req.body).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    // 10. CMS Pages (/api/cms-pages)
    if (path === '/api/cms-pages' || path === '/api/cms-pages/') {
      if (req.method === 'GET') {
        const name = req.query.name;
        const { data, error } = await supabase.from('cms_pages').select('*').eq('page_name', name).single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json(data || { page_name: name, content: {} });
      }
      if (req.method === 'POST') {
        const { page_name, content, updated_by } = req.body;
        const { data, error } = await supabase.from('cms_pages').upsert({ page_name, content, updated_by, updated_at: new Date().toISOString() }).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    // 11. Gallery (/api/gallery)
    if (path === '/api/gallery' || path === '/api/gallery/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const { data, error } = await supabase.from('gallery').insert(req.body).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }
    if (path?.startsWith('/api/gallery/') && urlParts.length > 3) {
      const id = urlParts[3];
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

    return res.status(404).json({ error: 'Not Found', path });
  } catch (err: any) {
    console.error('Lab-Router error:', err);
    return res.status(500).json({ 
      error: err.message || 'Internal server error', 
      details: err,
      hint: 'Ensure all required columns (inventory: brand, asset_id, specification, total_quantity, location, status) exist in Supabase.'
    });
  }
}
