
import React from 'react';
import { FileText, Download, ExternalLink, BookOpen, Video } from 'lucide-react';
// Assuming this page remains static for now
const Resources: React.FC = () => { // Assuming this page remains static for now
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
         <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Student Resources</h1>
         <p className="text-slate-500 mb-12 text-lg">Manuals, Software, and Guidelines for IDEA Lab equipment.</p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Downloads */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-brand-600" /> Manuals & Guidelines
               </h2>
               <div className="space-y-4">
                  {[
                     "IDEA Lab Safety Protocol (PDF)",
                     "3D Printer Operation Manual (v2.1)",
                     "Laser Cutter Safety Guidelines",
                     "Project Proposal Template (DOCX)",
                     "Indent Request Format"
                  ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-brand-50 group cursor-pointer transition-colors">
                        <span className="font-medium text-slate-700">{item}</span>
                        <Download className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                     </div>
                  ))}
               </div>
            </div>

            {/* Software Links */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <ExternalLink className="w-6 h-6 text-blue-600" /> Software Tools
               </h2>
               <div className="space-y-4">
                  {[
                     { name: "Ultimaker Cura (Slicer)", desc: "For FDM 3D Printing" },
                     { name: "Autodesk Fusion 360", desc: "CAD/CAM Design (Student License)" },
                     { name: "Arduino IDE", desc: "Microcontroller Programming" },
                     { name: "KiCad PCB", desc: "Electronics Design Automation" }
                  ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 group cursor-pointer transition-colors">
                        <div>
                           <p className="font-bold text-slate-900">{item.name}</p>
                           <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                     </div>
                  ))}
               </div>
            </div>

            {/* Tutorials */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 md:col-span-2">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Video className="w-6 h-6 text-purple-600" /> Video Tutorials
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((_, i) => (
                     <div key={i} className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden group cursor-pointer">
                        <img src={`https://picsum.photos/seed/tutorial${i}/600/400`} alt="Tutorial" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                              <PlayIcon />
                           </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                           <p className="text-white font-bold text-sm">Introduction to {i === 0 ? '3D Printing' : i === 1 ? 'CNC Machining' : 'PCB Design'}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

const PlayIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

export default Resources;
