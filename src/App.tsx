import React, { useState, useEffect, useRef } from 'react';
import { 
  SAPArticle, 
  InventoryRecord, 
  AppUser, 
  NavigationTab, 
  WarehouseEntity,
  ClosedInventory 
} from './types';
import { INITIAL_USERS, INITIAL_ENTITIES, INITIAL_CLOSED_INVENTORIES } from './data/mockSystemData';
import { findSapArticle } from './data/mockSapDatabase';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SapArticlesView } from './components/SapArticlesView';
import { InventoryHistoryView } from './components/InventoryHistoryView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HistoryModal } from './components/HistoryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { playSound, setSoundEnabled } from './utils/sound';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const STORAGE_KEY_AUTH_USER = 'b1stock_auth_user_v2';
const STORAGE_KEY_USERS = 'b1stock_users_list_v2';
const STORAGE_KEY_ENTITIES = 'b1stock_entities_list_v2';
const STORAGE_KEY_RECORDS = 'b1stock_inventory_records_v2';
const STORAGE_KEY_CLOSED_INVENTORIES = 'b1stock_closed_inventories_v2';
const STORAGE_KEY_DARK_MODE = 'b1stock_dark_mode_v2';
const STORAGE_KEY_SIDEBAR_COLLAPSED = 'b1stock_sidebar_collapsed_v2';

