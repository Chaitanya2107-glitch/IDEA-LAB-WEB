import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    id: 1,
    image: 'img/homepage/DSC_4856.JPG',
    title: 'Innovation Redefined',
    subtitle: 'Where ideas meet execution'
  },
  {
    id: 2,
    image: 'img/homepage/DSC_4770.JPG',
    title: 'Future Ready',
    subtitle: 'Building the next generation of creators'
  },
  {
    id: 3,
    image: 'img/homepage/DSC_4720.JPG',
    title: 'Limitless Potential',
    subtitle: 'Explore the boundaries of science'
  },
  {
    id: 4,
    image: 'img/homepage/DSC_4782.JPG',
    title: 'Collaborative Ecosystem',
    subtitle: 'Uniting diverse minds for breakthrough solutions'
  },
  {
    id: 5,
    image: 'img/homepage/5.png',
    title: 'Advanced Fabrication',
    subtitle: 'State-of-the-art tools for rapid prototyping'
  }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={SLIDES[currentSlide].image} 
            alt={SLIDES[currentSlide].title} 
            loading={currentSlide === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover"
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-transparent to-black/30 opacity-80" />
          <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="max-w-6xl"
        >
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 mb-6 text-sm font-bold tracking-widest text-brand-400 uppercase bg-black/50 backdrop-blur-md rounded-full border border-brand-500/30"
          >
            Welcome to
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-tight mb-6 drop-shadow-2xl"
          >
            REVA University <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-vivid-pink">
              AICTE IDEA LAB
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          >
            {SLIDES[currentSlide].subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/gallery" className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand-600/30 flex items-center group">
              Explore Gallery <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/events" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-lg transition-all transform hover:scale-105">
              Upcoming Events
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-10 right-10 z-20 hidden md:flex space-x-4">
        <button onClick={prevSlide} className="p-3 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="p-3 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Indicators */}
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-brand-500' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
