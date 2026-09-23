import { supabase } from '../services/supabase';

/**
 * Recovers any pending payment confirmations saved in localStorage.
 * This handles the case where Razorpay redirects the page before
 * the async handler can update the database.
 */
export const recoverPendingPayment = async () => {
  try {
    const stored = localStorage.getItem('pending_payment_confirmation');
    if (!stored) return;

    const { orderId, paymentId, timestamp } = JSON.parse(stored);
    
    // Only process if it was saved within the last 30 minutes
    if (Date.now() - timestamp > 30 * 60 * 1000) {
      localStorage.removeItem('pending_payment_confirmation');
      return;
    }

    console.log('[PaymentRecovery] Found pending payment confirmation, updating DB...');

    const { error } = await supabase
      .from('print_orders')
      .update({ 
        status: 'Paid', 
        payment_status: 'paid', 
        payment_method: `Online: ${paymentId}` 
      })
      .eq('id', orderId);

    if (error) {
      console.error('[PaymentRecovery] Failed to update:', error);
    } else {
      console.log('[PaymentRecovery] Successfully updated order', orderId);
    }

    localStorage.removeItem('pending_payment_confirmation');
  } catch (e) {
    console.error('[PaymentRecovery] Error:', e);
    localStorage.removeItem('pending_payment_confirmation');
  }
};

/**
 * Checks for print orders that are 'pending_payment' for more than 5 minutes
 * and marks them as 'cancelled' in the database.
 * Returns the updated array of orders.
 */
export const checkAndCancelStaleOrders = async (orders: any[]) => {
  // FIRST: recover any pending payment from localStorage
  await recoverPendingPayment();

  const now = new Date().getTime();
  const FIVE_MIN_MS = 5 * 60 * 1000;

  const staleOrderIds: string[] = [];

  // Re-fetch the orders after recovery to get updated statuses
  const { data: freshOrders } = await supabase
    .from('print_orders')
    .select('id, status')
    .in('id', orders.map(o => o.id));

  // Build a map of fresh statuses
  const freshStatusMap = new Map<string, string>();
  if (freshOrders) {
    freshOrders.forEach(o => freshStatusMap.set(o.id, o.status));
  }

  const updatedOrders = orders.map(order => {
    // Use the fresh status from DB if available
    const currentStatus = freshStatusMap.get(order.id) || order.status;
    order = { ...order, status: currentStatus };

    if (currentStatus === 'pending_payment') {
      const timeStr = order.created_at + (order.created_at.includes('Z') || order.created_at.includes('+') ? '' : 'Z');
      const orderTime = new Date(timeStr).getTime();
      if (now - orderTime > FIVE_MIN_MS) {
        staleOrderIds.push(order.id);
        return { ...order, status: 'cancelled' };
      }
    }
    return order;
  });

  if (staleOrderIds.length > 0) {
    supabase
      .from('print_orders')
      .update({ status: 'cancelled' })
      .in('id', staleOrderIds)
      .then(({ error }) => {
        if (error) console.error("Error auto-cancelling stale orders:", error);
      });
  }

  return updatedOrders;
};

/**
 * Fetches the staff approver name from the activity_log for a given order.
 */
export const fetchOrderApprover = async (filename: string): Promise<string | null> => {
  if (!filename) return null;
  const { data, error } = await supabase
    .from('activity_log')
    .select('actorName')
    .eq('action', 'Status Update')
    .eq('targetName', filename)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.actorName;
};
