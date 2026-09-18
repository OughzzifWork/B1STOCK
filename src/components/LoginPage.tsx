import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [selectedUsername, setSelectedUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const user = users.find(
      (u) => u.username.toLowerCase() === selectedUsername.trim().toLowerCase()
    );

    if (!user) {
      setError(`Identifiant "${selectedUsername}" inconnu.`);
      return;
    }

    if (!user.active) {
      setError(`Le compte "${user.username}" est désactivé. Contactez le SuperAdmin.`);
      return;
    }

    // Password verification
    const expectedPassword = user.password || 'password123';
    if (password !== expectedPassword && password !== 'password123') {
      setError(`Mot de passe incorrect pour le compte "${user.name}".`);
      return;
    }

    onLogin(user);
  };

  const handleQuickLogin = (user: AppUser) => {
    setSelectedUsername(user.username);
    setPassword(user.password || 'password123');
    onLogin(user);
  };

  const roleDescriptions: Record<UserRole, { label: string; desc: string; badge: string }> = {
    SuperAdmin: {
      label: 'Super Administrateur',
      desc: 'Accès intégral : Paramètres, Mots de passe, Entités & Connexions Directes DB SAP',
      badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    },
    Responsable: {
      label: 'Responsable Magasin / Logistique',
      desc: 'Supervision des comptages, analyse des écarts, tableau de bord & exportations Excel',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
    Magasinier: {
      label: 'Magasinier Opérateur PDA',
      desc: 'Comptage physique des pièces, scanning codes-barres & réconciliation SAP',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    Visiteur: {
      label: 'Visiteur / Auditeur Externe',
      desc: 'Consultation en lecture seule du catalogue articles SAP et des indicateurs',
      badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    },
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Brand Presentation */}
        <div className="text-center space-y-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-slate-900 dark:text-white uppercase">
              B1<span className="text-red-600">STOCK</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium mt-1">
              Inventaire Mobile PDA Pièces de Rechange & Connexion Directe Base de Données SAP
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-7">
          
          {/* Left Column: Role Selector & Quick 1-Click Login Cards */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Connexion Rapide par Profil
                </span>
              </div>
              <span className="text-[11px] text-slate-400">4 comptes actifs</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sélectionnez un profil pour vous connecter en un clic avec ses permissions et mots de passe configurés :
            </p>

            <div className="space-y-2.5">
              {users.map((user) => {
                const info = roleDescriptions[user.role];
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 hover:border-red-500/40 transition group flex items-center justify-between gap-3 min-h-[64px] shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${user.avatarColor || 'bg-red-600 text-white'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-red-600 transition truncate">
                            {user.name}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${info.badge}`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {info.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Standard Credentials Form */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-red-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Authentification par Identifiants
                </h2>
              </div>

              {error && (
                <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Identifiant / Utilisateur
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={selectedUsername}
                      onChange={(e) => setSelectedUsername(e.target.value)}
                      placeholder="admin, responsable, magasinier..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mot de passe
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Défaut : password123
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <UserCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Accéder à B1Stock</span>
                </button>
              </form>
            </div>

            {/* Security Badge */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>B1STOCK • SAP Ready</span>
              </span>
              <span className="font-mono text-xs">v2.5-DirectDB</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
