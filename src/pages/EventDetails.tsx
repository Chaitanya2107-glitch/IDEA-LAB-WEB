
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, CalendarPlus, UserCheck, Users, X, Loader2, CheckCircle, Lock, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateGoogleCalendarUrl } from '../utils/calendar';
import { getComputedEventStatus, STATUS_STYLES } from '../utils/eventStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeHighlightIdx, setActiveHighlightIdx] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    degree: '',
    program: '',
    srn: '',
    phone_number: '+91 '
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userEmail = session?.user?.email;

          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setEvent({
              ...data,
              category: data.type || data.event_type,
              imageUrl: data.banner_image || data.banner_url || null,
              date: new Date(`${data.start_date}T${data.start_time || '00:00:00'}`)
            });

            if (userEmail) {
              const { data: reg } = await supabase
                .from('event_registrations')
                .select('id')
                .eq('event_id', id)
                .eq('email', userEmail)
                .maybeSingle();
              if (reg) setRegistered(true);

              setForm(prev => ({ ...prev, name: session?.user?.user_metadata?.full_name || '' }));
            }
          }
        } catch (err) {
          console.error("Error fetching event details:", err);
        }
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const payload = {
        event_id: id,
        user_id: session.user.id,
        email: session.user.email,
        ...form
      };

      await authService.registerForEvent(payload);
      setRegistered(true);
      setRegistering(false);
    } catch (err: any) {
      console.error("Registration detail error:", err);
      alert(err.message || "Registration failed. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!event) return <div className="min-h-screen pt-24 text-center">Event not found</div>;

  const googleUrl = event ? generateGoogleCalendarUrl(event) : '';
  const spotsLeft = (event?.max_attendees || 0) - (event?.registered_count || 0);
  const computedStatus = getComputedEventStatus(event);
  const statusStyle = STATUS_STYLES[computedStatus];
  const isCompleted = computedStatus === 'completed';
  const highlights: string[] = event.highlights || [];

  const eventDate = event?.date instanceof Date && !isNaN(event.date.getTime()) 
    ? event.date 
    : new Date();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
         {event.imageUrl ? (
           <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
         ) : (
           <div className="w-full h-full bg-slate-900" />
         )}
         {isCompleted && (
           <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center pointer-events-none">
             <span className="text-white/80 text-5xl font-black uppercase tracking-widest rotate-[-20deg] border-4 border-white/40 px-8 py-3 rounded-2xl">Completed</span>
           </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
         <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 text-white max-w-7xl mx-auto">
             <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 md:mb-6 transition-colors text-sm font-bold">
                <ArrowLeft className="w-4 h-4" /> Back to Events
             </button>
             <span className={`inline-block px-3 py-1 mb-3 md:mb-4 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${statusStyle.cls}`}>
                {statusStyle.label}
             </span>
             <h1 className="text-3xl md:text-6xl font-display font-bold mb-4 leading-tight">{event.title}</h1>
             <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-6 text-sm md:text-lg opacity-90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-brand-400" /> 
                  {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand-400" /> 
                  {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 md:w-5 md:h-5 text-brand-400" /> {event.location || 'Location TBD'}</div>
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
             
             {/* Content Side */}
             <div className="md:w-2/3 order-2 md:order-1 space-y-12">
                 <div>
                   <h2 className="text-2xl font-bold mb-4 text-slate-900">About This Event</h2>
                   <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8">
                      {event.description || 'No description provided.'}
                   </p>
                   <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest mt-12 mb-8">
                     <Users className="w-5 h-5 text-brand-500" /> {event.registered_count || 0} / {event.max_attendees || 0} Participants
                   </div>
                 </div>

                 {/* Past Event Highlights */}
                 {isCompleted && highlights.length > 0 && (
                   <section>
                     <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-3">
                       <ImageIcon className="w-6 h-6 text-brand-500" /> Event Highlights
                     </h2>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {highlights.map((url, idx) => (
                         <motion.div
                           key={idx}
                           whileHover={{ scale: 1.03 }}
                           onClick={() => setActiveHighlightIdx(idx)}
                           className={`relative rounded-2xl overflow-hidden cursor-zoom-in bg-slate-100 ${idx === 0 ? 'col-span-2 h-56' : 'h-36'}`}
                         >
                           <img src={url} alt={`Highlight ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                         </motion.div>
                       ))}
                     </div>
                   </section>
                 )}
             </div>

             {/* Registration Side */}
             <div className="md:w-1/3 order-1 md:order-2">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:sticky md:top-24">
                   <h3 className="text-lg font-bold text-slate-900 mb-4">Registration</h3>
                   
                   {isCompleted ? (
                     <div className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2 mb-4 text-sm">
                       <Lock className="w-4 h-4" /> Registrations Closed
                     </div>
                   ) : !registered ? (
                       <button 
                         disabled={spotsLeft <= 0}
                         onClick={() => setRegistering(true)}
                         className={`w-full py-4 font-bold rounded-xl transition-colors shadow-lg mb-4 ${
                           spotsLeft > 0 ? 'bg-slate-900 text-white hover:bg-brand-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                         }`}
                       >
                         {spotsLeft > 0 ? 'Register Now' : 'Event Full'}
                       </button>
                   ) : (
                       <button disabled className="w-full py-4 bg-green-100 text-green-700 font-bold rounded-xl flex items-center justify-center gap-2 mb-4">
                          <UserCheck className="w-5 h-5" /> Registered Successfully
                       </button>
                   )}

                   <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                       <a 
                          href={googleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-gray-50 text-slate-700 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200 text-sm"
                       >
                          <CalendarPlus className="w-4 h-4" /> <span className="hidden md:inline">Add to Calendar</span><span className="md:hidden">Calendar</span>
                       </a>
                       
                       <button className="w-full py-3 text-slate-500 font-bold hover:text-brand-600 transition-colors flex items-center justify-center gap-2 text-sm border border-transparent hover:border-gray-100 rounded-xl">
                          <Share2 className="w-4 h-4" /> Share
                       </button>
                   </div>

                   <div className={`mt-4 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${statusStyle.cls}`}>
                     {computedStatus === 'ongoing' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block shrink-0" />}
                     {computedStatus === 'upcoming' && <Clock className="w-3 h-3 shrink-0" />}
                     {computedStatus === 'completed' && <CheckCircle className="w-3 h-3 shrink-0" />}
                     {statusStyle.label} — {computedStatus === 'upcoming' ? `Starts ${event.start_date}` : computedStatus === 'ongoing' ? 'Happening now!' : `Ended ${event.end_date || event.start_date}`}
                   </div>
                </div>
             </div>
          </div>
      </div>

      {/* Highlights Lightbox */}
      <AnimatePresence>
        {activeHighlightIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setActiveHighlightIdx(null); }}
          >
            <button onClick={() => setActiveHighlightIdx(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]">
              <X className="w-6 h-6" />
            </button>
            {highlights.length > 1 && (
              <>
                <button onClick={() => setActiveHighlightIdx((activeHighlightIdx - 1 + highlights.length) % highlights.length)} className="absolute left-6 p-4 text-white hover:text-brand-400 transition-colors z-[110]">
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button onClick={() => setActiveHighlightIdx((activeHighlightIdx + 1) % highlights.length)} className="absolute right-6 p-4 text-white hover:text-brand-400 transition-colors z-[110]">
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}
            <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center">
              <img src={highlights[activeHighlightIdx]} alt="Highlight" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
              <div className="absolute -bottom-10 w-full text-center text-white/50 text-xs font-bold uppercase tracking-widest">
                {activeHighlightIdx + 1} of {highlights.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Overlay */}
      {registering && !isCompleted && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
             
             <div className="flex justify-between items-start mb-8 relative z-10">
               <div>
                 <h2 className="text-2xl font-black text-slate-900">Event Pass</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Complete your registration</p>
               </div>
               <button onClick={() => setRegistering(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                 <X className="w-6 h-6" />
               </button>
             </div>

             <form onSubmit={handleRegister} className="space-y-4 relative z-10">
               <div className="grid grid-cols-1 gap-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                   <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                     className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-slate-800" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Degree</label>
                      <input required value={form.degree} onChange={e => setForm({...form, degree: e.target.value})}
                        placeholder="e.g. B.Tech"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-slate-800 placeholder:opacity-30" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">SRN / ID</label>
                      <input required value={form.srn} onChange={e => setForm({...form, srn: e.target.value})}
                        placeholder="RE22..."
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-slate-800 placeholder:opacity-30" />
                    </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Program / Branch</label>
                   <input required value={form.program} onChange={e => setForm({...form, program: e.target.value})}
                     className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-slate-800" />
                 </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="+91 0000000000"
                      value={form.phone_number} 
                      onChange={e => {
                        let val = e.target.value;
                        if (!val.startsWith('+91 ')) val = '+91 ' + val.replace(/^\+91\s?/, '');
                        setForm({...form, phone_number: val});
                      }}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-slate-800 placeholder:opacity-30" 
                    />
                  </div>
               </div>

               <button type="submit" disabled={submitting}
                 className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2 mt-4">
                 {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                 {submitting ? 'Processing...' : 'Confirm Registration'}
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
