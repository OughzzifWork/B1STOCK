import React, { useState, useMemo } from 'react';
import { InventoryRecord, DiscrepancyStatus } from '../types';
import { exportInventoryToExcel } from '../utils/excelExport';
import { 
  FileSpreadsheet, 
  Trash2, 
  X, 
  Search, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  User, 
  AlertOctagon 
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: InventoryRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onDeleteRecord,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DiscrepancyStatus>('ALL');
  const [confirmClear, setConfirmClear] = useState(false);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.codeArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.nomArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.operatorId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const conformes = records.filter((r) => r.status === 'CONFORME').length;
    const manquants = records.filter((r) => r.status === 'MANQUANT').length;
    const surplus = records.filter((r) => r.status === 'SURPLUS').length;
    const totalEcart = records.reduce((acc, r) => acc + r.ecart, 0);
    return { total, conformes, manquants, surplus, totalEcart };
  }, [records]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div 
        id="history-modal-dialog"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                Historique d'Inventaire Magasin
              </h2>
              <p className="text-xs text-slate-400">
                {records.length} écritures validées et synchronisées localement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Excel Export Button */}
            <button
              type="button"
              id="btn-export-excel"
              onClick={() => exportInventoryToExcel(records)}
              disabled={records.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:pointer-events-none text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition min-h-[40px]"
              title="Exporter les écritures en format Excel .xlsx"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exporter en Excel</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Fermer la boîte de dialogue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Total Lignes</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>
          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-bold">Conformes (=0)</span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{stats.conformes}</span>
          </div>
          <div className="bg-rose-50/60 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800 shadow-2xs">
            <span className="text-rose-700 dark:text-rose-400 block text-[10px] uppercase font-bold">Manquants (&lt;0)</span>
            <span className="text-base font-black text-rose-700 dark:text-rose-400">{stats.manquants}</span>
          </div>
          <div className="bg-blue-50/60 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-200 dark:border-blue-800 shadow-2xs">
            <span className="text-blue-700 dark:text-blue-400 block text-[10px] uppercase font-bold">Surplus (&gt;0)</span>
            <span className="text-base font-black text-blue-700 dark:text-blue-400">{stats.surplus}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Solde Écart Net</span>
            <span className={`text-base font-black font-mono ${stats.totalEcart === 0 ? 'text-slate-700 dark:text-slate-300' : stats.totalEcart < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {stats.totalEcart > 0 ? `+${stats.totalEcart}` : stats.totalEcart}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher code, pièce, opérateur..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white focus:border-red-600 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'CONFORME', 'MANQUANT', 'SURPLUS'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[34px] ${
                  statusFilter === filter
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {filter === 'ALL' ? 'Tous' : filter}
              </button>
            ))}

            {records.length > 0 && (
              <div className="ml-auto pl-2">
                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 min-h-[34px]"
                    title="Vider l'historique"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Purger</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-900">
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Confirmer ?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAll();
                        setConfirmClear(false);
                      }}
                      className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold"
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px]"
                    >
                      Non
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content list / table */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-950/40">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertOctagon className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Aucun enregistrement trouvé</p>
              <p className="text-xs text-slate-500 mt-1">
                {records.length === 0
                  ? "Vous n'avez pas encore validé d'écriture de stock."
                  : 'Aucun enregistrement ne correspond à vos filtres.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredRecords.map((item) => {
                const isConforme = item.status === 'CONFORME';
                const isManquant = item.status === 'MANQUANT';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isConforme
                        ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60'
                        : isManquant
                        ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60'
                        : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {item.codeArticle}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${
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
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.nomArticle}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{item.operatorName}</span>
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{item.formattedDate}</span>
                          </span>
                          {item.emplacement && (
                            <span className="text-slate-400">
                              Emplacement : <strong>{item.emplacement}</strong>
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-1 text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                            Note : {item.notes}
                          </div>
                        )}
                      </div>

                      {/* Discrepancy block */}
                      <div className="text-right shrink-0 pl-2">
                        <div className="text-xs text-slate-500">
                          SAP: <strong>{item.qteSap}</strong> | Réel: <strong>{item.qteReelle}</strong>
                        </div>
                        <div className="text-lg sm:text-xl font-mono font-black mt-0.5">
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
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteRecord(item.id)}
                          className="mt-1 text-slate-400 hover:text-rose-600 p-1 transition"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
