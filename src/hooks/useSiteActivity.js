'use client';

import { useState, useEffect, useRef } from 'react';

export function useSiteActivity() {
  const [activeTime, setActiveTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    if (!isActive) {
      setIsActive(true);
      startTimer();
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;
      
      if (inactiveTime > 30000) {
        setIsActive(false);
        clearInterval(intervalRef.current);
        return;
      }

      setActiveTime(prev => {
        const newTime = prev + 1;
        localStorage.setItem('site_active_time', newTime.toString());
        return newTime;
      });
    }, 1000);
  };

  useEffect(() => {
    const savedTime = localStorage.getItem('site_active_time');
    if (savedTime) {
      setActiveTime(parseInt(savedTime) || 0);
    }

    startTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => updateActivity();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return { activeTime, isActive, resetTime: () => setActiveTime(0) };
}