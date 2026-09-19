import React from 'react';
import { AppUser, NavigationTab, WarehouseEntity } from '../types';
import { 
  LayoutDashboard, 
  ScanLine, 
  Database, 
  History,
  Settings, 
  User, 
  LogOut, 
  X
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: AppUser;
  currentEntity?: WarehouseEntity;
  inventoryCount: number;
  closedInventoryCount?: number;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  inventoryCount,
  closedInventoryCount,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
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
      id: 'history',
      label: 'Inventory History',
      icon: History,
      badge: closedInventoryCount && closedInventoryCount > 0 ? closedInventoryCount : undefined,
      description: 'Archives des inventaires passés clôturés',
    },
    ...(isSuperAdmin ? [{
      id: 'parametres' as NavigationTab,
      label: 'Paramètres',
      icon: Settings,
      superAdminOnly: true,
      description: 'Users, Entités & Direct DB SAP',
    }] : []),
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
        } ${isCollapsed ? 'lg:w-20 w-64 sm:w-72' : 'w-64 sm:w-72'}`}
      >
        {/* Brand Header: Exact same height (h-[68px]) and border-b as Header */}
        <div className="h-[68px] px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          {isCollapsed ? (
            <div className="w-full flex items-center justify-center">
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                B1<span className="text-red-600">S</span>
              </span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
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
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-3'} space-y-1.5 overflow-y-auto overflow-x-hidden`}>
          {!isCollapsed && (
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 px-3 py-1">
              Menu Principal
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            if (item.superAdminOnly && !isSuperAdmin) {
              return null;
            }

            if (isCollapsed) {
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  title={`${item.label} - ${item.description}`}
                  className={`w-full flex items-center justify-center p-3 rounded-xl transition-all relative min-h-[46px] group ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-red-600'
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span
                      className={`absolute top-1 right-1 px-1 py-0.2 rounded-full text-[9px] font-black min-w-[16px] text-center ${
                        isActive
                          ? 'bg-white text-red-600'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
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

        {/* Sidebar Footer: PWA Install & Logout */}
        <div className={`border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 ${isCollapsed ? 'p-2' : 'p-3'} space-y-2`}>
          {!isCollapsed && <PWAInstallButton variant="sidebar" />}
          {isCollapsed ? (
            <button
              type="button"
              id="btn-sidebar-logout-collapsed"
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center justify-center min-h-[42px] shadow-xs cursor-pointer"
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <LogOut className="w-5 h-5 text-rose-500" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-sidebar-logout"
              onClick={onLogout}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2 min-h-[42px] shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
