import React from 'react';
import { SAPArticle } from '../types';
import { Lock, Database, MapPin, Tag } from 'lucide-react';

interface SapArticleDisplayProps {
  article: SAPArticle | null;
}

export const SapArticleDisplay: React.FC<SapArticleDisplayProps> = ({ article }) => {
  if (!article) {
    return (
      <div 
        id="sap-empty-state" 
        className="bg-slate-50/70 dark:bg-slate-900/40 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400"
      >
        <div className="w-12 h-12 mx-auto mb-2.5 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Database className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun article chargé</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Scannez le code-barres ou QR code d'une pièce pour rapatrier la fiche article et le stock théorique SAP.
        </p>
      </div>
    );
  }

  return (
    <section 
      id="sap-data-container"
      className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-200 dark:border-slate-800 transition-all"
    >
      {/* Read-Only Status Banner */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Fiche Article SAP • Lecture Seule
          </span>
        </div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
          VERROUILLÉ
        </span>
      </div>

      {/* The 4 Required SAP Fields */}
      <div className="space-y-3">
        {/* Field 1: Code Article SAP & Field 4: Qte SAP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Field 1: Code Article SAP */}
          <div className="sm:col-span-2">
            <label className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                Code Article SAP
              </span>
              <span className="text-[10px] text-slate-400 font-normal uppercase">Lecture seule</span>
            </label>
            <input
              type="text"
              id="sap-code-article"
              value={article.codeArticle}
              disabled
              readOnly
              tabIndex={-1}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-base pointer-events-none select-none cursor-not-allowed shadow-inner"
            />
          </div>

          {/* Field 4: Qte SAP */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                Qté SAP (Théorique)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Figer</span>
            </label>
            <input
              type="text"
              id="sap-qte-stock"
              value={`${article.qteSap} ${article.unite || 'U'}`}
              disabled
              readOnly
              tabIndex={-1}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-xl text-center pointer-events-none select-none cursor-not-allowed shadow-inner"
            />
          </div>
        </div>

        {/* Field 2: Nom Article */}
        <div>
          <label className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              Nom Article
            </span>
            <span className="text-[10px] text-slate-400 font-normal uppercase">ERP SAP</span>
          </label>
          <input
            type="text"
            id="sap-nom-article"
            value={article.nomArticle}
            disabled
            readOnly
            tabIndex={-1}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm pointer-events-none select-none cursor-not-allowed shadow-inner"
          />
        </div>

        {/* Field 3: Description */}
        <div>
          <label className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              Description Technique
            </span>
            <span className="text-[10px] text-slate-400 font-normal uppercase">Détails</span>
          </label>
          <textarea
            id="sap-description"
            rows={2}
            value={article.description}
            disabled
            readOnly
            tabIndex={-1}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium resize-none pointer-events-none select-none cursor-not-allowed shadow-inner leading-relaxed"
          />
        </div>

        {/* Supplementary Warehouse Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{article.emplacement || 'Non assigné'}</span>
          </div>
          {article.categorie && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{article.categorie}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
