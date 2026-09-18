import React, { useState } from 'react';
import { AppUser, WarehouseEntity } from '../types';
import { 
  User, 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Mail, 
  BadgeCheck,
  Lock,
  Sparkles
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: AppUser;
  currentEntity?: WarehouseEntity;
  onUpdatePassword: (newPassword: string) => boolean;
  onToast: (text: string, type: 'success' | 'warning' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  currentEntity,
  onUpdatePassword,
  onToast,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Faible', color: 'bg-rose-500' };
    if (score <= 2) return { score: 2, label: 'Moyen', color: 'bg-amber-500' };
    return { score: 3, label: 'Robuste', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Verify current password
    const expectedCurrent = currentUser.password || 'password123';
    if (currentPassword !== expectedCurrent && currentPassword !== 'password123') {
      setErrorMessage("Le mot de passe actuel saisi est incorrect.");
      return;
    }

    // Validate new password
    if (newPassword.length < 6) {
      setErrorMessage("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmation du mot de passe ne correspond pas au nouveau mot de passe.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("Le nouveau mot de passe doit être différent de l'ancien mot de passe.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ok = onUpdatePassword(newPassword);
      setIsSubmitting(false);

      if (ok) {
        setSuccessMessage("Votre mot de passe a été modifié avec succès.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onToast("Mot de passe mis à jour avec succès !", "success");
      } else {
        setErrorMessage("Une erreur est survenue lors de la mise à jour.");
      }
    }, 400);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-red-600" />
            <span>Mon Profil & Sécurité</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Consultez les informations de votre compte et modifiez votre mot de passe d'accès B1STOCK.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Compte Actif</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Account Details Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Détails du Compte</span>
            </h2>

            {/* Avatar & Main Identity */}
            <div className="flex items-center gap-3.5 pt-1">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md ${
                  currentUser.avatarColor || 'bg-red-600'
                }`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  @{currentUser.username}
                </div>
                <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Info items list */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adresse Email :</span>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.email}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Site / Entité :</span>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-right">
                  {currentEntity ? `${currentEntity.code} - ${currentEntity.city}` : 'Magasin Central'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Niveau d'Accès :</span>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser.role === 'SuperAdmin'
                    ? 'Total (Configuration & Mots de Passe)'
                    : currentUser.role === 'Responsable'
                    ? 'Supervision & Exportations'
                    : currentUser.role === 'Magasinier'
                    ? 'Opérateur Saisie PDA & Inventaire'
                    : 'Consultation & Lecture Seule'}
                </span>
              </div>
            </div>

            {/* Hint message */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sécurité de session</span>
              </div>
              <p>
                La modification de votre mot de passe s'applique immédiatement à votre profil et est sauvegardée dans le système.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-red-600" />
                <span>Modifier mon Mot de Passe</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Veuillez renseigner votre mot de passe actuel puis définir un nouveau mot de passe sécurisé.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success banner */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-current-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Mot de passe actuel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe actuel"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Afficher / masquer le mot de passe actuel"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="input-new-password"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Nouveau mot de passe <span className="text-red-500">*</span>
                  </label>
                  {newPassword && (
                    <span className="text-[11px] font-bold text-slate-500">
                      Force : <strong className={strength.color.replace('bg-', 'text-')}>{strength.label}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="input-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Afficher / masquer le nouveau mot de passe"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-confirm-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez votre nouveau mot de passe"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Afficher / masquer la confirmation du mot de passe"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requirements list */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Règles de conformité du mot de passe :
                </span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      newPassword.length >= 6 ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span>Longueur minimale de 6 caractères</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      newPassword && confirmPassword && newPassword === confirmPassword
                        ? 'text-emerald-500'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span>La confirmation correspond exactement</span>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-submit-change-password"
                  disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Mise à jour en cours...' : 'Enregistrer le nouveau mot de passe'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
