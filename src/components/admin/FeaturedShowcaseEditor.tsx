import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShowcaseItem, HeroGuest } from '../../types';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RotateCcw, 
  Eye, 
  Image as ImageIcon,
  Tag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smile,
  CheckCircle2,
  AlertCircle,
  Crop
} from 'lucide-react';
import { ImageUploadField } from '../common/ImageUploadField';

const PRESET_BACKGROUNDS = [
  {
    name: 'Darpan & Cultural Inauguration',
    url: 'https://farm66.staticflickr.com/65535/53890794279_c2e8e2a4bc_b.jpg',
    color: '#00D2FF',
  },
  {
    name: 'Main Auditorium & Conclave Stage',
    url: 'https://farm66.staticflickr.com/65535/53601520593_35b116390a_b.jpg',
    color: '#FFD60A',
  },
  {
    name: 'Central Campus Quadrangle Procession',
    url: 'https://farm66.staticflickr.com/65535/53589012105_a341a3ffee_b.jpg',
    color: '#FF2D55',
  },
  {
    name: 'AI Guild & Technology Hub',
    url: 'https://farm66.staticflickr.com/65535/54209949900_8938a64d67_b.jpg',
    color: '#34C759',
  },
];

const PRESET_AVATARS = [
  'https://farm66.staticflickr.com/65535/53188337164_f346df7a8f_b.jpg',
  'https://farm66.staticflickr.com/65535/53600439267_de66a73a92_b.jpg',
  'https://farm66.staticflickr.com/65535/54775630968_3b1b6f2374_b.jpg',
  'https://farm66.staticflickr.com/65535/53882241965_c4806b8f4c_b.jpg',
  'https://farm66.staticflickr.com/65535/53188337114_6037bba686_b.jpg',
];

const QUICK_EMOJIS = ['🎙️', '⚡', '🎭', '🚀', '🌟', '🎓', '🏆', '💡', '🎪', '🎨', '🎵', '🔬', '💻', '🔥', '🤖', '📚'];

