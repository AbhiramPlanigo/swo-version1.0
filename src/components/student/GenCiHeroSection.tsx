import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  Share2, 
  Mic2, 
  Radio, 
  Layers, 
  Award,
  Clock,
  Send,
  ExternalLink,
  Flame,
  Volume2,
  Bell,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventItem, ShowcaseItem } from '../../types';

interface GenCiHeroSectionProps {
  onExploreReel: () => void;
  onNavigateToEvents: () => void;
  onSelectEvent?: (event: EventItem) => void;
  onQuickRegister?: (event: EventItem) => void;
}

const AUTOPLAY_INTERVAL = 6000; // 6-second auto-scroll interval loop

export const GenCiHeroSection: React.FC<GenCiHeroSectionProps> = ({
  onExploreReel,
  onNavigateToEvents,
}) => {
  const { studentUser, openLoginModal, showToast, theme, showcaseItems } = useApp();

  const items: ShowcaseItem[] = showcaseItems && showcaseItems.length > 0 ? showcaseItems : [];

  // Selected Showcase Template & Animation Direction
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => items[0]?.id || 'talk-series');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isReserved, setIsReserved] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [isHovered, setIsHovered] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);

  // Keep selection valid if an item was deleted or changed
  const activeTemplate = items.find((t) => t.id === selectedTemplateId) || items[0];

  const handleSelectTemplate = useCallback((t: ShowcaseItem, dir: 1 | -1 = 1) => {
    setSelectedTemplateId(t.id);
    setDirection(dir);
    setProgress(0);
  }, []);

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    const currentIndex = items.findIndex((t) => t.id === (activeTemplate?.id || items[0]?.id));
    const nextIndex = (currentIndex + 1) % items.length;
    handleSelectTemplate(items[nextIndex], 1);
  }, [items, activeTemplate, handleSelectTemplate]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    const currentIndex = items.findIndex((t) => t.id === (activeTemplate?.id || items[0]?.id));
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    handleSelectTemplate(items[prevIndex], -1);
  }, [items, activeTemplate, handleSelectTemplate]);

  // 6-Second Auto-Scrolling Loop with Seamless Reset & Pause Handling
  useEffect(() => {
    if (items.length <= 1 || isHovered || isUserPaused) {
      return;
    }

    const stepMs = 50; // Smooth 50ms resolution for progress bar animation
    let elapsed = 0;

    const interval = setInterval(() => {
      if (document.hidden) return; // Pause when tab is inactive

      elapsed += stepMs;
      const pct = Math.min(100, (elapsed / AUTOPLAY_INTERVAL) * 100);
      setProgress(pct);

      if (elapsed >= AUTOPLAY_INTERVAL) {
        elapsed = 0;
        setProgress(0);
        setSelectedTemplateId((prevId) => {
          const currentIndex = items.findIndex((t) => t.id === prevId);
          const nextIndex = (currentIndex + 1) % items.length;
          return items[nextIndex].id;
        });
        setDirection(1);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [items, isHovered, isUserPaused, selectedTemplateId]);

  // Touch Swipe Gesture Tracking for Mobile
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) {
        handleNext(); // Swiped left -> advance to next
      } else {
        handlePrev(); // Swiped right -> go to previous
      }
    }
    touchStartXRef.current = null;
  };

  if (!activeTemplate) return null;

  const displayTitle = activeTemplate.title;
  const displaySubtitle = activeTemplate.subtitle;
  const displayBadge = activeTemplate.badge;
  const displayDescription = activeTemplate.description;
  const displayDate = activeTemplate.date;
  const displayTime = activeTemplate.time;
  const displayVenue = activeTemplate.venue;
  const displayLocationBadge = activeTemplate.locationBadge || activeTemplate.venue || 'Main Auditorium • Central Campus';
  const displaySpeakers = activeTemplate.speakers || [];
  const displayBgImage = activeTemplate.bgImage || '/assets/christ-yeshwanthpur-campus.jpg';

  const handleReserve = () => {
    if (!studentUser) {
      openLoginModal(
        `Please sign in with your official @christuniversity.in account to get notified about "${displayTitle}".`,
        () => {
          setIsReserved(true);
          showToast('Notification Enabled', `You will receive updates about "${displayTitle}".`, 'success');
        }
      );
      return;
    }
    setIsReserved(true);
    showToast('Notification Enabled', `Updates will be sent to ${studentUser.email}.`, 'success');
  };

  return (
    <div 
      className="relative w-full rounded-[32px] sm:rounded-[40px] overflow-hidden border border-[#E2E8F0] dark:border-white/10 shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Background Anime / High-Gloss Canvas with Ambient Visual Depth */}
      <div className="absolute inset-0 z-0">
        <img
          src={displayBgImage}
          alt={displayTitle}
          className="w-full h-full object-cover object-[center_32%] transform scale-105 filter brightness-[0.55] dark:brightness-[0.44] saturate-[1.18] contrast-[1.05] transition-all duration-1000 ease-out"
        />
        
        {/* Dynamic Dark Gradient Overlays - tuned so users can clearly see the university building behind */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/60 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/90 via-[#0B0F17]/55 to-[#0B0F17]/20" />
        
        {/* Ambient Glowing Neon Spots */}
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-35 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: activeTemplate.accentColor }}
        />
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-30 pointer-events-none bg-[#3A5982]"
        />

        {/* Subtle Sci-Fi / Anime Geometric Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Main Content Stage: Fully Filled & Responsive Full Page Utilization */}
      <div className="relative z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-14 min-h-[580px] lg:min-h-[640px] text-white space-y-8">
        
        {/* =========================================================================
            HEADER BAR: CHRIST LOGO & OFFICIAL DIRECTORATE CREST + TEMPLATE SWITCHER
            ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          
          {/* Christ University Official Crest & Brand Typography */}
          <div className="flex items-center gap-3.5">
            {/* Official University Crest Insignia */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-[#C5A063]/50 group hover:scale-105 transition-transform">
              <img
                src="/christ-university-crest.png"
                alt="CHRIST (Deemed to be University) Official Crest"
                className="w-full h-full object-contain select-none"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#C5A063] uppercase">
                  CHRIST (Deemed to be University)
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wide text-white/90">
                  Bangalore Yeshwanthpur Campus
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/90 font-medium tracking-tight">
                Student Welfare Office • Official Flagship Conclave Platform
              </p>
            </div>
          </div>

          {/* Official Flagship Showcase Category Selector with 6-Second Loop */}
          {items.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative inline-flex items-center p-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 shadow-md">
                {items.map((tmpl) => {
                  const isSelected = activeTemplate.id === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl, 1)}
                      className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 active:scale-95 select-none overflow-hidden ${
                        isSelected
                          ? 'text-[#0B0F17] font-bold'
                          : 'text-white/75 hover:text-white'
                      }`}
                      title={`Switch to ${tmpl.tabLabel}`}
                    >
                      {isSelected && (
                        <>
                          <motion.div
                            layoutId="activeHeroTemplatePill"
                            className="absolute inset-0 bg-white rounded-full shadow-md"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                          {/* 6-Second Auto-Scroll Progress Fill Indicator */}
                          {items.length > 1 && !isUserPaused && (
                            <div 
                              className="absolute bottom-0 left-0 h-[2.5px] bg-[#0071E3] transition-all duration-75 ease-linear rounded-full opacity-90 shadow-sm"
                              style={{ width: `${progress}%` }}
                            />
                          )}
                        </>
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {tmpl.tabEmoji && <span>{tmpl.tabEmoji}</span>}
                        <span>{tmpl.tabLabel}</span>
                      </span>
                    </button>
                  );
                })}

                {/* Carousel Loop Controls & 6s Auto-Scroll State Indicator */}
                {items.length > 1 && (
                  <div className="flex items-center gap-0.5 pl-1.5 pr-0.5 border-l border-white/15 ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="w-6 h-6 rounded-full hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Previous showcase (or swipe right)"
                      aria-label="Previous showcase"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserPaused((prev) => !prev);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isUserPaused
                          ? 'bg-[#C5A063]/30 text-[#C5A063]'
                          : 'hover:bg-white/15 text-white/70 hover:text-white'
                      }`}
                      title={isUserPaused ? 'Resume 6s auto-scroll loop' : 'Pause 6s auto-scroll loop'}
                      aria-label={isUserPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
                    >
                      {isUserPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="w-6 h-6 rounded-full hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Next showcase (or swipe left)"
                      aria-label="Next showcase"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            CENTER SHOWCASE: BIG & FULLY FILLED TYPOGRAPHY & INTELLECTUAL VIBE
            Direction-Aware Smooth Slide & Blur Transition
            ========================================================================= */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTemplate.id}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                opacity: 0,
                x: dir > 0 ? 28 : -28,
                filter: 'blur(3px)',
              }),
              center: {
                opacity: 1,
                x: 0,
                filter: 'blur(0px)',
                transition: {
                  duration: 0.32,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
              exit: (dir: number) => ({
                opacity: 0,
                x: dir > 0 ? -28 : 28,
                filter: 'blur(3px)',
                transition: {
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                },
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-4xl space-y-6"
          >
            {/* Eyebrow Status Badge with Anime Glow */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-xs font-bold tracking-wider text-white shadow-lg">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_12px_currentColor]"
                  style={{ backgroundColor: activeTemplate.accentColor, color: activeTemplate.accentColor }}
                />
                <span 
                  className="font-mono tracking-widest"
                  style={{ color: activeTemplate.accentColor }}
                >
                  {displayBadge}
                </span>
              </div>

              {/* Campus Location & Stage Symbol (Replaces old Broadcast Ready) */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/10 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#C5A063] shrink-0" />
                <span>{displayLocationBadge}</span>
              </div>
            </div>

            {/* Main Giant Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-white drop-shadow-xl uppercase">
                {displayTitle}
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl font-light text-white/90 leading-relaxed font-serif italic max-w-3xl">
                "{displaySubtitle}"
              </p>
            </div>

            {/* Contextual Narrative */}
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl font-normal">
              {displayDescription}
            </p>

            {/* Logistics Matrix Chips (Time, Date, Location) */}
            <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap pt-1">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white">
                <Calendar className="w-4 h-4 text-[#C5A063] shrink-0" />
                <span>{displayDate}</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white">
                <Clock className="w-4 h-4 text-[#60A5FA] shrink-0" />
                <span>{displayTime}</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{displayVenue}</span>
              </div>
            </div>

            {/* Keynote Guest Panel Preview */}
            <div className="pt-2 flex items-center gap-4 flex-wrap">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                Featured Guests ({displaySpeakers.length}):
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {displaySpeakers.map((spk, idx) => (
                  <div 
                    key={spk.id || idx} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 hover:border-[#C5A063]/50 transition-colors"
                  >
                    <img
                      src={spk.avatar}
                      alt={spk.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30"
                    />
                    <div className="text-left leading-none">
                      <span className="text-xs font-bold text-white block">{spk.name}</span>
                      <span className="text-[9px] text-white/70">{spk.org || spk.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* =========================================================================
            BOTTOM ACTION BAR & SCROLL DOWN TRIGGER
            ========================================================================= */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleReserve}
              className={`inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xl active:scale-95 ${
                isReserved
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-gradient-to-r from-[#C5A063] via-[#E2C78A] to-[#C5A063] text-black hover:brightness-110 shadow-[0_4px_24px_rgba(197,160,99,0.4)]'
              }`}
            >
              {isReserved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Notifications Enabled</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-black" />
                  <span>Notify Me</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToEvents}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all active:scale-95 backdrop-blur-md"
            >
              <span>Full Event Dossier</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </button>
          </div>

          {/* Prompt to explore Scrolling Reel Towards Down */}
          <button
            onClick={onExploreReel}
            className="flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white group transition-colors self-start sm:self-auto py-2"
          >
            <span>Live Campus Highlights & Scrolling Reel Below</span>
            <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 group-hover:translate-y-1 transition-all">
              <ArrowDown className="w-3.5 h-3.5 text-[#C5A063]" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
