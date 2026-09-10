import React, { useState } from 'react';
import { Modal } from './Modal';
import { AppleButton } from './AppleButton';
import { ImageUploadField, AllowedAspectRatio } from './ImageUploadField';
import { Copy, Check, Sparkles, UploadCloud, Library, Trash2, Plus, Calendar, Download, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MediaAsset } from '../../types';

export interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'event' | 'hero' | 'poster' | 'avatar' | 'moment';
  onSelectAsset?: (url: string) => void;
}

const CATEGORY_MAP: Record<string, {
  name: string;
  ratio: AllowedAspectRatio;
  dimensions: string;
  description: string;
  usage: string;
}> = {
  event: {
    name: 'Event Banner',
    ratio: '16:9',
    dimensions: '1920 × 1080 px (16:9)',
    description: 'This is the ratio of the image allowed: 16:9 Landscape. High-definition widescreen format ensures the event card and modal hero looks crisp without cropping.',
    usage: 'Used on Event Cards, Carousel Featured Slides, and Event Passes.',
  },
  hero: {
    name: 'Homepage Hero Ambience',
    ratio: '21:9',
    dimensions: '2560 × 1080 px (or 1920 × 1080 px)',
    description: 'This is the ratio of the image allowed: 21:9 Ultrawide or 16:9 Landscape. Panoramic resolution provides cinematic depth across wide desktop screens.',
    usage: 'Used as the flagship background banner on the public portal.',
  },
  poster: {
    name: 'Notice & Circular Poster',
    ratio: '4:3',
    dimensions: '1200 × 900 px (4:3)',
    description: 'This is the ratio of the image allowed: 4:3 Standard Landscape. Perfect for official administrative bulletin attachments and circular illustrations.',
    usage: 'Attached to official SWO broadcast notices and bulletins.',
  },
  avatar: {
    name: 'Profile & Speaker Avatar',
    ratio: '1:1',
    dimensions: '400 × 400 px (1:1 Square)',
    description: 'This is the ratio of the image allowed: 1:1 Square. Balanced symmetrical square ratio ensures portraits and seals frame perfectly in circular avatars.',
    usage: 'Used for Student ID profile pictures, Guest Speaker cards, and Administrator badges.',
  },
  moment: {
    name: 'Campus Moment / Gallery',
    ratio: '16:9',
    dimensions: '1920 × 1080 px (16:9)',
    description: 'This is the ratio of the image allowed: 16:9 Landscape. Preserves the natural perspective of DSLR and smartphone collegiate event photography.',
    usage: 'Showcased in student media highlights and collegiate photo galleries.',
  },
};

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'event',
  onSelectAsset,
}) => {
  const { showToast, savedMediaAssets, saveMediaAsset, deleteMediaAsset } = useApp();
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [assetName, setAssetName] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync category if default changes
  React.useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  const activeCategoryConfig = CATEGORY_MAP[selectedCategory] || CATEGORY_MAP.event;

  const handleSaveToLibrary = () => {
    if (!uploadedImageUrl) {
      showToast('No Image Uploaded', 'Please upload or crop an image first.', 'warning');
      return;
    }

    const defaultTitle = `${activeCategoryConfig.name} (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    const finalName = assetName.trim() || defaultTitle;

    saveMediaAsset({
      url: uploadedImageUrl,
      name: finalName,
      category: selectedCategory as any,
      ratio: activeCategoryConfig.ratio,
      dimensions: activeCategoryConfig.dimensions.split(' ')[0],
    });

    if (onSelectAsset) {
      onSelectAsset(uploadedImageUrl);
    }

    // Reset upload form to allow uploading another image sequentially
    setUploadedImageUrl('');
    setAssetName('');
    setActiveTab('library');
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Image Copied', 'Asset link copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Institutional Media Asset Library"
      subtitle="Upload, crop, zoom, and organize institutional banners & keynote photos"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-3">
          <div className="flex rounded-xl bg-black/[0.04] dark:bg-white/5 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New Asset</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Media Library</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#0071E3]/15 text-[#0071E3] dark:text-[#93C5FD]">
                {savedMediaAssets.length}
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Assets persist across events & showcases
          </span>
        </div>

        {/* TAB 1: UPLOAD NEW ASSET */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Category Selector Pills */}
            <div>
              <label className="text-xs font-bold text-[#1D1D1F] dark:text-white block mb-1.5">
                Target Placement & Ratio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(CATEGORY_MAP).map(([key, cfg]) => {
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCategory(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0071E3] bg-[#0071E3]/10 dark:bg-[#0071E3]/20 shadow-xs'
                          : 'border-black/[0.08] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-white dark:bg-[#1E293B]'
                      }`}
                    >
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#0071E3] dark:text-[#93C5FD]' : 'text-[#1D1D1F] dark:text-white'}`}>
                        {cfg.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {cfg.ratio} ({cfg.dimensions.split(' ')[0]})
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Asset Name / Label */}
            <div>
              <label className="text-xs font-bold text-[#1D1D1F] dark:text-white block mb-1">
                Asset Name / Description (Optional)
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder={`e.g. ${activeCategoryConfig.name} - Annual Symposium`}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
              />
            </div>

            {/* Dynamic Image Upload Field with Instant Crop & Zoom */}
            <ImageUploadField
              label={`Upload & Crop ${activeCategoryConfig.name}`}
              value={uploadedImageUrl}
              onChange={setUploadedImageUrl}
              aspectRatio={activeCategoryConfig.ratio}
              recommendedDimensions={activeCategoryConfig.dimensions}
              description={activeCategoryConfig.description}
              helpText={activeCategoryConfig.usage}
              required
            />

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-3">
              <AppleButton
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </AppleButton>

              <AppleButton
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleSaveToLibrary}
                disabled={!uploadedImageUrl}
              >
                Save to Institutional Media Library
              </AppleButton>
            </div>
          </div>
        )}

        {/* TAB 2: MEDIA LIBRARY GALLERY */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Institutional media pool available for all event publications:
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="text-xs font-bold text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Another Image</span>
              </button>
            </div>

            {savedMediaAssets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 text-center space-y-2">
                <Library className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No media assets in library yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="text-xs font-semibold text-[#0071E3] hover:underline"
                >
                  Upload your first banner or photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {savedMediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/10 flex flex-col justify-between gap-2.5 shadow-2xs hover:border-[#0071E3]/50 transition-all group"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[16/9] w-full">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/christ-yeshwanthpur-campus.jpg';
                        }}
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                        {asset.ratio}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-white truncate" title={asset.name}>
                        {asset.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize font-semibold text-[#0071E3] dark:text-[#93C5FD]">
                          {asset.category}
                        </span>
                        <span>•</span>
                        <span>{asset.dimensions}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] dark:border-white/5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(asset.id, asset.url)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          title="Copy Image Link"
                        >
                          {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMediaAsset(asset.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {onSelectAsset ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectAsset(asset.url);
                            showToast('Asset Selected', 'The banner was applied.', 'success');
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg bg-[#0071E3] text-white text-[11px] font-bold hover:bg-[#0062C4] transition-colors cursor-pointer"
                        >
                          Use This Asset
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready for Events
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex justify-end">
              <AppleButton variant="secondary" size="sm" onClick={onClose}>
                Close Library
              </AppleButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
