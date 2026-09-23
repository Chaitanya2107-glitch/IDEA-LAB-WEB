// src/pages/UserDashboard.tsx
import React, { useEffect, useState, useRef } from "react";
import { X, LayoutDashboard, Printer, CircuitBoard, Calendar,
  Settings, LogOut, Package, ChevronLeft, ChevronRight, Shield,
  ArrowRight, Zap, Clock, CheckCircle, XCircle, AlertCircle,
  Loader2, GraduationCap, Cpu, Box, ClipboardList, UserCircle, Plus,
  Download
} from "lucide-react";
import { User, PrintOrder, PcbOrder, SlotBooking, Indent } from "../../types";
import { authService } from "../services/api";
import { supabase } from "../services/supabase";
import { checkAndCancelStaleOrders, fetchOrderApprover } from "../utils/orderUtils";
import { generateReceipt } from "../utils/pdfGenerator";
import SettingsPanel from "../components/SettingsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import SlotBookingModal from "../components/SlotBookingModal";

interface Props { user?: User; }
type Section = "overview" | "prints" | "pcbs" | "bookings" | "indents" | "settings";

/* ── Status badge ── */
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-700",
    pending_payment: "bg-orange-100 text-orange-700",
    printing:  "bg-blue-100 text-blue-700",
    queued:    "bg-slate-100 text-slate-600",
    completed: "bg-green-100 text-green-700",
    Paid:      "bg-emerald-100 text-emerald-700",
    rejected:  "bg-red-100 text-red-700",
    approved:  "bg-green-100 text-green-700",
    active:    "bg-blue-100 text-blue-700",
    cancelled: "bg-slate-200 text-slate-500",
  };
  const icon: Record<string, React.ReactNode> = {
    pending:   <Clock className="w-2.5 h-2.5" />,
    pending_payment: <Clock className="w-2.5 h-2.5" />,
    printing:  <Loader2 className="w-2.5 h-2.5 animate-spin" />,
    completed: <CheckCircle className="w-2.5 h-2.5" />,
    Paid:      <CheckCircle className="w-2.5 h-2.5" />,
    rejected:  <XCircle className="w-2.5 h-2.5" />,
    approved:  <CheckCircle className="w-2.5 h-2.5" />,
    cancelled: <XCircle className="w-2.5 h-2.5" />,
  };
  const labelMap: Record<string, string> = {
    pending_payment: "Waiting",
    Paid: "Paid"
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${cls}`}>
      {icon[status]} {labelMap[status] || status}
    </span>
  );
};

/* ── Horizontal carousel ── */
const Carousel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode[]; onMore?: () => void }> = ({ title, icon, children, onMore }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  if (children.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">{icon}{title}</h3>
        <div className="flex items-center gap-2">
          {onMore && <button onClick={onMore} className="text-xs text-brand-600 font-bold flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3 h-3" /></button>}
          <button onClick={() => scroll(-1)} className="p-1 rounded-full hover:bg-slate-100"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
          <button onClick={() => scroll(1)} className="p-1 rounded-full hover:bg-slate-100"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {children}
      </div>
    </div>
  );
};

/* ── Order card (carousel item) ── */
const OrderCard = ({ item, type }: { item: any; type: string }) => (
  <div className="snap-start shrink-0 w-64 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
        type === "print" ? "bg-brand-50" : type === "pcb" ? "bg-blue-50" : "bg-purple-50"
      }`}>
        {type === "print" ? <Printer className="w-4 h-4 text-brand-600" /> :
         type === "pcb"   ? <CircuitBoard className="w-4 h-4 text-blue-600" /> :
                            <Calendar className="w-4 h-4 text-purple-600" />}
      </div>
      <StatusBadge status={item.status || "pending"} />
    </div>
    <p className="font-bold text-slate-800 text-sm truncate mb-1">
      {item.file_name || item.fileName || item.title || `#${item.id?.slice(0,6) ?? "Order"}`}
    </p>
    <p className="text-xs text-slate-400">
      {item.created_at || item.submitDate
        ? new Date(item.created_at || item.submitDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "—"}
    </p>
    {item.cost && (
      <p className="text-xs font-bold text-brand-600 mt-2">₹{item.cost}</p>
    )}
  </div>
);

