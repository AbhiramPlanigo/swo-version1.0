import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AdminNavTab } from '../navigation/AdminSidebar';
import { FeaturedShowcaseEditor } from './FeaturedShowcaseEditor';
import { AdminQuoteEditor } from './AdminQuoteEditor';
import { EventItem } from '../../types';
import { ImageUploadField } from '../common/ImageUploadField';
import { 
  Calendar, 
  Users, 
  Megaphone, 
  Award, 
  TrendingUp, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  QrCode,
  Edit3,
  X,
  Trash2,
  RotateCcw,
  Check,
  Sparkles
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: AdminNavTab) => void;
  onOpenCreateEvent: () => void;
  onOpenCreateAnnouncement: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigateTab,
  onOpenCreateEvent,
  onOpenCreateAnnouncement,
}) => {
  const { events, registrations, announcements, certificates, attendanceRecords, adminUser, updateEvent, showToast } = useApp();

  // Quick edit modal for campus event dates & details
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editCapacity, setEditCapacity] = useState<number>(100);
  const [editTitle, setEditTitle] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState('');

  const openQuickEditEvent = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditDate(evt.date);
    setEditTime(evt.time);
    setEditVenue(evt.venue);
    setEditCapacity(evt.capacity);
    setEditTitle(evt.title);
    setEditBannerUrl(evt.bannerUrl || '');
  };

  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    updateEvent(editingEvent.id, {
      title: editTitle,
      date: editDate,
      time: editTime,
      venue: editVenue,
      capacity: editCapacity,
      bannerUrl: editBannerUrl || editingEvent.bannerUrl,
    });

    showToast('Event Schedule Updated', `Date and logistics for "${editTitle}" have been saved.`, 'success');
    setEditingEvent(null);
  };

  const publishedEvents = events.filter((e) => e.status === 'Published');
  const totalRegistrations = registrations.filter((r) => r.status !== 'Cancelled').length;
  const attendedCount = registrations.filter((r) => r.status === 'Attended').length;
  const attendanceRate = totalRegistrations > 0 
    ? Math.round((attendedCount / totalRegistrations) * 100) 
    : 84;

  const activeAnnouncements = announcements.length;
  const totalCertificatesIssued = certificates.length;

  // State for dismissed individual activity IDs and clear all flag
  const [dismissedActivityIds, setDismissedActivityIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('swo_dismissed_activities');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isClearedAll, setIsClearedAll] = useState<boolean>(() => {
    try {
      return localStorage.getItem('swo_activities_cleared_all') === 'true';
    } catch {
      return false;
    }
  });

  const handleDeleteActivity = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDismissedActivityIds((prev) => {
      const next = [...prev, id];
      try {
        localStorage.setItem('swo_dismissed_activities', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Activity Removed', 'Item removed from activity stream.', 'info');
  };

  const handleClearAllActivities = () => {
    setIsClearedAll(true);
    try {
      localStorage.setItem('swo_activities_cleared_all', 'true');
    } catch {}
    showToast('Activity Stream Cleared', 'All activity stream items have been cleared.', 'info');
  };

  const handleRestoreActivities = () => {
    setIsClearedAll(false);
    setDismissedActivityIds([]);
    try {
      localStorage.removeItem('swo_activities_cleared_all');
      localStorage.removeItem('swo_dismissed_activities');
    } catch {}
    showToast('Activity Stream Reset', 'Activity stream items restored.', 'info');
  };

  // Real dynamic activities stream from actual user registrations, certificates, and notices
  const rawActivities = [
    ...registrations.slice(-8).reverse().map((r) => ({
      id: `reg-${r.id}`,
      text: `Registration confirmed: ${r.studentName} (${r.studentRegNo}) in ${r.eventTitle}`,
      time: r.registeredAt ? 'Recently' : 'Active',
      type: 'reg' as const,
    })),
    ...certificates.slice(-5).reverse().map((c) => ({
      id: `cert-${c.id}`,
      text: `Certificate issued for ${c.studentName}: ${c.eventTitle}`,
      time: c.issuedDate || 'Issued',
      type: 'cert' as const,
    })),
    ...announcements.slice(-5).reverse().map((a) => ({
      id: `ann-${a.id}`,
      text: `Notice published: "${a.title}"`,
      time: a.date || 'Published',
      type: 'ann' as const,
    })),
  ];

  const dynamicActivities = isClearedAll
    ? []
    : rawActivities.filter((act) => !dismissedActivityIds.includes(act.id)).slice(0, 5);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-800/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated SWO Staff Session
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Yeshwanthpur Campus SWO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Student Welfare Office Overview
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-0.5">
            Real-time event registries, student footfalls, certificate dispatches, and campus welfare controls.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <AppleButton
            variant="secondary"
            size="sm"
            icon={<Users className="w-4 h-4 text-[#0071E3]" />}
            onClick={() => onNavigateTab('committees')}
          >
            Assign Committee
          </AppleButton>
          <AppleButton
            variant="secondary"
            size="sm"
            icon={<Megaphone className="w-4 h-4 text-orange-600" />}
            onClick={onOpenCreateAnnouncement}
          >
            Post Notice
          </AppleButton>
          <AppleButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenCreateEvent}
          >
            New Event
          </AppleButton>
        </div>
      </div>

      {/* FEATURED GUESTS & HOMEPAGE BANNER SHOWCASE MANAGER (REQUESTED FEATURE) */}
      <FeaturedShowcaseEditor />

      {/* DAILY INSPIRATION & QUOTE OF THE DAY MANAGER */}
      <AdminQuoteEditor />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <AppleCard padding="sm" className="flex flex-col justify-between dark:bg-[#141A26] dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400 uppercase tracking-wider">Live Events</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/70 dark:border-blue-900/40 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">{publishedEvents.length}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Across 6 disciplines</p>
          </div>
        </AppleCard>

        {/* KPI 2 */}
        <AppleCard padding="sm" className="flex flex-col justify-between dark:bg-[#141A26] dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400 uppercase tracking-wider">Registrations</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/70 dark:border-emerald-900/40 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">{totalRegistrations}</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">+24% vs last month</p>
          </div>
        </AppleCard>

        {/* KPI 3 */}
        <AppleCard padding="sm" className="flex flex-col justify-between dark:bg-[#141A26] dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/70 dark:border-purple-900/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">{attendanceRate}%</p>
            <p className="text-[11px] text-[#86868B] dark:text-slate-400 font-medium mt-1">Checked in at gates</p>
          </div>
        </AppleCard>

        {/* KPI 4 */}
        <AppleCard padding="sm" className="flex flex-col justify-between dark:bg-[#141A26] dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400 uppercase tracking-wider">Certificates</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/70 dark:border-amber-900/40 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">{totalCertificatesIssued}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">E-signed & pushed</p>
          </div>
        </AppleCard>

        {/* KPI 5 */}
        <AppleCard padding="sm" className="col-span-2 lg:col-span-1 flex flex-col justify-between dark:bg-[#141A26] dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400 uppercase tracking-wider">Circulars</span>
            <div className="w-9 h-9 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100/70 dark:border-orange-900/40 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">{activeAnnouncements}</p>
            <p className="text-[11px] text-[#86868B] dark:text-slate-400 font-medium mt-1">Campus-wide broadcast</p>
          </div>
        </AppleCard>
      </div>

      {/* Main Content Split: Upcoming Events Live Status & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events Management Radar (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                Active Event Registrations
              </h3>
              <p className="text-xs text-[#86868B] dark:text-slate-400">
                Click "Edit Details & Dates" on any event to update dates, capacity, or venue.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-[#0071E3] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Manage All Events <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {events.slice(0, 5).map((evt) => {
              const fillPct = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

              return (
                <AppleCard
                  key={evt.id}
                  padding="sm"
                  className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-white">
                          {evt.category}
                        </span>
                        {evt.inCarousel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD60A]/20 text-[#B78103] dark:text-[#FFD60A]">
                            Carousel (Rank #{evt.carouselOrder})
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate mt-0.5">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-[#86868B] dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <Calendar className="w-3 h-3 text-[#3A5982] dark:text-blue-400 shrink-0" />
                        <span className="font-semibold text-[#16212F] dark:text-slate-200">{evt.date}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3 text-[#FF3B30] shrink-0" /> {evt.venue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <div className="w-32 sm:w-36 text-xs">
                      <div className="flex items-center justify-between text-[#86868B] dark:text-slate-400 mb-1">
                        <span>Bookings</span>
                        <span className="font-semibold text-[#1D1D1F] dark:text-white">
                          {evt.registeredCount} / {evt.capacity}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0071E3] rounded-full"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openQuickEditEvent(evt)}
                      className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/10 text-[#16212F] dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center gap-1"
                      title="Edit Date, Time & Venue for this event"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Edit Dates</span>
                    </button>
                  </div>
                </AppleCard>
              );
            })}
          </div>
        </div>

        {/* Live Directorate Activity Feed (1 column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                Activity Stream
              </h3>
              <span className="text-xs text-[#34C759] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-ping" /> Live
              </span>
            </div>

            {dynamicActivities.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAllActivities}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer select-none"
                title="Clear all activity items"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            ) : isClearedAll ? (
              <button
                type="button"
                onClick={handleRestoreActivities}
                className="text-[11px] font-semibold text-[#0071E3] dark:text-blue-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all cursor-pointer select-none"
                title="Restore activity stream"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            ) : null}
          </div>

          <AppleCard padding="sm" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-4">
            {dynamicActivities.length === 0 ? (
              <div className="py-8 px-3 text-center space-y-2">
                <div className="w-8 h-8 rounded-xl bg-black/[0.03] dark:bg-white/5 flex items-center justify-center text-[#0071E3] dark:text-blue-400 mx-auto">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white">
                  {isClearedAll ? 'Activity Stream Cleared' : 'No Recent Activity'}
                </p>
                <p className="text-[11px] text-[#86868B] dark:text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                  {isClearedAll
                    ? 'All previous logs have been dismissed. You can click Reset above to restore.'
                    : 'Dynamic activity logs will appear here as students register for events or receive certificates.'}
                </p>
              </div>
            ) : (
              dynamicActivities.map((act) => (
                <div
                  key={act.id}
                  className="group flex items-start gap-3 pb-3 border-b border-black/[0.04] dark:border-white/5 last:border-0 last:pb-0 relative"
                >
                  <div className="w-7 h-7 rounded-xl bg-black/[0.03] dark:bg-white/5 flex items-center justify-center text-[#0071E3] dark:text-blue-400 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 pr-6">
                    <p className="text-xs text-[#1D1D1F] dark:text-slate-200 leading-snug font-medium line-clamp-2">
                      {act.text}
                    </p>
                    <span className="text-[10px] text-[#86868B] dark:text-slate-400 mt-0.5 block">{act.time}</span>
                  </div>

                  {/* Delete individual activity button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteActivity(act.id, e)}
                    title="Delete activity"
                    className="opacity-50 hover:opacity-100 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all absolute right-0 top-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </AppleCard>

          {/* Quick Scanner Shortcut */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#002147] to-[#0A2540] text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase">
              <QrCode className="w-4 h-4 text-[#FFD60A]" /> Fast Gate Check-In
            </div>
            <h4 className="text-sm font-bold">Launch Auditorium Gate Scanner</h4>
            <p className="text-xs text-white/80">
              Check in registered students via camera or optical smartcard barcode reader.
            </p>
            <div className="pt-2">
              <AppleButton
                variant="gold"
                size="sm"
                className="w-full text-xs"
                onClick={() => onNavigateTab('attendance')}
              >
                Open Gate Check-In
              </AppleButton>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK EVENT DATES & DETAILS MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141A26] border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3A5982]/10 text-[#3A5982] dark:text-blue-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#16212F] dark:text-white">
                    Modify Event Date & Schedule
                  </h3>
                  <p className="text-xs text-[#536275] dark:text-slate-400">
                    Quickly reschedule or adjust venue for this event.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#16212F] dark:text-white mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#16212F] dark:text-white mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    placeholder="e.g. 2026-03-24 or March 24, 2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#16212F] dark:text-white mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 1:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#16212F] dark:text-white mb-1">
                    Auditorium / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#16212F] dark:text-white mb-1">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-white/15 text-xs text-[#16212F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#3A5982]"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Event Banner Photograph"
                  value={editBannerUrl}
                  onChange={setEditBannerUrl}
                  aspectRatio="16:9"
                  recommendedDimensions="1920 × 1080 px"
                  description="This is the ratio of the image allowed: 16:9 Landscape. Formatted for high-definition event cards and public showcase displays."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#3A5982] hover:bg-[#2D476C] text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
