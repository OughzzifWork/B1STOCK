import * as XLSX from 'xlsx';
import { InventoryRecord } from '../types';

export function exportInventoryToExcel(records: InventoryRecord[], filenamePrefix = 'B1Stock_Inventaire') {
  if (!records || records.length === 0) {
    alert('Aucun enregistrement à exporter.');
    return;
  }

  // Transform records into localized tabular rows
  const data = records.map((rec, index) => ({
    'N°': index + 1,
    'Date & Heure': rec.formattedDate,
    'ID Opérateur': rec.operatorId,
    'Nom Opérateur': rec.operatorName,
    'Code SAP': rec.codeArticle,
    'Désignation Article': rec.nomArticle,
    'Emplacement': rec.emplacement || 'Non spécifié',
    'Qté SAP': rec.qteSap,
    'Qté Réelle (Comptée)': rec.qteReelle,
    'Écart (Réel - SAP)': rec.ecart,
    'Statut': rec.status,
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 6 },  // N°
    { wch: 18 }, // Date & Heure
    { wch: 14 }, // ID Opérateur
    { wch: 18 }, // Nom Opérateur
    { wch: 16 }, // Code SAP
    { wch: 38 }, // Désignation Article
    { wch: 28 }, // Emplacement
    { wch: 10 }, // Qté SAP
    { wch: 20 }, // Qté Réelle
    { wch: 18 }, // Écart
    { wch: 14 }, // Statut
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaire_B1Stock');

  // Add Summary sheet
  const conformes = records.filter(r => r.status === 'CONFORME').length;
  const manquants = records.filter(r => r.status === 'MANQUANT').length;
  const surplus = records.filter(r => r.status === 'SURPLUS').length;
  const totalEcartPieces = records.reduce((acc, r) => acc + r.ecart, 0);

  const summaryData = [
    { 'Indicateur': 'Total articles inventoriés', 'Valeur': records.length },
    { 'Indicateur': 'Articles Conformes (Écart = 0)', 'Valeur': conformes },
    { 'Indicateur': 'Articles Déficitaires (Manquants)', 'Valeur': manquants },
    { 'Indicateur': 'Articles Excédentaires (Surplus)', 'Valeur': surplus },
    { 'Indicateur': 'Solde net d\'écart en pièces', 'Valeur': totalEcartPieces },
    { 'Indicateur': 'Taux de conformité', 'Valeur': `${((conformes / records.length) * 100).toFixed(1)}%` },
    { 'Indicateur': 'Généré le', 'Valeur': new Date().toLocaleString('fr-FR') },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 32 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Synthèse');

  // Generate filename with timestamp
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const filename = `${filenamePrefix}_${dateStr}_${timeStr}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}
