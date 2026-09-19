import React, { useState, useMemo } from 'react';
import { SAPArticle, InventoryRecord, AppUser, WarehouseEntity } from '../types';
import { MOCK_SAP_DATABASE } from '../data/mockSapDatabase';
import { 
  Database, 
  Search, 
  ScanLine, 
  MapPin, 
  Lock, 
  ArrowRight,
  QrCode,
  X,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { CameraScannerModal } from './CameraScannerModal';
import { ArticleInventoryModal } from './ArticleInventoryModal';

interface SapArticlesViewProps {
  records: InventoryRecord[];
  onSaveRecord: (record: InventoryRecord) => void;
  currentUser: AppUser;
  currentEntity?: WarehouseEntity;
  showToast: (text: string, type?: 'success' | 'warning' | 'info') => void;
  onSelectArticleForInventory?: (article: SAPArticle) => void;
}

export const SapArticlesView: React.FC<SapArticlesViewProps> = ({
  records,
  onSaveRecord,
  currentUser,
  currentEntity,
  showToast,
  onSelectArticleForInventory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScannedSearch, setIsScannedSearch] = useState(false);
  const [inventoryModalArticle, setInventoryModalArticle] = useState<SAPArticle | null>(null);

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
      const q = searchTerm.trim().toLowerCase();
      if (!q) {
        return selectedCategory === 'ALL' || art.categorie === selectedCategory;
      }

      const matchesQuery =
        art.codeArticle.toLowerCase().includes(q) ||
        (art.codeBarre && art.codeBarre.toLowerCase().includes(q)) ||
        art.nomArticle.toLowerCase().includes(q) ||
        art.description.toLowerCase().includes(q) ||
        (art.emplacement && art.emplacement.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'ALL' || art.categorie === selectedCategory;
      return matchesQuery && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const handleScanDetected = (rawCode: string) => {
    let cleanCode = rawCode.trim();

    // Check if QR code payload is JSON (e.g. {"code": "PART-1001"})
    try {
      if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
        const parsed = JSON.parse(cleanCode);
        cleanCode = parsed.code || parsed.codeArticle || parsed.matnr || parsed.id || cleanCode;
      }
    } catch {
      // ignore
    }

    // Check if prefixed (e.g. "SAP:PART-1001" or "QR:PART-1001")
    if (cleanCode.includes(':') && !cleanCode.startsWith('http')) {
      const parts = cleanCode.split(':');
      if (parts.length === 2 && parts[1].trim()) {
        cleanCode = parts[1].trim();
      }
    }

    setSearchTerm(cleanCode);
    setIsScannedSearch(true);
    setIsScannerOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsScannedSearch(false);
  };

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-scan-qr-header"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer min-h-[38px]"
            title="Scanner QR Code Article"
          >
            <QrCode className="w-4 h-4" />
            <span>Scanner QR Code</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 min-h-[38px]">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Fiches Maîtresses</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-search-sap-articles"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value) setIsScannedSearch(false);
                }}
                placeholder="Rechercher code SAP (ex: PART-1001), désignation, emplacement..."
                className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition min-h-[44px]"
              />
              {searchTerm && (
                <button
                  type="button"
                  id="btn-clear-sap-search"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md transition"
                  title="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* QR Scan Button in search bar */}
            <button
              type="button"
              id="btn-scan-qr-searchbar"
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition shrink-0 border border-slate-700 active:scale-[0.98] min-h-[44px] cursor-pointer"
              title="Scanner un QR Code pour rechercher dans la base SAP"
            >
              <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Scan QR</span>
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 self-end sm:self-auto shrink-0">
            {filteredArticles.length} / {MOCK_SAP_DATABASE.length} articles
          </div>
        </div>

        {/* QR Scan Active Tag */}
        {isScannedSearch && searchTerm && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2 truncate">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                Recherche par QR Code : <strong className="font-mono">{searchTerm}</strong>
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-emerald-200/70 dark:bg-emerald-900/60 font-bold text-[10px]">
                {filteredArticles.length} résultat(s)
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 ml-2"
            >
              Effacer le filtre
            </button>
          </div>
        )}

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

      {/* Articles Cards Grid or Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Aucun article SAP trouvé
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? `Aucun article ne correspond à la recherche "${searchTerm}". Vérifiez le code scanné ou réessayez.`
              : 'Aucun article trouvé dans cette catégorie.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </button>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scanner un autre QR</span>
            </button>
          </div>
        </div>
      ) : (
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

                {/* Inventory status badge if already counted */}
                {(() => {
                  const existing = records.find((r) => r.codeArticle === art.codeArticle);
                  if (!existing) return null;
                  return (
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Inventorié</span>
                      </span>
                      <span className="font-mono font-black text-emerald-800 dark:text-emerald-200">
                        {existing.qteReelle} {art.unite || 'U'}
                        <span className="text-[10px] font-normal ml-1 opacity-75">
                          (Écart: {existing.ecart > 0 ? `+${existing.ecart}` : existing.ecart})
                        </span>
                      </span>
                    </div>
                  );
                })()}

                {/* Direct action to count this part in an inventory Pop-up without leaving the page */}
                {(() => {
                  const existing = records.find((r) => r.codeArticle === art.codeArticle);
                  return (
                    <button
                      type="button"
                      id={`btn-inventory-${art.codeArticle}`}
                      onClick={() => setInventoryModalArticle(art)}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[38px] group cursor-pointer shadow-2xs ${
                        existing
                          ? 'bg-amber-100 hover:bg-amber-600 text-amber-900 hover:text-white dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <ScanLine className={`w-3.5 h-3.5 ${existing ? 'text-amber-700 dark:text-amber-400 group-hover:text-white' : 'text-red-600 group-hover:text-white'}`} />
                      <span>{existing ? 'Modifier la Quantité Réelle' : 'Inventorier cette pièce'}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up Modal for Inventory without leaving page */}
      <ArticleInventoryModal
        isOpen={Boolean(inventoryModalArticle)}
        onClose={() => setInventoryModalArticle(null)}
        article={inventoryModalArticle}
        existingRecord={
          inventoryModalArticle
            ? records.find((r) => r.codeArticle === inventoryModalArticle.codeArticle) || null
            : null
        }
        currentUser={currentUser}
        currentEntity={currentEntity}
        onSaveRecord={onSaveRecord}
        showToast={showToast}
      />

      {/* Camera / QR Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanDetected={handleScanDetected}
        title="Recherche Article par QR Code SAP"
        subtitle="Alignez le QR code ou code-barres de l'article pour filtrer instantanément"
      />
    </div>
  );
};
