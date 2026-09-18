import React from 'react';
import { 
  ScanLine, 
  Camera, 
  Search, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { MOCK_SAP_DATABASE } from '../data/mockSapDatabase';

interface ScannerSectionProps {
  scanInput: string;
  onChangeScanInput: (value: string) => void;
  onSearch: (code?: string) => void;
  onOpenLiveCamera: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const ScannerSection: React.FC<ScannerSectionProps> = ({
  scanInput,
  onChangeScanInput,
  onSearch,
  onOpenLiveCamera,
  isLoading,
  errorMessage,
  inputRef,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <label 
          htmlFor="pda-scan-input" 
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          <ScanLine className="w-4 h-4 text-red-600" />
          <span>Lecture Code-Barres / QR SAP</span>
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Laser PDA ou Caméra
        </span>
      </div>

      {/* Barcode scanner input group */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            id="pda-scan-input"
            ref={inputRef}
            type="text"
            value={scanInput}
            onChange={(e) => onChangeScanInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scannez ou tapez Code SAP (ex: PART-1001)..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck="false"
            className="w-full pl-11 pr-10 py-3.5 text-base sm:text-lg font-mono font-bold tracking-wide rounded-xl border-2 border-slate-300 dark:border-slate-700 focus:border-red-600 focus:ring-4 focus:ring-red-600/20 outline-none transition bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-sans placeholder:text-sm min-h-[52px]"
          />
          {scanInput && (
            <button
              type="button"
              onClick={() => {
                onChangeScanInput('');
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Effacer la saisie"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Enter/Lookup button */}
        <button
          type="button"
          id="btn-scan-lookup"
          onClick={() => onSearch()}
          disabled={isLoading || !scanInput.trim()}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:pointer-events-none text-white px-4 py-3 rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-1.5 min-h-[52px] min-w-[52px] transition shrink-0"
          title="Interroger SAP"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              <span className="hidden sm:inline">Rechercher</span>
            </>
          )}
        </button>

        {/* Camera trigger */}
        <button
          type="button"
          id="btn-open-camera"
          onClick={onOpenLiveCamera}
          className="bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-emerald-400 px-3.5 py-3 rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-1.5 min-h-[52px] border border-slate-700 transition shrink-0"
          title="Scanner via la caméra PDA"
        >
          <Camera className="w-5 h-5 text-emerald-400" />
          <span className="hidden md:inline text-xs text-white">Caméra</span>
        </button>
      </div>

      {/* Error / Not found message */}
      {errorMessage && (
        <div className="mt-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{errorMessage}</span>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">Erreur SAP</span>
        </div>
      )}

      {/* Quick click suggestions for testing on PDA */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Exemples rapides :</span>
        </span>
        <div className="flex gap-1.5 overflow-x-auto py-0.5">
          {MOCK_SAP_DATABASE.slice(0, 3).map((art) => (
            <button
              key={art.codeArticle}
              type="button"
              onClick={() => onSearch(art.codeArticle)}
              className="px-2 py-0.5 rounded-lg font-mono text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              {art.codeArticle}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
