import React, { useEffect, useState } from 'react';
import { Play, X, Image as ImageIcon, Video, Loader2, Camera, SortDesc } from 'lucide-react';
import { authService } from '../services/api';
import { FadeIn } from '../components/FadeIn';

const GalleryLoader = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-slate-300" />
      </div>
    ))}
  </div>
);

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const data = await authService.getGalleryItems();
        if (mounted) {
          setItems(data || []);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchGallery();
    return () => { mounted = false; };
  }, []);

  // Filter items
  const filteredItems = items.filter(item => filter === 'all' || item.item_type === filter);

  // Sort items
  const sortedAndFilteredItems = [...filteredItems].sort((a, b) => {
    // Assuming items have a created_at property, otherwise use id or fallback
    const dateA = new Date(a.created_at || '2000-01-01').getTime();
    const dateB = new Date(b.created_at || '2000-01-01').getTime();
    
    if (sortOrder === 'newest') return dateB - dateA;
    return dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 pt-24 pb-16 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-300 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-8">
              <Camera className="w-3.5 h-3.5" /> Media Gallery
            </span>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white mb-6 leading-tight">
              Captured
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-300"> Moments</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
              A glimpse into the daily innovations and breakthroughs happening at the IDEA Lab.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* ── Filters & Sort ── */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? "bg-brand-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              All Media
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`flex items-center gap-2 shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'image' ? "bg-brand-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              <ImageIcon className="w-4 h-4" /> Photos
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`flex items-center gap-2 shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'video' ? "bg-brand-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              <Video className="w-4 h-4" /> Videos
            </button>
          </div>

          <div className="flex items-center gap-2">
            <SortDesc className="w-4 h-4 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-slate-100 border-none text-slate-700 text-sm font-bold rounded-full px-4 py-2 focus:ring-2 focus:ring-brand-500 cursor-pointer outline-none transition-all hover:bg-slate-200"
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <GalleryLoader />
        ) : sortedAndFilteredItems.length === 0 ? (
          <FadeIn>
            <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-sm">
                <p className="text-slate-500 text-lg font-medium">No {filter === 'all' ? 'media' : filter + 's'} found in the gallery yet.</p>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
            {sortedAndFilteredItems.map((item, index) => (
              <FadeIn key={item.id} delay={index * 0.05} className={`relative group rounded-3xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-xl cursor-zoom-in transition-all duration-300 border border-slate-200 ${
                  item.display_size === 'large' ? 'md:col-span-2 md:row-span-2' : 
                  item.display_size === 'medium' ? 'md:row-span-2' : ''
                }`}>
                
                {item.item_type === 'video' ? (
                  <div className="w-full h-full relative" onClick={() => setSelectedItem(item)}>
                      <img src={item.poster_url || item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <div className="w-14 h-14 bg-white shadow-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Play className="w-6 h-6 text-brand-600 fill-current ml-1" />
                          </div>
                      </div>
                  </div>
                ) : (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    loading="lazy"
                    onClick={() => setSelectedItem(item)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}

                {/* Overlay info */}
                <div onClick={() => setSelectedItem(item)} className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                  {item.tags && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.split(',').map((tag: string) => (
                        <span key={tag} className="text-[10px] px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white font-bold tracking-wider uppercase">
                            {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-white font-display font-black text-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {item.title}
                  </h3>
                  {item.caption && <p className="text-white/70 text-sm mt-1 truncate transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-50">{item.caption}</p>}
                </div>

              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 md:top-10 md:right-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 backdrop-blur-md"
              >
                  <X className="w-6 h-6" />
              </button>
              
              <div className="w-full max-w-6xl max-h-[90vh] relative flex flex-col items-center">
                  {selectedItem.item_type === 'video' ? (
                      <video 
                         src={selectedItem.image_url} 
                         controls 
                         autoPlay 
                         className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl ring-1 ring-white/10"
                      />
                  ) : (
                      <img 
                         src={selectedItem.image_url} 
                         alt={selectedItem.title} 
                         className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
                      />
                  )}
                  <div className="mt-6 text-center px-4">
                      <h3 className="text-2xl md:text-3xl font-bold font-display text-white mb-2">{selectedItem.title}</h3>
                      {selectedItem.caption && <p className="text-white/70 max-w-2xl mx-auto">{selectedItem.caption}</p>}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Gallery;
