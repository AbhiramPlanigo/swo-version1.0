import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Crop, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  RefreshCw, 
  Check, 
  X, 
  Sparkles,
  Info
} from 'lucide-react';
import { AllowedAspectRatio } from './ImageUploadField';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  initialAspectRatio?: AllowedAspectRatio;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
  title?: string;
  lockRatio?: boolean;
}

const CROP_RATIO_SPECS: Record<AllowedAspectRatio, {
  label: string;
  fraction: number;
  outputWidth: number;
  outputHeight: number;
  description: string;
}> = {
  '16:9': {
    label: '16:9 Landscape',
    fraction: 16 / 9,
    outputWidth: 1920,
    outputHeight: 1080,
    description: 'Cinematic Widescreen (1920 × 1080 px). Required for event banners, hero ambience, and campus highlights.',
  },
  '1:1': {
    label: '1:1 Square',
    fraction: 1,
    outputWidth: 1000,
    outputHeight: 1000,
    description: 'Symmetrical Square (1000 × 1000 px). Required for profile avatars, guest speaker portraits, and seals.',
  },
  '4:3': {
    label: '4:3 Standard',
    fraction: 4 / 3,
    outputWidth: 1200,
    outputHeight: 900,
    description: 'Classic Display Poster (1200 × 900 px). Required for circular posters, bulletins, and survey cards.',
  },
  '21:9': {
    label: '21:9 Ultrawide',
    fraction: 21 / 9,
    outputWidth: 2560,
    outputHeight: 1080,
    description: 'Panoramic Ultrawide (2560 × 1080 px). Ideal for flagship portal hero header banners.',
  },
  '3:1': {
    label: '3:1 Banner Strip',
    fraction: 3 / 1,
    outputWidth: 1200,
    outputHeight: 400,
    description: 'Horizontal Ribbon (1200 × 400 px). Optimized for official signature strips and letterheads.',
  },
};

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  initialAspectRatio = '16:9',
  onCropComplete,
  onClose,
  title = 'Image Framing & Crop Studio',
  lockRatio = false,
}) => {
  const [activeRatio, setActiveRatio] = useState<AllowedAspectRatio>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number }>({
    clientX: 0,
    clientY: 0,
    panX: 0,
    panY: 0,
  });

  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const cropBoxRef = useRef<HTMLDivElement>(null);

  // Sync initial ratio when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveRatio(initialAspectRatio);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setFlipH(false);
    }
  }, [isOpen, initialAspectRatio]);

  // Load natural dimensions of source image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const currentSpec = CROP_RATIO_SPECS[activeRatio] || CROP_RATIO_SPECS['16:9'];

  // Handle direct pointer manipulation for dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      setIsDragging(false);
    }
  };

  // Handle smooth wheel zooming
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(3.5, Math.max(1, +(prev + delta).toFixed(2))));
  };

  // Reset to default center framing
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
  };

  // High-resolution Canvas Crop Renderer
  const handleApplyCrop = useCallback(() => {
    if (!cropBoxRef.current || !imageNaturalSize.width || !imageNaturalSize.height) {
      onCropComplete(imageSrc);
      onClose();
      return;
    }

    const boxRect = cropBoxRef.current.getBoundingClientRect();
    const boxW = boxRect.width;
    const boxH = boxRect.height;

    // Create offscreen canvas with target output resolution
    const canvas = document.createElement('canvas');
    canvas.width = currentSpec.outputWidth;
    canvas.height = currentSpec.outputHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      onCropComplete(imageSrc);
      onClose();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate how the image is fitted inside the viewport at zoom = 1
      const isRotated90or270 = Math.abs(rotation % 180) === 90;
      const effectiveImgW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const effectiveImgH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      // Base cover scale on screen
      const scaleCover = Math.max(boxW / effectiveImgW, boxH / effectiveImgH);
      const baseDrawnW = img.naturalWidth * scaleCover;
      const baseDrawnH = img.naturalHeight * scaleCover;

      // Screen to canvas factor
      const screenToCanvas = canvas.width / boxW;

      ctx.save();
      // High-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Move origin to canvas center + pan offset scaled
      ctx.translate(
        canvas.width / 2 + pan.x * screenToCanvas,
        canvas.height / 2 + pan.y * screenToCanvas
      );

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply horizontal flip and zoom scale
      ctx.scale((flipH ? -1 : 1) * zoom, zoom);

      // Draw the image centered
      const drawW = baseDrawnW * screenToCanvas;
      const drawH = baseDrawnH * screenToCanvas;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();

      // Export as high-quality JPEG (with safe fallback for cross-origin URLs)
      try {
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.93);
        onCropComplete(croppedDataUrl);
      } catch {
        onCropComplete(imageSrc);
      }
      onClose();
    };

    img.src = imageSrc;
  }, [cropBoxRef, imageNaturalSize, currentSpec, imageSrc, onCropComplete, onClose, pan, zoom, rotation, flipH]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  // Responsive crop box container styles based on ratio
  const maxViewW = 520;
  const viewW = Math.min(maxViewW, typeof window !== 'undefined' ? window.innerWidth - 64 : 500);
  const viewH = Math.round(viewW / currentSpec.fraction);

  // Calculate base image size for cover mode in the preview box
  const isRotated = Math.abs(rotation % 180) === 90;
  const effectiveW = isRotated ? imageNaturalSize.height : imageNaturalSize.width;
  const effectiveH = isRotated ? imageNaturalSize.width : imageNaturalSize.height;
  const baseScale = effectiveW && effectiveH ? Math.max(viewW / effectiveW, viewH / effectiveH) : 1;
  const imgRenderW = imageNaturalSize.width * baseScale;
  const imgRenderH = imageNaturalSize.height * baseScale;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#141A26] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#161E2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3]/20 text-[#0071E3] dark:text-[#93C5FD] flex items-center justify-center border border-[#0071E3]/30">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/20 text-[#93C5FD] border border-[#0071E3]/40">
                  {currentSpec.label}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                Position, zoom, and frame your photograph to match the official ratio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cropper"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="px-5 py-2.5 bg-[#0F1420] border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Allowed Ratios:
          </span>
          {(Object.keys(CROP_RATIO_SPECS) as AllowedAspectRatio[]).map((r) => {
            const spec = CROP_RATIO_SPECS[r];
            const isSelected = activeRatio === r;
            return (
              <button
                key={r}
                type="button"
                disabled={lockRatio}
                onClick={() => {
                  setActiveRatio(r);
                  setPan({ x: 0, y: 0 });
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0071E3] text-white shadow-md shadow-blue-900/30'
                    : lockRatio
                    ? 'bg-white/5 text-slate-500 opacity-50 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {spec.label}
              </button>
            );
          })}
        </div>

        {/* Explicit Ratio Instruction Notice */}
        <div className="px-5 py-2 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-blue-950/40 border-b border-blue-900/30 text-[11px] text-blue-200 flex items-center gap-2 shrink-0">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">
            <strong>This is the ratio of the image allowed:</strong> {currentSpec.description}
          </span>
        </div>

        {/* Workspace Canvas / Viewport */}
        <div 
          className="flex-1 min-h-[300px] sm:min-h-[360px] bg-[#0A0D14] flex items-center justify-center p-4 overflow-hidden relative select-none"
          onWheel={handleWheel}
        >
          {/* Active Crop Box with Rule of Thirds */}
          <div
            ref={cropBoxRef}
            style={{ width: `${viewW}px`, height: `${viewH}px` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative rounded-xl overflow-hidden border-2 border-white/80 shadow-[0_0_0_9999px_rgba(5,7,12,0.85)] cursor-grab ${
              isDragging ? 'cursor-grabbing border-[#0071E3]' : ''
            }`}
          >
            {/* The Image inside crop box */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px)`,
              }}
            >
              <img
                src={imageSrc}
                alt="Source preview"
                style={{
                  width: `${imgRenderW}px`,
                  height: `${imgRenderH}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                className="select-none pointer-events-none object-cover"
                draggable={false}
              />
            </div>

            {/* Circular guide overlay for 1:1 avatars */}
            {activeRatio === '1:1' && (
              <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none" />
            )}

            {/* Rule of thirds grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div />
            </div>

            {/* Helper drag badge */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white/80 pointer-events-none">
              Drag to reposition photo
            </div>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="px-5 py-3.5 bg-[#161E2E] border-t border-white/10 space-y-3 shrink-0">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0071E3]"
              />
              <span className="text-[11px] font-mono font-bold text-slate-300 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3.5, +(prev + 0.1).toFixed(2)))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Orientation & Quick Transform Tools */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                title="Rotate 90 degrees counter-clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotate -90°</span>
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                title="Rotate 90 degrees clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotate +90°</span>
              </button>
              <button
                type="button"
                onClick={() => setFlipH((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs ${
                  flipH ? 'bg-[#0071E3]/30 text-blue-300 border border-[#0071E3]/50' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
                title="Flip photo horizontally"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Flip</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                title="Reset zoom and framing"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-4 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0062C4] text-white font-semibold shadow-lg shadow-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Crop & Upload</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
