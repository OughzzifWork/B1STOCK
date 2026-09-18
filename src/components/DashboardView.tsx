import React, { useMemo } from 'react';
import { InventoryRecord, WarehouseEntity } from '../types';
import { MOCK_SAP_DATABASE } from '../data/mockSapDatabase';
import { exportInventoryToExcel } from '../utils/excelExport';
import { 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  ScanLine, 
  FileSpreadsheet, 
  Database, 
  TrendingUp,
  Boxes,
  Activity,
  Layers
} from 'lucide-react';

interface DashboardViewProps {
  records: InventoryRecord[];
  entities: WarehouseEntity[];
  currentEntity?: WarehouseEntity;
  onGoToInventory: () => void;
  onGoToArticles: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  entities,
  currentEntity,
  onGoToInventory,
  onGoToArticles,
}) => {
  const stats = useMemo(() => {
    const totalCounted = records.length;
    const conformes = records.filter((r) => r.status === 'CONFORME').length;
    const manquants = records.filter((r) => r.status === 'MANQUANT').length;
    const surplus = records.filter((r) => r.status === 'SURPLUS').length;
    const totalEcart = records.reduce((acc, r) => acc + r.ecart, 0);
    const complianceRate = totalCounted > 0 ? ((conformes / totalCounted) * 100).toFixed(1) : '100.0';
    return { totalCounted, conformes, manquants, surplus, totalEcart, complianceRate };
  }, [records]);

  const totalSapCatalogCount = MOCK_SAP_DATABASE.length;

  return (
    <div className="space-y-4">
      {/* Quick Action Top Bar (Clean & compact, replacing the banner frame) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Site Actif : <strong className="text-slate-900 dark:text-white">{currentEntity?.name || 'Entrepôt Central'}</strong>
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {currentEntity?.code || 'ENT-01'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onGoToInventory}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition min-h-[38px]"
          >
            <ScanLine className="w-4 h-4" />
            <span>Nouveau Scan PDA</span>
          </button>

          <button
            type="button"
            onClick={() => exportInventoryToExcel(records)}
            disabled={records.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition min-h-[38px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={onGoToArticles}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition min-h-[38px] border border-slate-200 dark:border-slate-700"
          >
            <Database className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="hidden sm:inline">Catalogue SAP</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Comptés */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Articles Comptés</span>
            <Boxes className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {stats.totalCounted}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            sur <span className="font-bold text-slate-700 dark:text-slate-300">{totalSapCatalogCount}</span> articles SAP référencés
          </div>
        </div>

        {/* KPI 2: Taux de Conformité */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Taux Conformité</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {stats.complianceRate}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.conformes}</span> articles sans écart (Écart = 0)
          </div>
        </div>

        {/* KPI 3: Manquants */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Manquants (Déficit)</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {stats.manquants}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Articles avec stock physique &lt; SAP
          </div>
        </div>

        {/* KPI 4: Surplus */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Surplus (Excédent)</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
            {stats.surplus}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Articles avec stock physique &gt; SAP
          </div>
        </div>
      </div>

      {/* Discrepancy Progress Bar & Visual Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span>Répartition Qualitative des Comptages Réalisés</span>
          </h2>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            Solde net : {stats.totalEcart > 0 ? `+${stats.totalEcart}` : stats.totalEcart} pièces
          </span>
        </div>

        {/* Progress bar */}
        {stats.totalCounted > 0 ? (
          <div className="space-y-2">
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                style={{ width: `${(stats.conformes / stats.totalCounted) * 100}%` }}
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                title={`Conformes : ${stats.conformes}`}
              />
              <div
                style={{ width: `${(stats.manquants / stats.totalCounted) * 100}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`Manquants : ${stats.manquants}`}
              />
              <div
                style={{ width: `${(stats.surplus / stats.totalCounted) * 100}%` }}
                className="bg-blue-500 h-full rounded-r-full transition-all duration-500"
                title={`Surplus : ${stats.surplus}`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Conformes : <strong className="text-emerald-700 dark:text-emerald-400">{stats.conformes}</strong> ({((stats.conformes / stats.totalCounted) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Manquants : <strong className="text-rose-700 dark:text-rose-400">{stats.manquants}</strong> ({((stats.manquants / stats.totalCounted) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Surplus : <strong className="text-blue-700 dark:text-blue-400">{stats.surplus}</strong> ({((stats.surplus / stats.totalCounted) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Aucun comptage n'a encore été enregistré. Cliquez sur "Nouveau Scan PDA" pour démarrer l'inventaire.
          </div>
        )}
      </div>

      {/* Recent Discrepancies Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Derniers Écarts Détectés lors des Comptages
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {records.filter((r) => r.status !== 'CONFORME').length} anomalies
          </span>
        </div>

        {records.filter((r) => r.status !== 'CONFORME').length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Article</th>
                  <th className="py-2.5 px-3">Opérateur</th>
                  <th className="py-2.5 px-3 text-right">Qte SAP</th>
                  <th className="py-2.5 px-3 text-right">Qte Réelle</th>
                  <th className="py-2.5 px-3 text-right">Écart</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records
                  .filter((r) => r.status !== 'CONFORME')
                  .slice(0, 5)
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{rec.codeArticle}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{rec.nomArticle}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {rec.operatorName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {rec.qteSap}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                        {rec.qteReelle}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black">
                        <span className={rec.ecart < 0 ? 'text-rose-600' : 'text-blue-600'}>
                          {rec.ecart > 0 ? `+${rec.ecart}` : rec.ecart}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            rec.status === 'MANQUANT'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-70" />
            Aucun écart d'inventaire constaté sur les pièces comptées.
          </div>
        )}
      </div>
    </div>
  );
};
