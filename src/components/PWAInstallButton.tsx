import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode, don't show the install button
  if (isInstalled) {
    return null;
  }

  // Handle click based on platform
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback instruction for browsers where beforeinstallprompt was already dismissed
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleClick}
          title="Installer l'application PWA sur votre mobile ou PDA"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Installer PWA</span>
          <span className="sm:hidden">Installer</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 transition cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <div className="text-left flex-1 min-w-0">
            <div className="font-black truncate">Installer sur PDA / Mobile</div>
            <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 truncate">
              Accès rapide plein écran hors-ligne
            </div>
          </div>
        </button>
      )}

      {variant === 'pill' && (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer l'application</span>
        </button>
      )}

      {/* iOS or Manual Browser Installation Guide Modal */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Installation Mobile & PDA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pour installer B1Stock comme application autonome sur votre smartphone, tablette ou terminal PDA industriel :
            </p>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <Share className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Étape 1 :</strong> Dans le menu de votre navigateur (Safari ou Chrome), touchez le bouton <strong>Partager</strong> ou les <strong>trois points verticaux</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <PlusSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Étape 2 :</strong> Sélectionnez <strong>"Sur l'écran d'accueil"</strong> ou <strong>"Installer l'application"</strong>.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