export const FeaturedShowcaseEditor: React.FC = () => {
  const { 
    showcaseItems, 
    updateShowcaseItem, 
    addShowcaseItem, 
    deleteShowcaseItem, 
    resetShowcaseItems, 
    showToast 
  } = useApp();

  const [selectedId, setSelectedId] = useState<string>(() => showcaseItems[0]?.id || 'talk-series');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'guests' | 'media'>('details');

  // Active showcase item
  const currentShowcase = showcaseItems.find((s) => s.id === selectedId) || showcaseItems[0];

  // Local draft state
  const [formData, setFormData] = useState<ShowcaseItem>(() => ({
    ...(currentShowcase || {
      id: 'talk-series',
      tabLabel: 'Talk Series',
      tabEmoji: '🎙️',
      badge: 'STUDENT WELFARE TALK SERIES',
      title: 'TALK SERIES COMING SOON',
      subtitle: 'Distinguished Voices & Leadership',
      description: 'An intellectually charged semester dialogue.',
      date: 'Friday, September 18, 2026',
      time: '03:30 PM – 06:00 PM IST',
      venue: 'Main University Auditorium',
      locationBadge: 'Main Auditorium • Central Campus',
      speakers: [],
      accentColor: '#C5A063',
      bgImage: '/assets/christ-yeshwanthpur-campus.jpg',
      tags: ['Christ University Exclusive'],
    }),
    speakers: [...(currentShowcase?.speakers || [])],
  }));

  // New guest draft state
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestRole, setNewGuestRole] = useState('');
  const [newGuestOrg, setNewGuestOrg] = useState('');
  const [newGuestAvatar, setNewGuestAvatar] = useState(PRESET_AVATARS[0]);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  // Sync draft when selected showcase changes or when showcaseItems update
  useEffect(() => {
    if (currentShowcase) {
      setFormData({
        ...currentShowcase,
        speakers: [...currentShowcase.speakers],
      });
    } else if (showcaseItems.length > 0) {
      setSelectedId(showcaseItems[0].id);
    }
  }, [selectedId, showcaseItems]);

  const handleSelectShowcase = (id: string) => {
    setSelectedId(id);
  };

  const handleFieldChange = (field: keyof ShowcaseItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      showToast('Missing Title', 'Please specify a title for this showcase event.', 'error');
      return;
    }
    if (!formData.tabLabel.trim()) {
      showToast('Missing Tab Label', 'Please specify a name for this showcase tab.', 'error');
      return;
    }

    updateShowcaseItem(formData.id, formData);
  };

  const handleAddNewShowcase = () => {
    const newItem = addShowcaseItem({
      tabLabel: 'New Festival',
      tabEmoji: '🌟',
      badge: 'CHRIST UNIVERSITY CAMPUS SHOWCASE 2026',
      title: 'NEW STUDENT FESTIVAL',
      subtitle: 'Celebrating Student Excellence, Innovation & Community',
      description: 'An extraordinary gathering bringing together distinguished thinkers, student innovators, and faculty mentors at Christ University.',
      date: 'Saturday, October 17, 2026',
      time: '10:00 AM – 05:00 PM IST',
      venue: 'Main University Auditorium • Tier 1',
      locationBadge: 'Main Auditorium • Campus Stage',
      accentColor: '#C5A063',
      bgImage: '/assets/christ-yeshwanthpur-campus.jpg',
    });

    setSelectedId(newItem.id);
    setIsExpanded(true);
  };

  const handleDeleteShowcase = (id: string) => {
    if (showcaseItems.length <= 1) {
      showToast('Cannot Delete', 'At least one showcase event must remain active for the homepage hero.', 'warning');
      return;
    }

    const itemToDelete = showcaseItems.find((s) => s.id === id);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${itemToDelete?.tabLabel || 'this showcase'}" from the homepage hero options?`
    );
    if (!confirmDelete) return;

    const remainingItems = showcaseItems.filter((s) => s.id !== id);
    if (deleteShowcaseItem(id)) {
      if (remainingItems.length > 0) {
        setSelectedId(remainingItems[0].id);
      }
    }
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest: HeroGuest = {
      id: 'guest_' + Date.now(),
      name: newGuestName.trim(),
      role: newGuestRole.trim() || 'Distinguished Guest',
      org: newGuestOrg.trim() || 'Christ University Student Welfare Office',
      avatar: newGuestAvatar || PRESET_AVATARS[0],
    };

    setFormData((prev) => ({
      ...prev,
      speakers: [...prev.speakers, newGuest],
    }));

    setNewGuestName('');
    setNewGuestRole('');
    setNewGuestOrg('');
    setIsAddingGuest(false);
  };

  const handleRemoveGuest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((g) => g.id !== id),
    }));
  };

  const handleUpdateGuest = (id: string, updatedFields: Partial<HeroGuest>) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.map((g) => (g.id === id ? { ...g, ...updatedFields } : g)),
    }));
  };

  return (
    <div className="rounded-2xl lg:rounded-3xl bg-white dark:bg-[#141A26] border border-[#CBD5E1]/60 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#16212F] via-[#24354D] to-[#3A5982] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C5A063] text-black text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Homepage Hero Showcase Studio
            </span>
            <span className="text-xs text-slate-300">
              Multi-Event Switcher & Live Customizer
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
            <span>{formData.tabEmoji}</span>
            <span>{formData.tabLabel} • Flagship Showcase</span>
          </h3>
          <p className="text-xs text-slate-200/90 max-w-2xl">
            Edit all showcase options (Talk Series, AI Conclave, Darpan Fest, and custom events). Modify tab names, custom emojis, campus stage locations, keynote guests, and banner visuals.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Collapse Studio</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit All Showcases ({showcaseItems.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#C5A063] hover:bg-[#B38E52] text-black transition-all shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {/* SHOWCASE TABS SELECTOR & MANAGEMENT BAR */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* List of Active Showcases */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#8C9AA9] uppercase tracking-wider px-1">
              Select Showcase to Edit:
            </span>
            {showcaseItems.map((item) => {
              const isCurrent = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectShowcase(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all select-none ${
                    isCurrent
                      ? 'bg-[#0071E3] text-white shadow-md scale-[1.02] ring-2 ring-[#0071E3]/30'
                      : 'bg-white dark:bg-[#1E293B] text-[#16212F] dark:text-white border border-[#CBD5E1]/60 dark:border-white/10 hover:border-[#0071E3] hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{item.tabEmoji}</span>
                  <span>{item.tabLabel}</span>
                  {item.id === selectedId && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
                  )}
                </button>
              );
            })}

            {/* Add New Showcase Button */}
            <button
              type="button"
              onClick={handleAddNewShowcase}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Showcase</span>
            </button>
          </div>

          {/* Delete Active Showcase Button */}
          <div>
            {showcaseItems.length > 1 ? (
              <button
                type="button"
                onClick={() => handleDeleteShowcase(selectedId)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 hover:border-rose-300 transition-colors"
                title="Delete this event from the homepage hero"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete "{formData.tabLabel}"</span>
              </button>
            ) : (
              <span className="text-[11px] text-[#8C9AA9] font-medium italic">
                Only 1 active event (shows as single hero)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overview Snapshot Bar for Currently Selected Showcase */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1]/40 dark:border-white/10">
            <span className="text-[10px] font-bold text-[#8C9AA9] uppercase tracking-wider block mb-1">
              Headline ({formData.tabEmoji} {formData.tabLabel})
            </span>
            <p className="text-xs font-bold text-[#16212F] dark:text-white truncate">
              {formData.title}
            </p>
            <span className="text-[11px] text-[#536275] dark:text-slate-400 truncate block mt-0.5">
              {formData.subtitle}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1]/40 dark:border-white/10">
            <span className="text-[10px] font-bold text-[#8C9AA9] uppercase tracking-wider block mb-1">
              Date & Time
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#16212F] dark:text-white">
              <Calendar className="w-3.5 h-3.5 text-[#3A5982] dark:text-[#93C5FD]" />
              <span className="truncate">{formData.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#536275] dark:text-slate-400 mt-0.5">
              <Clock className="w-3 h-3 text-[#C5A063]" />
              <span className="truncate">{formData.time}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1]/40 dark:border-white/10">
            <span className="text-[10px] font-bold text-[#8C9AA9] uppercase tracking-wider block mb-1">
              Campus Stage / Location Badge
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#16212F] dark:text-white">
              <MapPin className="w-3.5 h-3.5 text-[#C5A063]" />
              <span className="truncate">{formData.locationBadge || formData.venue}</span>
            </div>
            <span className="text-[11px] text-[#536275] dark:text-slate-400 block mt-0.5 truncate">
              {formData.venue}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1]/40 dark:border-white/10">
            <span className="text-[10px] font-bold text-[#8C9AA9] uppercase tracking-wider block mb-1">
              Keynote Guests ({formData.speakers.length})
            </span>
            <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
              {formData.speakers.slice(0, 4).map((spk, idx) => (
                <img
                  key={idx}
                  src={spk.avatar}
                  alt={spk.name}
                  title={`${spk.name} (${spk.org})`}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-[#141A26]"
                />
              ))}
              {formData.speakers.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-[#3A5982] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  +{formData.speakers.length - 4}
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#536275] dark:text-slate-400 mt-1 block truncate">
              {formData.speakers.length > 0
                ? formData.speakers.map((s) => s.name.split(' ')[0]).join(', ')
                : 'No guests added yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Live Modification Form */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Sub-Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'details'
                  ? 'bg-[#3A5982] text-white shadow-xs'
                  : 'text-[#536275] dark:text-slate-400 hover:text-[#16212F] dark:hover:text-white'
              }`}
            >
              1. Title, Names, Stage & Dates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'guests'
                  ? 'bg-[#3A5982] text-white shadow-xs'
                  : 'text-[#536275] dark:text-slate-400 hover:text-[#16212F] dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Featured Guests & Speakers ({formData.speakers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'media'
                  ? 'bg-[#3A5982] text-white shadow-xs'
                  : 'text-[#536275] dark:text-slate-400 hover:text-[#16212F] dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>3. Visual Theme & Media</span>
            </button>
          </div>

          {/* TAB 1: Event Details, Names, Emojis, Stage & Dates */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* SPECIAL SECTION: TAB NAME, CUSTOM EMOJI & CAMPUS STAGE BADGE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-[#CBD5E1]/60 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#0071E3]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#16212F] dark:text-white">
                    Showcase Tab Identity & Stage Location Badge
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tab Label / Event Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                      Showcase Tab Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tabLabel}
                      onChange={(e) => handleFieldChange('tabLabel', e.target.value)}
                      placeholder="e.g. AI Conclave, Darpan Fest, Test Fest"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                    <span className="text-[10px] text-[#8C9AA9] mt-1 block">
                      Controls the name displayed on the homepage hero navigation pill.
                    </span>
                  </div>

                  {/* Custom Emoji */}
                  <div>
                    <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                      Tab Custom Emoji
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.tabEmoji}
                        onChange={(e) => handleFieldChange('tabEmoji', e.target.value)}
                        placeholder="e.g. 🎙️"
                        className="w-16 px-2 py-2 text-center text-lg rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                      {/* Quick Emoji Selection Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-[200px] sm:max-w-none">
                        {QUICK_EMOJIS.slice(0, 8).map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => handleFieldChange('tabEmoji', em)}
                            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${
                              formData.tabEmoji === em ? 'bg-[#0071E3]/20 ring-1 ring-[#0071E3]' : ''
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8C9AA9] mt-1 block">
                      Pick a preset or type/paste any custom emoji.
                    </span>
                  </div>

                  {/* Campus Stage & Location Badge (Replaces old Broadcast Ready) */}
                  <div>
                    <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A063]" />
                      <span>Campus Stage & Location Badge</span>
                    </label>
                    <input
                      type="text"
                      value={formData.locationBadge || ''}
                      onChange={(e) => handleFieldChange('locationBadge', e.target.value)}
                      placeholder="e.g. Main Auditorium • Central Campus, Stage 1 • Flow"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                    <span className="text-[10px] text-[#8C9AA9] mt-1 block">
                      Replaces old "Broadcast Ready" tag with your custom campus stage or auditorium.
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Headlines & Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                    Eyebrow Status Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => handleFieldChange('badge', e.target.value)}
                    placeholder="e.g. GEN-AI & QUANTUM CONCLAVE 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                    Primary Headline / Main Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. THE NEXT COGNITIVE EPOCH"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                    Subtitle / Theme Motto
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                    placeholder="e.g. Autonomous Systems, Neural Architecture & Student Moonshots"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                    Event Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#8C9AA9] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      placeholder="e.g. October 04–05, 2026"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                    Event Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-[#8C9AA9] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => handleFieldChange('time', e.target.value)}
                      placeholder="e.g. 09:00 AM – 05:30 PM IST"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                    Full Venue Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8C9AA9] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleFieldChange('venue', e.target.value)}
                      placeholder="e.g. Executive Seminar Conclave • Block B"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1.5">
                    Context Description / Overview
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Provide a compelling overview for students regarding this flagship address..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#3A5982] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Featured Guests */}
          {activeTab === 'guests' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#16212F] dark:text-white">
                    Featured Guests & Speakers Panel ({formData.speakers.length})
                  </h4>
                  <p className="text-xs text-[#536275] dark:text-slate-400">
                    Add dignitaries, keynote speakers, and jury members associated with "{formData.tabLabel}".
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingGuest(!isAddingGuest)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0071E3] text-white hover:bg-[#0071E3]/90 transition-colors self-start sm:self-auto shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Keynote Guest</span>
                </button>
              </div>

              {/* Add Guest Form */}
              {isAddingGuest && (
                <form
                  onSubmit={handleAddGuest}
                  className="p-4 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-[#CBD5E1] dark:border-white/15 space-y-3"
                >
                  <span className="text-xs font-bold text-[#0071E3] dark:text-[#93C5FD] block">
                    Register New Featured Guest for {formData.tabLabel}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#16212F] dark:text-white mb-1">
                        Full Name & Honorific
                      </label>
                      <input
                        type="text"
                        required
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                        placeholder="e.g. Dr. Aarav Nambiar"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#16212F] dark:text-white mb-1">
                        Title / Role at Event
                      </label>
                      <input
                        type="text"
                        value={newGuestRole}
                        onChange={(e) => setNewGuestRole(e.target.value)}
                        placeholder="e.g. Chief AI Architect & Fellow"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#16212F] dark:text-white mb-1">
                        Organization / Affiliation
                      </label>
                      <input
                        type="text"
                        value={newGuestOrg}
                        onChange={(e) => setNewGuestOrg(e.target.value)}
                        placeholder="e.g. DeepMind Research Lab"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageUploadField
                        label="Speaker Portrait Photograph (Upload from PC or URL)"
                        value={newGuestAvatar}
                        onChange={setNewGuestAvatar}
                        aspectRatio="1:1"
                        recommendedDimensions="400 × 400 px"
                        description="This is the ratio of the image allowed: 1:1 Square (Recommended: 400×400 px). Balanced square portraits render crisply in keynote cards."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingGuest(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-[#536275] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0071E3] text-white hover:bg-[#0071E3]/90"
                    >
                      Confirm Guest
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Guests List */}
              <div className="space-y-3">
                {formData.speakers.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-[#CBD5E1] dark:border-white/10 text-center">
                    <p className="text-xs text-[#8C9AA9]">No keynote guests added to this showcase yet.</p>
                  </div>
                ) : (
                  formData.speakers.map((guest, idx) => {
                    const isEditing = editingGuestId === guest.id;
                    if (isEditing) {
                      return (
                        <div
                          key={guest.id || idx}
                          className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border-2 border-[#0071E3]/40 space-y-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#0071E3] text-white text-[10px] font-bold">
                                Editing Guest #{idx + 1}
                              </span>
                              <span className="text-xs font-bold text-[#16212F] dark:text-white">
                                {guest.name || 'Untitled Guest'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingGuestId(null)}
                              className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Done Editing</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#16212F] dark:text-white mb-1">
                                Full Name & Honorific
                              </label>
                              <input
                                type="text"
                                value={guest.name}
                                onChange={(e) => handleUpdateGuest(guest.id, { name: e.target.value })}
                                placeholder="e.g. Dr. Jane Goodall"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#16212F] dark:text-white mb-1">
                                Role / Title at Event
                              </label>
                              <input
                                type="text"
                                value={guest.role}
                                onChange={(e) => handleUpdateGuest(guest.id, { role: e.target.value })}
                                placeholder="e.g. Keynote Speaker & Fellow"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#16212F] dark:text-white mb-1">
                                Organization / Affiliation
                              </label>
                              <input
                                type="text"
                                value={guest.org}
                                onChange={(e) => handleUpdateGuest(guest.id, { org: e.target.value })}
                                placeholder="e.g. DeepMind Research Lab"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <ImageUploadField
                                label="Speaker Portrait Photograph (Upload from PC or URL with Crop & Zoom)"
                                value={guest.avatar}
                                onChange={(url) => handleUpdateGuest(guest.id, { avatar: url })}
                                aspectRatio="1:1"
                                recommendedDimensions="400 × 400 px"
                                description="This is the ratio of the image allowed: 1:1 Square (Recommended: 400×400 px). Upload from PC, interactive crop & zoom available."
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-black/[0.05] dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => handleRemoveGuest(guest.id)}
                              className="px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Guest</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingGuestId(null)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0071E3] text-white hover:bg-[#0062C4] shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Done Editing Guest</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={guest.id || idx}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1]/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#0071E3]/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setEditingGuestId(guest.id)}
                            className="relative cursor-pointer group shrink-0"
                            title="Click to edit or crop photo"
                          >
                            <img
                              src={guest.avatar}
                              alt={guest.name}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/10"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Edit3 className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-[#16212F] dark:text-white">
                                {guest.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A063]/20 text-[#8C6D34] dark:text-[#E6C98F] font-semibold">
                                Guest #{idx + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[#536275] dark:text-slate-400">
                              <span>{guest.role || 'Guest Speaker'}</span>
                              <span className="text-[#CBD5E1]">•</span>
                              <span className="text-[#8C9AA9]">{guest.org || 'Affiliation'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setEditingGuestId(guest.id)}
                            className="px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/10 hover:bg-[#0071E3] hover:text-white text-xs font-semibold text-[#16212F] dark:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Edit guest details and photograph"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Photo & Info</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGuest(guest.id)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Remove Guest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Visual Theme & Media */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-2">
                  Select Preset Campus Ambience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PRESET_BACKGROUNDS.map((bg, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleFieldChange('bgImage', bg.url)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all group relative ${
                        formData.bgImage === bg.url
                          ? 'border-[#C5A063] shadow-md ring-2 ring-[#C5A063]/30'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="h-24 w-full relative">
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                          <span className="text-[11px] font-bold text-white drop-shadow-sm">
                            {bg.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Custom Banner Background Photograph (PC Upload & Cropper)"
                  value={formData.bgImage}
                  onChange={(url) => handleFieldChange('bgImage', url)}
                  aspectRatio="16:9"
                  recommendedDimensions="1920 × 1080 px or 2560 × 1080 px (16:9 or 21:9)"
                  description="This is the ratio of the image allowed: 16:9 Landscape or 21:9 Ultrawide. Widescreen format creates cinematic depth behind the flagship hero section."
                />
              </div>

              {/* Accent Glow Color */}
              <div>
                <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-2">
                  Ambient Neon Glow Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor || '#C5A063'}
                    onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex items-center gap-2">
                    {['#C5A063', '#60A5FA', '#F59E0B', '#34C759', '#FF2D55', '#A855F7'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleFieldChange('accentColor', col)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          formData.accentColor === col ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetShowcaseItems}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C9AA9] hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Showcases to Institutional Defaults</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#536275] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                Close Studio
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#C5A063] hover:bg-[#B38E52] text-black shadow-sm transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Save "{formData.tabLabel}" & Publish Live</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
