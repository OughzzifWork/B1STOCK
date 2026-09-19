import React from 'react';
import { NavigationTab, AppUser } from '../types';
import { 
  LayoutDashboard, 
  ScanLine, 
  Database, 
  History,
  Settings, 
  User 
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  inventoryCount: number;
  currentUser: AppUser;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  inventoryCount,
  currentUser,
}) => {
  const isSuperAdmin = currentUser.role === 'SuperAdmin';
  const isScanActive = currentTab === 'inventaire';

  // Symmetrical sides layout:
  // Left: Accueil, Articles (2 items)
  // Center: Scanner PDA (1 primary action)
  // Right: History, Config/Profil (2 items)
  const leftItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: LayoutDashboard,
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: Database,
    },
  ];

  const rightItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'history',
      label: 'History',
      icon: History,
    },
    isSuperAdmin
      ? {
          id: 'parametres',
          label: 'Config',
          icon: Settings,
        }
      : {
          id: 'profil',
          label: 'Mon Profil',
          icon: User,
        },
  ];

  const renderStandardButton = (item: { id: NavigationTab; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;

    return (
      <button
        key={item.id}
        type="button"
        id={`mobile-tab-${item.id}`}
        onClick={() => onSelectTab(item.id)}
        className={`flex-1 max-w-[96px] flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] relative group touch-manipulation ${
          isActive
            ? 'text-red-600 dark:text-red-500 font-extrabold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <Icon
            className={`w-5 h-5 transition-transform ${
              isActive ? 'scale-110 text-red-600 dark:text-red-500' : ''
            }`}
          />
        </div>

        <span className={`text-[10px] mt-1 leading-none tracking-tight truncate ${isActive ? 'font-bold' : ''}`}>
          {item.label}
        </span>

        {isActive && (
          <span className="absolute bottom-0 w-6 h-0.5 bg-red-600 dark:text-red-500 rounded-full" />
        )}
      </button>
    );
  };

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Menu mobile inférieur"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto relative">
        {/* Left Side Navigation Items */}
        <div className="flex items-center justify-around flex-1">
          {leftItems.map(renderStandardButton)}
        </div>

        {/* Center Special Scan Button (Prominent, Raised & Distinctive Green) */}
        <div className="flex-shrink-0 px-2 flex flex-col items-center relative -mt-6">
          <button
            type="button"
            id="mobile-tab-inventaire-center-scan"
            onClick={() => onSelectTab('inventaire')}
            aria-label="Lancer le scanner d'inventaire"
            className={`relative group focus:outline-none touch-manipulation transition-all active:scale-95 ${
              isScanActive ? 'scale-105' : ''
            }`}
          >
            {/* Active glow pulse */}
            {isScanActive && (
              <span className="absolute -inset-1 rounded-full bg-[#009A44] opacity-50 blur-xs animate-pulse" />
            )}

            {/* Raised Circular Button in Company Green (#009A44) */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 ring-4 ${
                isScanActive
                  ? 'bg-gradient-to-tr from-[#008239] via-[#009A44] to-[#10B981] ring-[#009A44]/30 shadow-[#009A44]/50'
                  : 'bg-[#009A44] hover:bg-[#008239] ring-white dark:ring-slate-900 shadow-md shadow-[#009A44]/40'
              }`}
            >
              <ScanLine className="w-6 h-6 stroke-[2.5] text-white transition-transform group-hover:scale-110" />
            </div>

            {/* Inventory Count Badge */}
            {inventoryCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md border-2 border-white dark:border-slate-900">
                {inventoryCount > 99 ? '99+' : inventoryCount}
              </span>
            )}
          </button>

          {/* Centered Special Label */}
          <span
            className={`text-[10px] mt-0.5 leading-none font-black tracking-wide uppercase ${
              isScanActive
                ? 'text-[#009A44] dark:text-emerald-400 font-extrabold'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Scanner
          </span>
        </div>

        {/* Right Side Navigation Items */}
        <div className="flex items-center justify-around flex-1">
          {rightItems.map(renderStandardButton)}
        </div>
      </div>
    </nav>
  );
};
