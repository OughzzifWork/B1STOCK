import React from 'react';
import { AppUser, NavigationTab, WarehouseEntity } from '../types';
import { 
  LayoutDashboard, 
  ScanLine, 
  Database, 
  Settings, 
  User, 
  LogOut, 
  Lock, 
  X 
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: AppUser;
  currentEntity?: WarehouseEntity;
  inventoryCount: number;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  inventoryCount,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}) => {
  const isSuperAdmin = currentUser.role === 'SuperAdmin';

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    superAdminOnly?: boolean;
    description: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Indicateurs & synthèse des stocks',
    },
    {
      id: 'inventaire',
      label: 'Inventaire',
      icon: ScanLine,
      badge: inventoryCount > 0 ? inventoryCount : undefined,
      description: 'Saisie PDA & table articles scannés',
    },
    {
      id: 'articles',
      label: 'DB Article SAP',
      icon: Database,
      description: 'Catalogue des pièces SAP ERP',
    },
    {
      id: 'parametres',
      label: 'Paramètres',
      icon: Settings,
      superAdminOnly: true,
      description: 'Users, Entités & Direct DB SAP',
    },
    {
      id: 'profil',
      label: 'Mon Profil',
      icon: User,
      description: 'Compte & changement de mot de passe',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 sm:w-72`}
      >
        {/* Brand Header: Just B1STOCK, no Alf Al Maghrib logo */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between min-h-[68px]">
          <div className="flex items-center gap-2">
            <span className="font-black text-2xl tracking-wider text-slate-900 dark:text-white">
              B1<span className="text-red-600">STOCK</span>
            </span>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 px-3 py-1">
            Menu Principal
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isLocked = item.superAdminOnly && !isSuperAdmin;

            if (isLocked) {
              return (
                <div
                  key={item.id}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 opacity-60 cursor-not-allowed select-none min-h-[46px]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <span>{item.label}</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-400">SuperAdmin requis</div>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                    Verrouillé
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-left min-h-[46px] group relative ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-red-600'
                    }`}
                  />
                  <div className="truncate">
                    <div className="leading-tight truncate">{item.label}</div>
                    <div
                      className={`text-[10px] font-normal truncate ${
                        isActive ? 'text-red-100' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Badge */}
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      isActive
                        ? 'bg-white text-red-600'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.superAdminOnly && isSuperAdmin && (
                  <span
                    className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded shrink-0 ${
                      isActive
                        ? 'bg-white text-red-600'
                        : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: KEEP JUST LOGOUT BUTTON */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <button
            type="button"
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2 min-h-[42px] shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};
