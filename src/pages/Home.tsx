
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { Calendar, Cpu, ArrowRight, Printer, Box, MapPin, Clock, Quote, Star, Zap, Layers, CircuitBoard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EVENTS } from '../../constants';

const TESTIMONIALS = [
  {
    id: 1,
    text: "The IDEA Lab provided me with the tools and mentorship to turn my paper concept into a patented prototype.",
    author: "Aditya Rao",
    role: "Final Year, Mechanical Engg",
    image: "https://ui-avatars.com/api/?name=Aditya+Rao&background=0D8ABC&color=fff"
  },
  {
    id: 2,
    text: "As a faculty member, having an industrial-grade fabrication facility on campus allows us to bridge the gap between theory and application.",
    author: "Dr. Meera S.",
    role: "Associate Professor, ECE",
    image: "https://ui-avatars.com/api/?name=Meera+S&background=db2777&color=fff"
  },
  {
    id: 3,
    text: "The cross-disciplinary environment here is unmatched. I collaborated with CS students to build AI for my biotech project.",
    author: "Rahul Varma",
    role: "Researcher, Biotechnology",
    image: "https://ui-avatars.com/api/?name=Rahul+Varma&background=ea580c&color=fff"
  }
];

import { supabase } from '../services/supabase';
import { useRef } from 'react';

