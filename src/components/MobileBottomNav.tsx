import React from 'react';
import { NavigationTab, AppUser } from '../types';
import { 
  LayoutDashboard, 
  ScanLine, 
  Database, 
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

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    superAdminOnly?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: LayoutDashboard,
    },
    {
      id: 'inventaire',
      label: 'Inventaire',
      icon: ScanLine,
      badge: inventoryCount > 0 ? inventoryCount : undefined,
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: Database,
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'parametres' as NavigationTab,
            label: 'Config',
            icon: Settings,
            superAdminOnly: true,
          },
        ]
      : []),
    {
      id: 'profil',
      label: 'Mon Profil',
      icon: User,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Menu mobile inférieur"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              id={`mobile-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] relative group touch-manipulation ${
                isActive
                  ? 'text-red-600 dark:text-red-500 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              {/* Icon Container with optional notification badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-red-600 dark:text-red-500' : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-xs border border-white dark:border-slate-900">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] mt-1 leading-none tracking-tight truncate ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>

              {/* Active bar indicator */}
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-red-600 dark:bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
