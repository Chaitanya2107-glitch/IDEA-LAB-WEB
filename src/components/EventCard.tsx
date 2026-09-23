
import React from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Plus, ArrowRight } from 'lucide-react';
import { Event } from '../../types';
import { generateGoogleCalendarUrl } from '../utils/calendar';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const googleUrl = generateGoogleCalendarUrl(event);

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-brand-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
          {event.category}
        </div>
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
      </div>

      {/* Date Badge */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-2xl p-2 text-center shadow-lg min-w-[60px]">
        <span className="block text-[10px] font-bold text-gray-400 uppercase">{event.date.toLocaleString('default', { month: 'short' })}</span>
        <span className="block text-lg md:text-xl font-black text-brand-600 leading-none">{event.date.getDate()}</span>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <Link to={`/events/${event.id}`}>
            <h3 className="text-lg md:text-xl font-display font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {event.title}
            </h3>
        </Link>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-slate-500 text-xs md:text-sm">
            <Clock className="w-3.5 h-3.5 mr-2 text-brand-500" />
            {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center text-slate-500 text-xs md:text-sm">
            <MapPin className="w-3.5 h-3.5 mr-2 text-brand-500" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <p className="text-slate-600 text-xs md:text-sm line-clamp-3 mb-6 flex-grow">
          {event.description}
        </p>

        <div className="flex gap-2 mt-auto">
             <a 
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center py-2.5 md:py-3 bg-slate-50 text-slate-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 text-xs md:text-sm"
            >
            <Plus className="w-3.5 h-3.5 mr-2" />
            <span className="hidden md:inline">Add to Cal</span><span className="md:hidden">Cal</span>
            </a>
            <Link 
            to={`/events/${event.id}`}
            className="flex-1 inline-flex items-center justify-center py-2.5 md:py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-brand-600 transition-all duration-300 text-xs md:text-sm group/btn"
            >
            Details <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
