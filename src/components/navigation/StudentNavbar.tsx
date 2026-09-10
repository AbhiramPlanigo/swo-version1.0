import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChristLogo } from '../common/ChristLogo';
import { 
  Home, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  Bell, 
  Trophy, 
  Award, 
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  LogIn,
  LogOut,
  Search,
  Sun,
  Moon,
  Command,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  BarChart3,
  MoreHorizontal,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type StudentNavTab = 
  | 'home' 
  | 'events' 
  | 'calendar'
  | 'my-registrations' 
  | 'announcements' 
  | 'results' 
  | 'certificates' 
  | 'research'
  | 'profile';

export type CampusNavTab = StudentNavTab;

interface StudentNavbarProps {
  currentTab: StudentNavTab;
  onSelectTab: (tab: StudentNavTab) => void;
  unreadAnnouncementsCount: number;
}

interface NavItem {
  id: StudentNavTab;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  badge?: number | string;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({
  currentTab,
  onSelectTab,
  unreadAnnouncementsCount,
}) => {
  const { studentUser, logoutStudent, openLoginModal, theme, toggleTheme, events, announcements } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K for Apple Spotlight Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (searchModalOpen) setSearchModalOpen(false);
        if (profileDropdownOpen) setProfileDropdownOpen(false);
        if (moreDropdownOpen) setMoreDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, profileDropdownOpen, moreDropdownOpen]);

  // Focus input when spotlight opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [searchModalOpen]);

  // Primary navigation items (always visible on desktop)
  const primaryNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'events', label: 'Events', icon: <CalendarIcon className="w-3.5 h-3.5" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-3.5 h-3.5" /> },
    { 
      id: 'announcements', 
      label: 'Circulars', 
      icon: <Bell className="w-3.5 h-3.5" />,
      badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined,
    },
  ];

  // Secondary items (shown directly on xl screens, or tucked into "More" on lg screens)
  const secondaryNavItems: NavItem[] = [
    { id: 'research', label: 'Surveys', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'results', label: 'Results', icon: <Trophy className="w-3.5 h-3.5" /> },
  ];

  // Full set of public nav items
  const allDesktopNavItems = [...primaryNavItems, ...secondaryNavItems];

  // Authenticated items for mobile menu
  const authenticatedNavItems: NavItem[] = [
    { id: 'my-registrations', label: 'My Passes', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="w-3.5 h-3.5" /> },
  ];

  const allMobileNavItems = studentUser
    ? [...allDesktopNavItems, ...authenticatedNavItems]
    : allDesktopNavItems;

  const isMoreActive = currentTab === 'research' || currentTab === 'results';

  const handleProtectedTabClick = (tabId: StudentNavTab) => {
    if ((tabId === 'my-registrations' || tabId === 'certificates' || tabId === 'profile') && !studentUser) {
      openLoginModal(
        `Please sign in with your official @christuniversity.in account to access ${tabId === 'my-registrations' ? 'your event passes' : 'your certificates'}.`,
        () => onSelectTab(tabId)
      );
      return;
    }
    onSelectTab(tabId);
  };

  // Filtered Spotlight Search Results
  const filteredEvents = searchQuery.trim()
    ? (events || []).filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.venue.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : (events || []).slice(0, 3);

  const filteredAnnouncements = searchQuery.trim()
    ? (announcements || []).filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  return (
    <>
      {/* Universal Institutional Navigation Header with Apple Translucent Chrome */}
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip bg-white/75 dark:bg-[#0B0F17]/80 backdrop-blur-2xl backdrop-saturate-180 border-b border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & University Campus Identity */}
          <div 
            onClick={() => onSelectTab('home')} 
            className="cursor-pointer transition-transform duration-150 active:scale-[0.98] shrink-0 flex items-center select-none"
            title="Christ University SWO • Bangalore Yeshwanthpur Campus"
          >
            <ChristLogo size="md" showText={true} />
          </div>

          {/* Desktop Nav Items (Apple Segmented Dock) */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-black/[0.03] dark:bg-white/[0.06] p-1 rounded-full border border-black/[0.05] dark:border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md shrink-0">
            {/* Primary Nav Items (Always Visible on Desktop) */}
            {primaryNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleProtectedTabClick(item.id)}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-semibold tracking-[-0.01em] transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap active:scale-[0.96] select-none ${
                    isActive
                      ? 'text-[#002147] dark:text-white font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#002147] dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-white dark:bg-[#1E293B] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-black/[0.04] dark:border-white/10"
                      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
                    />
                  )}
                  <span className={`relative z-10 transition-transform duration-150 ${isActive ? 'text-[#002147] dark:text-white' : ''}`}>{item.icon}</span>
                  <span className={`relative z-10 ${isActive ? 'text-[#002147] dark:text-white' : ''}`}>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="relative z-10 ml-0.5 px-1.5 py-0.5 bg-gradient-to-r from-[#C5A063] to-[#D4AF37] text-white text-[9.5px] font-black rounded-full leading-none shadow-[0_1px_4px_rgba(197,160,99,0.35)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Secondary Items (Visible directly on xl screens) */}
            <div className="hidden xl:flex items-center gap-0.5">
              {secondaryNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleProtectedTabClick(item.id)}
                    className={`relative px-3 py-1.5 rounded-full text-xs font-semibold tracking-[-0.01em] transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap active:scale-[0.96] select-none ${
                      isActive
                        ? 'text-[#002147] dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[#002147] dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-white dark:bg-[#1E293B] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-black/[0.04] dark:border-white/10"
                        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
                      />
                    )}
                    <span className={`relative z-10 transition-transform duration-150 ${isActive ? 'text-[#002147] dark:text-white' : ''}`}>{item.icon}</span>
                    <span className={`relative z-10 ${isActive ? 'text-[#002147] dark:text-white' : ''}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Adaptive "More" Dropdown for lg screens (1024px to 1279px) */}
            <div className="xl:hidden relative">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-semibold tracking-[-0.01em] transition-colors duration-150 flex items-center gap-1 whitespace-nowrap active:scale-[0.96] select-none ${
                  isMoreActive
                    ? 'text-[#002147] dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#002147] dark:hover:text-white'
                }`}
              >
                {isMoreActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-white dark:bg-[#1E293B] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-black/[0.04] dark:border-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10">
                  {currentTab === 'research' ? 'Surveys' : currentTab === 'results' ? 'Results' : 'More'}
                </span>
                <ChevronDown className={`relative z-10 w-3 h-3 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {moreDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoreDropdownOpen(false)} />
                    <motion.div
                      style={{ transformOrigin: 'top center' }}
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                      className="absolute left-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-[#121824]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-1.5 z-50 text-[#0F172A] dark:text-white"
                    >
                      {secondaryNavItems.map((item) => {
                        const isSubActive = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              handleProtectedTabClick(item.id);
                              setMoreDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                              isSubActive
                                ? 'bg-[#0071E3]/10 text-[#0071E3] dark:text-blue-300 font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/10'
                            }`}
                          >
                            {item.icon}
                            <span>{item.id === 'research' ? 'Research & Surveys' : item.label}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Header Actions: Search, Theme Toggle & Institutional Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Apple Spotlight Search Trigger (Pill on xl, circle on smaller) */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              title="Spotlight Search (⌘K / Ctrl+K)"
              aria-label="Search Events & Campus Information"
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] border border-black/[0.05] dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400 active:scale-95 transition-all select-none shadow-2xs group"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <span>Search...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/10 font-mono text-[10px] font-bold text-slate-400">⌘K</kbd>
            </button>

            {/* Circular Search Button for lg and below */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              title="Spotlight Search (⌘K / Ctrl+K)"
              aria-label="Search Events & Campus Information"
              className="xl:hidden w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.07] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/[0.04] dark:border-white/[0.08] text-slate-700 dark:text-slate-200 active:scale-90 transition-all shadow-2xs group"
            >
              <Search className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
            </button>

            {/* Apple Theme Toggle Button (Smooth Micro-Spring) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Appearance"
              className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.07] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/[0.04] dark:border-white/[0.08] text-slate-700 dark:text-slate-200 active:scale-90 transition-all duration-150 shadow-2xs overflow-hidden shrink-0"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -70, scale: 0.7, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 70, scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 70, scale: 0.7, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -70, scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-[#002147]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Authenticated Student Capsule vs Public Sign In CTA */}
            {studentUser ? (
              /* User Profile Capsule with Origin-Aware Popover */
              <div className="relative shrink-0">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 min-h-[38px] px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.07] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] border border-black/[0.05] dark:border-white/[0.08] active:scale-[0.97] transition-all shadow-2xs group"
                >
                  <div className="p-0.5 rounded-full bg-[#C5A063]/30 border border-[#C5A063]/50 shrink-0">
                    {studentUser.avatar ? (
                      <img
                        src={studentUser.avatar}
                        alt={studentUser.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#002147] dark:bg-[#0071E3] text-white text-[9.5px] font-black flex items-center justify-center">
                        {studentUser.name
                          ? studentUser.name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                          : 'U'}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#0F172A] dark:text-white max-w-[90px] truncate">
                    {studentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      <motion.div
                        style={{ transformOrigin: 'top right' }}
                        initial={{ opacity: 0, scale: 0.95, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
                        className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white/95 dark:bg-[#121824]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-2 z-50 text-[#0F172A] dark:text-white"
                      >
                        <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/5 rounded-xl mb-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-[#C5A063] uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#C5A063]" />
                              Verified Student
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {studentUser.regNo}
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-[#0F172A] dark:text-white">{studentUser.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {studentUser.email}
                          </p>
                          <p className="text-[10px] text-[#002147] dark:text-[#93C5FD] font-semibold mt-0.5 truncate">
                            {studentUser.department}
                          </p>
                        </div>

                        <div className="p-1 space-y-0.5 text-xs">
                          <button
                            onClick={() => {
                              onSelectTab('profile');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full min-h-[38px] flex items-center gap-2.5 px-3 py-2 font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-[0.98] transition-all"
                          >
                            <UserIcon className="w-4 h-4 text-[#002147] dark:text-[#93C5FD]" />
                            Student Profile & Digital ID
                          </button>
                          <button
                            onClick={() => {
                              onSelectTab('my-registrations');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full min-h-[38px] flex items-center gap-2.5 px-3 py-2 font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-[0.98] transition-all"
                          >
                            <ClipboardList className="w-4 h-4 text-[#002147] dark:text-[#93C5FD]" />
                            My Passes & QR Tickets
                          </button>
                          <button
                            onClick={() => {
                              onSelectTab('certificates');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full min-h-[38px] flex items-center gap-2.5 px-3 py-2 font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/10 active:scale-[0.98] transition-all"
                          >
                            <Award className="w-4 h-4 text-[#002147] dark:text-[#93C5FD]" />
                            Earned Certificates
                          </button>
                        </div>

                        <div className="mt-1 pt-1 border-t border-black/[0.06] dark:border-white/[0.08] p-1">
                          <button
                            onClick={() => {
                              logoutStudent();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full min-h-[38px] flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-[0.98] transition-all"
                          >
                            <span>Sign Out to Public View</span>
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Public Sign In Button with Apple CTA Gradient & Micro-Spring */
              <button
                onClick={() => openLoginModal('Sign in with your official Christ University institutional email to register for events, download passes, and claim certificates.')}
                className="flex items-center gap-2 min-h-[38px] px-3.5 py-1.5 rounded-full bg-[#002147] hover:bg-[#002D5E] dark:bg-[#0071E3] dark:hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_14px_rgba(0,33,71,0.25)] dark:shadow-[0_2px_12px_rgba(0,113,227,0.35)] border border-white/15 active:scale-[0.96] transition-all duration-150 shrink-0 group"
              >
                <LogIn className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                <span>Sign In</span>
                <span className="hidden xl:inline text-[10px] font-normal text-white/75 pl-2 border-l border-white/20">
                  @christuniversity.in
                </span>
              </button>
            )}

            {/* Mobile Navigation Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.07] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/[0.04] dark:border-white/[0.08] text-slate-800 dark:text-white active:scale-90 transition-all shrink-0"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu (Apple Sheet Style) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="lg:hidden border-t border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-2xl px-4 py-3 space-y-1.5 overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-black/[0.06] dark:border-white/[0.08] mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interface Theme</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-white border border-black/[0.05] dark:border-white/[0.1] active:scale-95 transition-all"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#002147]" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>

              {allMobileNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleProtectedTabClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                    currentTab === item.id
                      ? 'bg-[#002147] dark:bg-[#0071E3] text-white font-bold shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={currentTab === item.id ? 'text-white' : 'text-[#002147] dark:text-[#93C5FD]'}>
                      {item.icon}
                    </span>
                    <span>{item.id === 'research' ? 'Research & Surveys' : item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 bg-[#C5A063] text-white text-[10px] font-black rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              {studentUser ? (
                <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    onClick={() => {
                      logoutStudent();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[42px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-[0.98] transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out ({studentUser.name.split(' ')[0]})</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full min-h-[42px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-[#002147] dark:bg-[#0071E3] rounded-xl shadow-xs active:scale-[0.98] transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In with @christuniversity.in</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Spotlight Search Modal (⌘K Apple Spotlight UI) */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSearchModalOpen(false)}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white/95 dark:bg-[#121824]/95 backdrop-blur-3xl rounded-3xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.2)] overflow-hidden z-10"
            >
              {/* Search Bar Input */}
              <div className="flex items-center px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] gap-3">
                <Search className="w-5 h-5 text-[#C5A063] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, circulars, calendar, surveys..."
                  className="flex-1 bg-transparent text-sm sm:text-base outline-none text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-slate-400 border border-black/[0.05] dark:border-white/[0.08]">
                  ESC
                </span>
              </div>

              {/* Results Container */}
              <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
                
                {/* Events Section */}
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Events & Activities</span>
                    <span className="text-[10px] text-slate-400 lowercase">{filteredEvents.length} items</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          onSelectTab('events');
                          setSearchModalOpen(false);
                        }}
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.08] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#002147]/10 dark:bg-white/10 flex items-center justify-center shrink-0 text-[#002147] dark:text-[#93C5FD]">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate group-hover:text-[#002147] dark:group-hover:text-[#93C5FD] transition-colors">
                              {evt.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {evt.date} • {evt.venue}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-500 shrink-0">
                          {evt.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Circulars Section */}
                {filteredAnnouncements.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Circulars & Notices</span>
                      <span className="text-[10px] text-slate-400 lowercase">{filteredAnnouncements.length} items</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {filteredAnnouncements.map((ann) => (
                        <div
                          key={ann.id}
                          onClick={() => {
                            onSelectTab('announcements');
                            setSearchModalOpen(false);
                          }}
                          className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.08] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#C5A063]/10 flex items-center justify-center shrink-0 text-[#C5A063]">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate group-hover:text-[#002147] dark:group-hover:text-[#93C5FD] transition-colors">
                                {ann.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {ann.date} • {ann.category}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C5A063]/15 text-[#8F6F35] dark:text-[#E2C78A] shrink-0">
                            Official
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Destination Links */}
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Navigation
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <button
                      onClick={() => {
                        onSelectTab('calendar');
                        setSearchModalOpen(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.08] text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <CalendarIcon className="w-4 h-4 text-[#C5A063]" />
                      <span>Calendar</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('research');
                        setSearchModalOpen(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.08] text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-[#0071E3]" />
                      <span>Surveys & Voice</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('results');
                        setSearchModalOpen(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.08] text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-[#C5A063]" />
                      <span>Fest Results</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Spotlight Footer info */}
              <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-white/5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A063]" />
                  <span>Student Welfare Office • Bangalore Yeshwanthpur Campus</span>
                </span>
                <span className="hidden sm:inline font-mono text-[10px]">
                  Press <kbd className="px-1 py-0.5 rounded bg-black/[0.05] dark:bg-white/10 font-bold">↵</kbd> to jump
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Bottom Navigation Pill Bar */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 sm:inset-x-6 max-w-md mx-auto z-40 bg-white/90 dark:bg-[#121824]/90 backdrop-blur-2xl rounded-2xl border border-black/[0.06] dark:border-white/[0.1] shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-1.5 flex items-center justify-between gap-1">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex-1 min-h-[46px] min-w-[44px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation ${
            currentTab === 'home' 
              ? 'bg-[#002147] dark:bg-[#0071E3] text-white font-bold shadow-xs' 
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[11px] tracking-tight mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('events')}
          className={`flex-1 min-h-[46px] min-w-[44px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation ${
            currentTab === 'events' 
              ? 'bg-[#002147] dark:bg-[#0071E3] text-white font-bold shadow-xs' 
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-[11px] tracking-tight mt-0.5">Events</span>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className={`flex-1 min-h-[46px] min-w-[44px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation ${
            currentTab === 'calendar' 
              ? 'bg-[#002147] dark:bg-[#0071E3] text-white font-bold shadow-xs' 
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-[11px] tracking-tight mt-0.5">Calendar</span>
        </button>

        <button
          onClick={() => onSelectTab('research')}
          className={`flex-1 min-h-[46px] min-w-[44px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation relative ${
            currentTab === 'research' 
              ? 'bg-[#002147] dark:bg-[#0071E3] text-white font-bold shadow-xs' 
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[11px] tracking-tight mt-0.5">Surveys</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex-1 min-h-[46px] min-w-[44px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation ${
            mobileMenuOpen 
              ? 'bg-[#002147] dark:bg-[#0071E3] text-white font-bold shadow-xs' 
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[11px] tracking-tight mt-0.5">More</span>
        </button>
      </div>
    </>
  );
};
