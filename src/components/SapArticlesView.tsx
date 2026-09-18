import React, { useState, useMemo } from 'react';
import { SAPArticle } from '../types';
import { MOCK_SAP_DATABASE } from '../data/mockSapDatabase';
import { 
  Database, 
  Search, 
  ScanLine, 
  MapPin, 
  Lock, 
  ArrowRight
} from 'lucide-react';

interface SapArticlesViewProps {
  onSelectArticleForInventory: (article: SAPArticle) => void;
}

export const SapArticlesView: React.FC<SapArticlesViewProps> = ({
  onSelectArticleForInventory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    MOCK_SAP_DATABASE.forEach((item) => {
      if (item.categorie) set.add(item.categorie);
    });
    return Array.from(set);
  }, []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return MOCK_SAP_DATABASE.filter((art) => {
      const q = searchTerm.toLowerCase();
      const matchesQuery =
        art.codeArticle.toLowerCase().includes(q) ||
        art.nomArticle.toLowerCase().includes(q) ||
        art.description.toLowerCase().includes(q) ||
        (art.emplacement && art.emplacement.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'ALL' || art.categorie === selectedCategory;
      return matchesQuery && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Base de Données Articles SAP (ERP)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Données maîtres et stocks théoriques synchronisés en lecture seule
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Lock className="w-4 h-4 text-slate-400" />
          <span>Fiches Maîtresses Immuables</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher code SAP (ex: PART-1001), désignation, emplacement..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
            />
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 self-end sm:self-auto">
            {filteredArticles.length} / {MOCK_SAP_DATABASE.length} articles
          </div>
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[32px] ${
              selectedCategory === 'ALL'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Toutes Catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[32px] ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredArticles.map((art) => (
          <div
            key={art.codeArticle}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md hover:border-red-500/40 transition flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-black text-sm sm:text-base text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {art.codeArticle}
                </span>
                {art.categorie && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {art.categorie}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {art.nomArticle}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {art.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {art.emplacement || 'Emplacement non défini'}
                  </span>
                </span>
                <div className="font-mono">
                  <span className="text-[10px] text-slate-400 uppercase mr-1">SAP :</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    {art.qteSap} {art.unite || 'U'}
                  </span>
                </div>
              </div>

              {/* Direct action to count this part in Inventory */}
              <button
                type="button"
                onClick={() => onSelectArticleForInventory(art)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[38px] group"
              >
                <ScanLine className="w-3.5 h-3.5 text-red-600 group-hover:text-white" />
                <span>Inventorier cette pièce</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
