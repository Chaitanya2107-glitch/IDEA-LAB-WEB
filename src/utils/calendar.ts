import { Event } from '../../types';

export const generateGoogleCalendarUrl = (event: Event): string => {
  const startTime = event.date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  // Assuming 2 hour duration for simplicity
  const endTime = new Date(event.date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  const text = encodeURIComponent(event.title);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
};
