import {
  User,
  StaffUser,
  SlotBooking,
  StaffRequest,
  Notification,
  PcbOrder,
  PrintOrder,
  Indent,
  InventoryItem,
  HistoryLog,
  Event,
  Project,
} from "../../types";

const TOKEN_KEY = "token";

/* -------------------- Helpers -------------------- */
const json = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }
  return res.json();
};

const authHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ==================================================
   AUTH SERVICE
   ================================================== */
export const authService = {
  /* ================= USER (Google) ================= */

  async syncUser(payload: { uid: string, email: string, name: string, avatar: string | null, role: string }): Promise<User> {
    const res = await fetch(`/api/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await json(res);
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.user;
  },

  async signInWithMicrosoft() {
    const { supabase } = await import("./supabase");
    return supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'openid profile email',
        redirectTo: window.location.origin
      }
    });
  },

  /* ================= STAFF (Credentials via Firebase now) ================= */

  async loginStaffService(uid: string, email: string): Promise<StaffUser> {
    const res = await fetch(`/api/auth/staff-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email }),
    });

    const data = await json(res);
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.staff;
  },

  /* ================= SESSION ================= */

  async getCurrentSession(supabase: any): Promise<{
    user: User | null;
    staff: StaffUser | null;
  }> {
    try {
      let token = localStorage.getItem(TOKEN_KEY);
      
      // If no token in local storage, check for Supabase session
      if (!token && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Sync Supabase user with backend to get a local token
          const data = await this.syncUser({
            uid: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || "User",
            avatar: session.user.user_metadata.avatar_url || null,
            role: "USER"
          }) as any;

          if (data.staff) {
            return { user: null, staff: data.staff };
          }
          return { user: data.user || data, staff: null };
        }
      }

      if (!token) return { user: null, staff: null };

      const res = await fetch(`/api/user/me`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        return { user: null, staff: null };
      }

      const data = await json(res);

      if (data.staff) {
        return { user: null, staff: data.staff };
      }

      return { user: data.user, staff: null };
    } catch {
      return { user: null, staff: null };
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  /* ================= PROFILES ================= */

  async updateProfile(payload: User): Promise<User> {
    const res = await fetch(`/api/user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await json(res);
    return data.user ?? data;
  },

  async updateStaffProfile(payload: StaffUser): Promise<StaffUser> {
    const res = await fetch(`/api/staff/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await json(res);
    return data.user ?? data;
  },

  /* ================= INVENTORY ================= */

  async getInventory(): Promise<InventoryItem[]> {
    const res = await fetch(`/api/inventory`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= GALLERY ================= */

  async getGalleryItems(): Promise<any[]> {
    const res = await fetch(`/api/gallery`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async addGalleryItem(data: any): Promise<any> {
    const res = await fetch(`/api/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async updateGalleryItem(id: string, data: any): Promise<any> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete gallery item");
  },

  /* ================= STAFF REQUESTS ================= */

  async getStaffRequests(): Promise<StaffRequest[]> {
    const res = await fetch(`/api/staff/requests`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= SLOT BOOKINGS ================= */

  async getSlotRequests(): Promise<SlotBooking[]> {
    const res = await fetch(`/api/slots`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= USER HISTORY ================= */

  async getUserHistory() {
    const res = await fetch(`/api/user/history`, {
      headers: authHeaders(),
    });
    const data = await json(res);
    return data.history;
  },

  /* ================= USERS & STAFF MANAGEMENT ================= */

  async getUsers(): Promise<User[]> {
    const res = await fetch(`/api/users`, { headers: authHeaders() });
    return json(res);
  },

  async getStaff(): Promise<StaffUser[]> {
    const res = await fetch(`/api/staff`, { headers: authHeaders() });
    return json(res);
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ role }),
    });
    return json(res);
  },

  async updateStaffRole(id: string, role: string): Promise<StaffUser> {
    const res = await fetch(`/api/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ role }),
    });
    return json(res);
  },

  async updateStaffVerification(id: string, is_verified: boolean): Promise<StaffUser> {
    const res = await fetch(`/api/staff/${id}/verify`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ is_verified }),
    });
    return json(res);
  },

  async deleteUser(id: string): Promise<void> {
    await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  async deleteStaff(id: string): Promise<void> {
    await fetch(`/api/staff/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  async logActivity(action: string, actor: StaffUser, details?: string, target?: { type: string, id: string, name: string }): Promise<void> {
    await fetch(`/api/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        actor_id: actor.id,
        actor_name: actor.name,
        action,
        details,
        target_type: target?.type,
        target_id: target?.id,
        target_name: target?.name,
        timestamp: new Date().toISOString()
      }),
    });
  },

  /* ================= PCB ================= */

  async getPcbOrders(): Promise<PcbOrder[]> {
    const res = await fetch(`/api/pcb-orders`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= INDENTS ================= */

  async getIndents(): Promise<Indent[]> {
    const res = await fetch(`/api/indents`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= PROJECTS ================= */

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`/api/projects`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async addProject(data: any): Promise<Project> {
    const res = await fetch(`/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async updateProject(id: string, data: any): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete project");
  },

  /* ================= STAFF HISTORY ================= */

  async getHistory(): Promise<HistoryLog[]> {
    const res = await fetch(`/api/history`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= USER PRINT ORDERS ================= */

  async getPrintOrders(): Promise<PrintOrder[]> {
    const res = await fetch(`/api/print-orders`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= STAFF PRINT ORDERS ================= */

  async getStaffPrintOrders() {
    const res = await fetch(`/api/staff/print-orders`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async downloadPrintOrderStl(orderId: string): Promise<string> {
    const res = await fetch(
      `/api/staff/print-orders/${orderId}/download`,
      {
        headers: authHeaders(),
      }
    );

    const data = await json(res);
    return data.url; // signed URL
  },

  /* ================= NOTIFICATIONS ================= */

  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`/api/notifications`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= CMS PAGES ================= */

  async getCMSPage(name: string): Promise<any> {
    const res = await fetch(`/api/cms-pages?name=${name}`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async updateCMSPage(page_name: string, content: any, updated_by: string): Promise<any> {
    const res = await fetch(`/api/cms-pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ page_name, content, updated_by }),
    });
    return json(res);
  },

  /* ================= PDF REVIEWS ================= */

  async getPDFReviews(staffId?: string, isAdmin?: boolean): Promise<any[]> {
    const res = await fetch(`/api/pdf-reviews?staffId=${staffId || ''}&isAdmin=${isAdmin || false}`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async submitPDFReview(data: any): Promise<any> {
    const res = await fetch(`/api/pdf-reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async updatePDFReviewStatus(id: string, status: string, notes?: string): Promise<any> {
    const res = await fetch(`/api/pdf-reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status, admin_notes: notes, reviewed_at: new Date().toISOString() }),
    });
    return json(res);
  },

  async createIndent(data: Partial<Indent>): Promise<Indent> {
    const res = await fetch(`/api/indents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async getEventById(id: string): Promise<Event> {
    const res = await fetch(`/api/events/${id}`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async getBlockedDates(): Promise<Date[]> {
    const res = await fetch(`/api/slots/blocked`, {
      headers: authHeaders(),
    });
    const dates: string[] = await json(res);
    return dates.map((d) => new Date(d));
  },

  async createSlotRequest(data: any): Promise<SlotBooking> {
    const res = await fetch(`/api/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async createPcbOrder(data: Partial<PcbOrder>): Promise<PcbOrder> {
    const res = await fetch(`/api/pcb-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async getProjectById(id: string): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
       headers: authHeaders(),
    });
    return json(res);
  },

  /* ================= NEW INVENTORY & STATS ================= */

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`/api/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const res = await fetch(`/api/inventory/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete item");
  },

  async addInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`/api/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async bulkDeleteInventoryItems(ids: string[]): Promise<void> {
    const res = await fetch(`/api/inventory/batch-delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error("Failed to delete items");
  },

  async getMachineUsage(): Promise<any[]> {
    const res = await fetch(`/api/stats/machine-usage`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async getEvents(): Promise<Event[]> {
    const res = await fetch(`/api/events`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async addEvent(data: Partial<Event>): Promise<Event> {
    const res = await fetch(`/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const res = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete event");
  },

  async updateSlotStatus(id: string, status: string, rejectionReason?: string): Promise<SlotBooking> {
    const res = await fetch(`/api/slots?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status, rejectionReason }),
    });
    return json(res);
  },

  /* ================= PRINT MATERIALS CONFIG ================= */

  async getPrintMaterialsConfig(): Promise<any[]> {
    const res = await fetch(`/api/print-materials`, {
      headers: authHeaders(),
    });
    return json(res);
  },

  async updatePrintMaterialConfig(id: string, data: any): Promise<any> {
    const res = await fetch(`/api/print-materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async addPrintMaterialConfig(data: any): Promise<any> {
    const res = await fetch(`/api/print-materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async deletePrintMaterialConfig(id: string): Promise<void> {
    const res = await fetch(`/api/print-materials/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete material");
  },

  /* ================= EVENT REGISTRATIONS ================= */

  async registerForEvent(data: any): Promise<any> {
    const res = await fetch(`/api/events/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    return json(res);
  },

  async getEventRegistrations(eventId: string): Promise<any[]> {
    const res = await fetch(`/api/events/${eventId}/registrations`, {
      headers: authHeaders(),
    });
    return json(res);
  }
};
