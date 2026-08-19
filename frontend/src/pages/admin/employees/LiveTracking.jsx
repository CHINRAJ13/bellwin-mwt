import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import { MapPin } from 'lucide-react';

const LiveTracking = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <PageHeader
        title="Live Tracking"
        subtitle="Real-time employee movement and branch area (Trichy)"
        icon={MapPin}
      />
      
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-none">
        <div className="w-full rounded-none overflow-hidden border border-gray-200">
          <iframe 
            width="100%" 
            height="600" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=78.50%2C10.65%2C78.85%2C10.95&layer=mapnik&marker=10.8050%2C78.6856"
            className="w-full grayscale-[20%] hue-rotate-[10deg] contrast-[1.1]"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
