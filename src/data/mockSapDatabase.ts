import { SAPArticle, Operator } from '../types';

export const MOCK_OPERATORS: Operator[] = [
  { id: 'OP-042', name: 'Jean Dupont', badge: 'MAG-A1', role: 'Magasinier Principal' },
  { id: 'OP-108', name: 'Marc Laurent', badge: 'INV-02', role: 'Opérateur Inventaire' },
  { id: 'OP-205', name: 'Sophie Martin', badge: 'TECH-B', role: 'Gestionnaire Pièces' },
  { id: 'OP-314', name: 'Karim Benali', badge: 'MAINT-04', role: 'Agent Logistique' },
];

export const MOCK_SAP_DATABASE: SAPArticle[] = [
  {
    codeArticle: 'PART-1001',
    nomArticle: 'Roulement à billes SKF 6204',
    description: 'Roulement à billes monorow 20x47x14 mm à gorge profonde',
    qteSap: 15,
    emplacement: 'Allée B - Travée 04 - Niv. 2',
    unite: 'Pièce',
    categorie: 'Mécanique',
    codeBarre: 'PART-1001',
  },
  {
    codeArticle: 'PART-1002',
    nomArticle: 'Joint torique NBR 70 Shore 35x3 mm',
    description: 'Joint étanchéité nitrile résistant aux huiles minérales',
    qteSap: 50,
    emplacement: 'Allée A - Tiroir 12 - Bac 03',
    unite: 'Pièce',
    categorie: 'Hydraulique',
    codeBarre: 'PART-1002',
  },
  {
    codeArticle: 'PART-2045',
    nomArticle: 'Courroie trapézoïdale Gates SPZ 1120',
    description: 'Courroie crantée haute puissance transmission motrice',
    qteSap: 8,
    emplacement: 'Allée C - Travée 01 - Niv. 1',
    unite: 'Pièce',
    categorie: 'Transmission',
    codeBarre: 'PART-2045',
  },
  {
    codeArticle: 'PART-3180',
    nomArticle: 'Électrovanne Festo 24V DC 5/2',
    description: 'Distributeur pneumatique bistable G1/8 10 bar',
    qteSap: 4,
    emplacement: 'Allée D - Armoire Sécurisée P-03',
    unite: 'Pièce',
    categorie: 'Pneumatique',
    codeBarre: 'PART-3180',
  },
  {
    codeArticle: 'PART-4092',
    nomArticle: 'Capteur inductif PNP NO M12 Telemecanique',
    description: 'Détecteur de proximité portée 4 mm connecteur M12',
    qteSap: 12,
    emplacement: 'Allée D - Tiroir Élec 05',
    unite: 'Pièce',
    categorie: 'Électrique',
    codeBarre: 'PART-4092',
  },
  {
    codeArticle: 'PART-5501',
    nomArticle: 'Fusible Ultra-Rapide Ferraz Shawmut 16A',
    description: 'Fusible céramique 10x38 500V type aR protection variateur',
    qteSap: 45,
    emplacement: 'Allée D - Boîtier Élec F-11',
    unite: 'Pièce',
    categorie: 'Électrique',
    codeBarre: 'PART-5501',
  },
  {
    codeArticle: 'PART-6210',
    nomArticle: 'Filtre régulateur pneumatique SMC 1/4"',
    description: 'Ensemble FRL purge automatique cuve polycarbonate',
    qteSap: 6,
    emplacement: 'Allée C - Travée 03 - Niv. 2',
    unite: 'Pièce',
    categorie: 'Pneumatique',
    codeBarre: 'PART-6210',
  },
  {
    codeArticle: 'PART-7740',
    nomArticle: 'Vérin pneumatique double effet Ø32 Course 100',
    description: 'Vérin ISO 15552 avec amortissement réglable',
    qteSap: 3,
    emplacement: 'Allée B - Travée 08 - Niv. 1',
    unite: 'Pièce',
    categorie: 'Pneumatique',
    codeBarre: 'PART-7740',
  },
  {
    codeArticle: 'PART-8899',
    nomArticle: 'Cartouche filtrante hydraulique Hydac 10µm',
    description: 'Élément filtrant retour réservoir fibre de verre',
    qteSap: 20,
    emplacement: 'Allée A - Rayon 06 - Niv. 3',
    unite: 'Pièce',
    categorie: 'Hydraulique',
    codeBarre: 'PART-8899',
  },
  {
    codeArticle: 'PART-9302',
    nomArticle: 'Chaîne à rouleaux simplex ISO 08B-1 (5m)',
    description: 'Chaîne de transmission acier trempé au pas de 12.7 mm',
    qteSap: 5,
    emplacement: 'Allée C - Sol Travée 05',
    unite: 'Boîte',
    categorie: 'Mécanique',
    codeBarre: 'PART-9302',
  },
];

export function findSapArticle(query: string): SAPArticle | null {
  const clean = query.trim().toUpperCase();
  if (!clean) return null;
  return (
    MOCK_SAP_DATABASE.find(
      (item) =>
        item.codeArticle.toUpperCase() === clean ||
        item.codeBarre?.toUpperCase() === clean ||
        item.nomArticle.toUpperCase().includes(clean)
    ) || null
  );
}
