
import React from 'react';
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Github, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const LOGO_WHITE = "https://researchportal.reva.edu.in/assets/revawhite-Cgq6Hl76.png";

  return (
    <footer className="bg-slate-900 text-white pt-12 md:pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MOBILE VIEW (Visible on small screens, Hidden on md+) */}
        <div className="md:hidden flex flex-col items-center text-center space-y-8">
            <img 
                src={LOGO_WHITE}
                alt="REVA University" 
                className="h-10 w-auto object-contain opacity-90"
            />
            
            <div className="flex gap-6">
                <a href="#" className="p-3 bg-white/5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"><Twitter className="w-5 h-5" /></a>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 text-sm font-medium text-slate-400">
                <Link to="/about" className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">About</Link>
                <Link to="/events" className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">Events</Link>
                <Link to="/team" className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">Team</Link>
                <Link to="/contact" className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">Contact</Link>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed max-w-xs">
                © 2024 AICTE IDEA Lab.<br/>REVA University, Bengaluru.
            </div>
        </div>

        {/* DESKTOP VIEW (Hidden on small screens, Visible on md+) */}
        <div className="hidden md:grid grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img 
                  src={LOGO_WHITE}
                  alt="REVA University" 
                  className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              Empowering the next generation of innovators with cutting-edge tools, mentorship, and a collaborative ecosystem designed for breakthroughs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-slate-200">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/about" className="hover:text-brand-400 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-brand-500" /> About Us</Link></li>
              <li><Link to="/team" className="hover:text-brand-400 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-brand-500" /> Our Team</Link></li>
              <li><Link to="/projects" className="hover:text-brand-400 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-brand-500" /> Project Showcase</Link></li>
              <li><Link to="/testimonials" className="hover:text-brand-400 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-brand-500" /> Testimonials</Link></li>
              <li><Link to="/resources" className="hover:text-brand-400 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-brand-500" /> Resources</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-slate-200">Contact</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-brand-500 shrink-0" />
                <span>AICTE IDEA Lab, REVA University,<br/>Rukmini Knowledge Park, Kattigenahalli,<br/>Yelahanka, Bengaluru, Karnataka 560064</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-brand-500 shrink-0" />
                <span>idealab@reva.edu.in</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-brand-500 shrink-0" />
                <span>+91 80 4696 6966</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-slate-200">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4">Subscribe to our newsletter for the latest workshop alerts.</p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-slate-500"
              />
              <button className="bg-brand-600 text-white font-semibold py-3 rounded-lg hover:bg-brand-700 transition-colors text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Bottom Bar */}
        <div className="hidden md:flex pt-8 border-t border-slate-800 flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © 2024 AICTE IDEA Lab, REVA University. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
