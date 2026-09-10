import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem, EventCategory, EventStatus, CustomField } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { AppleSkeletonTable } from '../common/AppleSkeleton';
import { ImageUploadField } from '../common/ImageUploadField';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Sliders, 
  Search, 
  Sparkles, 
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  Layers,
  ArrowUpDown,
  QrCode,
  UserCheck,
  Library,
  Check
} from 'lucide-react';

interface AdminEventsViewProps {
  isCreateOpenInitially?: boolean;
  onCloseCreateInitial?: () => void;
}

export const AdminEventsView: React.FC<AdminEventsViewProps> = ({
  isCreateOpenInitially = false,
  onCloseCreateInitial,
}) => {
  const { events, addEvent, updateEvent, deleteEvent, showToast, savedMediaAssets } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(isCreateOpenInitially);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorySelect = (cat: string) => {
    setIsLoading(true);
    setSelectedCategory(cat);
    setTimeout(() => setIsLoading(false), 300);
  };

  // Form State
  const initialFormState: Partial<EventItem> = {
    title: '',
    subtitle: '',
    category: 'Talk Series',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '02:00 PM – 04:30 PM',
    venue: 'Main Auditorium, Central Block, Christ University',
    description: '',
    capacity: 250,
    registrationDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'Published',
    organizingCommittee: 'SWO Cultural Core Wing',
    eligibility: 'Open to all undergraduate and postgraduate students of Yeshwanthpur Campus',
    bannerUrl: 'https://farm66.staticflickr.com/65535/53890794279_c2e8e2a4bc_b.jpg',
    inCarousel: false,
    carouselOrder: 1,
    requiresQrPass: true,
    speaker: {
      name: '',
      role: '',
      avatar: 'https://farm66.staticflickr.com/65535/53188337164_f346df7a8f_b.jpg',
      bio: '',
    },
    customFields: [],
  };

  const [formData, setFormData] = useState<Partial<EventItem>>(initialFormState);

  const categories: EventCategory[] = [
    'Talk Series',
    'Cultural',
    'Literary',
    'Well-Being',
    'Tech & Innovation',
    'Social Welfare',
    'Sports & Fitness',
  ];

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    setEditingEvent(evt);
    setFormData(evt);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      const newEvt: EventItem = {
        id: `evt-${Date.now()}`,
        title: formData.title || 'Untitled Event',
        subtitle: formData.subtitle || '',
        category: formData.category || 'Cultural',
        date: formData.date || new Date().toISOString().split('T')[0],
        time: formData.time || '02:00 PM',
        venue: formData.venue || 'Auditorium',
        description: formData.description || '',
        capacity: Number(formData.capacity) || 100,
        registeredCount: 0,
        registrationDeadline: formData.registrationDeadline || new Date().toISOString(),
        status: (formData.status as EventStatus) || 'Published',
        organizingCommittee: formData.organizingCommittee || 'SWO',
        eligibility: formData.eligibility || 'Open to all',
        bannerUrl: formData.bannerUrl || 'https://farm66.staticflickr.com/65535/53890794279_c2e8e2a4bc_b.jpg',
        inCarousel: !!formData.inCarousel,
        carouselOrder: Number(formData.carouselOrder) || 1,
        speaker: formData.speaker?.name ? formData.speaker : undefined,
        customFields: formData.customFields || [],
        requiresQrPass: formData.requiresQrPass !== false,
      };
      addEvent(newEvt);
    }

    setIsModalOpen(false);
    if (onCloseCreateInitial) onCloseCreateInitial();
  };

  const toggleCarouselFlag = (evt: EventItem) => {
    updateEvent(evt.id, { inCarousel: !evt.inCarousel });
  };

  const toggleQrPassRequirement = (evt: EventItem) => {
    const nextVal = evt.requiresQrPass === false;
    updateEvent(evt.id, { requiresQrPass: nextVal });
    showToast(
      nextVal ? 'Pass Protocol Enabled' : 'Reverted to Open Walk-in',
      nextVal
        ? `"${evt.title}" now requires digital QR passes for auditorium check-in.`
        : `"${evt.title}" reverted to open walk-in entry (no QR pass required).`,
      'info'
    );
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organizingCommittee.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 dark:text-[#93C5FD]">
              Curator Controls
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Yeshwanthpur Campus SWO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Events & Banner Management
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-1">
            Create campus programs, assign auditorium seating limits, customize registration forms, and curate the homepage carousel.
          </p>
        </div>

        <AppleButton
          variant="navy"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Create Event
        </AppleButton>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by title, venue, or committee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#141A26] border border-black/[0.08] dark:border-white/15 text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:border-[#0071E3] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#002147] dark:bg-[#0071E3] text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#141A26] text-[#515154] dark:text-slate-300 hover:text-[#1D1D1F] dark:hover:text-white border border-black/[0.06] dark:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / List */}
      {isLoading ? (
        <AppleSkeletonTable rows={5} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="No programs match your current filter parameters."
          actionLabel="Create First Event"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredEvents.map((evt) => {
            const fillPct = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

            return (
              <AppleCard
                key={evt.id}
                padding="none"
                className="p-5 border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-colors"
              >
                {/* Event summary info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-black/[0.04] dark:border-white/10">
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    {evt.inCarousel && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-[#FFD60A] text-[#1D1D1F] shadow-xs">
                        #{evt.carouselOrder}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#93C5FD]">
                        {evt.category}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.status === 'Published'
                            ? 'bg-[#34C759]/15 text-[#28A745] dark:text-emerald-400'
                            : evt.status === 'Draft'
                            ? 'bg-black/[0.06] dark:bg-white/10 text-[#86868B] dark:text-slate-400'
                            : 'bg-[#FF3B30]/15 text-[#FF3B30] dark:text-rose-400'
                        }`}
                      >
                        {evt.status}
                      </span>

                      {/* Entry Type Badge / 1-Click Revert Button */}
                      <button
                        type="button"
                        onClick={() => toggleQrPassRequirement(evt)}
                        title={
                          evt.requiresQrPass !== false
                            ? 'Click to revert back to Open Walk-in (No QR Pass)'
                            : 'Click to require QR Gate Pass for this event'
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer select-none hover:shadow-xs active:scale-95 ${
                          evt.requiresQrPass !== false
                            ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {evt.requiresQrPass !== false ? (
                          <>
                            <QrCode className="w-3 h-3 text-indigo-500" />
                            <span>QR Pass Required</span>
                            <span className="text-[9px] font-semibold opacity-70 ml-0.5 underline">Revert</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            <span>Open Walk-in</span>
                            <span className="text-[9px] font-semibold opacity-70 ml-0.5 underline">Require QR</span>
                          </>
                        )}
                      </button>

                      <span className="text-xs text-[#86868B] dark:text-slate-400">
                        {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {evt.time}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white tracking-tight truncate">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-[#86868B] dark:text-slate-400 truncate">
                      {evt.venue} • {evt.organizingCommittee}
                    </p>
                  </div>
                </div>

                {/* Capacity & Carousel status */}
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                  {/* Capacity Bar */}
                  <div className="w-36 text-xs">
                    <div className="flex items-center justify-between text-[#86868B] dark:text-slate-400 mb-1">
                      <span>Seats</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">{evt.registeredCount}/{evt.capacity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0071E3] rounded-full"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Carousel toggle pill */}
                  <button
                    onClick={() => toggleCarouselFlag(evt)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      evt.inCarousel
                        ? 'bg-[#002147] dark:bg-[#0071E3] text-white border-[#002147] dark:border-[#0071E3]'
                        : 'bg-black/[0.02] dark:bg-white/[0.04] text-[#86868B] dark:text-slate-300 border-black/[0.08] dark:border-white/15 hover:border-black/[0.15] dark:hover:border-white/30'
                    }`}
                  >
                    {evt.inCarousel ? `★ In Carousel (#${evt.carouselOrder})` : '+ Add to Carousel'}
                  </button>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <AppleButton
                      variant="secondary"
                      size="sm"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEdit(evt)}
                    >
                      Edit
                    </AppleButton>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${evt.title}"? This cannot be undone.`)) {
                          deleteEvent(evt.id);
                        }
                      }}
                      className="p-2 rounded-xl text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </AppleCard>
            );
          })}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event Details' : 'Create New SWO Event'}
        subtitle="Configure auditorium capacity, registration criteria, and hero carousel visibility."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Ignite Talk Series: The Future of Quantum Architecture"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Subtitle / Punchline</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. A premier national symposium on emerging computing paradigm"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              >
                <option value="Published" className="bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white">Published (Open for Registration)</option>
                <option value="Draft" className="bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white">Draft (Hidden from Student Portal)</option>
                <option value="Closed" className="bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white">Closed (Archived)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Time Slot *</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 02:00 PM – 04:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Campus Venue *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Main Auditorium, Central Block"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Capacity (Max Seats) *</label>
              <input
                type="number"
                required
                min={10}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              {/* Quick Pick from Uploaded Institutional Media Library */}
              {savedMediaAssets.length > 0 && (
                <div className="mb-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                      <Library className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>Or Select from Uploaded Media Library</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {savedMediaAssets.length} institutional assets available
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {savedMediaAssets.map((asset) => {
                      const isSelected = formData.bannerUrl === asset.url;
                      return (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, bannerUrl: asset.url })}
                          className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-[#0071E3] ring-2 ring-[#0071E3]/30 scale-[1.02]'
                              : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                          style={{ width: '110px', height: '62px' }}
                          title={asset.name}
                        >
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                            <p className="text-[9px] text-white font-medium truncate">{asset.name}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-[#0071E3] text-white shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <ImageUploadField
                label="Event Banner Photograph / Poster"
                value={formData.bannerUrl}
                onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
                aspectRatio="16:9"
                recommendedDimensions="1920 × 1080 px (or min 1280 × 720 px)"
                description="This is the ratio of the image allowed: 16:9 Landscape. High-definition widescreen format ensures the banner looks crisp across student portals and digital passes."
                required
              />
            </div>

            {/* Carousel settings */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/10 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] dark:text-white flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.inCarousel}
                    onChange={(e) => setFormData({ ...formData, inCarousel: e.target.checked })}
                    className="rounded text-[#0071E3] focus:ring-[#0071E3]"
                  />
                  <span>Feature in Student Portal Homepage Carousel</span>
                </label>
                <p className="text-[11px] text-[#86868B] dark:text-slate-400 mt-0.5">
                  Display this event as a prime rotating slide with CTA on the home banner.
                </p>
              </div>

              {formData.inCarousel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-white">Order:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.carouselOrder}
                    onChange={(e) => setFormData({ ...formData, carouselOrder: parseInt(e.target.value) || 1 })}
                    className="w-16 px-2 py-1 rounded-lg border border-black/[0.1] dark:border-white/15 bg-white dark:bg-[#1E293B] text-xs text-center font-bold text-[#1D1D1F] dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* QR Pass / Gate Entry Pass Option */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/10 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] dark:text-white flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresQrPass ?? true}
                    onChange={(e) => setFormData({ ...formData, requiresQrPass: e.target.checked })}
                    className="rounded text-[#0071E3] focus:ring-[#0071E3]"
                  />
                  <span>Generate QR Entry Pass for Registered Students</span>
                </label>
                <p className="text-[11px] text-[#86868B] dark:text-slate-400 mt-0.5">
                  {(formData.requiresQrPass ?? true)
                    ? 'Auditorium / Gate Pass: Registered students receive a digital QR pass for gate check-in scanners.'
                    : 'Open Entry / Direct Walk-in: Anyone can just register and step in. Students simply show their University ID.'}
                </p>
              </div>

              <div className="shrink-0 pl-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  (formData.requiresQrPass ?? true)
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {(formData.requiresQrPass ?? true) ? 'QR Pass' : 'Open Entry'}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Full Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed itinerary, dress code, and expectations..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Organizing Committee *</label>
              <input
                type="text"
                required
                value={formData.organizingCommittee}
                onChange={(e) => setFormData({ ...formData, organizingCommittee: e.target.value })}
                placeholder="e.g. SWO University Cultural Committee"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            {/* Optional Keynote Speaker / Dignitary with 1:1 Portrait ImageUploadField */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/10 space-y-3">
              <label className="text-xs font-bold text-[#1D1D1F] dark:text-white block">
                Keynote Speaker / Chief Guest (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Speaker Name</label>
                  <input
                    type="text"
                    value={formData.speaker?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      speaker: { ...formData.speaker, name: e.target.value, role: formData.speaker?.role || '', avatar: formData.speaker?.avatar || '', bio: formData.speaker?.bio || '' }
                    })}
                    placeholder="e.g. Dr. Jane Goodall"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={formData.speaker?.role || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      speaker: { ...formData.speaker, name: formData.speaker?.name || '', role: e.target.value, avatar: formData.speaker?.avatar || '', bio: formData.speaker?.bio || '' }
                    })}
                    placeholder="e.g. Keynote Speaker"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <ImageUploadField
                  label="Speaker Portrait Photograph (1:1 Ratio)"
                  value={formData.speaker?.avatar || ''}
                  onChange={(url) => setFormData({
                    ...formData,
                    speaker: {
                      name: formData.speaker?.name || '',
                      role: formData.speaker?.role || '',
                      bio: formData.speaker?.bio || '',
                      avatar: url,
                    }
                  })}
                  aspectRatio="1:1"
                  recommendedDimensions="400 × 400 px"
                  description="This is the ratio of the image allowed: 1:1 Square. Upload from PC, crop & zoom to frame the keynote speaker."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/[0.05] dark:border-white/10">
            <AppleButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </AppleButton>
            <AppleButton type="submit" variant="primary" size="sm">
              {editingEvent ? 'Save Changes' : 'Create & Publish'}
            </AppleButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
