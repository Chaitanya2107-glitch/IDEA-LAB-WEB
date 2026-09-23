import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Printer, 
  Cpu, 
  Settings, 
  Zap, 
  Wrench, 
  Monitor, 
  Layers, 
  PenTool, 
  Scissors,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Globe,
  Settings as ToolIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/FadeIn';

const equipmentCategories = [
  {
    category: "3D Printing & Prototyping",
    description: "State-of-the-art additive manufacturing systems for rapid prototyping and complex geometry fabrication.",
    icon: <Printer className="w-8 h-8 text-blue-500" />,
    badgeColor: "bg-blue-50 text-blue-700",
    accent: "bg-blue-600",
    items: [
      { name: "Stratasys F170", specs: "Industrial FDM, 254 × 254 × 254 mm", status: "Available" },
      { name: "Formlabs Form 3+", specs: "SLA Resin, High Detail resolution", status: "In Use" },
      { name: "Markforged Mark Two", specs: "Continuous Carbon Fiber Printing", status: "Maintenance" },
      { name: "Prusa i3 MK3S+", specs: "Desktop FDM, Multi-material", status: "Available" }
    ]
  },
  {
    category: "Subtractive Manufacturing",
    description: "High-precision CNC and laser systems for cutting, engraving, routing, and precision milling.",
    icon: <Scissors className="w-8 h-8 text-orange-500" />,
    badgeColor: "bg-orange-50 text-orange-700",
    accent: "bg-orange-600",
    items: [
      { name: "Epilog Fusion Pro Laser", specs: "120W CO2, 48\" x 36\" bed", status: "Available" },
      { name: "ShopBot Desktop MAX CNC", specs: "36\" x 24\" Wood & Plastics", status: "Available" },
      { name: "Bantam Tools PCB Mill", specs: "Desktop high-speed precision", status: "In Use" },
      { name: "Tormach 1100M CNC Mill", specs: "Personal CNC for metal cutting", status: "Available" }
    ]
  },
  {
    category: "Electronics & Embedded",
    description: "Comprehensive anti-static workstations for circuit design, testing, diagnostics, and soldering.",
    icon: <Cpu className="w-8 h-8 text-emerald-500" />,
    badgeColor: "bg-emerald-50 text-emerald-700",
    accent: "bg-emerald-600",
    items: [
      { name: "Rigol MSO5000", specs: "4-Channel, 350 MHz Oscilloscope", status: "Available" },
      { name: "Hakko FX-951", specs: "Digital Controlled Soldering Stations", status: "Available" },
      { name: "Siglent SPD3303X", specs: "Programmable Linear DC Power", status: "Available" },
      { name: "Fluke 87V", specs: "Industrial True-RMS Multimeters", status: "In Use" }
    ]
  },
  {
    category: "Mechanical Fabrication",
    description: "Heavy-duty traditional workshop tools for metal, wood, composite shaping, and finishing.",
    icon: <Wrench className="w-8 h-8 text-slate-500" />,
    badgeColor: "bg-slate-50 text-slate-700",
    accent: "bg-slate-600",
    items: [
      { name: "Bridgeport Milling Machine", specs: "Manual Knee Mill", status: "Available" },
      { name: "Grizzly Industrial Lathe", specs: "12\" x 36\" Gear-Head", status: "Maintenance" },
      { name: "DeWalt Drill Press", specs: "Heavy Duty Floor Model", status: "Available" },
      { name: "Makita Cold Saw", specs: "12-Inch Metal Cutting", status: "Available" }
    ]
  }
];

const Infrastructure: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Available": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "In Use": return <Clock className="w-4 h-4 text-amber-500" />;
      case "Maintenance": return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  const getStatusTextClasses = (status: string) => {
    switch(status) {
      case "Available": return "text-emerald-700 bg-emerald-50 ring-emerald-100";
      case "In Use": return "text-amber-700 bg-amber-50 ring-amber-100";
      case "Maintenance": return "text-rose-700 bg-rose-50 ring-rose-100";
      default: return "";
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 pt-24 pb-16 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
            <FadeIn>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-300 font-bold text-[10px] uppercase tracking-[0.3em] mb-8">
                    <ToolIcon className="w-3.5 h-3.5" /> Industrial Grade
                </span>
                <h1 className="text-3xl md:text-7xl font-display font-black text-white mb-6 leading-[1.1] uppercase tracking-tighter">
                    Built for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">Excellence.</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    The REVA IDEA Lab host a comprehensive ecosystem of high-precision tools and industrial machinery designed to support the entire product development lifecycle.
                </p>
            </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
          <FadeIn>
            <div className="space-y-16">
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-12 bg-brand-600" />
                <h2 className="text-3xl font-display font-black text-slate-900 mb-6 uppercase tracking-tight">Rapid Prototyping</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                    From initial sketches to functional prototypes, our lab provides the exact tools needed for high-fidelity model creation and testing.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-12 bg-blue-600" />
                <h2 className="text-3xl font-display font-black text-slate-900 mb-6 uppercase tracking-tight">Advanced Manufacturing</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Utilize industry-standard subtractive and additive systems to manufacture durable, end-use parts and complex assemblies.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                alt="Infrastructure" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
            </div>
          </FadeIn>
        </div>

        {/* Equipment Categories */}
        <div className="space-y-40">
            <FadeIn>
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-5xl font-display font-black text-slate-900 uppercase tracking-tighter">Laboratory Catalog</h2>
                    <p className="text-slate-400 text-lg font-medium italic">"Explore the heavy machinery and precision tools that power innovation."</p>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {equipmentCategories.map((category, idx) => (
                    <FadeIn key={idx} delay={idx * 0.1}>
                        <div className="p-10 bg-slate-50 rounded-[3.5rem] hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200/60">
                                <div className={`w-16 h-16 ${category.badgeColor} rounded-2xl flex items-center justify-center shadow-sm`}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">{category.category}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{category.items.length} Systems Deployed</p>
                                </div>
                            </div>
                            
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                                {category.description}
                            </p>

                            <div className="space-y-4 mt-auto">
                                {category.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-100 hover:border-brand-200 transition-colors shadow-sm">
                                        <div className="min-w-0 flex-1 pr-4">
                                            <h4 className="font-bold text-slate-800 text-sm mb-0.5 truncate">{item.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                                                <Settings className="w-3 h-3 text-slate-300" /> {item.specs}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${getStatusTextClasses(item.status)} flex items-center gap-1.5 shrink-0`}>
                                            {getStatusIcon(item.status)} {item.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-50 py-32 text-center px-4">
          <FadeIn>
              <h2 className="text-5xl font-display font-black text-slate-900 mb-6 uppercase tracking-tighter">Ready to Build?</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">Your transformation from student to innovator starts here.</p>
              <Link to="/login" className="px-12 py-5 bg-brand-600 text-white font-black rounded-full hover:bg-slate-900 transition-all hover:scale-110 shadow-xl shadow-brand-600/25 inline-flex items-center gap-3">
                  GET STARTED <ArrowRight className="w-5 h-5" />
              </Link>
          </FadeIn>
      </div>
    </div>
  );
};

export default Infrastructure;
