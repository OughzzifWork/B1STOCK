import React, { useState } from 'react';
import { Operator } from '../types';
import { MOCK_OPERATORS } from '../data/mockSapDatabase';
import { UserCheck, X, PlusCircle, Check } from 'lucide-react';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOperator: Operator;
  onSelectOperator: (operator: Operator) => void;
}

export const OperatorModal: React.FC<OperatorModalProps> = ({
  isOpen,
  onClose,
  currentOperator,
  onSelectOperator,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customId, setCustomId] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim() || !customName.trim()) return;
    onSelectOperator({
      id: customId.trim().toUpperCase(),
      name: customName.trim(),
      badge: 'MAG-EXT',
      role: 'Opérateur PDA',
    });
    setIsCustomMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        id="operator-modal-card" 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg">Sélection Opérateur Inventaire</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Choisissez votre profil pour horodater et signer les mouvements d'inventaire SAP :
          </p>

          {!isCustomMode ? (
            <div className="space-y-2">
              {MOCK_OPERATORS.map((op) => {
                const isSelected = op.id === currentOperator.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      onSelectOperator(op);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition min-h-[56px] ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30 text-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {op.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{op.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                            {op.id}
                          </span>
                          <span>{op.role}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-semibold min-h-[48px] transition"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Saisir un autre matricule opérateur</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matricule / ID Opérateur (Ex: OP-999)
                </label>
                <input
                  type="text"
                  required
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="OP-..."
                  className="w-full uppercase font-mono px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm min-h-[48px]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom & Prénom de l'opérateur
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Prénom Nom"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm min-h-[48px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm min-h-[48px] hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm min-h-[48px] transition"
                >
                  Valider
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
