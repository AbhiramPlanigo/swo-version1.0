import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle2, AlertTriangle, Link as LinkIcon, Image as ImageIcon, Crop, Sliders, Laptop } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';

export type AllowedAspectRatio = '16:9' | '1:1' | '4:3' | '21:9' | '3:1';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  aspectRatio?: AllowedAspectRatio;
  recommendedDimensions?: string;
  description?: string;
  maxSizeMB?: number;
  helpText?: string;
  required?: boolean;
  className?: string;
  autoCropOnMismatch?: boolean;
}

const RATIO_CONFIG: Record<AllowedAspectRatio, {
  ratioLabel: string;
  ratioFraction: number; // width / height
  cssAspect: string;
  containerClass: string;
  defaultDimensions: string;
  explanation: string;
}> = {
  '16:9': {
    ratioLabel: '16:9 Landscape (Widescreen)',
    ratioFraction: 16 / 9,
    cssAspect: 'aspect-[16/9]',
    containerClass: 'w-full aspect-[16/9] max-h-80 mx-auto',
    defaultDimensions: '1920 × 1080 px (or min 1280 × 720 px)',
    explanation: 'Standard cinematic widescreen ratio. Ideal for event banners, hero ambience, and campus highlight posters.',
  },
  '1:1': {
    ratioLabel: '1:1 Square',
    ratioFraction: 1,
    cssAspect: 'aspect-square',
    containerClass: 'w-64 sm:w-72 max-w-full aspect-square mx-auto',
    defaultDimensions: '400 × 400 px (or up to 1000 × 1000 px)',
    explanation: 'Perfect symmetrical square ratio. Required for student & admin profile avatars, guest speaker portraits, and official stamps.',
  },
  '4:3': {
    ratioLabel: '4:3 Standard Landscape / Poster',
    ratioFraction: 4 / 3,
    cssAspect: 'aspect-[4/3]',
    containerClass: 'max-w-[480px] w-full aspect-[4/3] mx-auto',
    defaultDimensions: '1200 × 900 px',
    explanation: 'Classic display ratio. Ideal for circular posters, bulletin attachments, and certificate backdrops.',
  },
  '21:9': {
    ratioLabel: '21:9 Ultra-widescreen Panoramic',
    ratioFraction: 21 / 9,
    cssAspect: 'aspect-[21/9]',
    containerClass: 'w-full aspect-[21/9] max-h-72 mx-auto',
    defaultDimensions: '2560 × 1080 px',
    explanation: 'Ultra-wide panoramic format. Perfect for flagship homepage hero header ambiances.',
  },
  '3:1': {
    ratioLabel: '3:1 Banner Strip',
    ratioFraction: 3 / 1,
    cssAspect: 'aspect-[3/1]',
    containerClass: 'w-full aspect-[3/1] max-h-48 mx-auto',
    defaultDimensions: '1200 × 400 px',
    explanation: 'Wide rectangular strip ratio. Ideal for authorized signatory signatures and horizontal letterhead ribbons.',
  },
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  aspectRatio = '16:9',
  recommendedDimensions,
  description,
  maxSizeMB = 5,
  helpText,
  required = false,
  className = '',
  autoCropOnMismatch = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlDraft, setUrlDraft] = useState('');
  
  // Cropper Modal state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string>('');

  // Real-time aspect ratio analysis
  const [analyzedRatio, setAnalyzedRatio] = useState<{
    width: number;
    height: number;
    ratio: number;
    isExactMatch: boolean;
    isCloseMatch: boolean;
  } | null>(null);

  const config = RATIO_CONFIG[aspectRatio] || RATIO_CONFIG['16:9'];
  const targetDimensions = recommendedDimensions || config.defaultDimensions;
  const officialDescription = description || `This is the ratio of the image allowed: ${config.ratioLabel}. Recommended resolution is ${targetDimensions}.`;

  // Analyze image dimensions whenever value changes
  useEffect(() => {
    if (!value) {
      setAnalyzedRatio(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const r = w / h;
      const diff = Math.abs(r - config.ratioFraction);
      setAnalyzedRatio({
        width: w,
        height: h,
        ratio: r,
        isExactMatch: diff < 0.04,
        isCloseMatch: diff < 0.15,
      });
    };
    img.onerror = () => {
      setAnalyzedRatio(null);
    };
    img.src = value;
  }, [value, config.ratioFraction]);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP, or SVG).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit. Please upload an image smaller than ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Automatically open interactive Crop & Zoom studio immediately!
        setCropSource(result);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      const trimmed = urlDraft.trim();
      setCropSource(trimmed);
      setIsCropperOpen(true);
      setUrlDraft('');
    }
  };

  const handleOpenCropperForCurrent = () => {
    if (value) {
      setCropSource(value);
      setIsCropperOpen(true);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label and Ratio Badge Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="text-xs font-bold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>

        {/* Allowed Ratio Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#93C5FD] border border-[#0071E3]/20">
          <span>Allowed Ratio:</span>
          <strong className="font-semibold">{config.ratioLabel}</strong>
        </span>
      </div>

      {/* Explicit Ratio Instruction Notice */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/40 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
        <div className="p-1 rounded-md bg-[#0071E3] text-white shrink-0 mt-0.5">
          <ImageIcon className="w-3 h-3" />
        </div>
        <div className="leading-snug">
          <p className="font-semibold text-[#002147] dark:text-blue-200">
            {officialDescription}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Upload from PC (PNG, JPG, WEBP) • Interactive Crop & Zoom available • Max size: {maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* Upload Zone / Active Preview */}
      {value ? (
        <div className="space-y-3">
          {/* Centered True-Aspect Container (Never distorted into banner for 1:1) */}
          <div className={`relative ${config.containerClass} rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#0071E3]/30 shadow-md group`}>
            <img
              src={value}
              alt="Uploaded Asset Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/christ-yeshwanthpur-campus.jpg';
              }}
            />

            {/* Hover Actions: Quick Desktop overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs p-2">
              <button
                type="button"
                onClick={handleOpenCropperForCurrent}
                className="px-3 py-1.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold shadow-lg hover:bg-[#0062C4] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Crop, zoom and adjust photo framing"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Crop & Zoom</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white text-[#1D1D1F] text-xs font-semibold shadow-lg hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Upload another image from PC"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Upload from PC</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-lg hover:bg-rose-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Remove current image"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Persistent, Always-Visible Action Toolbar (Guarantees visible Crop/Zoom controls) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenCropperForCurrent}
              className="px-3.5 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0062C4] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Open interactive Crop & Zoom Studio to adjust zoom, center face, and frame"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop & Zoom Photo</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 text-xs font-semibold shadow-2xs hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Select another image from your computer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Upload from PC</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Remove current image"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          {/* Real-time Ratio Verification Feedback & One-Click Crop Action */}
          {analyzedRatio && (
            <div className={`px-3 py-2 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
              analyzedRatio.isExactMatch
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : analyzedRatio.isCloseMatch
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}>
              <div className="flex items-center gap-1.5 font-medium">
                {analyzedRatio.isExactMatch ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Exact {aspectRatio} ratio verified ({analyzedRatio.width} × {analyzedRatio.height}px)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Uploaded ratio {analyzedRatio.ratio.toFixed(2)}:1 ({analyzedRatio.width} × {analyzedRatio.height}px)</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCropperForCurrent}
                  className="px-2.5 py-1 rounded-lg bg-[#0071E3] hover:bg-[#0062C4] text-white text-[11px] font-semibold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Crop className="w-3 h-3" />
                  <span>{analyzedRatio.isExactMatch ? 'Refine Crop / Zoom' : `Crop to ${aspectRatio}`}</span>
                </button>
                <span className="text-[10px] font-mono opacity-80 hidden sm:inline">
                  Target: {targetDimensions}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Tabs for Upload from PC vs URL */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg bg-black/[0.04] dark:bg-white/5 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  inputMode === 'upload'
                    ? 'bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Upload from PC</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  inputMode === 'url'
                    ? 'bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Enter Web Link</span>
              </button>
            </div>
          </div>

          {inputMode === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#0071E3] bg-[#0071E3]/5 dark:bg-[#0071E3]/10 scale-[1.01]'
                  : 'border-black/15 dark:border-white/15 bg-black/[0.01] dark:bg-white/[0.02] hover:border-[#0071E3]/50 hover:bg-[#0071E3]/5'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#1E293B] shadow-sm border border-black/10 dark:border-white/10 flex items-center justify-center text-[#0071E3] dark:text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">
                  Click to browse or drag & drop image here
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Allowed aspect ratio: <strong className="text-[#0071E3] dark:text-blue-300">{config.ratioLabel}</strong> ({targetDimensions})
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or https://..."
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0062C4] transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {helpText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {helpText}
        </p>
      )}

      {/* Interactive Crop & Zoom Framing Studio */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={cropSource}
        initialAspectRatio={aspectRatio}
        title={`Crop & Zoom: ${label}`}
        onCropComplete={(croppedUrl) => {
          onChange(croppedUrl);
          setIsCropperOpen(false);
        }}
        onClose={() => setIsCropperOpen(false)}
      />
    </div>
  );
};
