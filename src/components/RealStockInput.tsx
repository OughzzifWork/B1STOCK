import React from 'react';
import { SAPArticle, DiscrepancyStatus, InventoryRecord } from '../types';
import { 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus, 
  Save, 
  RotateCcw,
  Equal,
  AlertTriangle,
  RotateCw
} from 'lucide-react';

interface RealStockInputProps {
  article: SAPArticle;
  realCount: string;
  onChangeRealCount: (val: string) => void;
  onValidate: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  notes: string;
  onChangeNotes: (val: string) => void;
  isAlreadyCounted?: boolean;
  previousRecord?: InventoryRecord | null;
}

export const RealStockInput: React.FC<RealStockInputProps> = ({
  article,
  realCount,
  onChangeRealCount,
  onValidate,
  inputRef,
  notes,
  onChangeNotes,
  isAlreadyCounted = false,
  previousRecord = null,
}) => {
  // Numeric parse
  const parsedCount = realCount.trim() === '' ? null : Number(realCount);
  const numericCount = parsedCount !== null && !isNaN(parsedCount) ? parsedCount : 0;
  
  // Real-Time Dynamic Calculation: Écart = Quantité Réelle - Quantité SAP
  const ecart = parsedCount !== null && !isNaN(parsedCount) ? numericCount - article.qteSap : null;

  // Status calculation
  let status: DiscrepancyStatus = 'CONFORME';
  if (ecart !== null) {
    if (ecart === 0) status = 'CONFORME';
    else if (ecart < 0) status = 'MANQUANT';
    else status = 'SURPLUS';
  }

  // Stepper handlers
  const handleStep = (delta: number) => {
    const current = parsedCount !== null && !isNaN(parsedCount) ? numericCount : 0;
    const nextVal = Math.max(0, current + delta);
    onChangeRealCount(nextVal.toString());
    inputRef.current?.focus();
  };

  const handleSetToSap = () => {
    onChangeRealCount(article.qteSap.toString());
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onValidate();
    }
  };

  return (
    <section 
      id="real-stock-container"
      className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-sm border-2 border-red-500/30 dark:border-red-600/40 space-y-3.5 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <label 
          htmlFor="real-stock-count-input" 
          className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>Quantité Réelle Comptée (Physique)</span>
        </label>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {isAlreadyCounted ? 'Mise à jour de saisie' : 'Saisie active opérateur'}
        </span>
      </div>

      {/* Non-blocking Duplicate Warning Banner */}
      {isAlreadyCounted && previousRecord && (
        <div 
          id="duplicate-warning-banner"
          className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 shadow-2xs"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-extrabold flex flex-wrap items-center gap-1.5">
              <span>Article déjà compté dans cet inventaire</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/70 font-mono font-bold text-amber-900 dark:text-amber-200">
                1 SEUL ENREGISTREMENT
              </span>
            </div>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Précédemment enregistré : <strong className="font-mono">{previousRecord.qteReelle} {article.unite || 'pièces'}</strong> (Écart : <span className="font-mono font-bold">{previousRecord.ecart > 0 ? `+${previousRecord.ecart}` : previousRecord.ecart}</span>) le {previousRecord.formattedDate}.
              <br />
              Vous pouvez ajuster la quantité ci-dessous : la validation mettra à jour l'enregistrement existant.
            </p>
          </div>
        </div>
      )}

      {/* Primary Input & Steppers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Quick minus stepper */}
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label="Diminuer de 1"
            className="w-14 sm:w-16 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-slate-800 dark:text-white font-bold flex items-center justify-center border border-slate-300 dark:border-slate-700 text-xl shadow-xs transition active:scale-95 shrink-0"
          >
            <Minus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Input field */}
          <div className="relative flex-1">
            <input
              id="real-stock-count-input"
              ref={inputRef}
              type="number"
              min="0"
              step="1"
              value={realCount}
              onChange={(e) => onChangeRealCount(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="w-full h-14 px-3 text-center text-3xl sm:text-4xl font-mono font-black rounded-xl border-2 border-red-600 focus:ring-4 focus:ring-red-600/20 outline-none text-slate-950 dark:text-white bg-red-50/20 dark:bg-slate-800/80 shadow-inner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none hidden sm:inline">
              {article.unite || 'PCS'}
            </span>
          </div>

          {/* Quick plus stepper */}
          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label="Augmenter de 1"
            className="w-14 sm:w-16 h-14 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold flex items-center justify-center text-xl shadow-xs transition active:scale-95 shrink-0"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Quick jump pills */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => handleStep(-5)}
            className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => handleStep(5)}
            className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95"
          >
            +5
          </button>
          <button
            type="button"
            onClick={handleSetToSap}
            className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 flex items-center justify-center gap-1"
            title="Fixer la quantité égale au stock théorique SAP"
          >
            <Equal className="w-3.5 h-3.5" />
            <span>= SAP ({article.qteSap})</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeRealCount('0')}
            className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-800 font-bold text-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zéro (0)</span>
          </button>
        </div>
      </div>

      {/* Real-Time Dynamic Calculation & Visual Feedback Badge for Discrepancy (Écart) */}
      <div 
        id="discrepancy-badge" 
        className={`p-3.5 rounded-xl border transition-all duration-200 ${
          ecart === null
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            : ecart === 0
            ? 'bg-emerald-600 border-emerald-700 text-white shadow-md'
            : ecart < 0
            ? 'bg-rose-600 border-rose-700 text-white shadow-md'
            : 'bg-blue-600 border-blue-700 text-white shadow-md'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ecart === null ? (
              <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
                ?
              </div>
            ) : ecart === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0 stroke-[2.5]" />
            ) : ecart < 0 ? (
              <ArrowDownRight className="w-6 h-6 text-rose-200 shrink-0 stroke-[3]" />
            ) : (
              <ArrowUpRight className="w-6 h-6 text-blue-200 shrink-0 stroke-[3]" />
            )}

            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold opacity-90">
                Calcul Écart = Réel ({parsedCount ?? 0}) - SAP ({article.qteSap})
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight leading-tight">
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
            <div className="text-2xl sm:text-3xl font-mono font-black">
              {ecart === null ? '--' : (ecart > 0 ? `+${ecart}` : `${ecart}`)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {status}
            </div>
          </div>
        </div>
      </div>

      {/* Quick optional notes field */}
      <div>
        <input
          type="text"
          id="inventory-note-input"
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder="Observation / motif d'écart éventuel (ex: Emballage percé, B1-04)..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-red-600 outline-none text-slate-700 dark:text-slate-200 min-h-[40px]"
        />
      </div>

      {/* Validation & Local Storage: Large, thumb-friendly "Valider l'écriture" or "Mettre à jour" button */}
      <button
        type="button"
        id="btn-validate-inventory"
        onClick={onValidate}
        className={`w-full text-white font-black text-base sm:text-lg py-4 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2.5 min-h-[56px] focus:outline-none focus:ring-4 active:scale-[0.98] cursor-pointer ${
          isAlreadyCounted
            ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 focus:ring-amber-400'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-400'
        }`}
      >
        {isAlreadyCounted ? (
          <>
            <RotateCw className="w-6 h-6 stroke-[2.5]" />
            <span>Mettre à jour la Quantité Réelle</span>
          </>
        ) : (
          <>
            <Save className="w-6 h-6 stroke-[2.5]" />
            <span>Valider l'écriture d'inventaire</span>
          </>
        )}
      </button>
    </section>
  );
};
