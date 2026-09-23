// src/components/DashboardNavbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon, Settings, LogOut, ChevronDown, 
  Home, Box, Menu, Shield, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, StaffUser } from '../../types';
import SideDrawer from './SideDrawer';

interface DashboardNavbarProps {
  user: User | null;
  staffUser?: StaffUser | null;
  onLogout: () => void;
  onUpdateUser: (data: any) => Promise<void>;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user, staffUser, onLogout }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => setMoreOpen(prev => !prev);
    window.addEventListener('toggleSideDrawer', handleToggle);
    return () => window.removeEventListener('toggleSideDrawer', handleToggle);
  }, []);

  const activeUser = user
    ? {
        id: user.id,
        name: user.name,
        avatar: user.avatar || "https://ui-avatars.com/api/?name=" + user.name,
        email: user.email,
        type: user.type ?? "student",
      }
    : staffUser
    ? {
        id: staffUser.employeeId,
        name: staffUser.name,
        avatar:
          staffUser.avatar ||
          "https://ui-avatars.com/api/?name=" + staffUser.name,
        email: staffUser.email || (staffUser.employeeId + "@reva.edu.in"),
        type: "staff",
      }
    : null;

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const logoutHandler = () => {
    setProfileOpen(false);
    onLogout();
    navigate("/");
  };

  const goToSettings = () => {
    setProfileOpen(false);
    if (staffUser) navigate("/staff-dashboard?tab=settings");
    else if (user) navigate("/dashboard?tab=settings");
  };

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-[60] py-3 pointer-events-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo hidden here — shown in sidebar instead */}
          <div className="hidden md:flex items-center gap-4" />

          <div className="md:hidden" /> {/* Spacer for mobile */}

          {/* Profile Section */}
          <div className="flex items-center pointer-events-auto">
             {activeUser ? (
               <div className="relative" ref={profileRef}>
                 <button
                   onClick={() => setProfileOpen(!profileOpen)}
                   className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                 >
                   <img
                     src={activeUser.avatar}
                     alt={activeUser.name}
                     className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50 shadow-sm"
                   />
                   <span className="text-sm font-black text-slate-800 hidden sm:block">
                     {activeUser.name.split(" ")[0]}
                   </span>
                   <ChevronDown
                     className={`w-3.5 h-3.5 transition-transform duration-300 text-slate-400 ${profileOpen ? 'rotate-180' : ''}`}
                   />
                 </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[70]"
                      >
                        <div className="px-5 py-5 border-b border-slate-50">
                          <div className="flex items-center gap-2 mb-2">
                             {(user?.email?.toLowerCase().endsWith("@reva.edu.in") && user?.type === "university") || staffUser ? <Shield className="w-3.5 h-3.5 text-brand-600" /> : <Globe className="w-3.5 h-3.5 text-blue-600" />}
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                              {staffUser ? "Staff Access" : (user?.email?.toLowerCase().endsWith("@reva.edu.in") && user?.type === "university") ? "University Access" : "General Access"}
                            </p>
                          </div>
                          <p className="text-base font-black text-slate-900 truncate leading-none mb-1.5">
                            {activeUser.name}
                          </p>
                          <p className="text-xs font-bold text-brand-600 truncate leading-none">
                            {activeUser.email}
                          </p>
                        </div>

                        <div className="p-1.5 space-y-0.5">
                          <button
                            onClick={() => navigate("/")}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors group"
                          >
                            <Home className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                            Go to Homepage
                          </button>

                          {((user?.email?.toLowerCase().endsWith("@reva.edu.in") && user?.type === "university") || staffUser) && (
                            <button
                              onClick={() => navigate("/components")}
                              className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                            >
                              <Box className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                              Catalog
                            </button>
                          )}

                          <button
                            onClick={goToSettings}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                          >
                            <Settings className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                            Settings
                          </button>
                        </div>

                        <div className="border-t border-slate-50 p-1.5 bg-slate-50/30">
                          <button
                            onClick={logoutHandler}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-black text-red-500 hover:bg-red-50 flex items-center gap-3 transition-all"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             ) : (
               <button
                 onClick={() => navigate("/login")}
                 className="px-5 py-2 rounded-full text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all transform hover:scale-105 pointer-events-auto"
               >
                 Sign In
               </button>
             )}
          </div>
        </div>
      </div>
    </nav>
    <SideDrawer 
      isOpen={moreOpen} 
      onClose={() => setMoreOpen(false)} 
      user={user} 
      staffUser={staffUser} 
    />
    </>
  );
};

export default DashboardNavbar;
