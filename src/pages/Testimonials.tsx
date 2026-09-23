
import React from 'react';
import { Quote, Star } from 'lucide-react';
// Assuming testimonials remain static for now
const TESTIMONIALS = [ // Assuming testimonials remain static for now
  {
    id: 1,
    text: "The IDEA Lab provided me with the tools and mentorship to turn my paper concept into a patented prototype. The 24/7 access is a game changer.",
    author: "Aditya Rao",
    role: "Final Year, Mechanical Engg",
    image: "https://ui-avatars.com/api/?name=Aditya+Rao&background=0D8ABC&color=fff"
  },
  {
    id: 2,
    text: "As a faculty member, having an industrial-grade fabrication facility on campus allows us to bridge the gap between theory and practical application effortlessly.",
    author: "Dr. Meera S.",
    role: "Associate Professor, ECE",
    image: "https://ui-avatars.com/api/?name=Meera+S&background=db2777&color=fff"
  },
  {
    id: 3,
    text: "The cross-disciplinary environment here is unmatched. I collaborated with CS students to build AI for my biotech project. Simply amazing.",
    author: "Rahul Varma",
    role: "Researcher, Biotechnology",
    image: "https://ui-avatars.com/api/?name=Rahul+Varma&background=ea580c&color=fff"
  },
  {
    id: 4,
    text: "Access to high-end CNC machines and 3D printers helped our startup 'AgriTech' build the MVP in record time.",
    author: "Sneha Kapoor",
    role: "Alumni & Founder, AgriTech",
    image: "https://ui-avatars.com/api/?name=Sneha+Kapoor&background=22c55e&color=fff"
  },
  {
    id: 5,
    text: "The workshops on IoT and Embedded Systems gave me practical skills that landed me my dream job at Bosch.",
    author: "Karthik N.",
    role: "Student, EEE",
    image: "https://ui-avatars.com/api/?name=Karthik+N&background=6366f1&color=fff"
  },
  {
    id: 6,
    text: "A truly world-class facility. The mentorship from industry experts during the hackathons was invaluable.",
    author: "Priya D.",
    role: "Student, CSE",
    image: "https://ui-avatars.com/api/?name=Priya+D&background=f59e0b&color=fff"
  }
];

const TestimonialCard: React.FC<{ t: any, isMobile?: boolean }> = ({ t, isMobile }) => (
    <div className={`bg-white p-8 rounded-3xl border border-gray-100 group transition-all duration-300 h-full flex flex-col justify-between ${
        isMobile 
        ? 'shadow-lg border-brand-100 min-w-[300px] w-[85vw] snap-center mr-4 bg-gradient-to-br from-white to-gray-50' 
        : 'shadow-sm hover:shadow-xl hover:-translate-y-1'
    }`}>
        <div>
            <div className="flex justify-between items-start mb-6">
                <Quote className="w-10 h-10 text-brand-100 fill-brand-50" />
                <div className="flex gap-1 text-yellow-400">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-8 italic text-lg font-medium">"{t.text}"</p>
        </div>
        
        <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
            <img src={t.image} alt={t.author} className="w-14 h-14 rounded-full object-cover ring-4 ring-gray-50 group-hover:ring-brand-50 transition-all" />
            <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">{t.author}</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">{t.role}</p>
            </div>
        </div>
    </div>
);

const Testimonials: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      
      {/* Header */}
      <div className="bg-slate-900 py-20 px-4 text-center text-white relative overflow-hidden bg-noise">
         <div className="absolute inset-0 bg-gradient-to-b from-brand-900/50 to-slate-900 opacity-90"></div>
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Discover how the IDEA Lab is transforming education and innovation at REVA University.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
         
         {/* MOBILE VIEW: Horizontal Scrolling Snap List */}
         <div className="md:hidden">
             <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
                {TESTIMONIALS.map(t => (
                   <TestimonialCard key={t.id} t={t} isMobile={true} />
                ))}
                {/* Spacer for right padding */}
                <div className="min-w-[1px] h-1"></div>
             </div>
             <div className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                 Swipe to see more
             </div>
         </div>

         {/* DESKTOP VIEW: Grid Layout */}
         <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
               <TestimonialCard key={t.id} t={t} isMobile={false} />
            ))}
         </div>

      </div>
    </div>
  );
};

export default Testimonials;
