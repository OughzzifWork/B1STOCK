import React, { useState, useMemo } from 'react';
import { ClosedInventory, WarehouseEntity, AppUser, DiscrepancyStatus } from '../types';
import { exportInventoryToExcel } from '../utils/excelExport';
import {
  History,
  FileSpreadsheet,
  Search,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Trash2,
  X,
  Layers,
  ChevronRight,
  AlertOctagon,
  ArrowUpDown
} from 'lucide-react';

interface InventoryHistoryViewProps {
  closedInventories: ClosedInventory[];
  entities: WarehouseEntity[];
  currentUser: AppUser;
  onDeleteClosedInventory?: (id: string) => void;
  onGoToInventory: () => void;
  showToast: (text: string, type?: 'success' | 'warning' | 'info') => void;
}

export const InventoryHistoryView: React.FC<InventoryHistoryViewProps> = ({
  closedInventories,
  entities,
  currentUser,
  onDeleteClosedInventory,
  onGoToInventory,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('ALL');
  const [selectedInventoryForDetail, setSelectedInventoryForDetail] = useState<ClosedInventory | null>(null);

  // Detail modal filtering & search
  const [modalSearch, setModalSearch] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState<'ALL' | DiscrepancyStatus>('ALL');

  // Confirmation for deletion
  const [deletingInvId, setDeletingInvId] = useState<string | null>(null);

  const canDelete = currentUser.role === 'SuperAdmin' || currentUser.role === 'Responsable';

  // Overall Statistics across all closed inventories
  const globalStats = useMemo(() => {
    const totalSessions = closedInventories.length;
    const totalItemsScanned = closedInventories.reduce((acc, inv) => acc + inv.totalItems, 0);
    const totalConformes = closedInventories.reduce((acc, inv) => acc + inv.totalConforme, 0);
    const totalManquants = closedInventories.reduce((acc, inv) => acc + inv.totalManquant, 0);
    const totalSurplus = closedInventories.reduce((acc, inv) => acc + inv.totalSurplus, 0);
    const totalEcartNet = closedInventories.reduce((acc, inv) => acc + inv.totalEcart, 0);
    const conformitePct = totalItemsScanned > 0 ? ((totalConformes / totalItemsScanned) * 100).toFixed(1) : '100.0';

    return {
      totalSessions,
      totalItemsScanned,
      totalConformes,
      totalManquants,
      totalSurplus,
      totalEcartNet,
      conformitePct,
    };
  }, [closedInventories]);

  // Filtered closed inventories
  const filteredInventories = useMemo(() => {
    return closedInventories.filter((inv) => {
      const matchesEntity = selectedEntityFilter === 'ALL' || inv.entityId === selectedEntityFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        inv.reference.toLowerCase().includes(searchLower) ||
        inv.closedBy.toLowerCase().includes(searchLower) ||
        inv.entityName.toLowerCase().includes(searchLower) ||
        (inv.notes && inv.notes.toLowerCase().includes(searchLower)) ||
        inv.records.some(
          (r) =>
            r.codeArticle.toLowerCase().includes(searchLower) ||
            r.nomArticle.toLowerCase().includes(searchLower)
        );

      return matchesEntity && matchesSearch;
    });
  }, [closedInventories, selectedEntityFilter, searchTerm]);

  // Modal filtered items
  const modalFilteredRecords = useMemo(() => {
    if (!selectedInventoryForDetail) return [];
    return selectedInventoryForDetail.records.filter((rec) => {
      const searchLower = modalSearch.toLowerCase();
      const matchesSearch =
        !modalSearch ||
        rec.codeArticle.toLowerCase().includes(searchLower) ||
        rec.nomArticle.toLowerCase().includes(searchLower) ||
        (rec.notes && rec.notes.toLowerCase().includes(searchLower));

      const matchesStatus = modalStatusFilter === 'ALL' || rec.status === modalStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [selectedInventoryForDetail, modalSearch, modalStatusFilter]);

  const handleExportSession = (inv: ClosedInventory) => {
    exportInventoryToExcel(inv.records, `B1Stock_${inv.reference}`);
    showToast(`Inventaire ${inv.reference} exporté en Excel avec succès.`, 'success');
  };

  const handleConfirmDelete = (id: string, ref: string) => {
    if (onDeleteClosedInventory) {
      onDeleteClosedInventory(id);
      showToast(`Session d'inventaire ${ref} supprimée de l'historique.`, 'info');
      setDeletingInvId(null);
      if (selectedInventoryForDetail?.id === id) {
        setSelectedInventoryForDetail(null);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Inventory History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Historique et archives de tous les inventaires passés clôturés
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToInventory}
          className="self-start sm:self-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition"
        >
          <span>Aller à l'inventaire en cours →</span>
        </button>
      </div>

      {/* Global Summary Statistics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Inventaires Clôturés
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {globalStats.totalSessions}
            </span>
            <span className="text-xs text-slate-400">sessions archivées</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Articles Recensés
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {globalStats.totalItemsScanned}
            </span>
            <span className="text-xs text-slate-400">pièces comptées</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Taux de Conformité
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {globalStats.conformitePct}%
            </span>
            <span className="text-xs text-slate-400">sans écart</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Solde Net d'Écart
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono ${
                globalStats.totalEcartNet === 0
                  ? 'text-slate-900 dark:text-white'
                  : globalStats.totalEcartNet > 0
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {globalStats.totalEcartNet > 0 ? `+${globalStats.totalEcartNet}` : globalStats.totalEcartNet}
            </span>
            <span className="text-xs text-slate-400">pièces nettes</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence (INV-...), opérateur, note, article..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">Site :</span>
          </div>
          <select
            value={selectedEntityFilter}
            onChange={(e) => setSelectedEntityFilter(e.target.value)}
            className="flex-1 sm:flex-initial w-full sm:w-auto min-w-0 max-w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-red-600 truncate cursor-pointer shadow-2xs"
          >
            <option value="ALL">Tous les sites ({entities.length})</option>
            {entities.map((ent) => (
              <option key={ent.id} value={ent.id}>
                {ent.code} — {ent.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List of Closed Inventories */}
      {filteredInventories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <History className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
            Aucun inventaire clôturé trouvé
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {closedInventories.length === 0
              ? "Aucun inventaire n'a encore été clôturé. Rendez-vous sur la page Inventaire et cliquez sur 'Clôturé Inventaire' pour enregistrer votre première session."
              : "Aucune session d'inventaire ne correspond à vos critères de recherche."}
          </p>
          {closedInventories.length === 0 && (
            <button
              type="button"
              onClick={onGoToInventory}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 shadow-xs transition"
            >
              <span>Accéder à l'inventaire en cours</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInventories.map((inv) => {
            const conformite =
              inv.totalItems > 0 ? ((inv.totalConforme / inv.totalItems) * 100).toFixed(0) : '100';

            return (
              <div
                key={inv.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Identification, Entity, Operator & Notes */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/60">
                        {inv.reference}
                      </span>

                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inv.entityName}</span>
                      </span>

                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Clôturé le {inv.formattedDate}</span>
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        Session Clôturée
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                      <div>
                        Clôturé par : <strong className="text-slate-800 dark:text-slate-200">{inv.closedBy}</strong>{' '}
                        <span className="opacity-75">({inv.closedByRole})</span>
                      </div>
                      {inv.notes && (
                        <div className="text-slate-500 italic max-w-xl truncate">
                          « {inv.notes} »
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Metrics Pills */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Scanné</div>
                      <div className="font-mono font-black text-slate-900 dark:text-white">
                        {inv.totalItems} articles
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                      <div className="text-[10px] uppercase font-bold">Conformes</div>
                      <div className="font-mono font-black">{inv.totalConforme}</div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300">
                      <div className="text-[10px] uppercase font-bold">Manquants</div>
                      <div className="font-mono font-black">{inv.totalManquant}</div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                      <div className="text-[10px] uppercase font-bold">Surplus</div>
                      <div className="font-mono font-black">{inv.totalSurplus}</div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Conformité</div>
                      <div className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {conformite}%
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInventoryForDetail(inv);
                        setModalSearch('');
                        setModalStatusFilter('ALL');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      title="Consulter le détail de tous les articles de cette session"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Détails ({inv.records.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportSession(inv)}
                      className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      title="Télécharger l'inventaire complet en Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Excel</span>
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeletingInvId(inv.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        title="Supprimer cet inventaire de l'historique"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Confirm delete prompt inline */}
                {deletingInvId === inv.id && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-red-800 dark:text-red-200">
                      Confirmer la suppression définitive de la session {inv.reference} de l'historique ?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(inv.id, inv.reference)}
                        className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition cursor-pointer"
                      >
                        Supprimer
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingInvId(null)}
                        className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL: Full breakdown of records inside the selected closed inventory */}
      {selectedInventoryForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-base sm:text-lg">
                      Détail Session {selectedInventoryForDetail.reference}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800 font-mono font-bold">
                      {selectedInventoryForDetail.records.length} écritures
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedInventoryForDetail.entityName} • Clôturé le{' '}
                    {selectedInventoryForDetail.formattedDate} par {selectedInventoryForDetail.closedBy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportSession(selectedInventoryForDetail)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporter Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInventoryForDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Subheader with Search and Status Filter */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Filtrer dans cet inventaire (code, désignation, note)..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-red-600 outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {(['ALL', 'CONFORME', 'MANQUANT', 'SURPLUS'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setModalStatusFilter(st)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      modalStatusFilter === st
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'ALL' ? 'Tous' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[300px] text-xs">
              {modalFilteredRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <AlertOctagon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Aucun article trouvé</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Aucun article ne correspond aux filtres actuels.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Article SAP</th>
                      <th className="py-2.5 px-2 text-center">Qté SAP</th>
                      <th className="py-2.5 px-2 text-center">Qté Réelle</th>
                      <th className="py-2.5 px-2 text-center">Écart</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 px-3 hidden sm:table-cell">Emplacement</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">Opérateur</th>
                      <th className="py-2.5 px-3">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {modalFilteredRecords.map((item) => {
                      const isConforme = item.status === 'CONFORME';
                      const isManquant = item.status === 'MANQUANT';

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-slate-900 dark:text-white">
                              {item.codeArticle}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                              {item.nomArticle}
                            </div>
                          </td>

                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.qteSap}
                          </td>

                          <td className="py-2.5 px-2 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                            {item.qteReelle}
                          </td>

                          <td className="py-2.5 px-2 text-center font-mono font-black text-sm">
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                                isConforme
                                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                                  : isManquant
                                  ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                                  : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                              }`}
                            >
                              {item.ecart > 0 ? `+${item.ecart}` : item.ecart}
                            </span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isConforme
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isManquant
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isConforme && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {isManquant && <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                              {item.status === 'SURPLUS' && <ArrowUpRight className="w-3 h-3 text-amber-600" />}
                              <span>{item.status}</span>
                            </span>
                          </td>

                          <td className="py-2.5 px-3 hidden sm:table-cell text-slate-500 font-mono text-[11px]">
                            {item.emplacement || '—'}
                          </td>

                          <td className="py-2.5 px-3 hidden md:table-cell text-slate-600 dark:text-slate-400">
                            {item.operatorName}
                          </td>

                          <td className="py-2.5 px-3 text-slate-500 italic text-[11px]">
                            {item.notes || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <div>
                Affichage de {modalFilteredRecords.length} sur {selectedInventoryForDetail.records.length} pièces
              </div>

              <button
                type="button"
                onClick={() => setSelectedInventoryForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
