import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement, AnnouncementCategory } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { EmptyState } from '../common/EmptyState';
import { AppleSkeletonAnnouncement } from '../common/AppleSkeleton';
import { Modal } from '../common/Modal';
import { motion } from 'motion/react';
import { 
  Megaphone, 
  Pin, 
  Calendar, 
  CheckCheck, 
  Filter, 
  Search, 
  Bell, 
  Sparkles,
  Building2,
  ChevronRight,
  Upload
} from 'lucide-react';

interface AnnouncementsViewProps {
  onOpenMediaUpload?: (category?: 'event' | 'hero' | 'poster' | 'avatar' | 'moment') => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  onOpenMediaUpload,
}) => {
  const { announcements, markAnnouncementAsRead, markAllAnnouncementsAsRead, studentUser } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
  };

  const categories = ['All', 'Talk Series', 'Auditions', 'Circular', 'Academic', 'Campus Life'];

  const filteredAnnouncements = announcements
    .filter((a) => {
      if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesContent = a.content.toLowerCase().includes(query);
        const matchesAuthor = a.authorName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesAuthor) return false;
      }
      return true;
    })
    // Sort pinned to top, then chronological date
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const unreadCount = studentUser
    ? announcements.filter((a) => !a.readBy.includes(studentUser.id)).length
    : 0;

  const handleCardClick = (ann: Announcement) => {
    if (studentUser) {
      markAnnouncementAsRead(ann.id);
    }
    setActiveAnnouncement(ann);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0071E3]/10 dark:bg-[#0071E3]/25 text-[#0071E3] dark:text-[#93C5FD]">
              Campus Circulars & Bulletins
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#C59B27]/15 text-[#9A7B1C] dark:text-[#E6C98F]">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Official Announcements
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-1">
            Verified circulars, audition schedules, callouts, and academic guidelines issued by SWO Yeshwanthpur.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenMediaUpload && (
            <button
              type="button"
              onClick={() => onOpenMediaUpload('poster')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0071E3] dark:text-blue-300 bg-[#0071E3]/10 hover:bg-[#0071E3]/20 border border-[#0071E3]/20 transition-all cursor-pointer shadow-xs"
              title="Upload Circular Poster (Allowed Ratio: 4:3)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Notice Poster (4:3)</span>
            </button>
          )}

          {unreadCount > 0 && (
            <AppleButton
              variant="secondary"
              size="sm"
              icon={<CheckCheck className="w-4 h-4 text-[#0071E3]" />}
              onClick={() => markAllAnnouncementsAsRead()}
            >
              Mark All as Read
            </AppleButton>
          )}
        </div>
      </div>

      {/* Controls Bar: Search & Categories */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search announcements by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-colors shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`relative min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer select-none ${
                  isSelected
                    ? 'text-white'
                    : 'bg-white dark:bg-white/5 text-[#515154] dark:text-slate-300 hover:text-[#1D1D1F] dark:hover:text-white border border-black/[0.06] dark:border-white/10'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeAnnounceCategoryPill"
                    className="absolute inset-0 bg-[#002147] dark:bg-[#3A5982] rounded-full shadow-xs"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcement Cards List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-7 h-7" />}
          title="No Announcements Found"
          description="There are currently no active announcements matching your query. Check back shortly for university notices."
          actionLabel="View All Categories"
          onAction={() => {
            handleCategoryChange('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <motion.div layout className="space-y-3.5">
          {filteredAnnouncements.map((ann) => {
            const isRead = studentUser ? ann.readBy.includes(studentUser.id) : true;

            return (
              <motion.div
                layout
                key={ann.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
              >
                <AppleCard
                  hoverEffect
                  padding="none"
                  onClick={() => handleCardClick(ann)}
                  className={`p-4 sm:p-5 cursor-pointer border transition-colors ${
                    ann.isPinned
                      ? 'border-[#C59B27]/40 bg-gradient-to-r from-amber-500/[0.04] to-transparent dark:from-amber-500/[0.08]'
                      : 'border-black/[0.06] dark:border-white/10'
                  } ${!isRead ? 'ring-1 ring-[#0071E3]/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Header Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        {ann.isPinned && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C59B27]/15 text-[#9A7B1C] dark:text-[#E6C98F] flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-current" /> Pinned Notice
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#93C5FD]">
                          {ann.category}
                        </span>

                        <span className="text-xs text-[#86868B] dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#86868B] dark:text-slate-400" />
                          {new Date(ann.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white tracking-tight leading-snug">
                        {ann.title}
                      </h3>

                      {/* Content Preview */}
                      <p className="text-xs sm:text-sm text-[#515154] dark:text-slate-300 leading-relaxed line-clamp-2">
                        {ann.content}
                      </p>

                      {/* Metadata Footer */}
                      <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#86868B] dark:text-slate-400">
                        <span>Issued by: <strong className="text-[#1D1D1F] dark:text-white">{ann.authorName}</strong> ({ann.authorRole})</span>
                        <span>•</span>
                        <span>Target: {ann.targetDept} ({ann.targetYear})</span>
                      </div>
                    </div>

                    <div className="self-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </AppleCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Expanded Announcement Modal using Apple Spring System */}
      <Modal
        isOpen={!!activeAnnouncement}
        onClose={() => setActiveAnnouncement(null)}
        title={activeAnnouncement?.title}
        subtitle={activeAnnouncement ? `${new Date(activeAnnouncement.date).toLocaleDateString('en-US', { dateStyle: 'long' })} • Target: ${activeAnnouncement.targetDept}` : undefined}
        maxWidth="xl"
      >
        {activeAnnouncement && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#002147] text-white">
                {activeAnnouncement.category}
              </span>
              {activeAnnouncement.isPinned && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C59B27]/15 text-[#9A7B1C] dark:text-[#E6C98F] flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-current" /> Pinned
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.04] dark:border-white/10 text-xs sm:text-sm text-[#3A3A3C] dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {activeAnnouncement.content}
            </div>

            <div className="p-3.5 rounded-xl bg-[#002147]/5 dark:bg-white/5 border border-[#002147]/10 dark:border-white/10 flex items-center gap-3 text-xs">
              <Building2 className="w-5 h-5 text-[#002147] dark:text-[#93C5FD] shrink-0" />
              <div>
                <p className="font-semibold text-[#1D1D1F] dark:text-white">{activeAnnouncement.authorName}</p>
                <p className="text-[11px] text-[#86868B] dark:text-slate-400">{activeAnnouncement.authorRole} • Student Welfare Office</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <AppleButton
                variant="primary"
                size="sm"
                onClick={() => setActiveAnnouncement(null)}
              >
                Close Notice
              </AppleButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
