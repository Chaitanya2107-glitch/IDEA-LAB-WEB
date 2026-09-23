import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, ClipboardList, Settings, User, LucideIcon, MoreHorizontal, ChevronUp, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  id: string;
}

interface BottomNavProps {
  items?: NavItem[];
  activeId?: string;
  onTabChange?: (id: string) => void;
  isStaff?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, activeId, onTabChange, isStaff }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const defaultItems: NavItem[] = [
    { name: 'Home', path: isStaff ? '/staff-dashboard' : '/dashboard', icon: Home, id: 'overview' },
    { name: isStaff ? 'Activity' : 'Orders', path: '#activity', icon: ClipboardList, id: 'activity' },
    { name: 'Settings', path: '#settings', icon: Settings, id: 'settings' },
    { name: 'Profile', path: '#profile', icon: User, id: 'profile' },
  ];

  const allItems = items || defaultItems;
  const maxTabs = 5;
  const showMore = allItems.length > maxTabs;

  const displayItems = showMore ? allItems.slice(0, 4) : allItems;
  const moreItems = showMore ? allItems.slice(4) : [];

  // Close "More" menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  // Check if any "More" item is currently active
  const isMoreActive = moreItems.some(item => item.id === activeId);

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
      <div className="relative" ref={moreRef}>
        {/* --- Sub-menu for "More" --- */}
        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-[calc(100%+12px)] right-0 w-52 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl p-2.5 overflow-hidden flex flex-col gap-1.5 shadow-brand-500/10"
            >
              <div className="px-5 py-3 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management Lab</p>
              </div>
              
              {moreItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange?.(item.id);
                    setIsMoreOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all ${
                    activeId === item.id 
                    ? "bg-brand-50 text-brand-600 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeId === item.id ? "bg-white text-brand-600" : "bg-slate-50 text-slate-400"}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${activeId === item.id ? "opacity-100" : "opacity-80"}`}>
                    {item.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Main Navigation Bar --- */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex justify-between items-center p-2.5">
          {displayItems.map((item) => {
            const isActive = activeId === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange?.(item.id);
                  setIsMoreOpen(false);
                }}
                className={`relative flex flex-col items-center justify-center min-w-[64px] transition-all duration-500 ${
                  isActive ? "bg-white shadow-xl shadow-brand-500/10 rounded-[2rem] px-4 py-3" : "px-3 py-3"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                {isActive && (
                  <motion.span 
                    layoutId="label"
                    className="text-[9px] font-black uppercase tracking-widest text-brand-600 mt-1.5"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && (
                   <motion.div 
                     layoutId="cursor"
                     className="absolute -bottom-1 w-1 h-1 bg-brand-600 rounded-full"
                   />
                )}
              </button>
            );
          })}

          {showMore ? (
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] transition-all duration-500 rounded-[2rem] px-4 py-3 ${
                isMoreActive || isMoreOpen ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              <div className="relative">
                {isMoreOpen ? <ChevronUp className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                {!isMoreOpen && isMoreActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-600 rounded-full ring-2 ring-white" />
                )}
              </div>
              {(isMoreActive || isMoreOpen) && (
                <span className="text-[9px] font-black uppercase tracking-widest mt-1.5 italic">
                  More
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggleSideDrawer'))}
              className="flex flex-col items-center justify-center min-w-[64px] transition-all duration-500 rounded-[2rem] px-4 py-3 text-slate-400 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5 text-brand-600" />
              <span className="text-[9px] font-black uppercase tracking-widest mt-1.5 text-brand-600">
                Menu
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
