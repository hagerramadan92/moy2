"use client";

import { useEffect } from 'react';

export default function LeafletFix() {
  useEffect(() => {
    // Fix for Leaflet default icons
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
      iconUrl: '/leaflet/images/marker-icon.png',
      shadowUrl: '/leaflet/images/marker-shadow.png',
    });
  }, []);

  return null;
}