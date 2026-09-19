import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Flashlight, AlertCircle, Sparkles } from 'lucide-react';
import { MOCK_SAP_DATABASE } from '../data/mockSapDatabase';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanDetected: (code: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanDetected,
  title,
  subtitle,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        }

        // Native BarcodeDetector if available
        if ('BarcodeDetector' in window) {
          const BarcodeDetectorClass = (window as any).BarcodeDetector;
          const detector = new BarcodeDetectorClass({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'data_matrix'],
          });

          const scanFrame = async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const raw = barcodes[0].rawValue;
                  if (raw) {
                    onScanDetected(raw.trim());
                    return;
                  }
                }
              } catch {
                // frame detection pass
              }
            }
            animationFrameRef.current = requestAnimationFrame(scanFrame);
          };

          animationFrameRef.current = requestAnimationFrame(scanFrame);
        }
      } catch (err: any) {
        console.warn('Camera access issue:', err);
        setCameraError(
          "Impossible d'accéder à la caméra de votre PDA ou navigateur. Vous pouvez utiliser le simulateur de scan ci-dessous ou la saisie manuelle."
        );
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, onScanDetected]);

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } catch {
        // torch not supported on this device
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div 
        id="camera-scanner-dialog"
        className="w-full max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col"
      >
        {/* Header */}
        <div className="p-3.5 bg-slate-800 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {title || 'Scanner Caméra PDA'}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl transition min-w-[38px] min-h-[38px] flex items-center justify-center ${
                  torchOn ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
                title="Lampe torche"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-slate-300 max-w-xs">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <p className="text-xs font-semibold leading-relaxed">{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Laser Target Reticle Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-56 h-56 border-2 border-red-500/80 rounded-2xl shadow-lg">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-red-500"></div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-red-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-red-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-red-500"></div>

                  {/* Red Laser Sweep Line */}
                  <div className="w-full h-0.5 bg-red-600 shadow-[0_0_8px_#dc2626] absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
                </div>
              </div>

              <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/60 backdrop-blur-xs text-white font-mono text-[11px] px-2.5 py-1 rounded-full border border-red-500/40">
                  Alignez le QR code ou code-barres
                </span>
              </div>
            </>
          )}
        </div>

        {/* Quick Click-to-Scan Simulator Emulation */}
        <div className="p-3 bg-slate-800/80 border-t border-slate-700">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 mb-2">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>Simulation rapide de code scanné :</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {MOCK_SAP_DATABASE.slice(0, 4).map((p) => (
              <button
                key={p.codeArticle}
                type="button"
                onClick={() => onScanDetected(p.codeArticle)}
                className="text-left p-2 rounded-lg bg-slate-900 hover:bg-red-600 hover:text-white transition border border-slate-700 group"
              >
                <div className="font-mono font-bold text-xs group-hover:text-white">
                  {p.codeArticle}
                </div>
                <div className="text-[10px] text-slate-400 truncate group-hover:text-red-100">
                  {p.nomArticle}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
