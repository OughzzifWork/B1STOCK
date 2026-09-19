export interface SAPArticle {
  codeArticle: string;
  nomArticle: string;
  description: string;
  qteSap: number;
  emplacement?: string;
  unite?: string;
  categorie?: string;
  codeBarre?: string;
}

export type DiscrepancyStatus = 'CONFORME' | 'MANQUANT' | 'SURPLUS';

export interface InventoryRecord {
  id: string;
  timestamp: string;
  formattedDate: string;
  operatorId: string;
  operatorName: string;
  codeArticle: string;
  nomArticle: string;
  qteSap: number;
  qteReelle: number;
  ecart: number;
  status: DiscrepancyStatus;
  emplacement?: string;
  notes?: string;
  entityId?: string;
}

export interface Operator {
  id: string;
  name: string;
  badge: string;
  role: string;
}

export type UserRole = 'SuperAdmin' | 'Responsable' | 'Magasinier' | 'Visiteur';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  entityId: string;
  active: boolean;
  avatarColor?: string;
  password?: string;
}

export type SapDbEngine = 'MSSQL' | 'HANA' | 'POSTGRES';

export interface SapConnectionConfig {
  connectionType: 'DIRECT_DB';
  dbEngine: SapDbEngine;
  serverHost: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastTested?: string;
  sqlQuery: string;
  queryTimeoutSec?: number;
  ssl?: boolean;
}

export interface WarehouseEntity {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  sapConfig: SapConnectionConfig;
}

export interface ClosedInventory {
  id: string;
  reference: string;
  closedAt: string;
  formattedDate: string;
  closedBy: string;
  closedByRole: string;
  entityId: string;
  entityName: string;
  totalItems: number;
  totalConforme: number;
  totalManquant: number;
  totalSurplus: number;
  totalEcart: number;
  notes?: string;
  records: InventoryRecord[];
}

export type NavigationTab = 'dashboard' | 'inventaire' | 'articles' | 'history' | 'parametres' | 'profil';
