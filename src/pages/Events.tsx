// src/pages/Events.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon, List, ChevronLeft, ChevronRight,
  CheckCircle, Lock, Clock, MapPin, Users, Zap, Filter,
  X, Loader2, Tag, Info, AlertCircle, ArrowRight, Image as ImageIcon
} from "lucide-react";
import { User } from "../../types";
import { authService } from "../services/api";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { getLabStatus, INDIAN_HOLIDAYS_2026, LabStatus } from "../utils/labClosure";
import SlotBookingModal, { SESSION_TYPES, TIME_SLOTS } from "../components/SlotBookingModal";
import { getComputedEventStatus, STATUS_STYLES } from "../utils/eventStatus";

interface EventsProps { user?: User; }

/* ─── Indian national holidays (centralized in utils/labClosure.ts) ─── */
const FIXED_SUNDAYS_CLOSED = true;

const EVENT_TYPE_COLOR: Record<string, string> = {
  workshop:   "bg-brand-50 text-brand-700 border-brand-200",
  masterclass:"bg-purple-50 text-purple-700 border-purple-200",
  showcase:   "bg-blue-50 text-blue-700 border-blue-200",
  hackathon:  "bg-green-50 text-green-700 border-green-200",
  seminar:    "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* ══════════════ EventCard component ══════════════ */
const EventCard: React.FC<{ event: any; onRegister?: (e: any) => void }> = ({ event, onRegister }) => {
  const navigate = useNavigate();
  const d = new Date(event.start_date);
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()].slice(0, 3).toUpperCase();
  const eventType = event.type || event.event_type || 'workshop';
  const colorCls = EVENT_TYPE_COLOR[eventType] ?? "bg-slate-50 text-slate-700 border-slate-200";
  const spotsLeft = event.max_attendees - (event.registered_count ?? 0);
  const bannerUrl = event.banner_image || event.banner_url;
  const computedStatus = getComputedEventStatus(event);
  const statusStyle = STATUS_STYLES[computedStatus];
  const isCompleted = computedStatus === 'completed';
  const highlightCount = (event.highlights || []).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileHover={{ y: isCompleted ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/events/${event.id}`)}
      className={`bg-white border border-slate-100 rounded-[32px] shadow-sm transition-all overflow-hidden flex flex-col group cursor-pointer ${isCompleted ? 'opacity-80 grayscale-[30%]' : 'hover:shadow-2xl hover:shadow-brand-900/10'}`}
    >
      <div className="relative h-48 overflow-hidden">
        {bannerUrl ? (
          <img src={bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
            <CalendarIcon className="w-12 h-12" />
          </div>
        )}
        {isCompleted && <div className="absolute inset-0 bg-slate-900/30" />}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-sm backdrop-blur-md ${colorCls} border-white/20`}>
            {eventType}
          </span>
          <span className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-sm backdrop-blur-md border-white/20 ${statusStyle.cls}`}>
            {computedStatus === 'ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block mr-1" />}
            {statusStyle.label}
          </span>
        </div>
        {isCompleted && highlightCount > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-black">
            <ImageIcon className="w-3 h-3" /> {highlightCount} highlights
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-start gap-4 mb-6">
          <div className="shrink-0 w-12 flex flex-col items-center bg-brand-50 rounded-2xl py-2 shadow-sm border border-brand-100/50">
            <span className="text-[9px] font-black text-brand-500 tracking-widest">{month}</span>
            <span className="text-xl font-black text-brand-700 leading-none">{day}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 text-lg mb-1 leading-tight group-hover:text-brand-600 transition-colors uppercase tracking-tight">{event.title}</h3>
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400">
              <span className="flex items-center gap-1 uppercase tracking-wider"><Clock className="w-3 h-3" /> {event.start_time?.slice(0,5)}</span>
              <span className="flex items-center gap-1 uppercase tracking-wider truncate"><MapPin className="w-3 h-3" /> {event.location}</span>
            </div>
          </div>
        </div>

        <p className="text-sm font-bold text-slate-500 line-clamp-2 mb-6 leading-relaxed flex-1 italic">
          "{event.description}"
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
          {isCompleted ? (
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Lock className="w-3 h-3" /> Registration Closed</span>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Availability</span>
              <span className={`text-xs font-black uppercase tracking-wider ${spotsLeft <= 5 ? "text-red-500" : "text-brand-500"}`}>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : "SOLD OUT"}
              </span>
            </div>
          )}
          
          {isCompleted ? (
            <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition flex items-center gap-2">
              View Recap <ArrowRight className="w-3 h-3" />
            </button>
          ) : spotsLeft > 0 ? (
            <button onClick={(e) => { e.stopPropagation(); onRegister?.(event); }}
              className="px-6 py-3 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition shadow-xl shadow-brand-600/20 active:scale-95 flex items-center gap-2">
              Register Now <ArrowRight className="w-3 h-3" />
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

/* ══════════════ MAIN ══════════════ */
const Events: React.FC<EventsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "calendar" | "mybookings">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [blockedDateObjs, setBlockedDateObjs] = useState<Date[]>([]);
  const [closures, setClosures] = useState<Map<string, string>>(new Map());
  const [bookings, setBookings] = useState<Map<string, any[]>>(new Map()); // date → bookings
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  // Date click modal state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loadingMyBookings, setLoadingMyBookings] = useState(false);

  const loadMyBookings = useCallback(async () => {
    if (!user) return;
    setLoadingMyBookings(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('slot_bookings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      setMyBookings(data || []);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setLoadingMyBookings(false);
    }
  }, [user]);

  /* Load events + closures */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [evData, clRes, bkRes, blDatesRes] = await Promise.all([
        authService.getEvents(),
        supabase.from("lab_closures").select("*"),
        supabase.from("slot_bookings").select("date, status, purpose").in("status", ["approved", "pending"]),
        authService.getBlockedDates()
      ]);

      setEvents(evData ?? []);
      setBlockedDateObjs(blDatesRes ?? []);
 
      const closureMap = new Map<string, string>();
      (clRes.data ?? []).forEach((c: any) => closureMap.set(c.date, c.reason));
      setClosures(closureMap);
 
      const bookMap = new Map<string, any[]>();
      (bkRes.data ?? []).forEach((b: any) => {
        const arr = bookMap.get(b.date) ?? [];
        arr.push(b);
        bookMap.set(b.date, arr);
      });
      setBookings(bookMap);
    } catch (err) {
      console.error("Load events error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (view === 'mybookings') loadMyBookings(); }, [view, loadMyBookings]);

  /* ─── Calendar helpers ─── */
  const eventsOnDate = (dateStr: string) => events.filter(e => e.start_date === dateStr);
  const bookingsOnDate = (dateStr: string) => bookings.get(dateStr) ?? [];

  const dayStatus = (dateStr: string): "closed" | "busy" | "available" | "past" => {
    const status = getLabStatus(dateStr, blockedDateObjs);
    if (status.isClosed) {
      if (status.type === 'past') return "past";
      return "closed";
    }
    const bks = bookingsOnDate(dateStr);
    if (bks.length >= 3) return "busy";
    return "available";
  };

  const formatDate = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleDayClick = (dateStr: string) => {
    const s = dayStatus(dateStr);
    if (s === "past") return; // Block past date modals
    
    // Get closure reason from centralized logic for consistency
    const status = getLabStatus(dateStr, blockedDateObjs);
    
    setSelectedDate(dateStr);
    setSelectedDateInfo({
      status: s,
      closureReason: status.reason,
      events: eventsOnDate(dateStr),
      bookings: bookingsOnDate(dateStr),
    });
  };

  /* ─── Day cell colors ─── */
  const cellCls = (dateStr: string, isToday: boolean) => {
    const s = dayStatus(dateStr);
    if (s === "past") return "opacity-20 pointer-events-none grayscale";
    if (s === "closed") return "bg-red-50 text-red-300 cursor-default ring-0";
    if (s === "busy")   return "bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer";
    if (isToday) return "bg-brand-600 text-white hover:bg-brand-700 cursor-pointer ring-2 ring-brand-300";
    return "bg-white text-slate-700 hover:bg-brand-50 cursor-pointer hover:text-brand-700";
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredEvents = typeFilter === "all" ? events : events.filter(e => (e.type || e.event_type) === typeFilter);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* ── Header ── */}
      <div className="bg-slate-900 py-14 px-4 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-brand-300 text-xs font-bold uppercase tracking-widest mb-4">Events & Lab Booking</span>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3">Events Happening RIGHT NOW!</h1>
          <p className="text-white/50 max-w-xl">Book lab slots, register for workshops, and see what's happening at  IDEA Lab.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* ── Toggle ── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex gap-1 bg-white border border-slate-100 p-1 rounded-2xl shadow-sm">
            {(["list", "calendar"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === v ? "bg-brand-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}>
                {v === "list" ? <><List className="w-3.5 h-3.5 inline mr-1.5" />Events</> : <><CalendarIcon className="w-3.5 h-3.5 inline mr-1.5" />Calendar</>}
              </button>
            ))}
            {user && (
              <button onClick={() => setView('mybookings')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'mybookings' ? "bg-brand-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}>
                My Bookings
              </button>
            )}
          </div>

          {view === "list" && (
            <div className="flex gap-2 flex-wrap">
              {["all", "workshop", "masterclass", "showcase", "hackathon", "seminar"].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition border ${
                    typeFilter === t ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-500 border-slate-200 hover:border-brand-400"
                  }`}>{t === "all" ? "All Events" : t}</button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
          </div>
        ) : view === "list" ? (
          /* ── EVENT LIST ── */
          <div>
            {filteredEvents.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-20 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No upcoming events</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredEvents.map(ev => (
                    <EventCard key={ev.id} event={ev} onRegister={(e) => navigate(`/events/${e.id}`)} />
                  ))}
              </div>
            )}
          </div>
        ) : view === "mybookings" ? (
          /* ── MY BOOKINGS ── */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">My Slot Bookings</h2>
              <button onClick={() => { loadMyBookings(); setIsBookingModalOpen(true); }}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition shadow-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> New Booking
              </button>
            </div>
            {loadingMyBookings ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-400" /></div>
            ) : myBookings.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-20 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No slot bookings yet</p>
                <p className="text-slate-300 text-sm mt-1">Book a lab slot from the Calendar view</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map(b => {
                  const statusCls: Record<string,string> = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    rejected: 'bg-red-50 text-red-700 border-red-200'
                  };
                  return (
                    <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center shrink-0 text-brand-600">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusCls[b.status] || statusCls.pending}`}>
                            {b.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800">{(b.start_time||'').slice(0,5)} – {(b.end_time||'').slice(0,5)}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{b.purpose || 'No purpose stated'}</p>
                        {b.rejection_reason && (
                          <p className="text-xs text-red-500 mt-1 italic">Reason: {b.rejection_reason}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── CALENDAR ── */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Month Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 text-xs font-bold text-brand-600 border border-brand-200 rounded-full hover:bg-brand-50 transition">Today</button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-2 rounded-xl hover:bg-slate-100 transition"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-2 rounded-xl hover:bg-slate-100 transition"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 px-6 py-2 bg-slate-50 border-b border-slate-100 flex-wrap text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-600 inline-block" />Today</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 inline-block" />Busy</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" />Closed / Holiday</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border inline-block" />Available</span>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAY_NAMES.map(d => (
                <div key={d} className={`py-2 text-center text-xs font-black uppercase tracking-wider ${d === "Sun" ? "text-red-400" : "text-slate-400"}`}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`pad-${i}`} className="min-h-[88px] border-b border-r border-slate-50" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const evs = eventsOnDate(dateStr);
                const bks = bookingsOnDate(dateStr);
                const isToday = dateStr === todayStr;
                const cls = cellCls(dateStr, isToday);
                const status = dayStatus(dateStr);

                return (
                  <div key={day} onClick={() => handleDayClick(dateStr)}
                    className={`min-h-[88px] border-b border-r border-slate-50 p-2 transition relative ${cls}`}>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isToday ? "bg-white text-brand-700" : ""}`}>{day}</span>
                    {status === "closed" && <Lock className="w-3 h-3 absolute top-2 right-2 opacity-40" />}
                    {evs.slice(0, 2).map(ev => (
                      <div key={ev.id} className="mt-1 text-[9px] font-bold bg-brand-100 text-brand-700 px-1 py-0.5 rounded truncate">{ev.title}</div>
                    ))}
                    {bks.length > 0 && status !== "closed" && (
                      <div className="mt-1 text-[9px] font-bold text-amber-600">{bks.length} booking{bks.length > 1 ? "s" : ""}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Booking CTA banner for guests ── */}
        {!user && (
          <div className="mt-10 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-black text-lg">Want to book a lab slot?</p>
              <p className="text-white/70 text-sm">Log in to reserve time and register for events.</p>
            </div>
            <button onClick={() => navigate("/login")} className="px-6 py-2.5 bg-white text-brand-700 font-black rounded-xl hover:bg-brand-50 transition">
              Login / Sign Up
            </button>
          </div>
        )}
      </div>

      {/* ── Date Detail Modal ── */}
      <AnimatePresence>
        {selectedDate && selectedDateInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedDate(null)}>
            <motion.div initial={{ y: 80, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 80, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">{new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long" })}</p>
                  <h3 className="font-black text-slate-800 text-lg">{new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</h3>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-5 space-y-5">
                {/* Status banner */}
                {selectedDateInfo.status === "closed" ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-red-700">Lab Closed</p>
                      <p className="text-sm text-red-500">{selectedDateInfo.closureReason}</p>
                    </div>
                  </div>
                ) : selectedDateInfo.status === "busy" ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2 text-amber-700 text-sm font-bold">
                    <AlertCircle className="w-4 h-4" /> High demand — only limited slots available
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2 text-green-700 text-sm font-bold">
                    <CheckCircle className="w-4 h-4" /> Available for booking
                  </div>
                )}

                {/* Events on this day */}
                {selectedDateInfo.events.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase mb-2">Events</p>
                    <div className="space-y-2">
                      {selectedDateInfo.events.map((ev: any) => (
                        <div key={ev.id} className="bg-brand-50 border border-brand-100 rounded-xl p-3">
                          <p className="font-bold text-brand-800 text-sm">{ev.title}</p>
                          <p className="text-xs text-brand-500 mt-0.5">{ev.start_time?.slice(0,5)}–{ev.end_time?.slice(0,5)} · {ev.location}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Section */}
                {selectedDateInfo.status !== "closed" && selectedDate && (
                  <div className="pt-4 border-t border-slate-50">
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-slate-800 uppercase tracking-tight">Need the Lab?</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Reserve your workstation</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${selectedDateInfo.status === 'busy' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                              {selectedDateInfo.status === "busy" ? "Limited Slots" : "Available"}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => setIsBookingModalOpen(true)}
                          className="w-full py-4 bg-slate-900 hover:bg-brand-600 text-white rounded-[20px] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          <span>Book Date</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 border border-slate-100 rounded-[28px] text-center space-y-3">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Login required to book slots</p>
                        <button onClick={() => navigate("/login")} className="px-6 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-500 transition shadow-sm">Sign In / Register</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SlotBookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        user={user}
        initialDate={selectedDate || ""}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          setSelectedDate(null);
          loadData();
        }}
      />
    </div>
  );
};

export default Events;
