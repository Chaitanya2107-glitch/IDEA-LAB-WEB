
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, Calendar, Tag, User, Layers, Share2, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState<number | null>(null);

  const isMediaVideo = (url: string) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|webm|mov|ogg|avi)$/) || url.includes('/videos/');
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        const { data, error } = await supabase
          .from('lab_projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) {
          setProject({
            ...data,
            longDescription: data.long_description || data.description
          });
        }
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (!project) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h2>
        <button onClick={() => navigate('/projects')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Back to Projects</button>
    </div>
  );

  const heroImage = project.image_url || project.image;
  const hasHeroVideo = project.video && isMediaVideo(project.video);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Immersive Hero Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
            {hasHeroVideo ? (
                <video src={project.video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : heroImage ? (
                <img src={heroImage} alt={project.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Layers className="w-20 h-20 text-slate-200" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full p-6 z-20 pt-24">
            <button onClick={() => navigate('/projects')} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold hover:bg-white/20 transition-colors border border-white/10">
                <ArrowLeft className="w-4 h-4" /> All Projects
            </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto z-10">
            <div className="animate-slide-up">
                <span className="inline-block px-3 py-1 mb-4 rounded-full bg-brand-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-900/20">
                    {project.category}
                </span>
                <h1 className="text-4xl md:text-7xl font-display font-bold text-white mb-6 leading-tight max-w-4xl drop-shadow-xl">{project.title}</h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm md:text-base font-medium">
                    <div className="flex items-center gap-2"><User className="w-5 h-5 text-brand-400" /> {project.author}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-400" /> {project.date}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
              
              {/* Main Content */}
              <div className="lg:w-2/3 space-y-12">
                  <section>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-6 font-display uppercase tracking-tighter">Project by {project.author}</h2>
                      <div className="prose prose-lg text-slate-600 leading-relaxed">
                          <p className="text-xl font-light text-slate-800 mb-6">{project.long_description || project.description}</p>
                      </div>
                  </section>

                  {project.gallery && project.gallery.length > 0 && (
                      <section>
                          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-6 font-display uppercase tracking-tighter">Project Gallery Highlights</h2>
                          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                              {project.gallery.map((url, idx) => {
                                  const isVideo = isMediaVideo(url);
                                  return (
                                    <motion.div 
                                      key={idx} 
                                      whileHover={{ scale: 1.02, y: -5 }}
                                      className={`relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-zoom-in bg-slate-100 ${idx === 0 ? 'col-span-2 h-[200px] md:h-[400px]' : 'h-[120px] md:h-[250px]'}`}
                                      onClick={() => setActiveImageIdx(idx)}
                                    >
                                        {isVideo ? (
                                          <div className="w-full h-full relative">
                                            <video src={url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
                                                <ChevronRight className="w-6 h-6 fill-current" />
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                  );
                              })}
                          </div>
                      </section>
                  )}
              </div>

              {/* Sidebar Info */}
              <div className="lg:w-1/3">
                  <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 sticky top-24 shadow-sm">
                      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                          <Layers className="w-5 h-5 text-brand-600" /> Tech Stack
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                          {project.technologies?.map(tech => (
                              <span key={tech} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5 shadow-sm">
                                  <Tag className="w-3 h-3 text-brand-500" /> {tech}
                              </span>
                          ))}
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-200">
                          <button className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95">
                              Contact Author <ExternalLink className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Modern Lightbox Modal */}
      <AnimatePresence>
        {activeImageIdx !== null && project.gallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={(e) => { if(e.target === e.currentTarget) setActiveImageIdx(null); }}
          >
            <button 
              onClick={() => setActiveImageIdx(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
            >
              <X className="w-6 h-6" />
            </button>

            {project.gallery.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIdx((activeImageIdx - 1 + project.gallery.length) % project.gallery.length)}
                  className="absolute left-6 p-4 text-white hover:text-brand-400 transition-colors z-[110]"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                  onClick={() => setActiveImageIdx((activeImageIdx + 1) % project.gallery.length)}
                  className="absolute right-6 p-4 text-white hover:text-brand-400 transition-colors z-[110]"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}

            <motion.div
              layoutId={`gallery-${activeImageIdx}`}
              className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center"
            >
              {isMediaVideo(project.gallery[activeImageIdx]) ? (
                <video 
                  src={project.gallery[activeImageIdx]} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-full rounded-xl shadow-2xl" 
                />
              ) : (
                <img 
                  src={project.gallery[activeImageIdx]} 
                  alt="Full View" 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
              )}
              <div className="absolute -bottom-12 left-0 w-full text-center text-white/50 text-xs font-bold uppercase tracking-widest">
                Media {activeImageIdx + 1} of {project.gallery.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetails;
