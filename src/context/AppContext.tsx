import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  EventItem, 
  Registration, 
  Announcement, 
  EventResult, 
  Certificate, 
  Committee, 
  CommitteeMember,
  ResearchSurvey,
  SurveyResponse,
  StudentInquiry,
  AttendanceRecord,
  RegistrationStatus,
  CertificateType,
  CertificateTemplateId,
  CertificateSignatory,
  UserRole,
  HeroGuest,
  HeroBannerSettings,
  ShowcaseItem,
  DailyQuote,
  MediaAsset
} from '../types';
import { 
  INITIAL_STUDENT, 
  INITIAL_ADMIN, 
  INITIAL_EVENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_RESULTS, 
  INITIAL_CERTIFICATES, 
  INITIAL_COMMITTEES, 
  INITIAL_RESEARCH_SURVEYS 
} from '../data/mockData';
import { 
  registerStudentAccount, 
  authenticateStudent, 
  persistStudentProfileUpdate 
} from '../services/studentAuthService';
import { SupabaseDataService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: User | null;
  studentUser: User | null;
  adminUser: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  updateStudentProfile: (updated: Partial<User>) => void;
  updateAdminProfile: (updated: Partial<User>) => void;

  // Domain-restricted Student Auth
  isStudentAuthenticated: boolean;
  loginStudent: (email: string, name?: string, regNo?: string, department?: string) => { success: boolean; error?: string };
  signUpStudent: (params: { email: string; password: string; name: string; regNo: string; department: string }) => Promise<{ success: boolean; error?: string }>;
  signInStudent: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutStudent: () => void;

  // Dark Mode Theme (User-selectable Apple Charcoal)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Login Modal Trigger
  isLoginModalOpen: boolean;
  loginModalReason: string;
  pendingSuccessCallback: (() => void) | null;
  openLoginModal: (reason?: string, onSuccess?: () => void) => void;
  closeLoginModal: () => void;

  // Restricted Directorate / Admin Auth
  isAdminAuthenticated: boolean;
  authenticateAdmin: () => void;
  logoutAdmin: () => void;

  // Events
  events: EventItem[];
  addEvent: (event: Omit<EventItem, 'id' | 'registeredCount'>) => EventItem;
  updateEvent: (id: string, updated: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  toggleCarousel: (id: string, inCarousel: boolean, order?: number) => void;

  // Registrations
  registrations: Registration[];
  registerForEvent: (eventId: string, customAnswers?: Record<string, string>) => { success: boolean; registration?: Registration; message?: string };
  cancelRegistration: (registrationId: string) => void;
  updateRegistrationStatus: (id: string, status: RegistrationStatus) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  markAttendance: (
    eventIdOrCode: string,
    studentIdOrEventId?: string,
    method?: 'QR' | 'Manual' | 'Bulk'
  ) => {
    success: boolean;
    message: string;
    record?: AttendanceRecord;
    registration?: Registration;
  };
  unmarkAttendance: (attendanceId: string) => void;
  bulkMarkAttendance: (eventId: string) => number;
  registerSpotAttendee: (
    eventId: string,
    student: { name: string; regNo: string; dept: string; email?: string; role?: string }
  ) => { success: boolean; registration?: Registration; message: string };

  // Announcements
  announcements: Announcement[];
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'readBy' | 'date' | 'authorName' | 'authorRole'>) => void;
  addAnnouncement: (announcement: any) => void;
  toggleAnnouncementPin: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;
  markAnnouncementAsRead: (id: string) => void;
  markAllAnnouncementsAsRead: () => void;
  deleteAnnouncement: (id: string) => void;

  // Certificates
  certificates: Certificate[];
  issueCertificate: (cert: Omit<Certificate, 'id' | 'certificateNo' | 'qrVerifyCode' | 'issuedDate'>) => Certificate;
  bulkIssueCertificatesForEvent: (eventId: string, type: CertificateType) => number;
  bulkGenerateCertificates: (
    eventId: string,
    type: CertificateType,
    authorizedBy?: string,
    designation?: string,
    templateId?: CertificateTemplateId,
    signatories?: CertificateSignatory[],
    citationText?: string,
    customMetadata?: {
      universityTitle?: string;
      campusSubtitle?: string;
      officeSubtitle?: string;
      certificateHeading?: string;
      conferralLine?: string;
      verificationBadgeText?: string;
    }
  ) => number;

  // Results
  results: EventResult[];

  // Committees
  committees: Committee[];
  addCommitteeMember: (committeeId: string, member: { name: string; role: string; regNo: string; department: string; email: string; phone?: string; avatar?: string; assignedEvents?: string[] }) => void;
  removeCommitteeMember: (committeeId: string, memberId: string) => void;
  updateCommittee: (committeeId: string, updates: Partial<Committee>) => void;
  createCommittee: (committee: Omit<Committee, 'id' | 'memberCount' | 'members' | 'activeEventsCount'>) => Committee;
  deleteCommittee: (committeeId: string) => void;

  // Research Surveys & Inquiries
  surveys: ResearchSurvey[];
  researchSurveys: ResearchSurvey[];
  surveyResponses: SurveyResponse[];
  studentInquiries: StudentInquiry[];
  submitSurveyResponse: (surveyId: string, answers: Record<string, string | number>, feedbackText?: string) => void;
  createSurvey: (survey: Omit<ResearchSurvey, 'id' | 'responsesCount' | 'status'>) => void;
  addResearchSurvey: (survey: ResearchSurvey) => void;
  submitStudentInquiry: (inquiry: Omit<StudentInquiry, 'id' | 'submittedAt' | 'status'>) => void;
  updateStudentInquiryStatus: (id: string, status: 'Received' | 'Reviewed' | 'Incorporated', adminResponse?: string) => void;
  deleteStudentInquiry: (id: string) => void;
  deleteSurvey: (id: string) => void;

  // Hero Banner & Flagship Showcase Management
  heroSettings: HeroBannerSettings;
  updateHeroSettings: (updated: Partial<HeroBannerSettings>) => void;
  resetHeroSettings: () => void;
  showcaseItems: ShowcaseItem[];
  updateShowcaseItem: (id: string, updated: Partial<ShowcaseItem>) => void;
  addShowcaseItem: (custom?: Partial<ShowcaseItem>) => ShowcaseItem;
  deleteShowcaseItem: (id: string) => boolean;
  resetShowcaseItems: () => void;

  // Daily Inspiration & Quote of the Day
  dailyQuote: DailyQuote;
  updateDailyQuote: (updated: Partial<DailyQuote>) => void;

  // Institutional Media Asset Library
  savedMediaAssets: MediaAsset[];
  saveMediaAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => MediaAsset;
  deleteMediaAsset: (id: string) => void;

  // UI Toast
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

export const INITIAL_DAILY_QUOTE: DailyQuote = {
  id: 'quote-today',
  quote: 'Knowledge illuminates the intellect, but selfless service sanctifies the heart. Walk with courage, lead with empathy, and elevate every space you enter.',
  author: 'St. Kuriakose Elias Chavara',
  authorTitle: 'Founder Patron of Christ Institutions & Educational Visionary',
  date: 'Tuesday, September 08, 2026',
  category: 'Wisdom & Leadership',
  postedBy: 'Directorate of Student Welfare',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SAVED_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media_christ_aerial',
    url: '/assets/christ-yeshwanthpur-campus.jpg',
    name: 'Christ University Yeshwanthpur Campus - Aerial Panoramic',
    category: 'hero',
    ratio: '21:9',
    dimensions: '2560 × 1080 px',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'media_conclave_banner',
    url: '/assets/christ-yeshwanthpur-campus.jpg',
    name: 'National AI & Robotics Conclave 2026 - Main Banner',
    category: 'event',
    ratio: '16:9',
    dimensions: '1920 × 1080 px',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'talk-series',
    tabLabel: 'Talk Series',
    tabEmoji: '🎙️',
    badge: 'STUDENT WELFARE TALK SERIES • FLAGSHIP INAUGURAL',
    title: 'TALK SERIES COMING SOON',
    subtitle: 'Distinguished Voices & Vanguard Leadership at Yeshwanthpur',
    description: 'An intellectually charged semester dialogue uniting pioneering technologists, public policy changemakers, and visionary leaders with the vibrant student community of Christ University.',
    date: 'Friday, September 18, 2026',
    time: '03:30 PM – 06:00 PM IST',
    venue: 'Main University Auditorium • Tier 1 & 2',
    locationBadge: 'Main Auditorium • Central Campus',
    speakers: [
      {
        id: 'spk-1',
        name: 'Dr. Aarav Nambiar',
        role: 'Chief AI Architect & Fellow',
        org: 'DeepMind Research Lab',
        avatar: 'https://farm66.staticflickr.com/65535/53600439267_de66a73a92_b.jpg'
      },
      {
        id: 'spk-2',
        name: 'Prof. Maya Sengupta',
        role: 'Director of Cyber Ethics',
        org: 'Global Policy Council',
        avatar: 'https://farm66.staticflickr.com/65535/54775630968_3b1b6f2374_b.jpg'
      },
      {
        id: 'spk-3',
        name: 'Kavita Sundaram',
        role: 'VP Emerging Tech',
        org: 'QuantumCore Labs',
        avatar: 'https://farm66.staticflickr.com/65535/53882241965_c4806b8f4c_b.jpg'
      }
    ],
    accentColor: '#C5A063',
    bgImage: '/assets/christ-yeshwanthpur-campus.jpg',
    tags: ['Christ University Exclusive', 'Official SWO Accredited', 'OD Granted'],
    gradient: 'from-[#0A192F] via-[#1E3A5F] to-[#0A1118]',
    isFlagship: true
  },
  {
    id: 'quantum-tech',
    tabLabel: 'AI Conclave',
    tabEmoji: '⚡',
    badge: 'GEN-AI & QUANTUM CONCLAVE 2026',
    title: 'THE NEXT COGNITIVE EPOCH',
    subtitle: 'Autonomous Systems, Neural Architecture & Student Moonshots',
    description: 'A 2-day national symposium featuring live prototype demonstrations, enterprise sandbox workshops, and student research paper showcases at Christ University Yeshwanthpur Campus.',
    date: 'October 04–05, 2026',
    time: '09:00 AM – 05:30 PM IST',
    venue: 'Executive Seminar Conclave • Block B',
    locationBadge: 'Executive Seminar Conclave • Stage Flow / Block B',
    speakers: [
      {
        id: 'spk-qt-1',
        name: 'Kavita Sundaram',
        role: 'VP Emerging Tech',
        org: 'QuantumCore Labs',
        avatar: 'https://farm66.staticflickr.com/65535/54209785099_45d2370a1e_b.jpg'
      },
      {
        id: 'spk-qt-2',
        name: 'Dr. Aarav Nambiar',
        role: 'Chief AI Architect & Fellow',
        org: 'DeepMind Research Lab',
        avatar: 'https://farm66.staticflickr.com/65535/53600439267_de66a73a92_b.jpg'
      }
    ],
    tags: ['Tech Horizon', 'Hands-on Labs', 'Certificate Included'],
    gradient: 'from-[#111827] via-[#1E3A8A] to-[#030712]',
    accentColor: '#60A5FA',
    bgImage: '/assets/christ-yeshwanthpur-campus.jpg',
    isFlagship: false
  },
  {
    id: 'darpan-fest',
    tabLabel: 'Darpan Fest',
    tabEmoji: '🎭',
    badge: 'INTER-COLLEGIATE CULTURAL ODYSSEY',
    title: 'DARPAN 2026: UNBOUNDED',
    subtitle: 'Celebrating Music, Dance, Theatre & Creative Expression',
    description: 'Over 40 competitive collegiate categories, celebrity jury panels, and massive evening acoustic concerts celebrating the spirit of youth at Bangalore Yeshwanthpur Campus.',
    date: 'October 24–27, 2026',
    time: '10:00 AM – 09:00 PM IST',
    venue: 'Open-Air Amphitheatre & Quadrangle',
    locationBadge: 'Open-Air Amphitheatre • Main Quadrangle',
    speakers: [
      {
        id: 'spk-df-1',
        name: 'University Choir Ensemble',
        role: 'Keynote Symphony',
        org: 'Christ Music Conservatory',
        avatar: 'https://farm66.staticflickr.com/65535/54979528973_772fec7f07_b.jpg'
      },
      {
        id: 'spk-df-2',
        name: 'Siddharth Rao',
        role: 'Guest Music Producer & Alumnus',
        org: 'SoundWave Studios',
        avatar: 'https://farm66.staticflickr.com/65535/53188337164_f346df7a8f_b.jpg'
      }
    ],
    tags: ['University Mega Fest', '40+ Trophies', 'Evening Concerts'],
    gradient: 'from-[#1A102F] via-[#4C1D95] to-[#0F081D]',
    accentColor: '#F59E0B',
    bgImage: '/assets/christ-yeshwanthpur-campus.jpg',
    isFlagship: false
  }
];

