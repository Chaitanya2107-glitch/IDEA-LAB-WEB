import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Zap } from 'lucide-react';

const FEATURES = [
  {
    id: 1,
    tag: "Collaboration",
    title: "Interdisciplinary Ecosystem",
    description: "We shatter the walls between departments. Mechanical engineers work alongside artists, and computer scientists collaborate with biologists. This cross-pollination of ideas is where true innovation begins.",
    points: ["Open-plan co-working spaces", "Cross-domain faculty mentorship", "Student-led interest groups"],
    image: "https://picsum.photos/seed/collab2/1200/800"
  },
  {
    id: 2,
    tag: "Infrastructure",
    title: "Industry 4.0 Ready",
    description: "Don't just read about the future—build it. Our lab is equipped with the latest industrial-grade machinery, ensuring that you graduate with hands-on experience on the tools that power the world.",
    points: ["5-Axis CNC Milling", "Industrial IoT Sensor Arrays", "AR/VR Development Studio"],
    image: "https://picsum.photos/seed/machine/1200/800"
  },
  {
    id: 3,
    tag: "Incubation",
    title: "From Idea to Enterprise",
    description: "The journey doesn't end at the prototype. Our dedicated incubation cell helps student entrepreneurs navigate the complex world of patents, funding, and go-to-market strategies.",
    points: ["Seed funding opportunities", "IP Rights guidance", "Investor networking events"],
    image: "https://picsum.photos/seed/startup2/1200/800"
  }
];

const AboutSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const nextSlide = () => goToSlide((currentIndex + 1) % FEATURES.length);
  const prevSlide = () => goToSlide((currentIndex - 1 + FEATURES.length) % FEATURES.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const currentFeature = FEATURES[currentIndex];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-vivid-pink/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <span className="text-brand-600 font-bold tracking-wider uppercase text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" /> About The Lab
          </span>
          <h2 className="text-4xl font-display font-bold text-slate-900 mt-2">Center for Excellence</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Side */}
          <div className={`space-y-8 transition-all duration-500 transform ${isAnimating ? 'opacity-50 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-slate-600 text-xs font-bold uppercase tracking-wide">
              {currentFeature.tag}
            </div>
            
            <h3 className="text-3xl md:text-5xl font-display font-bold text-slate-900 leading-tight">
              {currentFeature.title}
            </h3>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              {currentFeature.description}
            </p>

            <ul className="space-y-4">
              {currentFeature.points.map((point, idx) => (
                <li key={idx} className="flex items-center space-x-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Controls */}
            <div className="flex items-center space-x-6 pt-8">
              <div className="flex space-x-2">
                <button 
                  onClick={prevSlide}
                  className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-brand-300 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-brand-300 transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              
              {/* Progress Dots */}
              <div className="flex space-x-2">
                {FEATURES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-8 bg-brand-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative h-[400px] lg:h-[500px] w-full group perspective">
            <div className="absolute inset-0 bg-brand-600 rounded-3xl transform rotate-3 scale-95 opacity-20 transition-transform group-hover:rotate-6 duration-500"></div>
            <div className={`relative h-full w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
              <img 
                src={currentFeature.image} 
                alt={currentFeature.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 to-transparent mix-blend-multiply"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSlider;