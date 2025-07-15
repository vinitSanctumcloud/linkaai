'use client';
import { DashboardLayout } from '@/components/dashboard-layout';
import React, { useEffect, useState } from 'react';

const ComingSoon = () => {
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const dest = new Date('Aug 3, 2025 00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = dest - now;

      if (diff <= 0) {
        setCountdown({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        days: days < 10 ? `0${days}` : `${days}`,
        hours: hours < 10 ? `0${hours}` : `${hours}`,
        minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
        seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-5 text-center">
        <div className="bg-gray-800 rounded-2xl p-10 shadow-2xl">
          <div className="mb-5">
            <img
              src="https://via.placeholder.com/150x50?text=Moodify+Logo"
              alt="Moodify logo"
              className="max-w-[150px] mx-auto"
            />
          </div>
          <h1 className="text-5xl font-bold text-[#f9943b] mb-4">Coming Soon</h1>
          <p className="text-gray-300 text-lg mb-8">
            Just 20 days until the launch of Moodify! Be the first to experience our revolutionary product.
          </p>
          {/* <div className="flex justify-center gap-4 mb-8">
            <div className="flex flex-col min-w-[60px]">
              <h3 className="text-3xl font-bold text-white">{countdown.days}</h3>
              <p className="text-xs text-gray-300 uppercase">DAYS</p>
            </div>
            <h3 className="text-3xl text-gray-300">:</h3>
            <div className="flex flex-col min-w-[60px]">
              <h3 className="text-3xl font-bold text-white">{countdown.hours}</h3>
              <p className="text-xs text-gray-300 uppercase">HRS</p>
            </div>
            <h3 className="text-3xl text-gray-300">:</h3>
            <div className="flex flex-col min-w-[60px]">
              <h3 className="text-3xl font-bold text-white">{countdown.minutes}</h3>
              <p className="text-xs text-gray-300 uppercase">MINS</p>
            </div>
            <h3 className="text-3xl text-gray-300">:</h3>
            <div className="flex flex-col min-w-[60px]">
              <h3 className="text-3xl font-bold text-white">{countdown.seconds}</h3>
              <p className="text-xs text-gray-300 uppercase">SECS</p>
            </div>
          </div> */}
          {/* <h6 className="text-[#f9943b] text-base font-semibold mb-6">Launch Date: August 3, 2025</h6> */}
          <div className="flex justify-center gap-2 flex-wrap">
            <input
              type="email"
              placeholder="Enter your email..."
              className="w-[250px] p-3 border border-gray-600 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9943b]"
            />
            <button className="px-6 py-3 bg-[#f9943b] text-gray-800 font-medium rounded-lg hover:bg-[#e6832a] transition-colors">
              Notify Me
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-300">
            Get in touch with us:{' '}
            <a href="mailto:hello@moodify.com" className="text-[#f9943b] hover:text-[#e6832a] transition-colors">
              hello@moodify.com
            </a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;