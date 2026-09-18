import React, { useState } from 'react';
import { AppUser, UserRole, WarehouseEntity, SapDbEngine } from '../types';
import { DEFAULT_SAP_SQL_QUERY } from '../data/mockSystemData';
import { 
  Settings, 
  Users, 
  Building2, 
  Database, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  Save, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  KeyRound,
  Play,
  Terminal,
  FileCode,
  Sparkles,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: AppUser;
  users: AppUser[];
  onUpdateUsers: (newUsers: AppUser[]) => void;
  entities: WarehouseEntity[];
  onUpdateEntities: (newEntities: WarehouseEntity[]) => void;
  showToast: (text: string, type?: 'success' | 'warning' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  users,
  onUpdateUsers,
  entities,
  onUpdateEntities,
  showToast,
}) => {
  // Access verification: Strictly for SuperAdmin
  if (currentUser.role !== 'SuperAdmin') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 p-8 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Accès Réservé au Super Administrateur</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Cette section de configuration (Gestion des utilisateurs, Mots de passe, Entités et Connexions Directes DB SAP) nécessite les privilèges <strong>SuperAdmin</strong>.
        </p>
        <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
          Votre rôle actuel : <strong className="text-rose-600 dark:text-rose-400 uppercase">{currentUser.role}</strong>
        </div>
      </div>
    );
  }

  // Active section inside Settings
  const [activeTab, setActiveTab] = useState<'users' | 'entities' | 'sap'>('users');

  // User form modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'Magasinier' as UserRole,
    entityId: entities[0]?.id || 'ENT-01',
    active: true,
    password: 'password123',
  });

  // Dedicated Password Change Modal for SuperAdmin
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Entity form modal state
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<WarehouseEntity | null>(null);
  const [entityFormData, setEntityFormData] = useState({
    code: '',
    name: '',
    city: '',
    address: '',
  });

  // SAP connection test simulation state
  const [testingSapEntityId, setTestingSapEntityId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [testQueryResultMap, setTestQueryResultMap] = useState<Record<string, {
    latency: number;
    rowsCount: number;
    executedAt: string;
    sampleRows: Array<{
      codeArticle: string;
      nomArticle: string;
      qteSap: number;
      emplacement: string;
      unite: string;
      categorie: string;
    }>;
  } | null>>({});

  // USER CRUD
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      username: '',
      name: '',
      email: '',
      role: 'Magasinier',
      entityId: entities[0]?.id || 'ENT-01',
      active: true,
      password: 'password123',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: AppUser) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      entityId: user.entityId,
      active: user.active,
      password: user.password || 'password123',
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.username.trim() || !userFormData.name.trim()) return;

    if (editingUser) {
      // Update existing
      const updated = users.map((u) =>
        u.id === editingUser.id ? { ...u, ...userFormData } : u
      );
      onUpdateUsers(updated);
      showToast(`Utilisateur "${userFormData.name}" mis à jour avec succès.`, 'success');
    } else {
      // Create new
      const newUser: AppUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        ...userFormData,
        avatarColor: 'bg-red-600 text-white',
      };
      onUpdateUsers([...users, newUser]);
      showToast(`Nouvel utilisateur "${userFormData.name}" créé avec succès.`, 'success');
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (user.id === currentUser.id) {
      showToast("Impossible de supprimer votre propre compte SuperAdmin actif.", 'warning');
      return;
    }
    if (confirm(`Confirmez-vous la suppression de l'utilisateur "${user.name}" (${user.username}) ?`)) {
      const updated = users.filter((u) => u.id !== user.id);
      onUpdateUsers(updated);
      showToast(`Utilisateur "${user.name}" supprimé du système.`, 'info');
    }
  };

  // SUPERADMIN PASSWORD CHANGE
  const handleOpenChangePassword = (user: AppUser) => {
    setSelectedUserForPassword(user);
    setNewPassword(user.password || 'password123');
    setShowNewPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let generated = 'Alf#';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
  };

  const handleSavePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword.trim()) return;

    const updatedUsers = users.map((u) =>
      u.id === selectedUserForPassword.id ? { ...u, password: newPassword.trim() } : u
    );
    onUpdateUsers(updatedUsers);
    setIsPasswordModalOpen(false);
    showToast(`Mot de passe mis à jour pour ${selectedUserForPassword.name} (${selectedUserForPassword.username}).`, 'success');
  };

  // ENTITY CRUD
  const handleOpenAddEntity = () => {
    setEditingEntity(null);
    setEntityFormData({
      code: '',
      name: '',
      city: '',
      address: '',
    });
    setIsEntityModalOpen(true);
  };

  const handleOpenEditEntity = (entity: WarehouseEntity) => {
    setEditingEntity(entity);
    setEntityFormData({
      code: entity.code,
      name: entity.name,
      city: entity.city,
      address: entity.address,
    });
    setIsEntityModalOpen(true);
  };

  const handleSaveEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityFormData.code.trim() || !entityFormData.name.trim()) return;

    if (editingEntity) {
      const updated = entities.map((ent) =>
        ent.id === editingEntity.id ? { ...ent, ...entityFormData } : ent
      );
      onUpdateEntities(updated);
      showToast(`Entrepôt "${entityFormData.name}" mis à jour.`, 'success');
    } else {
      const newEntity: WarehouseEntity = {
        id: `ENT-0${entities.length + 1}`,
        ...entityFormData,
        sapConfig: {
          connectionType: 'DIRECT_DB',
          dbEngine: 'MSSQL',
          serverHost: '192.168.10.50',
          port: 1433,
          databaseName: 'ALF_MAGHRIB_PRD',
          username: 'sa_sapb1_read',
          password: '••••••••••••',
          status: 'CONNECTED',
          lastTested: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          sqlQuery: DEFAULT_SAP_SQL_QUERY,
          queryTimeoutSec: 30,
          ssl: true,
        },
      };
      onUpdateEntities([...entities, newEntity]);
      showToast(`Nouvel entrepôt "${entityFormData.name}" ajouté avec succès.`, 'success');
    }
    setIsEntityModalOpen(false);
  };

  const handleDeleteEntity = (entity: WarehouseEntity) => {
    if (entities.length <= 1) {
      showToast("Impossible de supprimer la seule entité restante.", 'warning');
      return;
    }
    if (confirm(`Confirmez-vous la suppression du site "${entity.name}" ?`)) {
      const updated = entities.filter((e) => e.id !== entity.id);
      onUpdateEntities(updated);
      showToast(`Site "${entity.name}" supprimé.`, 'info');
    }
  };

  // SAP DIRECT DB CONFIG UPDATE
  const handleUpdateSapConfig = (
    entityId: string,
    field: string,
    value: any
  ) => {
    const updated = entities.map((ent) => {
      if (ent.id === entityId) {
        return {
          ...ent,
          sapConfig: {
            ...ent.sapConfig,
            [field]: value,
          },
        };
      }
      return ent;
    });
    onUpdateEntities(updated);
  };

  // Execute and test the manual SQL query directly against the simulated SAP DB
  const handleTestSapDirectQuery = (entityId: string) => {
    const ent = entities.find((e) => e.id === entityId);
    if (!ent) return;

    setTestingSapEntityId(entityId);

    setTimeout(() => {
      const now = new Date();
      const formattedTimestamp = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;

      const latency = Math.floor(Math.random() * 25) + 18; // ~20-40ms realistic DB latency

      // Sample rows matching the query output
      const sampleRows = [
        {
          codeArticle: 'PART-1001',
          nomArticle: 'Roulement à billes SKF 6204-2RSH/C3',
          qteSap: 15,
          emplacement: 'DEP-MAGHRIB-01',
          unite: 'PC',
          categorie: 'Mécanique & Transmission',
        },
        {
          codeArticle: 'PART-2045',
          nomArticle: 'Courroie trapézoïdale crantée Gates Quad-Power 4',
          qteSap: 8,
          emplacement: 'DEP-MAGHRIB-01',
          unite: 'PC',
          categorie: 'Transmission de puissance',
        },
        {
          codeArticle: 'PART-3088',
          nomArticle: 'Joint spi d\'étanchéité NBR 35x52x7',
          qteSap: 42,
          emplacement: 'DEP-MAGHRIB-01',
          unite: 'PC',
          categorie: 'Étanchéité & Hydraulique',
        },
        {
          codeArticle: 'ELEC-4100',
          nomArticle: 'Contacteur Schneider TeSys D 3P 18A 24VDC',
          qteSap: 6,
          emplacement: 'DEP-MAGHRIB-01',
          unite: 'PC',
          categorie: 'Électrotechnique & Commande',
        },
        {
          codeArticle: 'MOTEUR-550',
          nomArticle: 'Moteur électrique asynchrone triphasé 5.5kW 1450tr/min',
          qteSap: 3,
          emplacement: 'DEP-MAGHRIB-01',
          unite: 'PC',
          categorie: 'Motorisation Usine',
        }
      ];

      setTestQueryResultMap((prev) => ({
        ...prev,
        [entityId]: {
          latency,
          rowsCount: 148,
          executedAt: formattedTimestamp,
          sampleRows,
        }
      }));

      const updated = entities.map((e) => {
        if (e.id === entityId) {
          return {
            ...e,
            sapConfig: {
              ...e.sapConfig,
              status: 'CONNECTED' as const,
              lastTested: formattedTimestamp,
            },
          };
        }
        return e;
      });

      onUpdateEntities(updated);
      setTestingSapEntityId(null);
      showToast(
        `Connexion Directe DB établie avec succès (${latency} ms) ! 148 articles extraits.`,
        'success'
      );
    }, 800);
  };

  // SQL Query Presets
  const handleLoadQueryPreset = (entityId: string, presetType: 'STANDARD' | 'CRITICAL' | 'HANA') => {
    let query = '';
    if (presetType === 'STANDARD') {
      query = DEFAULT_SAP_SQL_QUERY;
    } else if (presetType === 'CRITICAL') {
      query = `SELECT 
  T0.ItemCode AS codeArticle,
  T0.ItemName AS nomArticle,
  T0.FrgnName AS description,
  CAST(T1.OnHand AS INT) AS qteSap,
  T1.WhsCode AS emplacement,
  T0.InvntryUom AS unite,
  T2.ItmsGrpNam AS categorie,
  T0.CodeBars AS codeBarre
FROM OITM T0
INNER JOIN OITW T1 ON T0.ItemCode = T1.ItemCode
LEFT JOIN OITB T2 ON T0.ItmsGrpCod = T2.ItmsGrpCod
WHERE T0.PrchseItem = 'Y' 
  AND T1.OnHand > 0
  AND (T2.ItmsGrpNam LIKE '%Transmission%' OR T2.ItmsGrpNam LIKE '%Moteur%')
ORDER BY T1.OnHand DESC`;
    } else {
      query = `SELECT 
  T0."ItemCode" AS "codeArticle",
  T0."ItemName" AS "nomArticle",
  T0."FrgnName" AS "description",
  T1."OnHand" AS "qteSap",
  T1."WhsCode" AS "emplacement",
  T0."InvntryUom" AS "unite",
  T2."ItmsGrpNam" AS "categorie",
  T0."CodeBars" AS "codeBarre"
FROM "OITM" T0
JOIN "OITW" T1 ON T0."ItemCode" = T1."ItemCode"
LEFT JOIN "OITB" T2 ON T0."ItmsGrpCod" = T2."ItmsGrpCod"
WHERE T1."WhsCode" = 'DEP-MAGHRIB-01'
ORDER BY T0."ItemCode" ASC`;
    }
    handleUpdateSapConfig(entityId, 'sqlQuery', query);
    showToast("Modèle de requête SQL inséré dans l'éditeur.", 'info');
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & SuperAdmin Badge */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Paramètres & Administration Système
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                SuperAdmin Only
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestion intégrale des utilisateurs, mots de passe, entités et connexions directes aux bases de données SAP
            </p>
          </div>
        </div>

        {/* Security indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Privilèges Root SuperAdmin Actifs</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 rounded-t-xl'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Utilisateurs & Mots de Passe ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entities')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'entities'
              ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 rounded-t-xl'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Sites & Entités Logistiques ({entities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sap')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'sap'
              ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 rounded-t-xl'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Connexion Directe DB SAP & Requête Manuelle</span>
        </button>
      </div>

      {/* SUB-TAB 1: USERS & PASSWORD MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-2xl rounded-tr-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Comptes Utilisateurs & Droits d'Accès
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                En tant que SuperAdmin, vous avez le droit de modifier le mot de passe de tous les utilisateurs du système.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddUser}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition min-h-[38px] self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Utilisateur</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Utilisateur</th>
                  <th className="py-2.5 px-3">Identifiant</th>
                  <th className="py-2.5 px-3">Rôle Système</th>
                  <th className="py-2.5 px-3">Site / Entité</th>
                  <th className="py-2.5 px-3">Mot de Passe</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Actions SuperAdmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => {
                  const entity = entities.find((e) => e.id === user.entityId);
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${user.avatarColor || 'bg-red-600 text-white'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {user.username}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            user.role === 'SuperAdmin'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                              : user.role === 'Responsable'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : user.role === 'Magasinier'
                              ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {entity ? entity.name : 'Tous les sites'}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-400">••••••••</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({(user.password || 'password123').length} car.)
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            user.active
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          <span>{user.active ? 'Actif' : 'Désactivé'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* SuperAdmin Change Password Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenChangePassword(user)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition flex items-center gap-1 text-[11px] font-bold"
                            title="Modifier le mot de passe de cet utilisateur"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Mot de passe</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                            title="Modifier l'utilisateur"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => handleDeleteUser(user)}
                            className={`p-1.5 rounded-lg transition ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                : 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                            }`}
                            title={isCurrent ? "Impossible de supprimer votre propre compte" : "Supprimer cet utilisateur"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WAREHOUSE ENTITIES */}
      {activeTab === 'entities' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-2xl rounded-tr-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sites & Entrepôts Logistiques B1Stock
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chaque site possède sa propre base de données SAP et son paramétrage de requête SQL direct.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddEntity}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition min-h-[38px] self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Entrepôt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {entities.map((ent) => {
              const usersCount = users.filter((u) => u.entityId === ent.id).length;

              return (
                <div
                  key={ent.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                        {ent.code}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEntity(ent)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          title="Modifier les coordonnées"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntity(ent)}
                          className="p-1 rounded-lg text-rose-500 hover:text-rose-700"
                          title="Supprimer ce site"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {ent.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {ent.address} • {ent.city}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Opérateurs rattachés : <strong>{usersCount}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sap')}
                      className="text-red-600 dark:text-red-400 font-bold hover:underline text-xs"
                    >
                      Requête SQL DB →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DIRECT DATABASE CONNECTION & MANUAL SQL QUERY */}
      {activeTab === 'sap' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-2xl rounded-tr-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-red-600" />
                <span>Connexion Directe Base de Données SAP & Éditeur de Requête Manuelle</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Connexion directe TCP/IP à la base de données (MS SQL Server / SAP HANA / PostgreSQL) avec saisie manuelle de votre requête SQL d'extraction des stocks et articles.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {entities.map((ent) => {
              const config = ent.sapConfig;
              const isConnected = config.status === 'CONNECTED';
              const isTesting = testingSapEntityId === ent.id;
              const showPwd = showPasswordMap[ent.id] || false;
              const testResult = testQueryResultMap[ent.id];

              return (
                <div
                  key={ent.id}
                  className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-slate-50/40 dark:bg-slate-900/60 space-y-5"
                >
                  {/* Entity SAP Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          {ent.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {ent.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Dernier test d'exécution SQL : {config.lastTested || 'Jamais'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                          isConnected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{isConnected ? `Connecté Direct (${config.dbEngine})` : 'Déconnecté / Erreur DB'}</span>
                      </span>

                      {/* Execute & Test Query Button */}
                      <button
                        type="button"
                        onClick={() => handleTestSapDirectQuery(ent.id)}
                        disabled={isTesting}
                        className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition min-h-[36px]"
                        title="Tester la connexion directe TCP et exécuter la requête manuelle"
                      >
                        <Play className={`w-3.5 h-3.5 fill-current ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Exécution SQL...' : 'Tester & Exécuter la Requête'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct DB Parameters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                    {/* SGBD Engine Selection */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Moteur SGBD SAP
                      </label>
                      <select
                        value={config.dbEngine}
                        onChange={(e) => handleUpdateSapConfig(ent.id, 'dbEngine', e.target.value as SapDbEngine)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 focus:border-red-600 outline-none"
                      >
                        <option value="MSSQL">Microsoft SQL Server (Standard B1)</option>
                        <option value="HANA">SAP HANA Database</option>
                        <option value="POSTGRES">PostgreSQL</option>
                      </select>
                    </div>

                    {/* Server Host / IP */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hôte / Adresse IP Serveur DB
                      </label>
                      <input
                        type="text"
                        value={config.serverHost}
                        onChange={(e) => handleUpdateSapConfig(ent.id, 'serverHost', e.target.value)}
                        placeholder="192.168.10.50 ou db-sap.alfmaghrib.ma"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:border-red-600 outline-none"
                      />
                    </div>

                    {/* Port */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Port TCP (ex: 1433 MSSQL, 30015 HANA)
                      </label>
                      <input
                        type="number"
                        value={config.port}
                        onChange={(e) => handleUpdateSapConfig(ent.id, 'port', Number(e.target.value))}
                        placeholder="1433"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:border-red-600 outline-none"
                      />
                    </div>

                    {/* Database Name */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nom Base de Données (Company DB)
                      </label>
                      <input
                        type="text"
                        value={config.databaseName}
                        onChange={(e) => handleUpdateSapConfig(ent.id, 'databaseName', e.target.value)}
                        placeholder="ALF_MAGHRIB_PRD"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 focus:border-red-600 outline-none"
                      />
                    </div>

                    {/* DB Username */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Utilisateur Base de Données (DB User)
                      </label>
                      <input
                        type="text"
                        value={config.username}
                        onChange={(e) => handleUpdateSapConfig(ent.id, 'username', e.target.value)}
                        placeholder="sa_sapb1_read"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:border-red-600 outline-none"
                      />
                    </div>

                    {/* DB Password */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mot de passe DB
                      </label>
                      <div className="relative">
                        <input
                          type={showPwd ? 'text' : 'password'}
                          value={config.password || ''}
                          onChange={(e) => handleUpdateSapConfig(ent.id, 'password', e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:border-red-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordMap((prev) => ({ ...prev, [ent.id]: !prev[ent.id] }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* SSL / Encrypted connection */}
                    <div className="flex items-center gap-2 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={config.ssl !== false}
                          onChange={(e) => handleUpdateSapConfig(ent.id, 'ssl', e.target.checked)}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                        />
                        <span>Chiffrement SSL / TLS requis</span>
                      </label>
                    </div>

                    {/* Save Config button */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => showToast(`Configuration Direct DB enregistrée pour ${ent.name}.`, 'success')}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition min-h-[38px] shadow-xs"
                      >
                        <Save className="w-4 h-4" />
                        <span>Enregistrer les Paramètres</span>
                      </button>
                    </div>
                  </div>

                  {/* MANUAL SQL QUERY SECTION */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-red-600" />
                        <span>Requête SQL Manuelle d'Extraction des Stocks (OITM / OITW)</span>
                      </label>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">Modèles rapides :</span>
                        <button
                          type="button"
                          onClick={() => handleLoadQueryPreset(ent.id, 'STANDARD')}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          Standard OITM
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadQueryPreset(ent.id, 'CRITICAL')}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          Pièces Critiques
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadQueryPreset(ent.id, 'HANA')}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          Format HANA
                        </button>
                      </div>
                    </div>

                    {/* SQL Editor Textarea */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-inner">
                      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono flex items-center gap-1">
                          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>custom_query_{ent.code.toLowerCase()}.sql</span>
                        </span>
                        <span>SQL Server / HANA Dialect</span>
                      </div>
                      <textarea
                        rows={9}
                        value={config.sqlQuery || DEFAULT_SAP_SQL_QUERY}
                        onChange={(e) => handleUpdateSapConfig(ent.id, 'sqlQuery', e.target.value)}
                        placeholder="SELECT T0.ItemCode, T0.ItemName, T1.OnHand FROM OITM T0 INNER JOIN OITW T1..."
                        className="w-full p-3 font-mono text-xs sm:text-sm text-emerald-300 bg-slate-950 focus:outline-none resize-y leading-relaxed"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  {/* Query Execution Result & Preview Table */}
                  {testResult && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Résultat de la Requête en Temps Réel
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                            {testResult.rowsCount} lignes retournées en {testResult.latency} ms
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Exécuté le {testResult.executedAt}
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                            <tr>
                              <th className="py-2 px-3">codeArticle</th>
                              <th className="py-2 px-3">nomArticle</th>
                              <th className="py-2 px-3 text-right">qteSap</th>
                              <th className="py-2 px-3">emplacement</th>
                              <th className="py-2 px-3">unite</th>
                              <th className="py-2 px-3">categorie</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11.5px]">
                            {testResult.sampleRows.map((row) => (
                              <tr key={row.codeArticle} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="py-1.5 px-3 font-bold text-red-600 dark:text-red-400">{row.codeArticle}</td>
                                <td className="py-1.5 px-3 font-sans text-slate-800 dark:text-slate-200">{row.nomArticle}</td>
                                <td className="py-1.5 px-3 text-right font-black text-slate-900 dark:text-white">{row.qteSap}</td>
                                <td className="py-1.5 px-3 text-slate-500">{row.emplacement}</td>
                                <td className="py-1.5 px-3 text-slate-500">{row.unite}</td>
                                <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400 font-sans">{row.categorie}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 italic">
                        * Aperçu des 5 premières lignes retournées directement depuis le socket DB SAP.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingUser ? "Modifier l'Utilisateur" : 'Créer un Nouvel Utilisateur'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Identifiant de connexion (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="ex: amarchand, jdupont"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="ex: Alexandre Marchand"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Professionnel
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="nom@alfmaghrib.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mot de passe utilisateur
                </label>
                <input
                  type="text"
                  required
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Mot de passe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rôle Système *
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, role: e.target.value as UserRole })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="Responsable">Responsable</option>
                    <option value="Magasinier">Magasinier</option>
                    <option value="Visiteur">Visiteur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Site / Entité de Rattachement
                  </label>
                  <select
                    value={userFormData.entityId}
                    onChange={(e) => setUserFormData({ ...userFormData, entityId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {entities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={userFormData.active}
                    onChange={(e) => setUserFormData({ ...userFormData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Compte actif et autorisé à se connecter</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
                >
                  {editingUser ? 'Enregistrer les Modifications' : 'Créer l\'Utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUPERADMIN PASSWORD CHANGE MODAL */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  Changement de Mot de Passe SuperAdmin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-red-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePasswordChange} className="p-5 space-y-4 text-xs">
              {/* User overview banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white ${selectedUserForPassword.avatarColor || 'bg-red-600'}`}>
                  {selectedUserForPassword.name.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedUserForPassword.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Identifiant : <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedUserForPassword.username}</strong></span>
                    <span>•</span>
                    <span className="font-bold uppercase text-red-600">{selectedUserForPassword.role}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Nouveau Mot de Passe *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Générer un mot de passe aléatoire</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Saisissez le nouveau mot de passe..."
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  L'utilisateur pourra se connecter immédiatement avec ce nouveau mot de passe.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Enregistrer le Nouveau Mot de Passe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT ENTITY */}
      {isEntityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingEntity ? "Modifier le Site Entrepôt" : 'Ajouter un Site Entrepôt'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEntityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntity} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Code Site SAP (WhsCode) *
                </label>
                <input
                  type="text"
                  required
                  value={entityFormData.code}
                  onChange={(e) => setEntityFormData({ ...entityFormData, code: e.target.value })}
                  placeholder="ex: ALF-CENTRAL, DEP-FES-01"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Désignation / Nom du Site *
                </label>
                <input
                  type="text"
                  required
                  value={entityFormData.name}
                  onChange={(e) => setEntityFormData({ ...entityFormData, name: e.target.value })}
                  placeholder="ex: ALF AL MAGHRIB - Usine Casablanca"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ville & Zone Industrielle
                </label>
                <input
                  type="text"
                  value={entityFormData.city}
                  onChange={(e) => setEntityFormData({ ...entityFormData, city: e.target.value })}
                  placeholder="ex: Casablanca Sidi Bernoussi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Adresse Complète
                </label>
                <input
                  type="text"
                  value={entityFormData.address}
                  onChange={(e) => setEntityFormData({ ...entityFormData, address: e.target.value })}
                  placeholder="ex: Zone Industrielle, Bd Ahl Loghlam"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEntityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
                >
                  {editingEntity ? 'Enregistrer les Modifications' : 'Créer l\'Entrepôt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
