import React, { useState, useEffect, useRef } from 'react';
import { SAPArticle, InventoryRecord, AppUser, WarehouseEntity, DiscrepancyStatus } from '../types';
import { playSound } from '../utils/sound';
import { 
  X, 
  Lock, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Equal, 
  RotateCcw, 
  RotateCw, 
  Save, 
  MapPin, 
  Tag 
} from 'lucide-react';

interface ArticleInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: SAPArticle | null;
  existingRecord: InventoryRecord | null;
  currentUser: AppUser;
  currentEntity?: WarehouseEntity;
  onSaveRecord: (record: InventoryRecord) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ArticleInventoryModal: React.FC<ArticleInventoryModalProps> = ({
  isOpen,
  onClose,
  article,
  existingRecord,
  currentUser,
  currentEntity,
  onSaveRecord,
  showToast,
}) => {
  const [realCount, setRealCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form when modal opens or article changes
  useEffect(() => {
    if (isOpen && article) {
      if (existingRecord) {
        setRealCount(String(existingRecord.qteReelle));
        setNotes(existingRecord.notes || '');
      } else {
        setRealCount('');
        setNotes('');
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 80);
    }
  }, [isOpen, article, existingRecord]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  const isAlreadyCounted = Boolean(existingRecord);
  const parsedCount = realCount.trim() === '' ? null : Number(realCount);
  const numericCount = parsedCount !== null && !isNaN(parsedCount) ? parsedCount : 0;
  const ecart = parsedCount !== null && !isNaN(parsedCount) ? numericCount - article.qteSap : null;

  let status: DiscrepancyStatus = 'CONFORME';
  if (ecart !== null) {
    if (ecart === 0) status = 'CONFORME';
    else if (ecart < 0) status = 'MANQUANT';
    else status = 'SURPLUS';
  }

  const handleStep = (delta: number) => {
    const current = parsedCount !== null && !isNaN(parsedCount) ? numericCount : 0;
    const nextVal = Math.max(0, current + delta);
    setRealCount(nextVal.toString());
    inputRef.current?.focus();
  };

  const handleSetToSap = () => {
    setRealCount(article.qteSap.toString());
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (realCount.trim() === '') {
      showToast('Veuillez renseigner la quantité réelle comptée.', 'warning');
      inputRef.current?.focus();
      return;
    }

    const countNumber = Number(realCount);
    if (isNaN(countNumber) || countNumber < 0) {
      showToast('Veuillez saisir un nombre entier positif ou nul.', 'warning');
      inputRef.current?.focus();
      return;
    }

    const calculatedEcart = countNumber - article.qteSap;
    let calculatedStatus: DiscrepancyStatus = 'CONFORME';
    if (calculatedEcart < 0) calculatedStatus = 'MANQUANT';
    else if (calculatedEcart > 0) calculatedStatus = 'SURPLUS';

    const now = new Date();
    const newRecord: InventoryRecord = {
      id: existingRecord ? existingRecord.id : `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      codeArticle: article.codeArticle,
      nomArticle: article.nomArticle,
      qteSap: article.qteSap,
      qteReelle: countNumber,
      ecart: calculatedEcart,
      status: calculatedStatus,
      emplacement: article.emplacement,
      notes: notes.trim() || undefined,
      entityId: currentEntity?.id,
    };

    onSaveRecord(newRecord);

    if (isAlreadyCounted) {
      playSound('success');
      showToast(
        `Quantité mise à jour : ${article.codeArticle} (${countNumber} ${article.unite || 'pièces'}, Écart : ${calculatedEcart > 0 ? `+${calculatedEcart}` : calculatedEcart})`,
        'success'
      );
    } else if (calculatedEcart === 0) {
      playSound('success');
      showToast(`Écriture validée : ${article.codeArticle} (Conforme, Écart: 0)`, 'success');
    } else {
      playSound('warning');
      showToast(
        `Écriture enregistrée avec Écart (${calculatedStatus}) : ${calculatedEcart > 0 ? `+${calculatedEcart}` : calculatedEcart} pièces`,
        'warning'
      );
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Save className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  Saisie d'Inventaire
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {article.codeArticle}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                {article.nomArticle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Non-blocking Duplicate Warning Banner if already counted */}
          {isAlreadyCounted && existingRecord && (
            <div 
              id="modal-duplicate-warning"
              className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 shadow-2xs"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-extrabold flex items-center gap-1.5">
                  <span>Article déjà compté dans cet inventaire</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/70 font-mono font-bold text-amber-900 dark:text-amber-200">
                    1 SEUL ENREGISTREMENT
                  </span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  Précédemment saisi : <strong className="font-mono">{existingRecord.qteReelle} {article.unite || 'pièces'}</strong> (Écart : <strong className="font-mono">{existingRecord.ecart > 0 ? `+${existingRecord.ecart}` : existingRecord.ecart}</strong>) le {existingRecord.formattedDate}.
                  <br />
                  Vous pouvez ajuster la quantité ci-dessous pour mettre à jour l'enregistrement existant.
                </p>
              </div>
            </div>
          )}

          {/* SAP Master Reference Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Données Maîtres SAP (ERP)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Lecture Seule
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Code Article</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white truncate">
                  {article.codeArticle}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Qté SAP</div>
                <div className="font-mono font-black text-slate-900 dark:text-white text-sm text-center">
                  {article.qteSap} {article.unite || 'U'}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Emplacement</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                  <span>{article.emplacement || 'Non assigné'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Count Section */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-2">
              <label 
                htmlFor="modal-real-stock-count-input"
                className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span>Quantité Réelle Comptée</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {isAlreadyCounted ? 'Mise à jour' : 'Nouveau comptage'}
                </span>
              </label>

              {/* Steppers and Number Input */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  aria-label="Diminuer de 1"
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-slate-800 dark:text-white font-bold flex items-center justify-center border border-slate-300 dark:border-slate-700 text-lg shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                >
                  <Minus className="w-5 h-5 stroke-[3]" />
                </button>

                <div className="relative flex-1">
                  <input
                    id="modal-real-stock-count-input"
                    ref={inputRef}
                    type="number"
                    min="0"
                    step="1"
                    value={realCount}
                    onChange={(e) => setRealCount(e.target.value)}
                    placeholder="0"
                    className="w-full h-12 sm:h-14 px-3 text-center text-3xl font-mono font-black rounded-xl border-2 border-red-600 focus:ring-4 focus:ring-red-600/20 outline-none text-slate-950 dark:text-white bg-red-50/20 dark:bg-slate-800/80 shadow-inner"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none hidden sm:inline">
                    {article.unite || 'PCS'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  aria-label="Augmenter de 1"
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold flex items-center justify-center text-lg shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              {/* Quick Jump Pills */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleStep(-5)}
                  className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(5)}
                  className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={handleSetToSap}
                  className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                  title="Fixer la quantité égale au stock théorique SAP"
                >
                  <Equal className="w-3.5 h-3.5" />
                  <span>= SAP ({article.qteSap})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRealCount('0')}
                  className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-800 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Zéro (0)</span>
                </button>
              </div>
            </div>

            {/* Dynamic Real-Time Discrepancy (Écart) */}
            <div 
              className={`p-3 rounded-xl border transition-all ${
                ecart === null
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  : ecart === 0
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                  : ecart < 0
                  ? 'bg-rose-600 border-rose-700 text-white shadow-xs'
                  : 'bg-blue-600 border-blue-700 text-white shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ecart === null ? (
                    <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
                      ?
                    </div>
                  ) : ecart === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0 stroke-[2.5]" />
                  ) : ecart < 0 ? (
                    <ArrowDownRight className="w-5 h-5 text-rose-200 shrink-0 stroke-[3]" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-blue-200 shrink-0 stroke-[3]" />
                  )}

                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
                      Calcul Écart = Réel ({parsedCount ?? 0}) - SAP ({article.qteSap})
                    </div>
                    <div className="text-sm sm:text-base font-black tracking-tight leading-tight">
                      {ecart === null ? (
                        'En attente de comptage'
                      ) : ecart === 0 ? (
                        'STOCK CONFORME (Écart nul)'
                      ) : ecart < 0 ? (
                        `MANQUANT : Déficit de ${Math.abs(ecart)} ${article.unite || 'pièces'}`
                      ) : (
                        `SURPLUS : Excédent de +${ecart} ${article.unite || 'pièces'}`
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-mono font-black">
                    {ecart === null ? '--' : (ecart > 0 ? `+${ecart}` : `${ecart}`)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-85">
                    {status}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observation / motif d'écart éventuel..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-850 focus:border-red-600 outline-none text-slate-800 dark:text-slate-200 min-h-[38px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-h-[44px]"
              >
                Annuler
              </button>

              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer min-h-[44px] ${
                  isAlreadyCounted
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                }`}
              >
                {isAlreadyCounted ? (
                  <>
                    <RotateCw className="w-4 h-4" />
                    <span>Mettre à jour la Quantité</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Valider l'écriture</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
