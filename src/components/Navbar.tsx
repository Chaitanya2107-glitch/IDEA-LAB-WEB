// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Box, User as UserIcon, Settings, LogOut, ChevronDown, Printer,
  Shield, LayoutDashboard, ChevronRight, Users, Zap, Info, MessageSquare,
  Globe, Home, Calendar, LayoutTemplate, Package, CircuitBoard, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { User, StaffUser } from '../../types';
import SideDrawer from './SideDrawer';

interface NavbarProps {
  user: User | null;
  staffUser?: StaffUser | null;
  onLogout: () => void;
  onUpdateUser: (data: any) => Promise<void>;
}

const Navbar: React.FC<NavbarProps> = ({ user, staffUser, onLogout, onUpdateUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mainLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
  ];

  const secondaryLinks = [
    { name: "About Us", path: "/about", icon: Info },
    { name: "Projects", path: "/projects", icon: Zap },
    { name: "Infrastructure", path: "/infrastructure", icon: Layers },
    { name: "Team", path: "/team", icon: Users },
    { name: "Testimonials", path: "/testimonials", icon: MessageSquare },
  ];

  const is2XL = windowWidth >= 1536;
  const isXL = windowWidth >= 1280;
  const isLG = windowWidth >= 1024;

  const visibleSecondary = secondaryLinks.filter(l => {
    if (l.name === "About Us") return isLG;
    if (l.name === "Projects") return isXL;
    return false;
  });

  const hiddenSecondary = secondaryLinks.filter(l => !visibleSecondary.includes(l));

  /* ---------------------------------------------
     LOGIC UPDATE: Avatar + Name Logic Fixed
     --------------------------------------------- */
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

  /* --------------------------------------------- */

  const mobileLinks = [
    ...(activeUser
      ? [
          {
            name: staffUser ? "Staff Dashboard" : "My Dashboard",
            path: staffUser ? "/staff-dashboard" : "/dashboard",
            icon: LayoutDashboard,
          },
        ]
      : []),
    { name: "Home", path: "/", icon: Home },

    ...(activeUser
      ? [
          ...(user?.type !== "non-university" && !staffUser
            ? [{ name: "Component Catalog", path: "/components", icon: Package }]
            : []),
        ]
      : []),

    { name: "Events", path: "/events", icon: Calendar },
    { name: "Gallery", path: "/gallery", icon: LayoutTemplate },
    { name: "About Us", path: "/about", icon: Info },
    { name: "Infrastructure", path: "/infrastructure", icon: Layers },
    { name: "Our Team", path: "/team", icon: Users },
    { name: "Projects", path: "/projects", icon: Zap },
    { name: "Testimonials", path: "/testimonials", icon: MessageSquare },
  ];

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const LOGO_LIGHT_BG = "/img/logo_orange_new.png";
  const LOGO_DARK_BG = "/img/logo_orange_new.png";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
    setMoreOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = (isOpen || moreOpen) ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, moreOpen]);

  useEffect(() => {
    const handleToggle = () => setMoreOpen(prev => !prev);
    window.addEventListener('toggleSideDrawer', handleToggle);
    return () => window.removeEventListener('toggleSideDrawer', handleToggle);
  }, []);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Pages whose background is LIGHT — navbar should use dark text/logo
  const isLightPage = [
    "/events",
    "/login",
    "/staff-dashboard",
    "/dashboard",
    "/team",
    "/resources",
    
    "/testimonials",
    "/3d-print",
  ].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/")
  );

  // Pages whose background is DARK — navbar should use WHITE text/logo
  const isDarkPage = [
    "/gallery",
    "/pcb-order",
    "/staff-login",
    "/about",
    "/infrastructure",
    "/projects",
  ].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/")
  );

  // On dark-bg pages: always white text (unless scrolled, where glass pill shows light bg)
  // On light-bg pages or scrolled: dark text
  const useDarkText = !isOpen && (
    isDarkPage ? scrolled : (scrolled || isLightPage)
  );

  // Logo to show: white logo on dark pages (unscrolled) or dark logo otherwise
  const showWhiteLogo = isDarkPage && !scrolled;


  const logoutHandler = () => {
    setIsOpen(false);
    onLogout();
    navigate("/");
  };

  const goToSettings = () => {
    setProfileOpen(false);
    setIsOpen(false);
    if (staffUser) navigate("/staff-dashboard");
    else if (user) navigate("/dashboard");
  };

  const getBadge = () => {
    if (staffUser) return "Staff Access";
    const isUnivEmail = user?.email?.toLowerCase().endsWith("@reva.edu.in");
    if (user?.type === "university" && isUnivEmail) return "University Access";
    return "General Access";
  };

  const getBadgeIcon = () => {
    if (staffUser) return <Shield className="w-3 h-3 text-brand-600" />;
    if (user?.type === "non-university")
      return <Globe className="w-3 h-3 text-blue-600" />;
    return <UserIcon className="w-3 h-3 text-brand-600" />;
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >


        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            scrolled && !isOpen
              ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              : isDarkPage
              ? (scrolled ? "bg-white/80 backdrop-blur-xl" : "bg-black/30 backdrop-blur-md")
              : (scrolled ? "bg-white/80 backdrop-blur-xl" : "bg-white/50 backdrop-blur-sm md:bg-transparent")
          } ${scrolled ? 'rounded-full border border-white/50' : isDarkPage ? 'rounded-full border border-white/10' : 'rounded-full border border-black/5 md:border-transparent'}`}
        >
          <div className="flex justify-between items-center h-14">
            <NavLink to="/" className="flex-shrink-0 flex items-center pl-2 min-w-[140px]">
              <img
                src={showWhiteLogo ? LOGO_DARK_BG : LOGO_LIGHT_BG}
                alt="REVA University"
                className="h-10 md:h-12 w-auto object-contain transition-all duration-300"
              />
            </NavLink>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-1 items-center bg-gray-100/10 p-1 rounded-full backdrop-blur-sm mx-4">
                {mainLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 lg:px-4 py-1.5 rounded-full text-sm font-medium ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : useDarkText
                          ? "text-slate-600 hover:text-slate-900 hover:bg-gray-100/50"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}


                {/* Progressive Secondary Links */}
                <div className="flex items-center space-x-1">
                  {visibleSecondary.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `px-3 lg:px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${
                          isActive
                            ? "bg-white text-slate-900 shadow-sm"
                            : useDarkText
                            ? "text-slate-600 hover:text-slate-900 hover:bg-gray-100/50"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`
                      }
                    >
                      {link.name === "PCB Fabrication" ? "PCB" : link.name === "3D Printing" ? "3D Print" : link.name}
                    </NavLink>
                  ))}
                </div>                {/* Premium Hamburger Menu for Desktop */}
                <div className="relative">
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`p-2 rounded-full transition-all group ${
                      moreOpen
                        ? "bg-white text-slate-900 shadow-sm"
                        : useDarkText
                        ? "text-slate-600 hover:text-slate-900 hover:bg-gray-100/50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {moreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
              </div>
            
            {/* RIGHT SIDE USER */}
            <div className="hidden md:flex items-center gap-3 pr-1 flex-shrink-0">
               {activeUser ? (
                 <div className="relative" ref={profileRef}>
                   <button
                     onClick={() => setProfileOpen(!profileOpen)}
                     className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border transition-all ${
                       useDarkText
                         ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                         : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                     }`}
                   >
                     <img
                       src={activeUser.avatar}
                       alt={activeUser.name}
                       className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50 shadow-sm"
                     />
                     <span
                       className={`text-sm font-black max-w-[100px] truncate ${
                         useDarkText ? "text-slate-800" : "text-white"
                       }`}
                     >
                       {activeUser.name.split(" ")[0]}
                     </span>
                     <ChevronDown
                       className={`w-3.5 h-3.5 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''} ${
                         useDarkText ? "text-slate-400" : "text-white/70"
                       }`}
                     />
                   </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[51]">
                        <div className="px-5 py-5 border-b border-slate-50">
                          <div className="flex items-center gap-2 mb-2">
                             {getBadgeIcon()}
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest text-nowrap">
                              {getBadge()}
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
                             onClick={() =>
                               navigate(staffUser ? "/staff-dashboard" : "/dashboard")
                             }
                             className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 flex items-center gap-3 transition-colors group"
                           >
                             <LayoutDashboard className="w-4 h-4 text-brand-600" />
                             {staffUser ? "Staff Dashboard" : "My Dashboard"}
                           </button>

                          {!staffUser && user?.type !== "non-university" && (
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
                      </div>
                    )}
                 </div>
               ) : (
                 <button
                   onClick={() => navigate("/login")}
                   className={`px-5 py-2 rounded-full text-sm font-bold flex gap-2 border bg-gradient-to-r hover:shadow-lg transition-all transform hover:scale-105 ${
                     useDarkText
                       ? "from-slate-800 to-slate-900 text-white border-transparent"
                       : "from-white/10 to-white/5 text-slate-900 border-white bg-white hover:bg-slate-50"
                   }`}
                 >
                   <UserIcon className="w-4 h-4" /> Sign In
                 </button>
               )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center z-50">
               <button
                 onClick={() => setIsOpen(!isOpen)}
                 className={`p-2 rounded-full transition-all ${
                   isOpen
                     ? "bg-white/20 text-white rotate-90"
                     : useDarkText
                     ? "text-slate-900 bg-gray-100"
                     : "text-white bg-white/10"
                 }`}
               >
                 {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
               </button>
            </div>
          </div>
        </div>

        {/* Side Drawer Component */}
        <SideDrawer 
          isOpen={moreOpen} 
          onClose={() => setMoreOpen(false)} 
          user={user} 
          staffUser={staffUser} 
        />

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="md:hidden fixed inset-0 z-40"
            >
              <div className="absolute inset-0 bg-[#0f172a]"></div>

              <div className="relative flex flex-col h-full overflow-y-auto">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-5 right-5 p-2.5 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all z-[60]"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Profile Section */}
                <div className="px-6 pt-16 pb-8 border-b border-white/5">
                  {activeUser ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={activeUser.avatar}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                        alt="Profile"
                      />
                      <div className="min-w-0">
                        <div className={`inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 ${staffUser ? 'bg-brand-500/15 border-brand-500/25' : user?.type === 'non-university' ? 'bg-blue-500/15 border-blue-500/25' : 'bg-brand-500/15 border-brand-500/25'} border rounded-full`}>
                          {getBadgeIcon()}
                          <span className={`text-[9px] font-black uppercase tracking-widest ${staffUser ? 'text-brand-400' : user?.type === 'non-university' ? 'text-blue-400' : 'text-brand-400'}`}>{getBadge()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white leading-tight truncate">{activeUser.name}</h3>
                        <p className="text-sm text-slate-400 mt-0.5 truncate">{activeUser.email}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setIsOpen(false); navigate("/login"); }}
                      className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> Sign In
                    </button>
                  )}
                </div>

                {/* Navigation Section */}
                <div className="flex-1 px-6 py-6 space-y-6">
                  <div>
                    <p className="px-1 mb-3 text-[11px] font-black text-brand-500 uppercase tracking-[0.2em]">Navigation</p>
                    <div className="space-y-1">
                      {[
                        { name: "Home", path: "/", icon: Home },
                        ...(activeUser ? [{ name: staffUser ? "Staff Dashboard" : "My Dashboard", path: staffUser ? "/staff-dashboard" : "/dashboard", icon: LayoutDashboard }] : []),
                        { name: "Events", path: "/events", icon: Calendar },
                        { name: "Gallery", path: "/gallery", icon: LayoutTemplate },
                        { name: "Project", path: "/projects", icon: Zap },
                      ].map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${
                              isActive ? "bg-white/8 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            }`
                          }
                        >
                          {link.icon && <link.icon className={`w-4.5 h-4.5 ${location.pathname === link.path ? 'text-brand-500' : 'text-slate-500'}`} />}
                          <span className="font-semibold text-[15px]">{link.name}</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-15" />
                        </NavLink>
                      ))}
                    </div>
                  </div>

                  {/* Discover More Section */}
                  <div>
                    <p className="px-1 mb-3 text-[11px] font-black text-brand-500 uppercase tracking-[0.2em]">Discover More</p>
                    <div className="space-y-1">
                      {[
                        ...(activeUser && user?.type !== "non-university" && !staffUser
                          ? [{ name: "Component Catalog", path: "/components", icon: Package }]
                          : []),
                        { name: "3D Printing", path: "/3d-print", icon: Printer },
                        { name: "PCB Fabrication", path: "/pcb-order", icon: CircuitBoard },
                        { name: "About Us", path: "/about", icon: Info },
                        { name: "Infrastructure", path: "/infrastructure", icon: Layers },
                        { name: "Our Team", path: "/team", icon: Users },
                        { name: "Testimonials", path: "/testimonials", icon: MessageSquare },
                      ].map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${
                              isActive ? "bg-white/8 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            }`
                          }
                        >
                          <link.icon className={`w-4.5 h-4.5 ${location.pathname === link.path ? 'text-brand-500' : 'text-slate-500'}`} />
                          <span className="font-semibold text-[15px]">{link.name}</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-15" />
                        </NavLink>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out */}
                  {activeUser && (
                    <button
                      onClick={logoutHandler}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span className="font-semibold text-[15px]">Sign Out</span>
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-6 border-t border-white/5 flex items-center justify-between bg-black/20">
                  <p className="text-xs font-medium text-slate-500">© 2026 REVA IDEA Lab</p>
                  <div className="flex gap-3">
                    <Globe className="w-4 h-4 text-slate-500 opacity-40" />
                    <Layers className="w-4 h-4 text-slate-500 opacity-40" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
