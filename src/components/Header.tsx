import React from 'react';
import { AppUser, NavigationTab, WarehouseEntity } from '../types';
import { 
  Menu, 
  Volume2, 
  VolumeX, 
  ClipboardList, 
  Sun, 
  Moon,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface HeaderProps {
  currentUser: AppUser;
  currentEntity?: WarehouseEntity;
  currentTab: NavigationTab;
  onToggleSidebar: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  inventoryCount: number;
  onOpenHistory: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentEntity,
  currentTab,
  onToggleSidebar,
  soundEnabled,
  onToggleSound,
  inventoryCount,
  onOpenHistory,
  isDarkMode,
  onToggleDarkMode,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}) => {
  const tabTitles: Record<NavigationTab, string> = {
    dashboard: 'Dashboard',
    inventaire: 'Inventaire PDA',
    articles: 'DB Articles SAP',
    history: 'Inventory History',
    parametres: 'Paramètres SuperAdmin',
    profil: 'Mon Profil',
  };

  const isConnected = currentEntity ? currentEntity.sapConfig.status === 'CONNECTED' : true;

  return (
    <header className="sticky top-0 z-30 h-[68px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border-b border-slate-200 dark:border-slate-800 transition-colors flex items-center shrink-0">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Mobile Hamburger, Desktop Toggle & Brand / Active Tab */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger */}
            <button
              type="button"
              id="btn-sidebar-toggle-mobile"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-600 transition min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-200 dark:border-slate-700"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Minimize / Expand Button */}
            {onToggleSidebarCollapse && (
              <button
                type="button"
                id="btn-sidebar-collapse-desktop-header"
                onClick={onToggleSidebarCollapse}
                className="hidden lg:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition min-w-[40px] min-h-[40px] items-center justify-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                aria-label={isSidebarCollapsed ? "Agrandir la barre latérale" : "Réduire la barre latérale"}
                title={isSidebarCollapsed ? "Agrandir la barre latérale" : "Réduire la barre latérale"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                    B1<span className="text-red-600">STOCK</span>
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <span className="font-bold text-xs sm:text-sm text-red-600 dark:text-red-400 truncate">
                    {tabTitles[currentTab]}
                  </span>
                </div>
                
                {/* SAP Direct DB Connection indicator */}
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 truncate">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    </span>
                    <span className="hidden xs:inline">Direct DB SAP ({currentEntity?.sapConfig.dbEngine || 'MSSQL'}) :</span>
                    <span className={isConnected ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                      {isConnected ? 'Connecté' : 'Hors Ligne'}
                    </span>
                  </span>
                  {currentEntity && (
                    <span className="hidden md:inline-flex items-center gap-1 text-slate-400 font-mono">
                      • {currentEntity.code} ({currentEntity.city})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dark Mode Toggle, Sound Toggle, User Pill & Scanned Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Dark Mode Switch */}
            {onToggleDarkMode && (
              <button
                type="button"
                id="btn-dark-mode-toggle"
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
                title={isDarkMode ? 'Basculer en Mode Clair' : 'Basculer en Mode Sombre'}
                aria-label="Basculer le mode sombre / clair"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </button>
            )}

            {/* Sound toggle */}
            <button
              type="button"
              id="btn-sound-toggle"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border text-xs min-h-[40px] min-w-[40px] flex items-center justify-center transition focus:outline-none ${
                soundEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
              title={soundEnabled ? 'Bip sonore scan activé' : 'Bip sonore désactivé'}
              aria-label="Basculer le son"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* User info pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${currentUser.avatarColor || 'bg-red-600 text-white'}`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">
                  {currentUser.role}
                </div>
              </div>
            </div>

            {/* Scanned articles counter / history button */}
            <button
              type="button"
              id="btn-open-history"
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-2.5 py-1.5 rounded-xl font-bold text-xs min-h-[40px] shadow-xs transition focus:outline-none focus:ring-2 focus:ring-red-400"
              title="Consulter l'historique des écritures d'inventaire"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="hidden xs:inline">Historique</span>
              <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-full text-[10px] font-black min-w-[20px] text-center shadow-xs">
                {inventoryCount}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
