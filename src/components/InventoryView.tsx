import React, { useState, useMemo } from 'react';
import { 
  SAPArticle, 
  InventoryRecord, 
  AppUser, 
  DiscrepancyStatus,
  WarehouseEntity 
} from '../types';
import { ScannerSection } from './ScannerSection';
import { SapArticleDisplay } from './SapArticleDisplay';
import { RealStockInput } from './RealStockInput';
import { CameraScannerModal } from './CameraScannerModal';
import { exportInventoryToExcel } from '../utils/excelExport';
import { playSound } from '../utils/sound';
import { 
  ScanLine, 
  Table, 
  FileSpreadsheet, 
  Search, 
  Trash2, 
  RotateCw, 
  Calendar, 
  User, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertOctagon
} from 'lucide-react';

interface InventoryViewProps {
  currentUser: AppUser;
  currentEntity?: WarehouseEntity;
  activeArticle: SAPArticle | null;
  onSetActiveArticle: (art: SAPArticle | null) => void;
  scanInput: string;
  onChangeScanInput: (val: string) => void;
  onSearchSap: (code?: string) => void;
  isLoadingArticle: boolean;
  searchError: string | null;
  realCount: string;
  onChangeRealCount: (val: string) => void;
  notes: string;
  onChangeNotes: (val: string) => void;
  records: InventoryRecord[];
  onAddRecord: (record: InventoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAllRecords: () => void;
  scanInputRef: React.RefObject<HTMLInputElement | null>;
  realStockInputRef: React.RefObject<HTMLInputElement | null>;
  showToast: (text: string, type?: 'success' | 'warning' | 'info') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  currentUser,
  currentEntity,
  activeArticle,
  onSetActiveArticle,
  scanInput,
  onChangeScanInput,
  onSearchSap,
  isLoadingArticle,
  searchError,
  realCount,
  onChangeRealCount,
  notes,
  onChangeNotes,
  records,
  onAddRecord,
  onDeleteRecord,
  onClearAllRecords,
  scanInputRef,
  realStockInputRef,
  showToast,
}) => {
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DiscrepancyStatus>('ALL');
  const [viewMode, setViewMode] = useState<'both' | 'scanner' | 'table'>('both');

  // Filtered records for data table
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const q = tableSearch.toLowerCase();
      const matchesSearch =
        rec.codeArticle.toLowerCase().includes(q) ||
        rec.nomArticle.toLowerCase().includes(q) ||
        rec.operatorName.toLowerCase().includes(q) ||
        rec.operatorId.toLowerCase().includes(q) ||
        (rec.emplacement && rec.emplacement.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, tableSearch, statusFilter]);

  // Validation logic
  const handleValidateWriting = () => {
    if (!activeArticle) return;

    if (realCount.trim() === '') {
      showToast('Veuillez saisir la quantité réelle comptée.', 'warning');
      realStockInputRef.current?.focus();
      return;
    }

    const countNumber = Number(realCount);
    if (isNaN(countNumber) || countNumber < 0) {
      showToast('Veuillez saisir un nombre valide supérieur ou égal à zéro.', 'warning');
      realStockInputRef.current?.focus();
      return;
    }

    // Discrepancy: Écart = Quantité Réelle - Quantité SAP
    const ecart = countNumber - activeArticle.qteSap;
    let status: DiscrepancyStatus = 'CONFORME';
    if (ecart < 0) status = 'MANQUANT';
    else if (ecart > 0) status = 'SURPLUS';

    const now = new Date();
    const newRecord: InventoryRecord = {
      id: `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
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
      codeArticle: activeArticle.codeArticle,
      nomArticle: activeArticle.nomArticle,
      qteSap: activeArticle.qteSap,
      qteReelle: countNumber,
      ecart,
      status,
      emplacement: activeArticle.emplacement,
      notes: notes.trim() || undefined,
      entityId: currentEntity?.id,
    };

    onAddRecord(newRecord);

    if (ecart === 0) {
      playSound('success');
      showToast(`Écriture validée : ${activeArticle.codeArticle} (Conforme, Écart: 0)`, 'success');
    } else {
      playSound('warning');
      showToast(
        `Écriture enregistrée avec Écart (${status}) : ${ecart > 0 ? `+${ecart}` : ecart} pièces`,
        'warning'
      );
    }

    // Auto-resets input for next item scan
    onSetActiveArticle(null);
    onChangeScanInput('');
    onChangeRealCount('');
    onChangeNotes('');

    setTimeout(() => {
      scanInputRef.current?.focus();
    }, 80);
  };

  const handleCancelScan = () => {
    onSetActiveArticle(null);
    onChangeScanInput('');
    onChangeRealCount('');
    onChangeNotes('');
    scanInputRef.current?.focus();
  };

  const canDelete = currentUser.role === 'SuperAdmin' || currentUser.role === 'Responsable';

  return (
    <div className="space-y-4">
      {/* Top Banner & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-red-600" />
            <span>Inventaire & Réconciliation SAP</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Poste opérateur PDA • {currentEntity?.name || 'Entrepôt Central'} • {records.length} pièces inventoriées
          </p>
        </div>

        {/* View mode toggle (Scanner / Table / Both) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'both' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vue Complète
          </button>
          <button
            type="button"
            onClick={() => setViewMode('scanner')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'scanner' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Scanner PDA
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-red-600" />
            <span>Table Articles Scannés ({records.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Scanner & SAP Card, Right side Scanned Articles Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* SECTION 1: SCANNER & COUNTING WORKFLOW */}
        {(viewMode === 'both' || viewMode === 'scanner') && (
          <div className={`${viewMode === 'both' ? 'lg:col-span-5' : 'lg:col-span-12 max-w-2xl mx-auto'} space-y-3.5`}>
            
            {/* Step 1: Scanner Input */}
            <ScannerSection
              scanInput={scanInput}
              onChangeScanInput={onChangeScanInput}
              onSearch={onSearchSap}
              onOpenLiveCamera={() => setIsCameraScannerOpen(true)}
              isLoading={isLoadingArticle}
              errorMessage={searchError}
              inputRef={scanInputRef}
            />

            {/* Step 2: Read-Only SAP Master Display */}
            <SapArticleDisplay article={activeArticle} />

            {/* Step 3: Real Physical Count & Dynamic Discrepancy Calculation */}
            {activeArticle && (
              <RealStockInput
                article={activeArticle}
                realCount={realCount}
                onChangeRealCount={onChangeRealCount}
                onValidate={handleValidateWriting}
                inputRef={realStockInputRef}
                notes={notes}
                onChangeNotes={onChangeNotes}
              />
            )}

            {/* Cancel Action */}
            {activeArticle && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleCancelScan}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition min-h-[40px]"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Annuler ce comptage</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: DATA TABLE WITH SEARCH BAR & FILTER LISTE SCANNER ARTICLES */}
        {(viewMode === 'both' || viewMode === 'table') && (
          <div className={`${viewMode === 'both' ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden`}>
            
            {/* Table Header with Search Bar, Filter and Excel Export Button */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      Liste des Articles Scannés
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {filteredRecords.length} sur {records.length} écritures validées
                    </span>
                  </div>
                </div>

                {/* Exporter en Excel button */}
                <button
                  type="button"
                  id="btn-inventory-export-excel"
                  onClick={() => exportInventoryToExcel(records)}
                  disabled={records.length === 0}
                  className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition min-h-[40px]"
                  title="Générer un fichier Excel normalisé de toutes les saisies"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporter en Excel (.xlsx)</span>
                </button>
              </div>

              {/* Search bar & Status Filter buttons */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Rechercher code SAP, pièce, opérateur..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
                  />
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(['ALL', 'CONFORME', 'MANQUANT', 'SURPLUS'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[34px] ${
                        statusFilter === filter
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {filter === 'ALL' ? 'Tous' : filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scanned Articles Data Table */}
            <div className="overflow-x-auto flex-1 min-h-[300px] max-h-[600px] overflow-y-auto">
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <AlertOctagon className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun article scanné trouvé</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {records.length === 0
                      ? 'Utilisez le scanner ci-contre pour valider des écritures d\'inventaire.'
                      : 'Aucun enregistrement ne correspond aux critères de recherche actuels.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/90 dark:bg-slate-800 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Article SAP</th>
                      <th className="py-2.5 px-2 text-center">Qté SAP</th>
                      <th className="py-2.5 px-2 text-center">Qté Réelle</th>
                      <th className="py-2.5 px-2 text-center">Écart</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">Opérateur</th>
                      <th className="py-2.5 px-3 hidden sm:table-cell">Horodatage</th>
                      {canDelete && <th className="py-2.5 px-2 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRecords.map((item) => {
                      const isConforme = item.status === 'CONFORME';
                      const isManquant = item.status === 'MANQUANT';

                      return (
                        <tr 
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-slate-900 dark:text-white">
                              {item.codeArticle}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                              {item.nomArticle}
                            </div>
                            {item.notes && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">
                                Note : {item.notes}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.qteSap}
                          </td>

                          <td className="py-2.5 px-2 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                            {item.qteReelle}
                          </td>

                          <td className="py-2.5 px-2 text-center font-mono font-black text-sm">
                            <span
                              className={
                                isConforme
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isManquant
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }
                            >
                              {item.ecart > 0 ? `+${item.ecart}` : item.ecart}
                            </span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                isConforme
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                  : isManquant
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                              }`}
                            >
                              {isConforme ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : isManquant ? (
                                <ArrowDownRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              )}
                              <span>{item.status}</span>
                            </span>
                          </td>

                          <td className="py-2.5 px-3 hidden md:table-cell text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[120px]">{item.operatorName}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 hidden sm:table-cell text-slate-500 font-mono text-[11px]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{item.formattedDate}</span>
                            </div>
                          </td>

                          {canDelete && (
                            <td className="py-2.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => onDeleteRecord(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition opacity-70 group-hover:opacity-100"
                                title="Supprimer cet enregistrement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer Summary & Clear All */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>
                Total : <strong className="text-slate-900 dark:text-white">{records.length}</strong> lignes d'inventaire
              </div>
              {canDelete && records.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllRecords}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold hover:underline"
                >
                  Réinitialiser tout l'inventaire
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Live Camera Scanner Modal */}
      {isCameraScannerOpen && (
        <CameraScannerModal
          isOpen={isCameraScannerOpen}
          onClose={() => setIsCameraScannerOpen(false)}
          onScanDetected={(scannedCode: string) => {
            setIsCameraScannerOpen(false);
            onChangeScanInput(scannedCode);
            onSearchSap(scannedCode);
          }}
        />
      )}
    </div>
  );
};
