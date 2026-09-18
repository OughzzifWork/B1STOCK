import React from 'react';

interface AlfLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
}

export const AlfLogo: React.FC<AlfLogoProps> = ({ variant = 'full', className = '' }) => {
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center font-black rounded-lg overflow-hidden shrink-0 ${className}`}>
        <div className="w-9 h-9 bg-red-600 flex flex-col items-center justify-center text-white text-[11px] font-black leading-none border-b-2 border-emerald-600 shadow-xs">
          <span className="tracking-tighter">ALF</span>
          <span className="text-[9px] text-emerald-300 font-bold">MAG</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <div className="h-8 bg-red-600 text-white font-serif font-black px-2.5 flex items-center text-sm tracking-tight rounded-l-md shadow-xs">
          ALF AL MAGHRIB
        </div>
        <div className="h-8 bg-emerald-600 text-white px-2 flex items-center justify-center rounded-r-md">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 19h16v2H4zM19 9l-4-4H9L5 9v8h14V9z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      {/* Top Banner: Red Alf Al Maghrib + Green Stepped Graphic */}
      <div className="flex items-stretch shadow-xs rounded-t-md overflow-hidden">
        {/* Red Title Container */}
        <div className="bg-[#E30613] text-white px-3 sm:px-4 py-1.5 flex items-center justify-center font-serif font-extrabold tracking-tight text-base sm:text-lg">
          ALF AL MAGHRIB
        </div>

        {/* Green Graphic with Silhouette Cutout Effect */}
        <div className="bg-[#009A44] px-2.5 sm:px-3 py-1 flex items-center justify-center text-white relative">
          <svg
            className="w-8 sm:w-10 h-6 sm:h-7 text-white"
            viewBox="0 0 60 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stepped background shape */}
            <path
              d="M0 20 H15 V12 H30 V4 H60 V40 H0 Z"
              fill="#009A44"
            />
            {/* Hen / Poultry silhouette */}
            <path
              d="M5 33 C6 30 9 29 11 31 C12 32 12 34 10 35 C8 36 6 35 5 33 Z"
              fill="white"
            />
            {/* Sheep / Bovine silhouette */}
            <path
              d="M16 34 C17 28 22 26 27 28 C28 31 27 35 24 35 C21 35 18 36 16 34 Z"
              fill="white"
            />
            {/* Cow / Cattle silhouette */}
            <path
              d="M32 35 C33 24 42 20 54 22 C56 26 55 33 50 35 C45 35 38 36 32 35 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Subtitle: Black tracked text */}
      <div className="bg-white px-1.5 py-0.5 border-x border-b border-slate-200 rounded-b-md">
        <span className="block text-[8px] sm:text-[9.5px] font-black tracking-widest text-slate-900 uppercase text-center font-sans">
          ALIMENTS DE BETAIL ET VOLAILLE
        </span>
      </div>
    </div>
  );
};
