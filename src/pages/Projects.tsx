import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Play, Zap, Cpu, Sparkles } from 'lucide-react';
import { Project } from '../../types';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';

const ProjectCard: React.FC<{ project: any }> = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isHovered && videoRef.current && project.video) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, project.video]);

  return (
    <div 
      className="relative group rounded-3xl overflow-hidden mb-6 break-inside-avoid bg-gray-100 dark:bg-gray-900 cursor-pointer transition-transform duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl h-[300px] md:h-[400px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="absolute inset-0 w-full h-full">
         <img 
            src={project.image_url || project.image} 
            alt={project.title} 
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-700 ${isHovered && project.video ? 'opacity-0' : 'opacity-100'}`}
         />
         {project.video && (
             <video
                ref={videoRef}
                src={project.video}
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
             />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      {project.video && (
          <div className={`absolute top-4 right-4 bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-all duration-300 ${isHovered ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
             <Play className="w-4 h-4 fill-current" />
          </div>
      )}

      <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
         <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {project.category}
            </span>
         </div>
         <h3 className="text-2xl font-display font-bold leading-tight mb-2 drop-shadow-md">{project.title}</h3>
         <p className={`text-sm text-gray-200 line-clamp-2 mb-4 transition-all duration-500 ${isHovered ? 'opacity-100 max-h-20' : 'opacity-80 max-h-0 md:max-h-20'}`}>
            {project.description}
         </p>
         
         <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
            <span className="text-xs font-medium text-gray-300">By {project.author}</span>
            <div className="flex gap-2">
                <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 rounded-lg text-xs font-bold hover:bg-brand-500 transition-colors shadow-lg"
                >
                    View Project <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      try {
        const data = await authService.getProjects();
        if (mounted) {
          setProjects(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Fetch projects error:", err);
        if (mounted) setLoading(false);
      }
    };
    fetchProjects();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Override ── */}
      <div className="relative bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 pt-24 pb-16 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-300 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Innovation Showcase
          </span>
          <h1 className="text-3xl md:text-7xl font-display font-black text-white mb-6 leading-tight">
            Innovation in<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-300">Continuous Motion</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Explore the breakthrough technologies and creative solutions developed by the brilliant minds at REVA IDEA Lab.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {["Real-time Projects", "Industry Standard", "Student Driven", "Impact Focus"].map(s => (
              <span key={s} className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/80 text-sm font-semibold backdrop-blur">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-100 rounded-3xl" />)}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {projects.map(proj => (
               <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
