import { AppUser, WarehouseEntity } from '../types';

export const DEFAULT_SAP_SQL_QUERY = `SELECT 
  T0.ItemCode AS codeArticle,
  T0.ItemName AS nomArticle,
  T0.FrgnName AS description,
  CAST(T1.OnHand AS INT) AS qteSap,
  T1.WhsCode AS emplacement,
  T0.InvntryUom AS unite,
  T2.ItmsGrpNam AS categorie,
  T0.CodeBars AS codeBarre
FROM OITM T0
INNER JOIN OITW T1 ON T0.ItemCode = T1.ItemCode
LEFT JOIN OITB T2 ON T0.ItmsGrpCod = T2.ItmsGrpCod
WHERE T1.WhsCode = 'DEP-MAGHRIB-01'
  AND T0.PrchseItem = 'Y'
ORDER BY T0.ItemCode ASC`;

export const INITIAL_ENTITIES: WarehouseEntity[] = [
  {
    id: 'ENT-01',
    code: 'ALF-CENTRAL',
    name: 'ALF AL MAGHRIB - Usine & Magasin Central',
    city: 'Casablanca Sidi Bernoussi',
    address: 'Zone Industrielle, Bd Ahl Loghlam, Casablanca',
    sapConfig: {
      connectionType: 'DIRECT_DB',
      dbEngine: 'MSSQL',
      serverHost: '192.168.10.50',
      port: 1433,
      databaseName: 'ALF_MAGHRIB_PRD',
      username: 'sa_sapb1_read',
      password: '••••••••••••',
      status: 'CONNECTED',
      lastTested: '18/09/2026 15:30',
      sqlQuery: DEFAULT_SAP_SQL_QUERY,
      queryTimeoutSec: 30,
      ssl: true,
    },
  },
  {
    id: 'ENT-02',
    code: 'ALF-FES',
    name: 'ALF AL MAGHRIB - Dépôt Régional Fès',
    city: 'Fès Bensouda',
    address: 'Parc Industriel Ain Chkef, Fès',
    sapConfig: {
      connectionType: 'DIRECT_DB',
      dbEngine: 'HANA',
      serverHost: 'hana-node01.alfmaghrib.ma',
      port: 30015,
      databaseName: 'SBODEMO_FES_PRD',
      username: 'SYSTEM',
      password: '••••••••••••',
      status: 'CONNECTED',
      lastTested: '18/09/2026 14:15',
      sqlQuery: `SELECT 
  T0."ItemCode" AS "codeArticle",
  T0."ItemName" AS "nomArticle",
  T0."FrgnName" AS "description",
  T1."OnHand" AS "qteSap",
  T1."WhsCode" AS "emplacement",
  T0."InvntryUom" AS "unite",
  T2."ItmsGrpNam" AS "categorie",
  T0."CodeBars" AS "codeBarre"
FROM "OITM" T0
JOIN "OITW" T1 ON T0."ItemCode" = T1."ItemCode"
LEFT JOIN "OITB" T2 ON T0."ItmsGrpCod" = T2."ItmsGrpCod"
WHERE T1."WhsCode" = 'DEP-FES-01'
ORDER BY T0."ItemCode" ASC`,
      queryTimeoutSec: 45,
      ssl: true,
    },
  },
  {
    id: 'ENT-03',
    code: 'ALF-AGADIR',
    name: 'ALF AL MAGHRIB - Station Sud Agadir',
    city: 'Agadir Ait Melloul',
    address: 'Zone Agro-Industrielle Lot 44, Ait Melloul',
    sapConfig: {
      connectionType: 'DIRECT_DB',
      dbEngine: 'MSSQL',
      serverHost: '192.168.30.22',
      port: 1433,
      databaseName: 'ALF_AGADIR_DB',
      username: 'b1_readonly',
      password: '••••••••••••',
      status: 'DISCONNECTED',
      lastTested: '18/09/2026 09:00',
      sqlQuery: DEFAULT_SAP_SQL_QUERY,
      queryTimeoutSec: 30,
      ssl: false,
    },
  },
];

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'USR-001',
    username: 'admin',
    name: 'Alexandre Marchand',
    role: 'SuperAdmin',
    email: 'admin@alfmaghrib.com',
    entityId: 'ENT-01',
    active: true,
    avatarColor: 'bg-red-600 text-white',
    password: 'password123',
  },
  {
    id: 'USR-002',
    username: 'responsable',
    name: 'Claire Delorme',
    role: 'Responsable',
    email: 'c.delorme@alfmaghrib.com',
    entityId: 'ENT-01',
    active: true,
    avatarColor: 'bg-emerald-600 text-white',
    password: 'password123',
  },
  {
    id: 'USR-003',
    username: 'magasinier',
    name: 'Jean Dupont',
    role: 'Magasinier',
    email: 'j.dupont@alfmaghrib.com',
    entityId: 'ENT-01',
    active: true,
    avatarColor: 'bg-slate-700 text-white',
    password: 'password123',
  },
  {
    id: 'USR-004',
    username: 'visiteur',
    name: 'Lucas Moreau (Auditeur)',
    role: 'Visiteur',
    email: 'visiteur@audit-logistique.com',
    entityId: 'ENT-02',
    active: true,
    avatarColor: 'bg-slate-500 text-white',
    password: 'password123',
  },
];