/* ── Quick action card ── */
const QuickAction = ({ icon, label, desc, color, onClick }: any) => (
  <motion.button
    whileHover={{ y: -3, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`flex flex-col items-start p-5 rounded-2xl border ${color} text-left transition-all hover:shadow-md`}
  >
    <div className="mb-3">{icon}</div>
    <p className="font-bold text-sm">{label}</p>
    <p className="text-xs opacity-70 mt-0.5">{desc}</p>
  </motion.button>
);

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export const UserDashboard: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("overview");
  const [prints, setPrints] = useState<any[]>([]);
  const [pcbs, setPcbs] = useState<PcbOrder[]>([]);
  const [slots, setSlots] = useState<SlotBooking[]>([]);
  const [indents, setIndents] = useState<Indent[]>([]);
  const isGuest = user?.type === "non-university" || (user?.email && !user.email.toLowerCase().endsWith("@reva.edu.in"));
  const [counts, setCounts] = useState({ prints: 0, pcbs: 0, slots: 0, indents: 0 });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<any | null>(null);
  const [showPrintDetail, setShowPrintDetail] = useState(false);
  const [approverName, setApproverName] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    const { data, count } = await supabase.from("print_orders").select("*", { count: 'exact' }).eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      const updatedData = await checkAndCancelStaleOrders(data);
      setPrints(updatedData);
    }
    const pcbList = await authService.getPcbOrders().catch(() => []);
    
    // Fetch slots directly for current user to avoid admin /api/slots empty issues
    const { data: slotData } = await supabase.from("slot_bookings").select("*").eq("user_id", user.id).order("date", { ascending: false });
    const slotList = slotData || [];
    
    const indentList = !isGuest ? await authService.getIndents().catch(() => []) : [];
    
    setPcbs(pcbList);
    setSlots(slotList);
    setIndents(indentList);
    setCounts({
      prints: count || 0,
      pcbs: pcbList.length,
      slots: slotList.length,
      indents: indentList.length
    });
  };

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as Section;
    if (tab && ["overview", "prints", "pcbs", "bookings", "indents", "settings"].includes(tab)) {
      setActive(tab);
    }
  }, [location.search]);

  useEffect(() => { loadData(); }, [user]);

  const nav = [
    { id: "overview",  icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
    { id: "prints",    icon: <Printer className="w-4 h-4" />,         label: "3D Prints",     badge: counts.prints },
    { id: "pcbs",      icon: <CircuitBoard className="w-4 h-4" />,    label: "PCB Orders",    badge: counts.pcbs },
    { id: "bookings",  icon: <Calendar className="w-4 h-4" />,        label: "Slot Bookings",  badge: counts.slots },
    ...(!isGuest ? [{ id: "indents", icon: <Box className="w-4 h-4" />, label: "Inventory", badge: counts.indents }] : []),
    { id: "settings",  icon: <Settings className="w-4 h-4" />,        label: "Settings" },
  ] as const;

  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ── Mobile Top Header ── */}
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 px-6 py-4 flex items-center justify-center">
        <Link to="/">
          <img src="/img/logo_orange_new.png" alt="REVA IDEA Lab" className="h-10 w-auto object-contain" />
        </Link>
      </header>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0">
        <div className="sticky top-0 h-screen bg-white border-r border-slate-100 flex flex-col px-4 pt-6 pb-6 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">

          {/* Logo */}
          <div className="px-2 mb-6">
            <Link to="/">
              <img src="/img/logo_orange_new.png" alt="REVA IDEA Lab" className="h-9 w-auto object-contain hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          <div className="px-2 mb-8">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=f97316&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-2xl object-cover ring-4 ring-slate-50"
              />
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter truncate leading-none">{user?.degree || user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5">
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id as Section);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active === item.id
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className={active === item.id ? "text-brand-600" : "text-slate-400"}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {(item as any).badge > 0 && (
                  <span className="bg-brand-100 text-brand-700 text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {(item as any).badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="pt-6 border-t border-slate-50 mt-auto">
            <button
              onClick={() => { authService.logout(); navigate("/"); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 pt-6 pb-24 md:pb-12 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10"
          >
            {/* ──────── OVERVIEW ──────── */}
            {active === "overview" && (
              <div>
                {/* Hero */}
                <div className="relative bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 rounded-3xl p-8 mb-8 overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
                  <p className="text-brand-300 text-sm font-semibold mb-1">{greeting} 👋</p>
                  <h1 className="text-white text-3xl font-bold mb-2">{firstName}</h1>
                  {user?.program && (
                    <p className="text-white/50 text-sm flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> {user.degree} · {user.program}
                    </p>
                  )}
                  {/* Active Order Status Carousel */}
                  {(() => {
                    const stageConfig: Record<string, { message: string; icon: React.ReactNode; progress: number }> = {
                      pending_payment: { message: "Awaiting payment confirmation", icon: <Clock className="w-5 h-5" />, progress: 10 },
                      Paid: { message: "Payment received – queued for processing", icon: <CheckCircle className="w-5 h-5" />, progress: 25 },
                      queued: { message: "In queue – your turn is coming up", icon: <ClipboardList className="w-5 h-5" />, progress: 30 },
                      pending: { message: "Pending review by lab staff", icon: <Clock className="w-5 h-5" />, progress: 20 },
                      printing: { message: "Your model is being printed now!", icon: <Loader2 className="w-5 h-5 animate-spin" />, progress: 60 },
                      processing: { message: "Fabrication in progress", icon: <Loader2 className="w-5 h-5 animate-spin" />, progress: 60 },
                      completed: { message: "Ready! Collect from the lab. Carry your receipt.", icon: <CheckCircle className="w-5 h-5" />, progress: 100 },
                      rejected: { message: "Order was rejected. Check details.", icon: <XCircle className="w-5 h-5" />, progress: 0 },
                      cancelled: { message: "This order was cancelled.", icon: <XCircle className="w-5 h-5" />, progress: 0 },
                      approved: { message: "Approved! Processing will begin shortly.", icon: <CheckCircle className="w-5 h-5" />, progress: 40 },
                    };

                    const activeOrders = [
                      ...prints.filter(p => !['cancelled', 'rejected'].includes(p.status)).map(p => ({ ...p, _type: 'print' as const })),
                      ...pcbs.filter(p => !['cancelled', 'rejected'].includes(p.status)).map(p => ({ ...p, _type: 'pcb' as const })),
                    ].sort((a, b) => new Date(b.created_at || b.submitDate).getTime() - new Date(a.created_at || a.submitDate).getTime())
                    .slice(0, 1);

                    if (activeOrders.length === 0) return (
                      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "3D Print", count: prints.length, action: () => navigate("/3d-print"), icon: <Printer className="w-5 h-5" /> },
                          { label: "PCB Order", count: pcbs.length, action: () => navigate("/pcb-order"), icon: <CircuitBoard className="w-5 h-5" /> },
                          { label: "Book Slot", count: slots.length, action: () => setIsBookingModalOpen(true), icon: <Calendar className="w-5 h-5" /> },
                        ].map(s => (
                          <motion.button
                            key={s.label}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={s.action}
                            className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl p-4 text-left hover:bg-white/15 transition-all"
                          >
                            <div className="text-white/40 mb-2">{s.icon}</div>
                            <p className="text-2xl font-black text-white">{s.count}</p>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">{s.label}</p>
                          </motion.button>
                        ))}
                      </div>
                    );

                    return (
                      <div className="mt-6">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Active Orders</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                          {activeOrders.map((order, idx) => {
                            const stage = stageConfig[order.status] || stageConfig.pending;
                            const isPrint = order._type === 'print';
                            const gradientClass = isPrint
                              ? "from-orange-500/20 via-orange-600/10 to-transparent border-orange-500/20"
                              : "from-emerald-500/20 via-emerald-600/10 to-transparent border-emerald-500/20";
                            const accentColor = isPrint ? "text-orange-400" : "text-emerald-400";
                            const barColor = isPrint ? "bg-orange-400" : "bg-emerald-400";
                            const dotColor = isPrint ? "bg-orange-500" : "bg-emerald-500";

                            return (
                              <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                                className={`snap-start shrink-0 w-56 bg-gradient-to-br ${gradientClass} backdrop-blur-md rounded-2xl p-4 border cursor-pointer hover:scale-[1.02] transition-transform`}
                                onClick={() => {
                                  if (isPrint) { setSelectedPrintOrder(order); setShowPrintDetail(true); }
                                  else setActive("pcbs");
                                }}
                              >
                                {/* Card Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrint ? 'bg-orange-500/20' : 'bg-emerald-500/20'}`}>
                                    {isPrint ? <Printer className={`w-4 h-4 ${accentColor}`} /> : <CircuitBoard className={`w-4 h-4 ${accentColor}`} />}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${order.status === 'printing' || order.status === 'processing' ? 'animate-pulse' : ''}`} />
                                    <span className="text-[9px] font-bold text-white/50 uppercase">{order.status === 'pending_payment' ? 'Waiting' : order.status}</span>
                                  </div>
                                </div>

                                {/* File Name */}
                                <p className="text-sm font-bold text-white truncate mb-1">{order.file_name || order.fileName || `#${order.id?.slice(0,6)}`}</p>

                                {/* Stage Message */}
                                <p className="text-[11px] text-white/50 leading-tight mb-3 line-clamp-2">{stage.message}</p>

                                {/* Progress Bar */}
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stage.progress}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                                    className={`h-full ${barColor} rounded-full`}
                                  />
                                </div>

                                {/* Cost */}
                                {order.cost && (
                                  <p className={`text-xs font-bold ${accentColor} mt-2`}>INR {order.cost}</p>
                                )}
                              </motion.div>
                            );
                          })}

                          {/* Add New Card */}
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: activeOrders.length * 0.08 }}
                            onClick={() => navigate("/3d-print")}
                            className="snap-start shrink-0 w-56 bg-white/5 border border-dashed border-white/15 rounded-2xl p-4 flex flex-col items-center justify-center text-white/30 hover:bg-white/10 hover:text-white/50 transition-all"
                          >
                            <Plus className="w-6 h-6 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">New Order</span>
                          </motion.button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Actions */}
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Services</h2>
                <div className={`grid grid-cols-2 ${isGuest ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 mb-12`}>
                  <QuickAction icon={<Printer className="w-6 h-6 text-brand-600" />} label="3D Print" desc="PLA, ABS, PETG" color="border-slate-100 bg-white text-slate-900" onClick={() => navigate("/3d-print")} />
                  <QuickAction icon={<CircuitBoard className="w-6 h-6 text-blue-600" />} label="PCB Fab" desc="Rapid prototype" color="border-slate-100 bg-white text-slate-900" onClick={() => navigate("/pcb-order")} />
                  <QuickAction icon={<Calendar className="w-6 h-6 text-purple-600" />} label="Slot" desc="Lab reservation" color="border-slate-100 bg-white text-slate-900" onClick={() => setIsBookingModalOpen(true)} />
                  {!isGuest && <QuickAction icon={<Zap className="w-6 h-6 text-orange-600" />} label="Borrow" desc="Get components" color="border-slate-100 bg-white text-slate-900" onClick={() => navigate("/components")} />}
                </div>

                {/* Carousels */}
                {prints.length > 0 && (
                  <Carousel title="3D Print Orders" icon={<Printer className="w-4 h-4 text-brand-600" />} onMore={() => setActive("prints")}>
                    {prints.slice(0, 6).map(p => <OrderCard key={p.id} item={p} type="print" />)}
                  </Carousel>
                )}
                {pcbs.length > 0 && (
                  <Carousel title="PCB Orders" icon={<CircuitBoard className="w-4 h-4 text-blue-600" />} onMore={() => setActive("pcbs")}>
                    {pcbs.slice(0, 6).map(p => <OrderCard key={p.id} item={p} type="pcb" />)}
                  </Carousel>
                )}
                {slots.length > 0 && (
                  <Carousel title="Slot Bookings" icon={<Calendar className="w-4 h-4 text-purple-600" />} onMore={() => setActive("bookings")}>
                    {slots.slice(0, 6).map(s => <OrderCard key={s.id} item={s} type="slot" />)}
                  </Carousel>
                )}

                {prints.length === 0 && pcbs.length === 0 && slots.length === 0 && (
                  <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                    <Cpu className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-bold text-slate-400">No activity yet</p>
                    <p className="text-sm text-slate-300 mt-1">Start with a 3D print or PCB order</p>
                    <button
                      onClick={() => navigate("/3d-print")}
                      className="mt-6 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition"
                    >
                      Start Printing →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ──────── ORDERS LIST ──────── */}
            {["prints", "pcbs", "bookings", "indents"].includes(active) && (
              <div className="pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">Activity Tracking</p>
                    <h1 className="text-4xl font-light text-slate-900 tracking-tighter">
                      {active === "prints" ? "3D Print Orders" : active === "pcbs" ? "PCB Orders" : active === "bookings" ? "Slot Bookings" : "Component Indents"}
                    </h1>
                  </div>
                  <button
                    onClick={() => {
                      if (active === "prints") navigate("/3d-print");
                      else if (active === "pcbs") navigate("/pcb-order");
                      else if (active === "bookings") setIsBookingModalOpen(true);
                      else if (active === "indents") navigate("/components");
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white hover:bg-brand-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    New {active === "prints" ? "Print" : active === "pcbs" ? "PCB Order" : active === "bookings" ? "Booking" : "Indent"}
                  </button>
                </div>

                {(() => {
                  const items = active === "prints" ? prints : active === "pcbs" ? pcbs : active === "bookings" ? slots : indents;
                  if ((items as any[]).length === 0) return (
                    <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {active === "prints" ? <Printer className="w-8 h-8 text-slate-200" /> : <Box className="w-8 h-8 text-slate-200" />}
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nothing found here yet</p>
                    </div>
                  );
                  return (
                    <div className="grid grid-cols-1 gap-3">
                      {(items as any[]).map(item => (
                        <div key={item.id} className="group bg-white rounded-3xl border border-slate-100/60 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-xl hover:shadow-slate-200/40 hover:border-brand-100 transition-all cursor-default">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                              {active === "prints" ? <Printer className="w-6 h-6 text-slate-300 group-hover:text-brand-600" /> : <Box className="w-6 h-6 text-slate-300 group-hover:text-brand-600" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 tracking-tight">{item.file_name || item.fileName || item.title || item.projectTitle || `Order #${item.id?.slice(0,6)}`}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {item.created_at || item.submitDate || item.requestDate
                                    ? new Date(item.created_at || item.submitDate || item.requestDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                                    : ""}
                                </p>
                                {item.cost && <span className="w-1 h-1 bg-slate-200 rounded-full" />}
                                {item.cost && <p className="text-[10px] font-black text-brand-600 uppercase tracking-tighter">₹{item.cost}</p>}
                                {item.material && <span className="w-1 h-1 bg-slate-200 rounded-full" />}
                                {item.material && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.material}</p>}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-0 flex items-center gap-4 w-full sm:w-auto self-end sm:self-center">
                            <StatusBadge status={item.status || "pending"} />
                            <button 
                              onClick={async () => {
                                if (active === "prints") {
                                  setSelectedPrintOrder(item);
                                  setShowPrintDetail(true);
                                  const name = await fetchOrderApprover(item.file_name);
                                  setApproverName(name);
                                }
                              }}
                              className={`${active === "prints" ? "flex" : "hidden sm:flex"} items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-brand-600 transition-colors`}
                            >
                              View <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ──────── SETTINGS ──────── */}
            {active === "settings" && user && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>
                <SettingsPanel
                  user={user}
                  onUpdate={async data => { await authService.updateProfile({ ...user, ...data }); }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── PRINT DETAIL SIDESHEET ── */}
      <AnimatePresence>
        {showPrintDetail && selectedPrintOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPrintDetail(false); setApproverName(null); }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[110] overflow-y-auto"
            >
              <div className="p-6 sm:p-8 pb-32 sm:pb-8">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-brand-50 rounded-[2rem] flex items-center justify-center">
                    <Printer className="w-8 h-8 text-brand-600" />
                  </div>
                  <button 
                    onClick={() => { setShowPrintDetail(false); setApproverName(null); }}
                    className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="mb-10">
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Order Details</p>
                  <h2 className="text-3xl font-light text-slate-900 tracking-tighter mb-4">{selectedPrintOrder.file_name}</h2>
                  <StatusBadge status={selectedPrintOrder.status} />
                </div>

                {/* Approver & Payment Details */}
                {(approverName || selectedPrintOrder.payment_method) && (
                  <div className="p-6 bg-brand-50 rounded-[2rem] border border-brand-100 mb-8 space-y-4">
                    {approverName && (
                      <div>
                        <p className="text-[10px] font-black text-brand-600/60 uppercase tracking-widest mb-1">Confirmed By</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-brand-600" /> IDEALab Staff: {approverName}
                        </p>
                      </div>
                    )}
                    {(selectedPrintOrder.payment_method && selectedPrintOrder.payment_method.startsWith("Online:")) && (
                      <div>
                        <p className="text-[10px] font-black text-brand-600/60 uppercase tracking-widest mb-1">Payment ID</p>
                        <p className="font-mono text-sm font-bold text-slate-800">{selectedPrintOrder.payment_method.replace("Online: ", "")}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Material</p>
                    <p className="text-base font-bold text-slate-800">{selectedPrintOrder.material}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Infill</p>
                    <p className="text-base font-bold text-slate-800">{selectedPrintOrder.infill}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weight</p>
                    <p className="text-base font-bold text-slate-800">{selectedPrintOrder.weight ? `${Math.round(selectedPrintOrder.weight)}g` : "—"}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                    <p className="text-base font-black text-brand-600">{selectedPrintOrder.cost ? `₹${selectedPrintOrder.cost}` : "—"}</p>
                  </div>
                </div>

                {/* Receipt Download Action */}
                {selectedPrintOrder.status !== 'cancelled' && selectedPrintOrder.status !== 'pending_payment' && (
                  <button 
                    onClick={() => generateReceipt({ ...selectedPrintOrder, approverName }, user)}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4" /> Download Receipt
                  </button>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Nav (Mobile Only) ── */}
      <BottomNav 
        activeId={active}
        onTabChange={(id) => {
          setActive(id as Section);
        }}
        items={[
          { name: 'Home', path: '#', icon: LayoutDashboard, id: 'overview' },
          { name: 'Prints', path: '#', icon: Printer, id: 'prints' },
          { name: 'PCB', path: '#', icon: CircuitBoard, id: 'pcbs' },
          { name: 'Booking', path: '#', icon: Calendar, id: 'bookings' },
          { name: 'Settings', path: '#', icon: UserCircle, id: 'settings' }
        ] as any}
      />

      <SlotBookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        user={user}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
};

export default UserDashboard;