export const INITIAL_HERO_SETTINGS: HeroBannerSettings = {
  ...DEFAULT_SHOWCASE_ITEMS[0],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage helpers
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`cu_swo_${key}`);
      if (!item) return fallback;
      // Auto-migrate away from any old stock placeholders or stale mock data
      if (
        key !== 'showcase_items' &&
        key !== 'hero_settings' &&
        (item.includes('unsplash.com') ||
          item.includes('flickr.com') ||
          item.includes('53601520593') ||
          item.includes('53188337164') ||
          item.includes('evt_01') ||
          item.includes('evt_02') ||
          item.includes('reg_01') ||
          item.includes('cert_01') ||
          item.includes('+91 98450 12890') ||
          item.includes('Aarav Sharma'))
      ) {
        localStorage.removeItem(`cu_swo_${key}`);
        return fallback;
      }
      const parsed = JSON.parse(item);
      // Extra sanitation for student_user: if avatar or phone is mock, clean them
      if (key === 'student_user' && parsed && typeof parsed === 'object') {
        if (parsed.avatar && (parsed.avatar.includes('flickr.com') || parsed.avatar.includes('unsplash.com'))) {
          parsed.avatar = '';
        }
        if (parsed.phone === '+91 98450 12890') {
          parsed.phone = '';
        }
        if (parsed.year === '2nd Year (Semester 4)') {
          parsed.year = '';
        }
      }
      // Extra sanitation for committees: clean out mock members & reset stale mock coordinators
      if (key === 'committees' && Array.isArray(parsed)) {
        const mockCoordinators = ['Dr. Arya Sen', 'Prof. Rajesh Nair', 'Dr. Mathew K. Varghese', 'Dr. Sunita Rao', 'Dr. Anitakurup'];
        return parsed.map((comm: any) => ({
          ...comm,
          facultyCoordinator: mockCoordinators.includes(comm.facultyCoordinator) ? '' : (comm.facultyCoordinator || ''),
          leadName: comm.leadName?.startsWith('SWO ') ? '' : (comm.leadName || ''),
          deputyName: comm.deputyName?.startsWith('Student ') ? '' : (comm.deputyName || ''),
          members: Array.isArray(comm.members) 
            ? comm.members.filter((m: any) => m.regNo !== '2447101' && m.name !== 'Aarav Sharma')
            : [],
        })) as unknown as T;
      }
      return parsed;
    } catch {
      return fallback;
    }
  };

  const setStored = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(`cu_swo_${key}`, JSON.stringify(value));
    } catch {
      // storage quota or private mode fallback
    }
  };

  // Public by default: studentUser starts as null unless previously signed in
  const [studentUser, setStudentUser] = useState<User | null>(() => getStored<User | null>('student_user', null));
  const [adminUser, setAdminUserState] = useState<User>(() => getStored<User>('admin_user', INITIAL_ADMIN));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => getStored('active_role', 'student'));
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => getStored('admin_auth', false));

  // Apple-style Dark Mode & White Mode Theme State
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('cu_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // fallback
    }
    return 'light';
  });

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('cu_theme_mode', next);
      } catch {}
      return next;
    });
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('cu_theme_mode', newTheme);
    } catch {}
  };

  // Synchronize dark class and background color on html/body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        document.body.style.backgroundColor = '#0B0F17';
        document.body.style.color = '#F8FAFC';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        document.body.style.backgroundColor = '#F8FAFC';
        document.body.style.color = '#16212F';
      }
    }
  }, [theme]);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState('Sign in with your official Christ University institutional email to continue.');
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);

  const isStudentAuthenticated = !!studentUser;
  const currentUser = currentRole === 'student' ? studentUser : adminUser;

  const [events, setEvents] = useState<EventItem[]>(() => getStored('events', INITIAL_EVENTS));
  const [registrations, setRegistrations] = useState<Registration[]>(() => getStored('registrations', INITIAL_REGISTRATIONS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const deletedAnnIds = getStored<string[]>('deleted_announcement_ids', []);
    const stored = getStored<Announcement[] | null>('announcements', null);
    if (stored !== null && Array.isArray(stored)) {
      return stored.filter((a) => !deletedAnnIds.includes(a.id));
    }
    return INITIAL_ANNOUNCEMENTS.filter((a) => !deletedAnnIds.includes(a.id));
  });
  const [certificates, setCertificates] = useState<Certificate[]>(() => getStored('certificates', INITIAL_CERTIFICATES));
  const [results] = useState<EventResult[]>(INITIAL_RESULTS);
  const [committees, setCommittees] = useState<Committee[]>(() => getStored('committees', INITIAL_COMMITTEES));
  const [surveys, setSurveys] = useState<ResearchSurvey[]>(() => {
    const deletedIds = getStored<string[]>('deleted_survey_ids', []);
    const stored = getStored<ResearchSurvey[] | null>('surveys', null);
    if (stored !== null && Array.isArray(stored)) {
      return stored.filter((s) => !deletedIds.includes(s.id));
    }
    return INITIAL_RESEARCH_SURVEYS.filter((s) => !deletedIds.includes(s.id));
  });
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(() => getStored('survey_responses', []));
  const [studentInquiries, setStudentInquiries] = useState<StudentInquiry[]>(() => getStored('student_inquiries', []));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => getStored('attendance', []));
  const [heroSettings, setHeroSettings] = useState<HeroBannerSettings>(() => getStored('hero_settings', INITIAL_HERO_SETTINGS));
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>(() => {
    const deletedIds = getStored<string[]>('deleted_showcase_ids', []);
    const stored = getStored<ShowcaseItem[] | null>('showcase_items', null);
    if (stored && Array.isArray(stored)) {
      const active = stored.filter((s) => !deletedIds.includes(s.id));
      if (active.length > 0) return active;
    }
    const defaultActive = DEFAULT_SHOWCASE_ITEMS.filter((s) => !deletedIds.includes(s.id));
    return defaultActive.length > 0 ? defaultActive : [DEFAULT_SHOWCASE_ITEMS[0]];
  });
  const [savedMediaAssets, setSavedMediaAssets] = useState<MediaAsset[]>(() => {
    const stored = getStored<MediaAsset[] | null>('saved_media_assets', null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
    return DEFAULT_SAVED_MEDIA_ASSETS;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => { setStored('student_user', studentUser); }, [studentUser]);
  useEffect(() => { setStored('active_role', currentRole); }, [currentRole]);
  useEffect(() => { setStored('admin_auth', isAdminAuthenticated); }, [isAdminAuthenticated]);
  useEffect(() => { setStored('events', events); }, [events]);
  useEffect(() => { setStored('registrations', registrations); }, [registrations]);
  useEffect(() => { setStored('announcements', announcements); }, [announcements]);
  useEffect(() => { setStored('certificates', certificates); }, [certificates]);
  useEffect(() => { setStored('committees', committees); }, [committees]);
  useEffect(() => { setStored('saved_media_assets', savedMediaAssets); }, [savedMediaAssets]);
  useEffect(() => { setStored('surveys', surveys); }, [surveys]);
  useEffect(() => { setStored('survey_responses', surveyResponses); }, [surveyResponses]);
  useEffect(() => { setStored('student_inquiries', studentInquiries); }, [studentInquiries]);
  useEffect(() => { setStored('attendance', attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { setStored('hero_settings', heroSettings); }, [heroSettings]);
  useEffect(() => { setStored('showcase_items', showcaseItems); }, [showcaseItems]);

  // Quote of the Day State
  const [dailyQuote, setDailyQuote] = useState<DailyQuote>(() => getStored('daily_quote', INITIAL_DAILY_QUOTE));
  useEffect(() => { setStored('daily_quote', dailyQuote); }, [dailyQuote]);

  // Initial Sync from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    const fetchCloudData = async () => {
      try {
        const [
          remoteEvents,
          remoteRegs,
          remoteAtt,
          remoteAnn,
          remoteCerts,
          remoteComms,
          remoteSurv,
          remoteHero,
          remoteQuote,
          remoteShowcases,
          remoteInquiries,
        ] = await Promise.all([
          SupabaseDataService.fetchEvents(),
          SupabaseDataService.fetchRegistrations(),
          SupabaseDataService.fetchAttendance(),
          SupabaseDataService.fetchAnnouncements(),
          SupabaseDataService.fetchCertificates(),
          SupabaseDataService.fetchCommittees(),
          SupabaseDataService.fetchSurveys(),
          SupabaseDataService.fetchHeroSettings(),
          SupabaseDataService.fetchDailyQuote(),
          SupabaseDataService.fetchShowcaseItems(),
          SupabaseDataService.fetchInquiries(),
        ]);

        if (!isMounted) return;

        if (remoteEvents !== null) setEvents(remoteEvents);
        if (remoteRegs !== null) setRegistrations(remoteRegs);
        if (remoteAtt !== null) setAttendanceRecords(remoteAtt);
        if (remoteAnn !== null) {
          const deletedAnnIds = getStored<string[]>('deleted_announcement_ids', []);
          setAnnouncements(remoteAnn.filter((a) => !deletedAnnIds.includes(a.id)));
        }
        if (remoteCerts !== null) setCertificates(remoteCerts);
        if (remoteComms !== null && remoteComms.length > 0) setCommittees(remoteComms);
        if (remoteSurv !== null) {
          const deletedIds = getStored<string[]>('deleted_survey_ids', []);
          setSurveys(remoteSurv.filter((s) => !deletedIds.includes(s.id)));
        }
        if (remoteShowcases !== null) {
          const deletedShowcaseIds = getStored<string[]>('deleted_showcase_ids', []);
          const activeShowcases = remoteShowcases.filter((s) => !deletedShowcaseIds.includes(s.id));
          if (activeShowcases.length > 0) {
            setShowcaseItems(activeShowcases);
            setStored('showcase_items', activeShowcases);
            if (activeShowcases[0]) {
              setHeroSettings(activeShowcases[0]);
            }
          }
        }
        if (remoteInquiries !== null && remoteInquiries.length > 0) {
          setStudentInquiries(remoteInquiries);
          setStored('student_inquiries', remoteInquiries);
        }
        if (remoteHero) setHeroSettings(remoteHero);
        if (remoteQuote) setDailyQuote(remoteQuote);
      } catch (err) {
        console.warn('[SWO Portal] Supabase live sync encountered an error:', err);
      }
    };

    fetchCloudData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateDailyQuote = (updated: Partial<DailyQuote>) => {
    setDailyQuote((prev) => {
      const next = {
        ...prev,
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      setStored('daily_quote', next);
      SupabaseDataService.updateDailyQuote(next);
      return next;
    });
    showToast('Quote of the Day Updated', 'Today\'s quote has been published live to the public homepage.', 'success');
  };

  const updateHeroSettings = (updated: Partial<HeroBannerSettings>) => {
    setHeroSettings((prev) => {
      const next = { ...prev, ...updated };
      setStored('hero_settings', next);
      SupabaseDataService.updateHeroSettings(next);
      return next;
    });
    setShowcaseItems((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.map((item, idx) => (idx === 0 ? { ...item, ...updated } : item));
      setStored('showcase_items', next);
      return next;
    });
    showToast('Featured Showcase Updated', 'Homepage hero banner, dates, and guests have been updated live.', 'success');
  };

  const resetHeroSettings = () => {
    setHeroSettings(INITIAL_HERO_SETTINGS);
    setStored('hero_settings', INITIAL_HERO_SETTINGS);
    SupabaseDataService.updateHeroSettings(INITIAL_HERO_SETTINGS);
    showToast('Showcase Reset', 'Reverted to default Talk Series flagship configuration.', 'info');
  };

  const updateShowcaseItem = (id: string, updated: Partial<ShowcaseItem>) => {
    let targetItem: ShowcaseItem | null = null;
    let targetIndex = 0;
    setShowcaseItems((prev) => {
      const next = prev.map((item, idx) => {
        if (item.id === id) {
          targetItem = { ...item, ...updated };
          targetIndex = idx;
          return targetItem;
        }
        return item;
      });
      setStored('showcase_items', next);
      if (next.length > 0 && next[0].id === id) {
        setHeroSettings({ ...next[0] });
        setStored('hero_settings', next[0]);
        SupabaseDataService.updateHeroSettings(next[0]);
      }
      return next;
    });
    if (targetItem) {
      SupabaseDataService.upsertShowcaseItem(targetItem, targetIndex);
    }
    showToast('Showcase Updated', 'Changes have been published live to the homepage hero.', 'success');
  };

  const addShowcaseItem = (custom?: Partial<ShowcaseItem>): ShowcaseItem => {
    const newItem: ShowcaseItem = {
      id: 'showcase-' + Date.now(),
      tabLabel: custom?.tabLabel || 'New Showcase',
      tabEmoji: custom?.tabEmoji || '🌟',
      badge: custom?.badge || 'STUDENT WELFARE SPECIAL SHOWCASE 2026',
      title: custom?.title || 'FLAGSHIP CAMPUS EXPERIENCE',
      subtitle: custom?.subtitle || 'Celebrating Innovation, Arts & Leadership at Christ University',
      description: custom?.description || 'A landmark campus gathering bringing together distinguished thinkers, student innovators, and faculty mentors.',
      date: custom?.date || 'Saturday, October 10, 2026',
      time: custom?.time || '10:00 AM – 04:30 PM IST',
      venue: custom?.venue || 'Main University Auditorium • Tier 1',
      locationBadge: custom?.locationBadge || 'Main Auditorium • Campus Stage',
      speakers: custom?.speakers || [],
      accentColor: custom?.accentColor || '#C5A063',
      bgImage: custom?.bgImage || '/assets/christ-yeshwanthpur-campus.jpg',
      tags: custom?.tags || ['Christ University Exclusive', 'OD Granted'],
      isFlagship: false,
      ...custom,
    };
    setShowcaseItems((prev) => {
      const next = [...prev, newItem];
      setStored('showcase_items', next);
      SupabaseDataService.upsertShowcaseItem(newItem, next.length - 1);
      return next;
    });
    showToast('Showcase Added', `"${newItem.tabLabel}" has been added to homepage hero options.`, 'success');
    return newItem;
  };

  const deleteShowcaseItem = (id: string): boolean => {
    if (showcaseItems.length <= 1) {
      showToast('Cannot Delete', 'At least one showcase event must remain active.', 'warning');
      return false;
    }
    const itemToDelete = showcaseItems.find((s) => s.id === id);

    // Track deleted IDs in local storage so mock defaults never resurface them
    const deletedIds = getStored<string[]>('deleted_showcase_ids', []);
    const aliasMap: Record<string, string[]> = {
      'darpan-fest': ['darpan-fest', 'showcase_darpan'],
      'showcase_darpan': ['darpan-fest', 'showcase_darpan'],
      'talk-series': ['talk-series', 'showcase_talkseries'],
      'showcase_talkseries': ['talk-series', 'showcase_talkseries'],
      'quantum-tech': ['quantum-tech', 'showcase_ai_conclave'],
      'showcase_ai_conclave': ['quantum-tech', 'showcase_ai_conclave'],
    };
    const toAdd = aliasMap[id] || [id];
    const nextDeletedIds = Array.from(new Set([...deletedIds, ...toAdd]));
    setStored('deleted_showcase_ids', nextDeletedIds);

    // Remove from Supabase database
    SupabaseDataService.deleteShowcaseItem(id);

    setShowcaseItems((prev) => {
      const next = prev.filter((item) => item.id !== id && !toAdd.includes(item.id));
      setStored('showcase_items', next);
      if (next[0]) {
        setHeroSettings({ ...next[0] });
        setStored('hero_settings', next[0]);
        SupabaseDataService.updateHeroSettings(next[0]);
      }
      return next;
    });
    showToast('Showcase Removed', `"${itemToDelete?.tabLabel || 'Event'}" has been deleted.`, 'info');
    return true;
  };

  const resetShowcaseItems = () => {
    setStored('deleted_showcase_ids', []);
    setShowcaseItems(DEFAULT_SHOWCASE_ITEMS);
    setStored('showcase_items', DEFAULT_SHOWCASE_ITEMS);
    setHeroSettings(DEFAULT_SHOWCASE_ITEMS[0]);
    setStored('hero_settings', DEFAULT_SHOWCASE_ITEMS[0]);
    SupabaseDataService.updateHeroSettings(DEFAULT_SHOWCASE_ITEMS[0]);
    SupabaseDataService.bulkSyncShowcaseItems(DEFAULT_SHOWCASE_ITEMS);
    showToast('Showcase Reset', 'Reverted all showcase items to institutional defaults.', 'info');
  };

  const saveMediaAsset = (asset: Omit<MediaAsset, 'id' | 'createdAt'>): MediaAsset => {
    const newAsset: MediaAsset = {
      ...asset,
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    setSavedMediaAssets((prev) => [newAsset, ...prev]);
    showToast('Media Asset Saved', `"${newAsset.name}" was saved to your institutional library.`, 'success');
    return newAsset;
  };

  const deleteMediaAsset = (id: string) => {
    setSavedMediaAssets((prev) => prev.filter((a) => a.id !== id));
    showToast('Asset Removed', 'The asset was deleted from your institutional library.', 'info');
  };

  // Toast System
  const showToast = (title: string, description?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openLoginModal = (reason?: string, onSuccess?: () => void) => {
    if (reason) setLoginModalReason(reason);
    if (onSuccess) {
      setPendingSuccessCallback(() => onSuccess);
    } else {
      setPendingSuccessCallback(null);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingSuccessCallback(null);
  };

  const loginStudent = (
    email: string,
    name?: string,
    regNo?: string,
    department?: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Institutional email is required.' };
    }

    const hasChristDomain = cleanEmail.includes('@christuniversity.in') || cleanEmail.includes('christuniversity.in');
    if (!hasChristDomain) {
      return {
        success: false,
        error: 'Access Restricted: Your email must contain @christuniversity.in (e.g. name@christuniversity.in or name@dept@christuniversity.in).'
      };
    }

    if (!name?.trim()) {
      return { success: false, error: 'Student Full Name is required to sign in.' };
    }

    if (!regNo?.trim()) {
      return { success: false, error: 'Registration Number is required to sign in.' };
    }

    const studentName = name.trim();
    const studentRegNo = regNo.trim();
    const defaultDept = department ? department.trim() : '';

    const newStudent: User = {
      id: 'usr_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      name: studentName,
      role: 'student',
      regNo: studentRegNo,
      department: defaultDept,
      year: '',
      campus: 'Yeshwanthpur Campus, Bengaluru',
      email: cleanEmail,
      phone: '',
      avatar: '',
    };

    setStudentUser(newStudent);
    showToast('Signed In', `Welcome back, ${studentName}.`, 'success');

    if (pendingSuccessCallback) {
      setTimeout(() => {
        pendingSuccessCallback();
        setPendingSuccessCallback(null);
      }, 150);
    }

    return { success: true };
  };

  const signUpStudent = async (params: {
    email: string;
    password: string;
    name: string;
    regNo: string;
    department: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const result = await registerStudentAccount(params);
    if (!result.success || !result.user) {
      return { success: false, error: result.error || 'Failed to register student account.' };
    }

    setStudentUser(result.user);
    showToast('Account Created 🎉', `Welcome to SWO, ${result.user.name}.`, 'success');

    if (pendingSuccessCallback) {
      setTimeout(() => {
        pendingSuccessCallback();
        setPendingSuccessCallback(null);
      }, 150);
    }

    return { success: true };
  };

  const signInStudent = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await authenticateStudent(email, password);
    if (!result.success || !result.user) {
      return { success: false, error: result.error || 'Authentication failed.' };
    }

    setStudentUser(result.user);
    showToast('Signed In Successfully', `Welcome back, ${result.user.name}.`, 'success');

    if (pendingSuccessCallback) {
      setTimeout(() => {
        pendingSuccessCallback();
        setPendingSuccessCallback(null);
      }, 150);
    }

    return { success: true };
  };

  const logoutStudent = () => {
    setStudentUser(null);
    localStorage.removeItem('cu_swo_student_user');
    showToast('Signed Out', 'You are now browsing the public campus website.', 'info');
  };

  const authenticateAdmin = () => {
    setIsAdminAuthenticated(true);
    setStored('admin_auth', true);
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setStored('admin_auth', false);
    showToast('SWO Admin Signed Out', 'Returned to public university session.', 'info');
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    showToast(
      role === 'student' ? 'Switched to Public View' : 'Switched to SWO Admin Dashboard',
      role === 'student' ? (studentUser ? `Logged in as ${studentUser.name}` : 'Public Campus Explorer') : `Logged in as ${adminUser.name}`,
      'info'
    );
  };

  const updateStudentProfile = (updated: Partial<User>) => {
    if (!studentUser) return;
    const next = { ...studentUser, ...updated };
    setStudentUser(next);
    setStored('student_user', next);
    persistStudentProfileUpdate(next);
    showToast('Profile Updated', 'Your student details have been saved successfully.', 'success');
  };

  const updateAdminProfile = (updated: Partial<User>) => {
    setAdminUserState((prev) => {
      const next = { ...prev, ...updated };
      setStored('admin_user', next);
      return next;
    });
    showToast('Profile Updated', 'SWO Admin details have been saved.', 'success');
  };

  // Event Handlers
  const addEvent = (eventData: Omit<EventItem, 'id' | 'registeredCount'>): EventItem => {
    const newId = 'evt_' + Date.now().toString(36);
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      registeredCount: 0,
    };
    setEvents((prev) => [newEvent, ...prev]);
    SupabaseDataService.upsertEvent(newEvent);
    showToast('Event Created', `"${newEvent.title}" was successfully created and published.`, 'success');
    return newEvent;
  };

  const updateEvent = (id: string, updated: Partial<EventItem>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    if (updated.requiresQrPass !== undefined) {
      setRegistrations((prev) =>
        prev.map((r) => (r.eventId === id ? { ...r, requiresQrPass: updated.requiresQrPass } : r))
      );
      SupabaseDataService.updateRegistrationsForEvent(id, { requires_qr_pass: updated.requiresQrPass });
    }
    SupabaseDataService.updateEvent(id, updated);
    showToast('Event Updated', 'Changes were saved successfully.', 'success');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    SupabaseDataService.deleteEvent(id);
    showToast('Event Deleted', 'The event has been removed from the schedule.', 'info');
  };

  const toggleCarousel = (id: string, inCarousel: boolean, order?: number) => {
    const resolvedOrder = order !== undefined ? order : 1;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            inCarousel,
            carouselOrder: resolvedOrder,
          };
        }
        return e;
      })
    );
    SupabaseDataService.updateEvent(id, { inCarousel, carouselOrder: resolvedOrder });
    showToast('Carousel Updated', inCarousel ? 'Banner added to homepage carousel.' : 'Banner removed from homepage carousel.', 'info');
  };

  // Registration Handlers
  const registerForEvent = (eventId: string, customAnswers?: Record<string, string>) => {
    if (!studentUser) {
      return { 
        success: false, 
        message: 'Institutional login required: Please sign in with your @christuniversity.in account to register.' 
      };
    }

    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Event not found.' };

    // Check if already registered
    const alreadyRegistered = registrations.some(
      (r) => r.eventId === eventId && r.studentId === studentUser.id && r.status !== 'Cancelled'
    );
    if (alreadyRegistered) {
      return { success: false, message: 'You are already registered for this event.' };
    }

    // Capacity check for waitlist
    const isFull = targetEvent.registeredCount >= targetEvent.capacity;
    const status: RegistrationStatus = isFull ? 'Waitlisted' : 'Registered';
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const ticketCode = `SWO-${targetEvent.category.substring(0, 4).toUpperCase()}-${studentUser.regNo}-${randCode}`;

    const requiresQrPass = targetEvent.requiresQrPass !== false;

    const newReg: Registration = {
      id: 'reg_' + Date.now().toString(36),
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      eventTime: targetEvent.time,
      eventVenue: targetEvent.venue,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentRegNo: studentUser.regNo,
      studentEmail: studentUser.email,
      studentDept: studentUser.department,
      studentYear: studentUser.year,
      registeredAt: new Date().toISOString(),
      status,
      customAnswers,
      ticketCode,
      requiresQrPass,
    };

    setRegistrations((prev) => [newReg, ...prev]);

    // Update count on event
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e))
    );

    // Persist to Supabase
    SupabaseDataService.insertRegistration(newReg);
    SupabaseDataService.updateEvent(eventId, { registeredCount: targetEvent.registeredCount + 1 });

    showToast(
      isFull ? 'Added to Waitlist' : 'Registration Confirmed! 🎉',
      requiresQrPass
        ? `You are ${status.toLowerCase()} for "${targetEvent.title}". Ticket: ${ticketCode}`
        : `You are registered for "${targetEvent.title}". Open entry — please present your student ID at the venue.`,
      'success'
    );

    return { success: true, registration: newReg };
  };

  const cancelRegistration = (registrationId: string) => {
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return;

    setRegistrations((prev) =>
      prev.map((r) => (r.id === registrationId ? { ...r, status: 'Cancelled' as RegistrationStatus } : r))
    );

    // Reduce event count
    setEvents((prev) =>
      prev.map((e) => (e.id === reg.eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e))
    );

    // Persist to Supabase
    SupabaseDataService.updateRegistrationStatus(registrationId, 'Cancelled');
    const targetEvent = events.find((e) => e.id === reg.eventId);
    if (targetEvent) {
      SupabaseDataService.updateEvent(reg.eventId, { registeredCount: Math.max(0, targetEvent.registeredCount - 1) });
    }

    showToast('Registration Cancelled', `Cancelled registration for "${reg.eventTitle}".`, 'info');
  };

  const updateRegistrationStatus = (id: string, status: RegistrationStatus) => {
    setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    SupabaseDataService.updateRegistrationStatus(id, status);
    showToast('Status Updated', `Registration status updated to ${status}.`, 'info');
  };

  // Attendance Handlers
  const markAttendance = (
    eventIdOrCode: string,
    studentIdOrEventId?: string,
    method: 'QR' | 'Manual' | 'Bulk' = 'Manual'
  ) => {
    let resolvedEventId = '';
    let searchToken = '';

    // Determine if first param is eventId or ticket/student code
    if (events.some((e) => e.id === eventIdOrCode)) {
      resolvedEventId = eventIdOrCode;
      searchToken = studentIdOrEventId?.trim() || '';
    } else if (studentIdOrEventId && events.some((e) => e.id === studentIdOrEventId)) {
      resolvedEventId = studentIdOrEventId;
      searchToken = eventIdOrCode.trim();
    } else {
      // Automatic lookup from registration
      searchToken = eventIdOrCode.trim();
      const match = registrations.find(
        (r) => r.ticketCode === searchToken || r.studentRegNo === searchToken
      );
      if (match) {
        resolvedEventId = match.eventId;
      } else {
        resolvedEventId = events[0]?.id || '';
      }
    }

    if (!searchToken) {
      return { success: false, message: 'Please scan or provide a valid ticket code or registration number.' };
    }

    // Check if student is registered for this event
    const reg = registrations.find(
      (r) =>
        r.eventId === resolvedEventId &&
        (r.ticketCode.toLowerCase() === searchToken.toLowerCase() ||
          r.studentRegNo.toLowerCase() === searchToken.toLowerCase() ||
          r.studentId === searchToken)
    );

    // If not found in current event, check if registered for any other event
    if (!reg) {
      const otherReg = registrations.find(
        (r) =>
          r.ticketCode.toLowerCase() === searchToken.toLowerCase() ||
          r.studentRegNo.toLowerCase() === searchToken.toLowerCase()
      );
      if (otherReg) {
        const otherEvent = events.find((e) => e.id === otherReg.eventId);
        return {
          success: false,
          message: `Ticket is registered for "${otherEvent?.title || otherReg.eventTitle}", not this event.`,
          registration: otherReg,
        };
      }
      return {
        success: false,
        message: `No active registration found for code/number "${searchToken}".`,
      };
    }

    const targetStudentId = reg.studentId;
    const targetStudentName = reg.studentName;
    const targetStudentReg = reg.studentRegNo;
    const targetStudentDept = reg.studentDept;

    // Check if already checked in
    const alreadyAttended = attendanceRecords.some(
      (a) => a.eventId === resolvedEventId && (a.studentId === targetStudentId || a.studentRegNo === targetStudentReg)
    );
    if (alreadyAttended) {
      return {
        success: false,
        message: `${targetStudentName} (${targetStudentReg}) has already been checked in.`,
        registration: reg,
      };
    }

    const newRecord: AttendanceRecord = {
      id: 'att_' + Date.now().toString(36),
      eventId: resolvedEventId,
      studentId: targetStudentId,
      studentName: targetStudentName,
      studentRegNo: targetStudentReg,
      studentDept: targetStudentDept,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method,
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);

    // Update registration status to 'Attended'
    setRegistrations((prev) =>
      prev.map((r) => (r.id === reg.id ? { ...r, status: 'Attended' as RegistrationStatus } : r))
    );

    // Persist to Supabase
    SupabaseDataService.insertAttendance(newRecord);
    SupabaseDataService.updateRegistrationStatus(reg.id, 'Attended');

    showToast('Admitted & Verified ✓', `${targetStudentName} (${targetStudentReg}) admitted at Gate.`, 'success');
    return { success: true, message: 'Check-in confirmed.', record: newRecord, registration: reg };
  };

  const unmarkAttendance = (attendanceId: string) => {
    const record = attendanceRecords.find((a) => a.id === attendanceId);
    if (!record) return;

    setAttendanceRecords((prev) => prev.filter((a) => a.id !== attendanceId));

    // Revert registration status to 'Registered'
    setRegistrations((prev) =>
      prev.map((r) => {
        if (
          r.eventId === record.eventId &&
          (r.studentId === record.studentId || r.studentRegNo === record.studentRegNo)
        ) {
          return { ...r, status: 'Registered' as RegistrationStatus };
        }
        return r;
      })
    );

    // Persist to Supabase
    SupabaseDataService.deleteAttendance(attendanceId);
    const targetReg = registrations.find(
      (r) => r.eventId === record.eventId && (r.studentId === record.studentId || r.studentRegNo === record.studentRegNo)
    );
    if (targetReg) {
      SupabaseDataService.updateRegistrationStatus(targetReg.id, 'Registered');
    }

    showToast('Check-In Reverted', `Attendance record for ${record.studentName} removed.`, 'info');
  };

  const registerSpotAttendee = (
    eventId: string,
    student: { name: string; regNo: string; dept: string; email?: string; role?: string }
  ) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) {
      return { success: false, message: 'Event not found.' };
    }

    const randCode = Math.floor(1000 + Math.random() * 9000);
    const prefix = student.role === 'VIP' ? 'VIP' : targetEvent.category.substring(0, 4).toUpperCase();
    const ticketCode = `SWO-${prefix}-${student.regNo}-${randCode}`;

    const newReg: Registration = {
      id: 'reg_spot_' + Date.now().toString(36),
      eventId,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      eventTime: targetEvent.time,
      eventVenue: targetEvent.venue,
      studentId: 'spot_' + student.regNo,
      studentName: student.name,
      studentRegNo: student.regNo,
      studentEmail: student.email || `${student.regNo.toLowerCase()}@christuniversity.in`,
      studentDept: student.dept,
      studentYear: 'Spot Registration',
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'Registered',
      ticketCode,
    };

    setRegistrations((prev) => [newReg, ...prev]);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e))
    );

    // Persist to Supabase
    SupabaseDataService.insertRegistration(newReg);
    SupabaseDataService.updateEvent(eventId, { registeredCount: targetEvent.registeredCount + 1 });

    showToast('Spot Pass Generated', `Pass issued for ${student.name}. Ticket: ${ticketCode}`, 'success');
    return { success: true, registration: newReg, message: 'Spot pass generated successfully.' };
  };

  const bulkMarkAttendance = (eventId: string) => {
    const eventRegs = registrations.filter((r) => r.eventId === eventId && r.status === 'Registered');
    if (eventRegs.length === 0) {
      showToast('No Pending Attendees', 'All registered students are already marked or no registrations exist.', 'warning');
      return 0;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecords: AttendanceRecord[] = eventRegs.map((r) => ({
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      eventId,
      studentId: r.studentId,
      studentName: r.studentName,
      studentRegNo: r.studentRegNo,
      studentDept: r.studentDept,
      checkInTime: now,
      method: 'Bulk',
    }));

    setAttendanceRecords((prev) => [...newRecords, ...prev]);
    setRegistrations((prev) =>
      prev.map((r) => (r.eventId === eventId && r.status === 'Registered' ? { ...r, status: 'Attended' as RegistrationStatus } : r))
    );

    // Persist to Supabase
    newRecords.forEach((r) => SupabaseDataService.insertAttendance(r));
    eventRegs.forEach((r) => SupabaseDataService.updateRegistrationStatus(r.id, 'Attended'));

    showToast('Bulk Attendance Marked', `Successfully checked in ${newRecords.length} attendees.`, 'success');
    return newRecords.length;
  };

  // Announcements
  const createAnnouncement = (announcementData: Omit<Announcement, 'id' | 'readBy' | 'date' | 'authorName' | 'authorRole'>) => {
    const newAnn: Announcement = {
      ...announcementData,
      id: 'ann_' + Date.now().toString(36),
      date: new Date().toISOString().split('T')[0],
      readBy: [],
      authorName: adminUser.name,
      authorRole: 'Student Welfare Office',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    SupabaseDataService.insertAnnouncement(newAnn);
    showToast('Announcement Published', `"${newAnn.title}" is now visible to students.`, 'success');
  };

  const toggleAnnouncementPin = (id: string) => {
    const target = announcements.find((a) => a.id === id);
    if (target) {
      SupabaseDataService.updateAnnouncement(id, { isPinned: !target.isPinned });
    }
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
  };

  const markAnnouncementAsRead = (id: string) => {
    if (!studentUser) return;
    const target = announcements.find((a) => a.id === id);
    if (target && !target.readBy.includes(studentUser.id)) {
      SupabaseDataService.updateAnnouncement(id, { readBy: [...target.readBy, studentUser.id] });
    }
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id && !a.readBy.includes(studentUser.id)) {
          return { ...a, readBy: [...a.readBy, studentUser.id] };
        }
        return a;
      })
    );
  };

  const markAllAnnouncementsAsRead = () => {
    if (!studentUser) return;
    setAnnouncements((prev) =>
      prev.map((a) => {
        const nextReadBy = Array.from(new Set([...a.readBy, studentUser.id]));
        SupabaseDataService.updateAnnouncement(a.id, { readBy: nextReadBy });
        return { ...a, readBy: nextReadBy };
      })
    );
    showToast('All Marked Read', 'All circulars and announcements marked as read.', 'info');
  };

  const deleteAnnouncement = (id: string) => {
    const deletedAnnIds = getStored<string[]>('deleted_announcement_ids', []);
    setStored('deleted_announcement_ids', Array.from(new Set([...deletedAnnIds, id])));
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    SupabaseDataService.deleteAnnouncement(id);
    showToast('Announcement Removed', 'Circular removed successfully.', 'info');
  };

  // Certificates
  const issueCertificate = (certData: Omit<Certificate, 'id' | 'certificateNo' | 'qrVerifyCode' | 'issuedDate'>): Certificate => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const certNo = `CU-SWO-${new Date().getFullYear()}-${certData.type.substring(0, 3).toUpperCase()}-${randomHex}`;
    const newCert: Certificate = {
      ...certData,
      id: 'cert_' + Date.now().toString(36),
      certificateNo: certNo,
      issuedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      qrVerifyCode: `https://christuniversity.in/verify/cert/${certNo}`,
    };

    setCertificates((prev) => [newCert, ...prev]);
    SupabaseDataService.insertCertificate(newCert);
    showToast('Certificate Issued', `Issued ${newCert.type} certificate for ${newCert.studentName}.`, 'success');
    return newCert;
  };

  const bulkIssueCertificatesForEvent = (eventId: string, type: CertificateType): number => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return 0;

    // Find all attended registrations
    const attendedRegs = registrations.filter((r) => r.eventId === eventId && r.status === 'Attended');
    if (attendedRegs.length === 0) {
      showToast('No Attendees Found', 'Mark attendance for students first before issuing bulk certificates.', 'warning');
      return 0;
    }

    const issuedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const newCerts: Certificate[] = attendedRegs.map((reg) => {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const certNo = `CU-SWO-${new Date().getFullYear()}-${type.substring(0, 3).toUpperCase()}-${randomHex}`;
      return {
        id: 'cert_' + Math.random().toString(36).substring(2, 9),
        certificateNo: certNo,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        studentName: reg.studentName,
        studentRegNo: reg.studentRegNo,
        department: reg.studentDept,
        type,
        issuedDate,
        authorizedBy: 'Dr. Mathew K. Varghese',
        designation: 'Student Welfare Officer, Christ University',
        qrVerifyCode: `https://christuniversity.in/verify/cert/${certNo}`,
      };
    });

    setCertificates((prev) => [...newCerts, ...prev]);
    SupabaseDataService.bulkInsertCertificates(newCerts);
    showToast('Certificates Published', `Generated and pushed ${newCerts.length} certificates to student portals.`, 'success');
    return newCerts.length;
  };

  const bulkGenerateCertificates = (
    eventId: string,
    type: CertificateType,
    authorizedBy?: string,
    designation?: string,
    templateId?: CertificateTemplateId,
    signatories?: CertificateSignatory[],
    citationText?: string,
    customMetadata?: {
      universityTitle?: string;
      campusSubtitle?: string;
      officeSubtitle?: string;
      certificateHeading?: string;
      conferralLine?: string;
      verificationBadgeText?: string;
    }
  ): number => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return 0;

    const attendedRegs = registrations.filter((r) => r.eventId === eventId && r.status === 'Attended');
    if (attendedRegs.length === 0) {
      showToast('No Attendees Found', 'Mark attendance for students first before issuing bulk certificates.', 'warning');
      return 0;
    }

    const issuedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const newCerts: Certificate[] = attendedRegs.map((reg) => {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const certNo = `CU-SWO-${new Date().getFullYear()}-${type.substring(0, 3).toUpperCase()}-${randomHex}`;
      return {
        id: 'cert_' + Math.random().toString(36).substring(2, 9),
        certificateNo: certNo,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        studentName: reg.studentName,
        studentRegNo: reg.studentRegNo,
        department: reg.studentDept,
        type,
        issuedDate,
        authorizedBy: authorizedBy || 'Dr. Mathew K. Varghese',
        designation: designation || 'Director, Student Welfare Office',
        qrVerifyCode: `https://christuniversity.in/verify/cert/${certNo}`,
        templateId: templateId || 'classic-gold',
        signatories: signatories && signatories.length > 0 ? signatories : undefined,
        citationText,
        ...customMetadata,
      };
    });

    setCertificates((prev) => [...newCerts, ...prev]);
    SupabaseDataService.bulkInsertCertificates(newCerts);
    showToast('Certificates Published', `Generated and dispatched ${newCerts.length} certificates with official signatures to student portals.`, 'success');
    return newCerts.length;
  };

  // Committees
  const addCommitteeMember = (
    committeeId: string, 
    member: { name: string; role: string; regNo: string; department: string; email: string; phone?: string; avatar?: string; assignedEvents?: string[] }
  ) => {
    const cleanRegNo = member.regNo.trim();
    let updatedCommitteeName = '';

    setCommittees((prev) =>
      prev.map((c) => {
        if (c.id === committeeId) {
          updatedCommitteeName = c.name;
          const existingIndex = c.members.findIndex(
            (m) => m.regNo && m.regNo.trim().toLowerCase() === cleanRegNo.toLowerCase()
          );

          let updatedMembers: CommitteeMember[];
          if (existingIndex >= 0) {
            updatedMembers = [...c.members];
            updatedMembers[existingIndex] = {
              ...updatedMembers[existingIndex],
              ...member,
              regNo: cleanRegNo,
            };
          } else {
            const newMember: CommitteeMember = {
              id: 'm_' + Date.now().toString(36),
              ...member,
              regNo: cleanRegNo,
            };
            updatedMembers = [...c.members, newMember];
          }

          const updated = {
            ...c,
            memberCount: updatedMembers.length,
            members: updatedMembers,
          };
          SupabaseDataService.upsertCommittee(updated);
          return updated;
        }
        return c;
      })
    );
    showToast(
      'Committee Appointment Confirmed',
      `${member.name} (${cleanRegNo}) assigned as "${member.role}" in ${updatedCommitteeName || 'committee'}.`,
      'success'
    );
  };

  const removeCommitteeMember = (committeeId: string, memberId: string) => {
    setCommittees((prev) =>
      prev.map((c) => {
        if (c.id === committeeId) {
          const updated = {
            ...c,
            memberCount: Math.max(0, c.memberCount - 1),
            members: c.members.filter((m) => m.id !== memberId),
          };
          SupabaseDataService.upsertCommittee(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('Member Removed', 'Committee roster updated.', 'info');
  };

  const updateCommittee = (committeeId: string, updates: Partial<Committee>) => {
    setCommittees((prev) =>
      prev.map((c) => {
        if (c.id === committeeId) {
          const updated = { ...c, ...updates };
          SupabaseDataService.upsertCommittee(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('Committee Updated', 'Committee details and faculty coordinator updated successfully.', 'success');
  };

  const createCommittee = (committeeData: Omit<Committee, 'id' | 'memberCount' | 'members' | 'activeEventsCount'>): Committee => {
    const newComm: Committee = {
      ...committeeData,
      id: 'com_' + Date.now().toString(36),
      memberCount: 0,
      activeEventsCount: 0,
      members: [],
    };
    setCommittees((prev) => [...prev, newComm]);
    SupabaseDataService.upsertCommittee(newComm);
    showToast('Committee Created', `"${newComm.name}" added to official SWO wings.`, 'success');
    return newComm;
  };

  const deleteCommittee = (committeeId: string) => {
    setCommittees((prev) => prev.filter((c) => c.id !== committeeId));
    showToast('Committee Removed', 'Committee wing deleted.', 'info');
  };

  const addAnnouncement = (annData: any) => {
    createAnnouncement(annData);
  };

  const togglePinAnnouncement = (id: string) => {
    toggleAnnouncementPin(id);
  };

  // Surveys & Inquiries
  const submitSurveyResponse = (
    surveyId: string,
    answers: Record<string, string | number>,
    feedbackText?: string
  ) => {
    const newResponse: SurveyResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      surveyId,
      studentId: studentUser?.id || `guest_${Date.now()}`,
      studentName: studentUser?.name || 'Christ University Student',
      studentRegNo: studentUser?.regNo || '2447000',
      studentDept: studentUser?.department || 'General Campus',
      submittedAt: new Date().toISOString(),
      answers,
      generalFeedback: feedbackText,
    };

    setSurveyResponses((prev) => [newResponse, ...prev]);

    setSurveys((prev) =>
      prev.map((s) =>
        s.id === surveyId
          ? {
              ...s,
              totalResponses: (s.totalResponses || 0) + 1,
              responsesCount: ((s.responsesCount ?? s.totalResponses) || 0) + 1,
            }
          : s
      )
    );

    if (studentUser) {
      SupabaseDataService.submitSurveyResponse(surveyId, studentUser.id, answers);
    }
    showToast('Feedback Received', 'Thank you! Your responses directly assist SWO in improving university events and campus life.', 'success');
  };

  const submitStudentInquiry = (
    inquiry: Omit<StudentInquiry, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newInquiry: StudentInquiry = {
      ...inquiry,
      id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      submittedAt: new Date().toISOString(),
      status: 'Received',
    };
    setStudentInquiries((prev) => [newInquiry, ...prev]);
    SupabaseDataService.insertInquiry(newInquiry);
    showToast('Inquiry Submitted', 'Your inquiry has been routed directly to the Student Welfare Office desk.', 'success');
  };

  const updateStudentInquiryStatus = (
    id: string,
    status: 'Received' | 'Reviewed' | 'Incorporated',
    adminResponse?: string
  ) => {
    setStudentInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id
          ? {
              ...inq,
              status,
              ...(adminResponse !== undefined ? { adminResponse } : {}),
            }
          : inq
      )
    );
    SupabaseDataService.updateInquiryStatus(id, status, adminResponse);
    showToast('Inquiry Updated', `Status updated to ${status}.`, 'info');
  };

  const deleteStudentInquiry = (id: string) => {
    setStudentInquiries((prev) => prev.filter((inq) => inq.id !== id));
    SupabaseDataService.deleteInquiry(id);
    showToast('Inquiry Deleted', 'Inquiry removed from records.', 'info');
  };

  const createSurvey = (surveyData: Omit<ResearchSurvey, 'id' | 'responsesCount' | 'status'>) => {
    const newSurvey: ResearchSurvey = {
      ...surveyData,
      id: 'surv_' + Date.now().toString(36),
      totalResponses: 0,
      responsesCount: 0,
      status: 'Active',
    };
    setSurveys((prev) => [newSurvey, ...prev]);
    SupabaseDataService.upsertSurvey(newSurvey);
    showToast('Research Survey Published', `"${newSurvey.title}" is now open for responses.`, 'success');
  };

  const addResearchSurvey = (newSurvey: ResearchSurvey) => {
    setSurveys((prev) => [newSurvey, ...prev]);
    SupabaseDataService.upsertSurvey(newSurvey);
    showToast('Research Survey Added', `"${newSurvey.title}" is active.`, 'success');
  };

  const deleteSurvey = (id: string) => {
    setSurveys((prev) => {
      const next = prev.filter((s) => s.id !== id);
      setStored('surveys', next);
      return next;
    });

    try {
      const deletedIds = getStored<string[]>('deleted_survey_ids', []);
      if (!deletedIds.includes(id)) {
        setStored('deleted_survey_ids', [...deletedIds, id]);
      }
    } catch {}

    SupabaseDataService.deleteSurvey(id);
    showToast('Survey Removed', 'The survey has been deleted from records and cloud database.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        studentUser,
        adminUser,
        currentRole,
        switchRole,
        updateStudentProfile,
        updateAdminProfile,

        isStudentAuthenticated,
        loginStudent,
        signUpStudent,
        signInStudent,
        logoutStudent,
        theme,
        toggleTheme,
        setTheme,
        isLoginModalOpen,
        loginModalReason,
        pendingSuccessCallback,
        openLoginModal,
        closeLoginModal,
        isAdminAuthenticated,
        authenticateAdmin,
        logoutAdmin,

        events,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleCarousel,

        registrations,
        registerForEvent,
        cancelRegistration,
        updateRegistrationStatus,

        attendanceRecords,
        markAttendance,
        unmarkAttendance,
        bulkMarkAttendance,
        registerSpotAttendee,

        announcements,
        createAnnouncement,
        addAnnouncement,
        toggleAnnouncementPin,
        togglePinAnnouncement,
        markAnnouncementAsRead,
        markAllAnnouncementsAsRead,
        deleteAnnouncement,

        certificates,
        issueCertificate,
        bulkIssueCertificatesForEvent,
        bulkGenerateCertificates,

        results,
        committees,
        addCommitteeMember,
        removeCommitteeMember,
        updateCommittee,
        createCommittee,
        deleteCommittee,

        surveys,
        researchSurveys: surveys,
        surveyResponses,
        studentInquiries,
        submitSurveyResponse,
        createSurvey,
        addResearchSurvey,
        submitStudentInquiry,
        updateStudentInquiryStatus,
        deleteStudentInquiry,
        deleteSurvey,

        heroSettings,
        updateHeroSettings,
        resetHeroSettings,
        showcaseItems,
        updateShowcaseItem,
        addShowcaseItem,
        deleteShowcaseItem,
        resetShowcaseItems,

        dailyQuote,
        updateDailyQuote,

        savedMediaAssets,
        saveMediaAsset,
        deleteMediaAsset,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