export default function App() {
  // Dark mode state with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DARK_MODE);
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_DARK_MODE, String(isDarkMode));
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Sidebar collapsed state with persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIDEBAR_COLLAPSED);
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return false;
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_SIDEBAR_COLLAPSED, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Users state
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  // Entities state with SAP configurations
  const [entities, setEntities] = useState<WarehouseEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTITIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ENTITIES;
  });

  // Authenticated user state - Mandatory login at application start
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Navigation tab state - Accessible after login, starting on Dashboard
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Inventory records state
  const [records, setRecords] = useState<InventoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'rec-init-01',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        formattedDate: new Date(Date.now() - 3600000 * 2).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        operatorId: 'USR-003',
        operatorName: 'Jean Dupont',
        codeArticle: 'PART-1001',
        nomArticle: 'Roulement à billes SKF 6204',
        qteSap: 15,
        qteReelle: 15,
        ecart: 0,
        status: 'CONFORME',
        emplacement: 'Allée B - Travée 04 - Niv. 2',
        notes: 'Comptage périodique régulier',
        entityId: 'ENT-01',
      },
      {
        id: 'rec-init-02',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        formattedDate: new Date(Date.now() - 3600000).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        operatorId: 'USR-003',
        operatorName: 'Jean Dupont',
        codeArticle: 'PART-2045',
        nomArticle: 'Courroie trapézoïdale Gates SPZ 1120',
        qteSap: 8,
        qteReelle: 7,
        ecart: -1,
        status: 'MANQUANT',
        emplacement: 'Allée C - Travée 01 - Niv. 1',
        notes: '1 pièce manquante signalée au chef de magasin',
        entityId: 'ENT-01',
      },
    ];
  });

  // Closed inventories history state
  const [closedInventories, setClosedInventories] = useState<ClosedInventory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLOSED_INVENTORIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLOSED_INVENTORIES;
  });

  // Active item & scanner state for Inventory
  const [scanInput, setScanInput] = useState('');
  const [activeArticle, setActiveArticle] = useState<SAPArticle | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [realCount, setRealCount] = useState('');
  const [notes, setNotes] = useState('');

  // Modals & settings
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  // Focus management
  const scanInputRef = useRef<HTMLInputElement | null>(null);
  const realStockInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch {
      // quota
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTITIES, JSON.stringify(entities));
    } catch {
      // quota
    }
  }, [entities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch {
      // quota
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLOSED_INVENTORIES, JSON.stringify(closedInventories));
    } catch {
      // quota
    }
  }, [closedInventories]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    } catch {
      // quota
    }
  }, [currentUser]);

  // Toast notification helper
  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playSound('scan');
  };

  // Login & Logout
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
    playSound('success');
    showToast(`Bienvenue, ${user.name} (${user.role}) !`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
    setActiveArticle(null);
    setScanInput('');
    setRealCount('');
  };

  // Self password update for the logged-in profile
  const handleUpdateMyPassword = (newPassword: string): boolean => {
    if (!currentUser) return false;
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);

    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u))
    );
    return true;
  };

  // Switch tab with SuperAdmin security guard
  const handleSelectTab = (tab: NavigationTab) => {
    if (tab === 'parametres' && currentUser?.role !== 'SuperAdmin') {
      showToast("Accès réservé au SuperAdmin pour la configuration.", 'warning');
      return;
    }
    setCurrentTab(tab);
    if (tab === 'inventaire') {
      setTimeout(() => scanInputRef.current?.focus(), 100);
    }
  };

  // SAP Article lookup
  const handleSearchSapArticle = (codeToSearch?: string) => {
    const query = codeToSearch || scanInput;
    if (!query || !query.trim()) return;

    setIsLoadingArticle(true);
    setSearchError(null);

    setTimeout(() => {
      const found = findSapArticle(query);
      setIsLoadingArticle(false);

      if (found) {
        setActiveArticle(found);
        setSearchError(null);
        playSound('scan');

        // Check for existing count (duplicate control)
        const existing = records.find((r) => r.codeArticle === found.codeArticle);
        if (existing) {
          setRealCount(String(existing.qteReelle));
          setNotes(existing.notes || '');
          showToast(
            `Article déjà compté : ${found.codeArticle} (${existing.qteReelle} ${found.unite || 'pièces'}). Vous pouvez ajuster la quantité réelle.`,
            'warning'
          );
        } else {
          setRealCount('');
          setNotes('');
        }

        setTimeout(() => {
          realStockInputRef.current?.focus();
        }, 60);
      } else {
        setActiveArticle(null);
        setSearchError(`Article "${query}" introuvable dans la base SAP.`);
        playSound('error');
        scanInputRef.current?.focus();
      }
    }, 180);
  };

  // Select article directly from "DB Article SAP" tab to start inventory
  const handleSelectArticleFromCatalog = (article: SAPArticle) => {
    setActiveArticle(article);
    setScanInput(article.codeArticle);
    setRealCount('');
    setNotes('');
    setSearchError(null);
    setCurrentTab('inventaire');
    playSound('scan');
    setTimeout(() => {
      realStockInputRef.current?.focus();
    }, 100);
  };

  // Upsert Inventory Record: strictly ONE record per article
  const handleAddRecord = (record: InventoryRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.codeArticle === record.codeArticle);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          ...record,
        };
        return updated;
      }
      return [record, ...prev];
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast("Enregistrement d'inventaire supprimé.", 'info');
  };

  const handleClearAllRecords = () => {
    setRecords([]);
    showToast("Historique d'inventaire purgé.", 'info');
  };

  // Close and archive the active inventory session to Inventory History
  const handleCloseInventory = (closingNotes?: string) => {
    if (records.length === 0) {
      showToast("Aucune écriture d'inventaire à clôturer.", 'warning');
      return;
    }

    const now = new Date();
    const nextNum = closedInventories.length + 1;
    const refNumber = `INV-${now.getFullYear()}-${String(nextNum).padStart(3, '0')}`;

    const newClosedInv: ClosedInventory = {
      id: `closed-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      reference: refNumber,
      closedAt: now.toISOString(),
      formattedDate: now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      closedBy: currentUser?.name || 'Opérateur',
      closedByRole: currentUser?.role || 'Opérateur',
      entityId: currentEntity?.id || 'ENT-01',
      entityName: currentEntity?.name || 'Magasin Central',
      totalItems: records.length,
      totalConforme: records.filter((r) => r.status === 'CONFORME').length,
      totalManquant: records.filter((r) => r.status === 'MANQUANT').length,
      totalSurplus: records.filter((r) => r.status === 'SURPLUS').length,
      totalEcart: records.reduce((acc, r) => acc + r.ecart, 0),
      notes: closingNotes?.trim() || undefined,
      records: [...records],
    };

    const archivedCount = records.length;
    setClosedInventories((prev) => [newClosedInv, ...prev]);
    // Reset the active inventory
    setRecords([]);
    setActiveArticle(null);
    setScanInput('');
    setRealCount('');
    setNotes('');

    playSound('success');
    showToast(`Inventaire ${refNumber} clôturé avec succès (${archivedCount} pièces sauvegardées dans l'historique).`, 'success');
    setCurrentTab('history');
  };

  const handleDeleteClosedInventory = (id: string) => {
    setClosedInventories((prev) => prev.filter((inv) => inv.id !== id));
    showToast("Session d'inventaire supprimée de l'historique.", 'info');
  };

  // If not logged in, render Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage users={users} onLogin={handleLogin} />
        <OfflineIndicator />
      </>
    );
  }

  // Active entity
  const currentEntity = entities.find((e) => e.id === currentUser.entityId) || entities[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-red-600 selection:text-white transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        currentEntity={currentEntity}
        inventoryCount={records.length}
        closedInventoryCount={closedInventories.length}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Layout Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64 sm:lg:pl-72'
        }`}
      >
        {/* Top Sticky Header */}
        <Header
          currentUser={currentUser}
          currentEntity={currentEntity}
          currentTab={currentTab}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          soundEnabled={soundActive}
          onToggleSound={handleToggleSound}
          inventoryCount={records.length}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="px-3 pt-3 sm:px-6 max-w-7xl mx-auto w-full">
            <div
              className={`p-3 rounded-xl flex items-center justify-between shadow-md transition text-xs sm:text-sm font-bold ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-700 text-white'
                  : toastMessage.type === 'warning'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-xs uppercase opacity-80 hover:opacity-100 px-2 py-0.5 rounded bg-black/20"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Views based on current tab */}
        <main className="flex-1 p-3 sm:p-5 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              records={records}
              entities={entities}
              currentEntity={currentEntity}
              onGoToInventory={() => handleSelectTab('inventaire')}
              onGoToArticles={() => handleSelectTab('articles')}
            />
          )}

          {currentTab === 'inventaire' && (
            <InventoryView
              currentUser={currentUser}
              currentEntity={currentEntity}
              activeArticle={activeArticle}
              onSetActiveArticle={setActiveArticle}
              scanInput={scanInput}
              onChangeScanInput={setScanInput}
              onSearchSap={handleSearchSapArticle}
              isLoadingArticle={isLoadingArticle}
              searchError={searchError}
              realCount={realCount}
              onChangeRealCount={setRealCount}
              notes={notes}
              onChangeNotes={setNotes}
              records={records}
              onAddRecord={handleAddRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearAllRecords={handleClearAllRecords}
              scanInputRef={scanInputRef}
              realStockInputRef={realStockInputRef}
              showToast={showToast}
              onCloseInventory={handleCloseInventory}
              onGoToHistory={() => handleSelectTab('history')}
            />
          )}

          {currentTab === 'articles' && (
            <SapArticlesView
              records={records}
              onSaveRecord={handleAddRecord}
              currentUser={currentUser}
              currentEntity={currentEntity}
              showToast={showToast}
              onSelectArticleForInventory={handleSelectArticleFromCatalog}
            />
          )}

          {currentTab === 'history' && (
            <InventoryHistoryView
              closedInventories={closedInventories}
              entities={entities}
              currentUser={currentUser}
              onDeleteClosedInventory={handleDeleteClosedInventory}
              onGoToInventory={() => handleSelectTab('inventaire')}
              showToast={showToast}
            />
          )}

          {currentTab === 'parametres' && (
            <SettingsView
              currentUser={currentUser}
              users={users}
              onUpdateUsers={setUsers}
              entities={entities}
              onUpdateEntities={setEntities}
              showToast={showToast}
            />
          )}

          {currentTab === 'profil' && (
            <ProfileView
              currentUser={currentUser}
              currentEntity={currentEntity}
              onUpdatePassword={handleUpdateMyPassword}
              onToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Menu */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        inventoryCount={records.length}
        currentUser={currentUser}
      />

      {/* Global History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        records={records}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllRecords}
      />

      {/* PWA Offline Connection Indicator */}
      <OfflineIndicator />
    </div>
  );
}
