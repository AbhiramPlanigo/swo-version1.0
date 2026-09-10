import React, { useState, useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  useNavigate, 
  useLocation, 
  Navigate 
} from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { StudentNavbar, StudentNavTab } from './components/navigation/StudentNavbar';
import { AdminSidebar, AdminNavTab } from './components/navigation/AdminSidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { ChristLoginModal } from './components/common/ChristLoginModal';
import { ChristLogo } from './components/common/ChristLogo';
import { SWOLogo } from './components/common/SWOLogo';

// Public Campus Views & Modals
import { HomeView } from './components/student/HomeView';
import { EventsView } from './components/student/EventsView';
import { CampusCalendarView } from './components/student/CampusCalendarView';
import { EventDetailsModal } from './components/student/EventDetailsModal';
import { RegistrationModal } from './components/student/RegistrationModal';
import { MyRegistrationsView } from './components/student/MyRegistrationsView';
import { AnnouncementsView } from './components/student/AnnouncementsView';
import { ResultsView } from './components/student/ResultsView';
import { CertificatesView } from './components/student/CertificatesView';
import { ProfileView } from './components/student/ProfileView';
import { ResearchSurveysView } from './components/student/ResearchSurveysView';
import { StudentFooter } from './components/student/StudentFooter';
import { TicketVerificationView } from './components/common/TicketVerificationView';

// Restricted Directorate Gateway & Admin Views
import { DirectorateGateway } from './components/admin/DirectorateGateway';
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { AdminEventsView } from './components/admin/AdminEventsView';
import { AdminRegistrationsView } from './components/admin/AdminRegistrationsView';
import { AdminAttendanceView } from './components/admin/AdminAttendanceView';
import { AdminAnnouncementsView } from './components/admin/AdminAnnouncementsView';
import { AdminResearchView } from './components/admin/AdminResearchView';
import { AdminCertificatesView } from './components/admin/AdminCertificatesView';
import { AdminCommitteesView } from './components/admin/AdminCommitteesView';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminProfileModal } from './components/admin/AdminProfileModal';

import { EventItem } from './types';
import { 
  Menu, 
  ShieldCheck, 
  ExternalLink, 
  LogOut, 
  Lock,
  Sun,
  Moon,
  Edit3,
  Upload
} from 'lucide-react';
import { MediaUploadModal } from './components/common/MediaUploadModal';

/* =========================================================================
   1. PUBLIC CAMPUS WEBSITE (DEFAULT ACCESSIBLE - NO LOGIN REQUIRED)
   ========================================================================= */
const PublicCampusLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    announcements, 
    studentUser 
  } = useApp();

  // Determine active tab from URL path or local state
  const getTabFromPath = (pathname: string): StudentNavTab => {
    if (pathname === '/events') return 'events';
    if (pathname === '/calendar') return 'calendar';
    if (pathname === '/announcements' || pathname === '/circulars') return 'announcements';
    if (pathname === '/results') return 'results';
    if (pathname === '/my-registrations' || pathname === '/tickets') return 'my-registrations';
    if (pathname === '/certificates') return 'certificates';
    if (pathname === '/research' || pathname === '/surveys') return 'research';
    if (pathname === '/profile') return 'profile';
    return 'home';
  };

  const [studentTab, setStudentTab] = useState<StudentNavTab>(() => getTabFromPath(location.pathname));

  // Sync tab when browser path changes
  useEffect(() => {
    setStudentTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabSelect = (tab: StudentNavTab) => {
    setStudentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL path accordingly
    const routeMap: Record<StudentNavTab, string> = {
      home: '/',
      events: '/events',
      calendar: '/calendar',
      announcements: '/announcements',
      results: '/results',
      'my-registrations': '/my-registrations',
      certificates: '/certificates',
      research: '/research',
      profile: '/profile',
    };
    navigate(routeMap[tab] || '/');
  };

  // Student modals state
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<EventItem | null>(null);
  const [selectedEventForRegister, setSelectedEventForRegister] = useState<EventItem | null>(null);

  // Count unread announcements for current student safely
  const unreadAnnouncementsCount = announcements.filter(
    (a) => studentUser ? !a.readBy.includes(studentUser.id) : false
  ).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-[#0B0F17] text-[#1D1D1F] dark:text-white selection:bg-[#3A5982] selection:text-white transition-colors">
      {/* Universal Institutional Navigation Header */}
      <StudentNavbar
        currentTab={studentTab}
        onSelectTab={handleTabSelect}
        unreadAnnouncementsCount={unreadAnnouncementsCount}
      />

      {/* Main Public Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {studentTab === 'home' && (
          <HomeView
            onNavigateTab={handleTabSelect}
            onNavigateToEvents={() => handleTabSelect('events')}
            onNavigateToRegistrations={() => handleTabSelect('my-registrations')}
            onNavigateToAnnouncements={() => handleTabSelect('announcements')}
            onNavigateToResults={() => handleTabSelect('results')}
            onNavigateToCertificates={() => handleTabSelect('certificates')}
            onSelectEvent={(evt) => setSelectedEventForDetails(evt)}
            onRegisterEvent={(evt) => setSelectedEventForRegister(evt)}
          />
        )}

        {studentTab === 'events' && (
          <EventsView
            onSelectEvent={(evt) => setSelectedEventForDetails(evt)}
            onRegisterEvent={(evt) => setSelectedEventForRegister(evt)}
          />
        )}

        {studentTab === 'calendar' && (
          <CampusCalendarView
            onSelectEvent={(evt) => setSelectedEventForDetails(evt)}
            onRegisterEvent={(evt) => setSelectedEventForRegister(evt)}
          />
        )}

        {studentTab === 'my-registrations' && (
          <MyRegistrationsView
            onExploreEvents={() => handleTabSelect('events')}
          />
        )}

        {studentTab === 'announcements' && (
          <AnnouncementsView />
        )}

        {studentTab === 'results' && (
          <ResultsView
            onViewCertificates={() => handleTabSelect('certificates')}
          />
        )}

        {studentTab === 'certificates' && (
          <CertificatesView
            onExploreEvents={() => handleTabSelect('events')}
          />
        )}

        {studentTab === 'research' && (
          <ResearchSurveysView />
        )}

        {studentTab === 'profile' && (
          <ProfileView />
        )}
      </main>

      {/* University Heritage & Editorial Footer */}
      <StudentFooter 
        onSelectTab={handleTabSelect} 
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEventForDetails}
        isOpen={!!selectedEventForDetails}
        onClose={() => setSelectedEventForDetails(null)}
        onRegister={(evt) => {
          setSelectedEventForDetails(null);
          setSelectedEventForRegister(evt);
        }}
        onViewTicket={() => {
          setSelectedEventForDetails(null);
          handleTabSelect('my-registrations');
        }}
      />

      {/* Registration Form Modal (Gated with Institutional @christuniversity.in Authentication) */}
      <RegistrationModal
        event={selectedEventForRegister}
        isOpen={!!selectedEventForRegister}
        onClose={() => setSelectedEventForRegister(null)}
        onRegistrationComplete={() => {
          // Handled inside modal with celebratory feedback
        }}
      />
    </div>
  );
};

/* =========================================================================
   2. RESTRICTED DIRECTORATE & SWO ADMIN PORTAL (URL-GATED: /admin)
   ========================================================================= */
const RestrictedAdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isAdminAuthenticated, 
    authenticateAdmin, 
    logoutAdmin, 
    adminUser,
    theme,
    toggleTheme
  } = useApp();

  const [adminTab, setAdminTab] = useState<AdminNavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);
  const [isAdminProfileModalOpen, setIsAdminProfileModalOpen] = useState(false);

  // Admin quick creation triggers
  const [adminOpenCreateEvent, setAdminOpenCreateEvent] = useState(false);
  const [adminOpenCreateNotice, setAdminOpenCreateNotice] = useState(false);
  const [adminMediaModalOpen, setAdminMediaModalOpen] = useState(false);
  const [adminMediaCategory, setAdminMediaCategory] = useState<'event' | 'hero' | 'poster' | 'avatar' | 'moment'>('event');

  const openAdminMediaUpload = (cat: 'event' | 'hero' | 'poster' | 'avatar' | 'moment' = 'event') => {
    setAdminMediaCategory(cat);
    setAdminMediaModalOpen(true);
  };

  // If not authenticated, require directorate credentials
  if (!isAdminAuthenticated) {
    return (
      <DirectorateGateway
        onAuthenticated={authenticateAdmin}
        onExitToPublic={() => {
          navigate('/');
          if (window.location.hash) {
            window.location.hash = '';
          }
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F7] dark:bg-[#0B0F17] text-[#1D1D1F] dark:text-white selection:bg-[#C5A063] selection:text-white transition-colors">
      {/* Admin Sidebar */}
      <div className={`${adminMobileOpen ? 'block' : 'hidden'} lg:block`}>
        <AdminSidebar
          currentTab={adminTab}
          onSelectTab={(tab) => {
            setAdminTab(tab);
            setAdminMobileOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onExitToPublic={() => {
            navigate('/');
            if (window.location.hash) {
              window.location.hash = '';
            }
          }}
        />
      </div>

      {/* Mobile backdrop for sidebar */}
      {adminMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setAdminMobileOpen(false)}
        />
      )}

      {/* Admin Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        {/* Admin Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-[#141A26]/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdminMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#1D1D1F] dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden shrink-0">
              <SWOLogo size="xs" showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#1D1D1F] dark:text-white capitalize">
                  {adminTab === 'research' ? 'Research & Surveys' : adminTab.replace('-', ' ')}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#C5A063]/15 text-[#9D7A3E] dark:text-[#E6C98F] text-[10px] font-bold border border-[#C5A063]/25 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#C5A063]" /> Restricted URL
                </span>
              </div>
              <span className="text-[10px] text-[#86868B] dark:text-slate-300 hidden sm:inline">
                Christ University Student Welfare Office • Yeshwanthpur Campus
              </span>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Dark / Light Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#16212F] dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
              title={theme === 'dark' ? 'Switch to Light (White) Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFD60A]" />
              ) : (
                <Moon className="w-4 h-4 text-[#3A5982]" />
              )}
            </button>

            {/* Direct button to open Media Asset Library */}
            <button
              type="button"
              onClick={() => openAdminMediaUpload('event')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0071E3] dark:text-blue-300 bg-[#0071E3]/10 dark:bg-blue-900/20 hover:bg-[#0071E3]/20 dark:hover:bg-blue-900/40 border border-[#0071E3]/20 transition-colors cursor-pointer shadow-2xs"
              title="Institutional Media Asset Library (Upload & Manage Banners)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>

            {/* Direct button to open Public Website */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#3A5982] dark:text-blue-300 bg-[#3A5982]/10 dark:bg-white/10 hover:bg-[#3A5982]/20 dark:hover:bg-white/20 transition-colors"
              title="Return to Public Campus Website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </button>

            {/* Admin Profile chip with edit modal trigger */}
            <button
              type="button"
              onClick={() => setIsAdminProfileModalOpen(true)}
              className="flex items-center gap-2 pl-2 border-l border-black/[0.06] dark:border-white/10 hover:opacity-85 transition-all text-left cursor-pointer group"
              title="Click to view and edit SWO Admin profile"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white dark:bg-[#1E293B] ring-1 ring-black/10 flex items-center justify-center shrink-0">
                <img
                  src={adminUser.avatar || '/swo-byc-logo.png'}
                  alt={adminUser.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/swo-byc-logo.png';
                  }}
                />
              </div>
              <div className="text-left leading-none hidden sm:block">
                <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate max-w-[120px] group-hover:text-[#0071E3] transition-colors">
                  {adminUser.name || 'SWO Admin'}
                </p>
                <span className="text-[9px] text-[#86868B] dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                  <span>SWO</span>
                  <Edit3 className="w-2.5 h-2.5 text-[#0071E3] ml-0.5 opacity-70 group-hover:opacity-100" />
                </span>
              </div>
            </button>

            {/* SWO Admin Sign Out Button */}
            <button
              onClick={() => {
                logoutAdmin();
                navigate('/');
              }}
              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Sign out of SWO Admin session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Admin View Render */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {adminTab === 'dashboard' && (
            <AdminDashboardOverview
              onNavigateTab={(tab) => setAdminTab(tab)}
              onOpenCreateEvent={() => {
                setAdminTab('events');
                setAdminOpenCreateEvent(true);
              }}
              onOpenCreateAnnouncement={() => {
                setAdminTab('announcements');
                setAdminOpenCreateNotice(true);
              }}
            />
          )}

          {adminTab === 'events' && (
            <AdminEventsView
              isCreateOpenInitially={adminOpenCreateEvent}
              onCloseCreateInitial={() => setAdminOpenCreateEvent(false)}
            />
          )}

          {adminTab === 'registrations' && (
            <AdminRegistrationsView />
          )}

          {adminTab === 'attendance' && (
            <AdminAttendanceView />
          )}

          {adminTab === 'announcements' && (
            <AdminAnnouncementsView
              isCreateOpenInitially={adminOpenCreateNotice}
              onCloseCreateInitial={() => setAdminOpenCreateNotice(false)}
            />
          )}

          {adminTab === 'research' && (
            <AdminResearchView />
          )}

          {adminTab === 'certificates' && (
            <AdminCertificatesView />
          )}

          {adminTab === 'committees' && (
            <AdminCommitteesView />
          )}

          {adminTab === 'analytics' && (
            <AdminAnalyticsView />
          )}
        </main>
      </div>

      {/* Admin Profile Modal */}
      <AdminProfileModal
        isOpen={isAdminProfileModalOpen}
        onClose={() => setIsAdminProfileModalOpen(false)}
      />

      {/* Universal Institutional Media Asset Uploader Modal */}
      <MediaUploadModal
        isOpen={adminMediaModalOpen}
        onClose={() => setAdminMediaModalOpen(false)}
        defaultCategory={adminMediaCategory}
      />
    </div>
  );
};

interface AdminErrorBoundaryProps {
  children: ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Directorate Portal Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] text-white p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#141A26] border border-white/10 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold">Directorate Portal</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.error?.message || 'Recovering Directorate interface.'}
            </p>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-full bg-[#0071E3] text-white text-xs font-bold hover:bg-blue-600 shadow-md"
              >
                Reload Portal
              </button>
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20"
              >
                Return to Campus
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CampusErrorBoundaryProps {
  children: ReactNode;
}

interface CampusErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CampusErrorBoundary extends Component<CampusErrorBoundaryProps, CampusErrorBoundaryState> {
  constructor(props: CampusErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Campus Portal Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-[#0B0F17] text-[#1D1D1F] dark:text-white p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#141A26] border border-black/[0.08] dark:border-white/10 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#C5A063]/20 text-[#C5A063] flex items-center justify-center mx-auto text-xl font-bold">
              ✦
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Student Welfare Office</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We encountered a temporary interface state while loading this section.
            </p>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-5 py-2.5 rounded-full bg-[#002147] dark:bg-[#0071E3] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-5 py-2.5 rounded-full bg-black/[0.05] dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-black/[0.08] dark:hover:bg-white/20 active:scale-95 transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =========================================================================
   3. ROOT APPLICATION WITH ROUTING & GLOBAL PROVIDERS
   ========================================================================= */
const AppRoutes: React.FC = () => {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    loginModalReason, 
    pendingSuccessCallback 
  } = useApp();
  const location = useLocation();

  // Support direct secret URL (/admin.swo.ypr) as well as hash-based URL (/#/admin.swo.ypr or #admin.swo.ypr)
  const isDirectAdminHash = 
    location.pathname === '/admin.swo.ypr' ||
    location.pathname === '/admin.swo.ypr/' ||
    location.hash === '#/admin.swo.ypr' || 
    location.hash === '#admin.swo.ypr' || 
    location.hash.startsWith('#/admin.swo.ypr') || 
    window.location.hash === '#/admin.swo.ypr' ||
    window.location.hash.startsWith('#/admin.swo.ypr') ||
    window.location.pathname === '/admin.swo.ypr' ||
    window.location.pathname === '/admin.swo.ypr/';

  return (
    <>
      {isDirectAdminHash ? (
        <AdminErrorBoundary>
          <RestrictedAdminLayout />
        </AdminErrorBoundary>
      ) : (
        <CampusErrorBoundary>
          <Routes>
            {/* Public Website Routes (No Login Required) */}
            <Route path="/" element={<PublicCampusLayout />} />
            <Route path="/events" element={<PublicCampusLayout />} />
            <Route path="/calendar" element={<PublicCampusLayout />} />
            <Route path="/announcements" element={<PublicCampusLayout />} />
            <Route path="/circulars" element={<PublicCampusLayout />} />
            <Route path="/results" element={<PublicCampusLayout />} />
            <Route path="/my-registrations" element={<PublicCampusLayout />} />
            <Route path="/tickets" element={<PublicCampusLayout />} />
            <Route path="/certificates" element={<PublicCampusLayout />} />
            <Route path="/research" element={<PublicCampusLayout />} />
            <Route path="/surveys" element={<PublicCampusLayout />} />
            <Route path="/profile" element={<PublicCampusLayout />} />

            {/* Public Verified Entry Pass Scanner Destination */}
            <Route path="/verify" element={<TicketVerificationView />} />
            <Route path="/pass/:ticketCode" element={<TicketVerificationView />} />

            {/* Restricted Secret URL for Directorate, Staff & Admin */}
            <Route
              path="/admin.swo.ypr"
              element={
                <AdminErrorBoundary>
                  <RestrictedAdminLayout />
                </AdminErrorBoundary>
              }
            />

            {/* Block / Redirect Old Admin Routes to Public Home */}
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/directorate" element={<Navigate to="/" replace />} />

            {/* Fallback to Public Homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CampusErrorBoundary>
      )}

      {/* Global Domain-Restricted Institutional Login Modal (@christuniversity.in) */}
      <ChristLoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        actionReason={loginModalReason}
        onSuccess={() => {
          if (pendingSuccessCallback) {
            pendingSuccessCallback();
          }
        }}
      />

      {/* Global Notification Toast Container */}
      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}


