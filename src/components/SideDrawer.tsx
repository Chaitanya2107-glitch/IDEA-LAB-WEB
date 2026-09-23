import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Globe, Layers, Package, Calendar, LayoutTemplate, Info, Users, Zap, MessageSquare, Printer, CircuitBoard, LayoutDashboard, UserCircle, Shield } from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  staffUser?: any;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, user, staffUser }) => {
  const location = useLocation();

  const mainLinks = [
    { name: "Home", path: "/" },
    { name: "My Dashboard", path: staffUser ? "/staff-dashboard" : "/dashboard", icon: LayoutDashboard },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Project", path: "/projects" },
  ];

  const secondaryLinks = [
    ...(user
      ? [
          ...(user?.type !== "non-university" && !staffUser
            ? [{ name: "Component Catalog", path: "/components", icon: Package }]
            : []),
        ]
      : []),
    { name: "3D Printing", path: "/3d-print", icon: Printer },
    { name: "PCB Fabrication", path: "/pcb-order", icon: CircuitBoard },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Gallery", path: "/gallery", icon: LayoutTemplate },
    { name: "About Us", path: "/about", icon: Info },
    { name: "Infrastructure", path: "/infrastructure", icon: Layers },
    { name: "Our Team", path: "/team", icon: Users },
    { name: "Projects", path: "/projects", icon: Zap },
    { name: "Testimonials", path: "/testimonials", icon: MessageSquare },
  ];

  // We show a subset in "Quick Navigation" and the rest in "Discover More"
  const visiblePaths = ["/", "/events", "/gallery", "/projects"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-slate-900 shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header / Profile Section */}
            <div className="relative p-6 pt-12 pb-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5">
              <div className="absolute top-4 right-6 flex items-center justify-end w-full pl-6">
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {(user || staffUser) ? (
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={user?.avatar || staffUser?.avatar || `https://ui-avatars.com/api/?name=${user?.name || staffUser?.name}&background=random`} 
                      className="w-16 h-16 rounded-3xl object-cover ring-4 ring-white/5"
                      alt="Profile"
                    />
                     <div>
                        <div className={`flex items-center gap-2 mb-1.5 px-2 py-1 ${staffUser ? 'bg-brand-500/10 border-brand-500/20' : (user?.email?.toLowerCase().endsWith("@reva.edu.in") && user?.type === 'university') ? 'bg-brand-500/10 border-brand-500/20' : 'bg-blue-500/10 border-blue-500/20'} border rounded-full w-fit`}>
                           {staffUser ? <Shield className="w-3 h-3 text-brand-500" /> : (user?.email?.toLowerCase().endsWith("@reva.edu.in") && user?.type === 'university') ? <Shield className="w-3 h-3 text-brand-500" /> : <Globe className="w-3 h-3 text-blue-500" />}
                           <span className={`text-[9px] font-black uppercase tracking-widest ${staffUser ? 'text-brand-500' : (user?.email?.toLowerCase().endsWith("@reva.edu.in") && user?.type === 'university') ? 'text-brand-500' : 'text-blue-500'}`}>
                             {staffUser ? "Staff Access" : (user?.email?.toLowerCase().endsWith("@reva.edu.in") && user?.type === "university") ? "University Access" : "General Access"}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-white leading-tight">{user?.name || staffUser?.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{user?.email || staffUser?.email}</p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 mb-4">
                   <h3 className="text-2xl font-black text-white tracking-tight">Welcome</h3>
                   <p className="text-slate-400 text-sm mt-2">Explore our engineering excellence</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

            <div className="grid grid-cols-1 gap-2">
              <div className="mb-4">
                <p className="px-4 mb-3 text-[11px] font-black text-brand-500 uppercase tracking-widest opacity-50">Navigation</p>
                {mainLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all ${
                        isActive ? "bg-white/10 text-white shadow-lg shadow-black/20" : "hover:bg-white/5 text-slate-400 hover:text-white"
                      }`
                    }
                  >
                    {link.icon && <link.icon className={`w-4 h-4 ${location.pathname === link.path ? "text-brand-500" : "text-slate-500"}`} />}
                    <span className="font-bold text-base">{link.name}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-20" />
                  </NavLink>
                ))}
              </div>

              <div>
                <p className="px-4 mb-3 text-[11px] font-black text-brand-500 uppercase tracking-widest opacity-50">Discover More</p>
                {secondaryLinks.filter(l => !visiblePaths.includes(l.path)).map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-5 px-5 py-4 rounded-[1.5rem] transition-all border border-transparent ${
                        isActive ? "bg-white/10 text-white shadow-lg shadow-black/20" : "hover:bg-white/5 text-slate-400 hover:text-white"
                      }`
                    }
                  >
                    <div className={`p-2.5 rounded-2xl ${location.pathname === link.path ? "bg-brand-500/20 text-brand-500" : "bg-white/5 text-slate-500"}`}>
                       <link.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-base">{link.name}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-10" />
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

            <div className="p-8 border-t border-white/5 flex items-center justify-between text-slate-500 bg-black/20">
              <p className="text-xs font-medium">© 2026 REVA IDEA Lab</p>
              <div className="flex gap-4">
                <Globe className="w-4 h-4 opacity-30" />
                <Layers className="w-4 h-4 opacity-30" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;