const Home: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);



  useEffect(() => {
    let mounted = true;
    const fetchUpcomingEvents = async () => {
      try {
        const today = new Date();
        const twoMonthsLater = new Date();
        twoMonthsLater.setMonth(today.getMonth() + 2);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', today.toISOString().split('T')[0])
          .lte('start_date', twoMonthsLater.toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(3);

        if (error) throw error;
        if (mounted) setUpcomingEvents(data || []);
      } catch (err) {
        console.error("Error fetching homepage events:", err);
      } finally {
        if (mounted) setLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      
      {/* Detailed About Section */}
      <section className="py-12 md:py-28 bg-white relative overflow-hidden">
          {/* Abstract Background Decor */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 skew-x-12 translate-x-32 z-0 hidden md:block"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-50 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 z-0"></div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          >
              <div className="flex flex-col lg:flex-row gap-8 md:gap-20 items-start">
                  
                  {/* Text Content */}
                  <div className="lg:w-3/5">
                      <span className="text-brand-600 font-bold tracking-wider uppercase text-xs md:text-sm flex items-center gap-2 mb-4 md:mb-6">
                        <span className="w-8 h-[2px] bg-brand-600"></span> About IDEA Lab
                      </span>
                      <h2 className="text-3xl md:text-6xl font-display font-black text-slate-900 mb-6 md:mb-8 leading-tight">
                        Catalyzing <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-vivid-pink">Future Innovation.</span>
                      </h2>
                      
                      <div className="prose prose-sm md:prose-lg text-slate-600 leading-relaxed space-y-4 md:space-y-6 text-justify">
                          <p>
                            IDEA Lab is a dedicated innovation ecosystem designed to empower students, faculty, and young innovators to transform ideas into real-world solutions. The lab provides an open, collaborative environment equipped with advanced tools, rapid prototyping facilities, and modern digital fabrication technologies.
                          </p>
                          <p className="hidden md:block">
                            At its core, IDEA Lab encourages experiential learning—allowing learners to design, build, test, and refine their creations while developing strong technical and entrepreneurial skills.
                          </p>
                          <p className="hidden md:block">
                            The initiative aims to bridge the gap between classroom concepts and practical application, fostering a culture where innovation becomes a habit.
                          </p>
                          
                          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/60 border border-slate-50 mt-8 md:mt-12 relative overflow-hidden group">
                              <Quote className="absolute -top-2 -right-2 w-16 h-16 text-slate-50 opacity-50 rotate-12 transition-transform group-hover:rotate-0 duration-500" />
                              <p className="font-display font-medium text-slate-800 text-lg md:text-xl italic m-0 relative z-10 leading-relaxed">
                                "A place where imagination meets engineering, IDEA Lab stands as a catalyst for innovation."
                              </p>
                              <div className="mt-4 flex items-center gap-3">
                                  <div className="w-8 h-[2px] bg-brand-500"></div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Innovation Mantra</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Visual/Image Side */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="lg:w-2/5 relative mt-6 md:mt-20"
                  >
                      <div className="relative bg-white p-3 rounded-[3rem] shadow-2xl shadow-slate-200/80 border border-slate-100 transition-transform duration-700 ease-out hover:-translate-y-2">
                          <div className="rounded-[2.5rem] overflow-hidden relative">
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 opacity-60"></div>
                              <img 
                                src="img/homepage/DSC09625.JPG" 
                                alt="Student Innovation" 
                                loading="eager"
                                width="800"
                                height="600"
                                className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
                              />
                              <div className="absolute bottom-6 left-6 z-20 text-white">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="font-black text-[10px] md:text-xs tracking-[0.2em] uppercase bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">Innovation Hub</span>
                                  </div>
                                  <p className="text-[10px] md:text-xs text-slate-100 max-w-xs font-medium">Turning theoretical concepts into functional prototypes.</p>
                              </div>
                          </div>
                      </div>
                      
                      
                  </motion.div>
              </div>
          </motion.div>
      </section>

      {/* TIMELINE SECTION (Responsive: Slide on Mobile, Zigzag on Desktop) */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="absolute right-0 top-0 w-96 h-96 bg-brand-600 rounded-full blur-[120px]"></div>
           <div className="absolute left-0 bottom-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-20">
             <span className="text-brand-500 font-bold tracking-wider uppercase text-xs md:text-sm flex items-center justify-center gap-2">
               <Calendar className="w-4 h-4" /> Mark Your Calendars
             </span>
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white mt-3">Upcoming Events</h2>
          </div>

          <div className="relative">
            {/* Vertical Center Line (Desktop Only) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent -translate-x-1/2"></div>

            {/* Mobile Horizontal Scroll Container / Desktop Vertical Stack */}
            <div className="flex md:block overflow-x-auto md:overflow-visible gap-6 snap-x snap-mandatory pb-8 md:pb-0 no-scrollbar md:space-y-16">
              {loadingEvents ? (
                <div className="w-full py-20 text-center text-slate-400 font-bold">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-500" />
                  Loading upcoming events...
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="w-full py-20 text-center text-slate-400 font-bold">
                  No upcoming events scheduled for the next 2 months.
                </div>
              ) : (
                upcomingEvents.map((event, index) => {
                  const eventDate = new Date(`${event.start_date}T${event.start_time || '00:00:00'}`);
                  
                  return (
                    <div 
                        key={event.id} 
                        className={`min-w-[85vw] md:min-w-0 snap-center relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                    >
                      
                      {/* Content Card */}
                      <div className="w-full md:w-1/2 group">
                        <div className={`relative bg-slate-800 border border-slate-700 p-6 md:p-8 rounded-3xl hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-900/20 h-full ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'}`}>
                           
                           {/* Date Badge */}
                           <div className="absolute top-6 right-6 flex flex-col items-center bg-slate-900 rounded-xl p-3 border border-slate-700 min-w-[60px]">
                              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-xl md:text-2xl font-black text-white">{eventDate.getDate()}</span>
                           </div>
    
                           <span className="inline-block px-3 py-1 mb-4 rounded-full bg-brand-500/10 text-brand-400 text-[10px] md:text-xs font-bold uppercase tracking-wider border border-brand-500/20">
                                {event.event_type}
                           </span>
                           
                           <Link to={`/events/${event.id}`}>
                              <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-3 group-hover:text-brand-400 transition-colors cursor-pointer truncate">{event.title}</h3>
                           </Link>
                           
                           <div className="flex flex-col gap-2 mb-4 text-slate-400 text-xs md:text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-500" /> 
                                {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {event.location}</div>
                           </div>
    
                           <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6 line-clamp-3">{event.description}</p>
                           
                           <Link to={`/events/${event.id}`} className="inline-flex items-center text-xs md:text-sm font-bold text-white hover:text-brand-400 transition-colors">
                              Event Details <ArrowRight className="w-4 h-4 ml-1" />
                           </Link>
                        </div>
                      </div>
    
                      {/* Center Node (Desktop Only) */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 z-10 shadow-[0_0_20px_rgba(0,0,0,0.0.5)] group-hover:scale-110 transition-transform duration-300">
                         <div className="w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.8)]"></div>
                      </div>
                      
                      {/* Empty space for balance (Desktop Only) */}
                      <div className="w-full md:w-1/2 hidden md:block"></div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="text-center mt-8 md:mt-20">
               <Link to="/events" className="inline-flex items-center gap-2 px-8 py-3 md:px-10 md:py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-brand-500 hover:text-white transition-all shadow-lg hover:scale-105 text-sm md:text-base">
                  View Full Schedule <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* UNIFIED FACILITIES SECTION (Hardware, 3D Print & PCB) */}
      <section className="py-16 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
                <span className="text-brand-600 font-bold tracking-wider uppercase text-xs md:text-sm flex items-center justify-center gap-2">
                    <Layers className="w-4 h-4" /> Lab Resources
                </span>
                <h2 className="text-3xl md:text-6xl font-display font-black text-slate-900 mt-4 tracking-tight">
                    Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-vivid-pink">The Best.</span>
                </h2>
            </div>

            {/* Carousel for mobile, Grid for desktop */}
            <div 
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-0 scrollbar-hide snap-x snap-mandatory"
            >
                
                {/* Hardware Card */}
                <div className="group relative rounded-[2.5rem] overflow-hidden min-h-[380px] md:min-h-[450px] flex flex-col justify-end p-6 md:p-8 transition-all hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute inset-0">
                        <img 
                            src="img/comp/DSC09591.JPG" 
                            alt="Hardware Library" 
                            loading="eager"
                            width="600"
                            height="450"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/50 to-transparent opacity-90"></div>
                    </div>
                    
                    <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">Hardware Library</h3>
                        <p className="text-blue-100 mb-6 leading-relaxed text-sm">
                            Microcontrollers, sensors, and actuators. Real-time tracking and instant digital indents.
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Arduino/ESP32', 'Sensors', 'Motors'].map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-100 text-[10px] font-bold backdrop-blur-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <Link to="/components" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-950 rounded-xl font-bold hover:bg-blue-50 transition-all group/btn shadow-lg text-sm">
                            Browse <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* 3D Print Card */}
                <div className="group relative rounded-[2.5rem] overflow-hidden min-h-[380px] md:min-h-[450px] flex flex-col justify-end p-6 md:p-8 transition-all hover:shadow-2xl hover:shadow-orange-900/20 hover:-translate-y-1 shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute inset-0">
                        <img 
                            src="img/comp/DSC09502.JPG" 
                            alt="3D Printing" 
                            loading="eager"
                            width="600"
                            height="450"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-950 via-orange-900/50 to-transparent opacity-90"></div>
                    </div>
                    
                    <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">Fabrication Station</h3>
                        <p className="text-orange-100 mb-6 leading-relaxed text-sm">
                            Industrial-grade FDM and SLA printing. Upload files and track progress remotely.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {['FDM', 'SLA Resin', 'Rapid Proto'].map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-orange-100 text-[10px] font-bold backdrop-blur-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <Link to="/3d-print" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-950 rounded-xl font-bold hover:bg-orange-50 transition-all group/btn shadow-lg text-sm">
                            Start Printing <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* PCB Printing Card */}
                <div className="group relative rounded-[2.5rem] overflow-hidden min-h-[380px] md:min-h-[450px] flex flex-col justify-end p-6 md:p-8 transition-all hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1 shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute inset-0">
                        <img 
                            src="img/homepage/pcb.JPG" 
                            alt="PCB Fabrication" 
                            loading="eager"
                            width="600"
                            height="450"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/50 to-transparent opacity-90"></div>
                    </div>
                    
                    <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                       <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">PCB Lab</h3>
                        <p className="text-emerald-100 mb-6 leading-relaxed text-sm">
                            Complete PCB fabrication workflow. From circuit design to etching, soldering, and testing.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Etching', 'Soldering', 'Testing', 'Design'].map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-100 text-[10px] font-bold backdrop-blur-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <Link to="/pcb-order" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-950 rounded-xl font-bold hover:bg-emerald-50 transition-all group/btn shadow-lg text-sm">
                            Order PCB <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              
              <div className="md:w-1/3 text-center md:text-left">
                 <span className="text-brand-600 font-bold tracking-wider uppercase text-xs md:text-sm mb-2 block">Community Voices</span>
                 <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 md:mb-6">What People Say</h2>
                 <p className="text-slate-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                   Hear from the students, faculty, and researchers who are building the future at IDEA Lab.
                 </p>
                 <Link to="/testimonials" className="inline-flex items-center text-slate-900 font-bold hover:text-brand-600 transition-colors group text-sm md:text-base">
                    View All Stories <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>

              <div className="md:w-2/3 w-full">
                 <div className="relative bg-white rounded-3xl p-6 md:p-12 shadow-xl shadow-slate-200/50 min-h-[250px] md:min-h-[300px] flex flex-col justify-center transition-all duration-500 ease-in-out">
                    <Quote className="absolute top-6 left-6 md:top-8 md:left-8 w-8 h-8 md:w-12 md:h-12 text-brand-100 rotate-180" />
                    
                    <div className="relative z-10">
                       <div className="flex gap-1 mb-4 md:mb-6 text-brand-500 justify-center md:justify-start">
                          {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 md:w-5 md:h-5 fill-current" />)}
                       </div>
                       
                       <p key={activeTestimonial} className="text-lg md:text-2xl text-slate-700 font-display font-medium leading-relaxed mb-6 md:mb-8 animate-fade-in text-center md:text-left">
                         "{TESTIMONIALS[activeTestimonial].text}"
                       </p>

                       <div className="flex items-center gap-4 border-t border-gray-100 pt-6 animate-fade-in justify-center md:justify-start">
                          <img 
                             src={TESTIMONIALS[activeTestimonial].image} 
                             alt={TESTIMONIALS[activeTestimonial].author} 
                             className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-brand-100"
                          />
                          <div className="text-left">
                             <h4 className="font-bold text-slate-900 text-sm md:text-base">{TESTIMONIALS[activeTestimonial].author}</h4>
                             <p className="text-xs md:text-sm text-slate-500">{TESTIMONIALS[activeTestimonial].role}</p>
                          </div>
                       </div>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex gap-2">
                       {TESTIMONIALS.map((_, idx) => (
                          <button 
                             key={idx} 
                             onClick={() => setActiveTestimonial(idx)}
                             className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeTestimonial ? 'w-6 bg-brand-600' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
                          />
                       ))}
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 bg-noise overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 via-red-500 to-blue-600 bg-[length:400%_400%] animate-gradient-flow"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="text-3xl md:text-6xl font-display font-bold text-white mb-4 md:mb-6 drop-shadow-md">Ready to build the future?</h2>
          <p className="text-white/90 text-base md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto font-medium">
            Join a community of innovators. The AICTE IDEA Lab is open to all students.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
             <Link to="/events" className="px-8 py-3 md:py-4 bg-white text-brand-600 rounded-full font-bold shadow-lg hover:bg-gray-50 transition-all hover:scale-105 w-full sm:w-auto text-sm md:text-base">
              Browse Events
            </Link>
            <Link to="/login" className="px-8 py-3 md:py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all w-full sm:w-auto text-sm md:text-base">
              Member Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
