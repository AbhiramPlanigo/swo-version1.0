import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  EventItem,
  Registration,
  AttendanceRecord,
  Announcement,
  Certificate,
  Committee,
  ResearchSurvey,
  HeroBannerSettings,
  DailyQuote,
  EventResult,
  ShowcaseItem,
  StudentInquiry,
} from '../types';

// ==============================================================================
// TYPE MAPPERS (camelCase TS <-> snake_case Postgres DB)
// ==============================================================================

export const mapEventFromDb = (row: any): EventItem => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle || '',
  description: row.description || '',
  category: row.category,
  date: row.date,
  time: row.time,
  venue: row.venue,
  bannerUrl: row.banner_url || '',
  capacity: Number(row.capacity) || 0,
  registeredCount: Number(row.registered_count) || 0,
  organizingCommittee: row.organizing_committee || '',
  eligibility: row.eligibility || '',
  registrationDeadline: row.registration_deadline || '',
  status: row.status || 'Published',
  inCarousel: Boolean(row.in_carousel),
  carouselOrder: row.carousel_order ?? 0,
  featured: Boolean(row.featured),
  customFields: row.custom_fields || [],
  speaker: row.speaker || undefined,
  requiresApproval: Boolean(row.requires_approval),
  requiresQrPass: row.requires_qr_pass !== undefined ? Boolean(row.requires_qr_pass) : true,
});

export const mapEventToDb = (evt: Partial<EventItem>): Record<string, any> => {
  const row: Record<string, any> = {};
  if (evt.id !== undefined) row.id = evt.id;
  if (evt.title !== undefined) row.title = evt.title;
  if (evt.subtitle !== undefined) row.subtitle = evt.subtitle;
  if (evt.description !== undefined) row.description = evt.description;
  if (evt.category !== undefined) row.category = evt.category;
  if (evt.date !== undefined) row.date = evt.date;
  if (evt.time !== undefined) row.time = evt.time;
  if (evt.venue !== undefined) row.venue = evt.venue;
  if (evt.bannerUrl !== undefined) row.banner_url = evt.bannerUrl;
  if (evt.capacity !== undefined) row.capacity = evt.capacity;
  if (evt.registeredCount !== undefined) row.registered_count = evt.registeredCount;
  if (evt.organizingCommittee !== undefined) row.organizing_committee = evt.organizingCommittee;
  if (evt.eligibility !== undefined) row.eligibility = evt.eligibility;
  if (evt.registrationDeadline !== undefined) row.registration_deadline = evt.registrationDeadline;
  if (evt.status !== undefined) row.status = evt.status;
  if (evt.inCarousel !== undefined) row.in_carousel = evt.inCarousel;
  if (evt.carouselOrder !== undefined) row.carousel_order = evt.carouselOrder;
  if (evt.featured !== undefined) row.featured = evt.featured;
  if (evt.customFields !== undefined) row.custom_fields = evt.customFields;
  if (evt.speaker !== undefined) row.speaker = evt.speaker;
  if (evt.requiresApproval !== undefined) row.requires_approval = evt.requiresApproval;
  if (evt.requiresQrPass !== undefined) row.requires_qr_pass = evt.requiresQrPass;
  return row;
};

export const mapRegistrationFromDb = (row: any): Registration => ({
  id: row.id,
  eventId: row.event_id,
  eventTitle: row.event_title,
  eventDate: row.event_date || '',
  eventTime: row.event_time || '',
  eventVenue: row.event_venue || '',
  studentId: row.student_id,
  studentName: row.student_name,
  studentRegNo: row.student_reg_no,
  studentEmail: row.student_email,
  studentDept: row.student_dept,
  studentYear: row.student_year,
  registeredAt: row.registered_at,
  status: row.status,
  customAnswers: row.custom_answers || {},
  ticketCode: row.ticket_code,
  requiresQrPass: row.requires_qr_pass !== undefined ? Boolean(row.requires_qr_pass) : true,
});

export const mapRegistrationToDb = (reg: Registration): Record<string, any> => ({
  id: reg.id,
  event_id: reg.eventId,
  event_title: reg.eventTitle,
  event_date: reg.eventDate,
  event_time: reg.eventTime,
  event_venue: reg.eventVenue,
  student_id: reg.studentId,
  student_name: reg.studentName,
  student_reg_no: reg.studentRegNo,
  student_email: reg.studentEmail,
  student_dept: reg.studentDept,
  student_year: reg.studentYear,
  registered_at: reg.registeredAt,
  status: reg.status,
  custom_answers: reg.customAnswers || {},
  ticket_code: reg.ticketCode,
  requires_qr_pass: reg.requiresQrPass !== undefined ? reg.requiresQrPass : true,
});

export const mapAttendanceFromDb = (row: any): AttendanceRecord => ({
  id: row.id,
  eventId: row.event_id,
  studentId: row.student_id,
  studentName: row.student_name,
  studentRegNo: row.student_reg_no,
  studentDept: row.student_dept,
  checkInTime: row.check_in_time,
  method: row.method || 'QR',
});

export const mapAttendanceToDb = (att: AttendanceRecord): Record<string, any> => ({
  id: att.id,
  event_id: att.eventId,
  student_id: att.studentId,
  student_name: att.studentName,
  student_reg_no: att.studentRegNo,
  student_dept: att.studentDept,
  check_in_time: att.checkInTime,
  method: att.method,
});

export const mapAnnouncementFromDb = (row: any): Announcement => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  date: row.date,
  targetDept: row.target_dept || 'All Departments',
  targetYear: row.target_year || 'All Batches',
  isPinned: Boolean(row.is_pinned),
  readBy: row.read_by || [],
  authorName: row.author_name,
  authorRole: row.author_role,
});

export const mapAnnouncementToDb = (ann: Announcement): Record<string, any> => ({
  id: ann.id,
  title: ann.title,
  content: ann.content,
  category: ann.category,
  date: ann.date,
  target_dept: ann.targetDept,
  target_year: ann.targetYear,
  is_pinned: ann.isPinned,
  read_by: ann.readBy || [],
  author_name: ann.authorName,
  author_role: ann.authorRole,
});

export const mapCertificateFromDb = (row: any): Certificate => ({
  id: row.id,
  certificateNo: row.certificate_no,
  eventId: row.event_id,
  eventTitle: row.event_title,
  eventDate: row.event_date,
  studentName: row.student_name,
  studentRegNo: row.student_reg_no,
  department: row.department,
  type: row.type,
  issuedDate: row.issued_date,
  authorizedBy: row.authorized_by,
  designation: row.designation,
  qrVerifyCode: row.qr_verify_code,
  templateId: row.template_id,
  signatories: row.signatories || [],
  citationText: row.citation_text,
});

export const mapCertificateToDb = (cert: Certificate): Record<string, any> => ({
  id: cert.id,
  certificate_no: cert.certificateNo,
  event_id: cert.eventId,
  event_title: cert.eventTitle,
  event_date: cert.eventDate,
  student_name: cert.studentName,
  student_reg_no: cert.studentRegNo,
  department: cert.department,
  type: cert.type,
  issued_date: cert.issuedDate,
  authorized_by: cert.authorizedBy,
  designation: cert.designation,
  qr_verify_code: cert.qrVerifyCode,
  template_id: cert.templateId || 'classic-gold',
  signatories: cert.signatories || [],
  citation_text: cert.citationText,
});

export const mapCommitteeFromDb = (row: any): Committee => ({
  id: row.id,
  name: row.name,
  wing: row.wing,
  leadName: row.lead_name,
  deputyName: row.deputy_name,
  memberCount: Number(row.member_count) || 0,
  email: row.email,
  description: row.description,
  activeEventsCount: Number(row.active_events_count) || 0,
  facultyCoordinator: row.faculty_coordinator,
  members: row.members || [],
});

export const mapCommitteeToDb = (comm: Committee): Record<string, any> => ({
  id: comm.id,
  name: comm.name,
  wing: comm.wing,
  lead_name: comm.leadName,
  deputy_name: comm.deputyName,
  member_count: comm.memberCount,
  email: comm.email,
  description: comm.description,
  active_events_count: comm.activeEventsCount,
  faculty_coordinator: comm.facultyCoordinator,
  members: comm.members || [],
});

export const mapSurveyFromDb = (row: any): ResearchSurvey => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  deadline: row.deadline,
  responsesCount: Number(row.responses_count) || 0,
  totalResponses: Number(row.total_responses) || 0,
  targetSample: Number(row.target_sample) || 100,
  status: row.status || 'Active',
  questions: row.questions || [],
  questionsCount: Number(row.questions_count) || (row.questions?.length ?? 0),
});

export const mapSurveyToDb = (surv: ResearchSurvey): Record<string, any> => ({
  id: surv.id,
  title: surv.title,
  description: surv.description,
  category: surv.category,
  deadline: surv.deadline,
  responses_count: surv.responsesCount ?? 0,
  total_responses: surv.totalResponses ?? 0,
  target_sample: surv.targetSample ?? 100,
  status: surv.status,
  questions: surv.questions || [],
  questions_count: surv.questionsCount ?? surv.questions?.length ?? 0,
});

export const mapHeroFromDb = (row: any): HeroBannerSettings => ({
  badge: row.badge,
  title: row.title,
  subtitle: row.subtitle,
  description: row.description,
  date: row.date,
  time: row.time,
  venue: row.venue,
  speakers: row.speakers || [],
  accentColor: row.accent_color || '#C5A063',
  bgImage: row.bg_image || '/assets/christ-yeshwanthpur-campus.jpg',
  tags: row.tags || [],
});

export const mapHeroToDb = (hero: HeroBannerSettings): Record<string, any> => ({
  id: 'current',
  badge: hero.badge,
  title: hero.title,
  subtitle: hero.subtitle,
  description: hero.description,
  date: hero.date,
  time: hero.time,
  venue: hero.venue,
  speakers: hero.speakers || [],
  accent_color: hero.accentColor,
  bg_image: hero.bgImage,
  tags: hero.tags || [],
  updated_at: new Date().toISOString(),
});

export const mapDailyQuoteFromDb = (row: any): DailyQuote => ({
  id: row.id || 'today',
  quote: row.quote,
  author: row.author,
  authorTitle: row.author_title,
  date: row.date,
  category: row.category,
  postedBy: row.posted_by,
  updatedAt: row.updated_at,
});

export const mapDailyQuoteToDb = (quote: DailyQuote): Record<string, any> => ({
  id: 'today',
  quote: quote.quote,
  author: quote.author,
  author_title: quote.authorTitle,
  date: quote.date,
  category: quote.category,
  posted_by: quote.postedBy,
  updated_at: quote.updatedAt || new Date().toISOString(),
});

export const mapShowcaseFromDb = (row: any): ShowcaseItem => ({
  id: row.id,
  tabLabel: row.tab_label || 'Showcase',
  tabEmoji: row.tab_emoji || '🌟',
  badge: row.badge || 'CHRIST UNIVERSITY CAMPUS SHOWCASE 2026',
  title: row.title || '',
  subtitle: row.subtitle || '',
  description: row.description || '',
  date: row.date || '',
  time: row.time || '',
  venue: row.venue || '',
  locationBadge: row.location_badge || 'Main Auditorium • Campus Stage',
  speakers: Array.isArray(row.speakers) ? row.speakers : [],
  accentColor: row.accent_color || '#C5A063',
  bgImage: row.bg_image || '/assets/christ-yeshwanthpur-campus.jpg',
  tags: Array.isArray(row.tags) ? row.tags : [],
  gradient: row.gradient || undefined,
  isFlagship: Boolean(row.is_flagship),
});

export const mapShowcaseToDb = (item: ShowcaseItem, sortOrder: number = 0): Record<string, any> => ({
  id: item.id,
  tab_label: item.tabLabel,
  tab_emoji: item.tabEmoji || '🌟',
  badge: item.badge,
  title: item.title,
  subtitle: item.subtitle,
  description: item.description,
  date: item.date,
  time: item.time,
  venue: item.venue,
  location_badge: item.locationBadge || 'Main Auditorium • Campus Stage',
  speakers: item.speakers || [],
  accent_color: item.accentColor,
  bg_image: item.bgImage,
  tags: item.tags || [],
  sort_order: sortOrder,
  is_active: true,
  updated_at: new Date().toISOString(),
});

export const mapInquiryFromDb = (row: any): StudentInquiry => ({
  id: row.id,
  studentId: row.student_id,
  studentName: row.student_name,
  studentRegNo: row.student_reg_no,
  studentDept: row.student_dept || 'General',
  studentEmail: row.student_email,
  category: row.category || 'General Welfare',
  question: row.question || '',
  submittedAt: row.submitted_at || new Date().toISOString(),
  status: row.status || 'Received',
  adminResponse: row.admin_response || '',
});

export const mapInquiryToDb = (inq: StudentInquiry): Record<string, any> => ({
  id: inq.id,
  student_id: inq.studentId,
  student_name: inq.studentName,
  student_reg_no: inq.studentRegNo,
  student_dept: inq.studentDept,
  student_email: inq.studentEmail,
  category: inq.category,
  question: inq.question,
  submitted_at: inq.submittedAt,
  status: inq.status,
  admin_response: inq.adminResponse || '',
});

// ==============================================================================
// SUPABASE DATA SERVICE OPERATIONS
// ==============================================================================

export const SupabaseDataService = {
  // --- EVENTS ---
  async fetchEvents(): Promise<EventItem[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (error) {
      console.warn('[Supabase] Failed to fetch events:', error.message);
      return null;
    }
    return data.map(mapEventFromDb);
  },

  async upsertEvent(event: EventItem): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('events').upsert(mapEventToDb(event));
    if (error) console.error('[Supabase] Failed to upsert event:', error.message);
    return !error;
  },

  async updateEvent(id: string, updates: Partial<EventItem>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('events').update(mapEventToDb(updates)).eq('id', id);
    if (error) console.error('[Supabase] Failed to update event:', error.message);
    return !error;
  },

  async deleteEvent(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.error('[Supabase] Failed to delete event:', error.message);
    return !error;
  },

  // --- REGISTRATIONS ---
  async fetchRegistrations(): Promise<Registration[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('registrations').select('*').order('registered_at', { ascending: false });
    if (error) {
      console.warn('[Supabase] Failed to fetch registrations:', error.message);
      return null;
    }
    return data.map(mapRegistrationFromDb);
  },

  async insertRegistration(reg: Registration): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('registrations').insert(mapRegistrationToDb(reg));
    if (error) console.error('[Supabase] Failed to insert registration:', error.message);
    return !error;
  },

  async updateRegistrationStatus(id: string, status: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id);
    if (error) console.error('[Supabase] Failed to update registration status:', error.message);
    return !error;
  },

  async deleteRegistration(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) console.error('[Supabase] Failed to delete registration:', error.message);
    return !error;
  },

  async updateRegistrationsForEvent(eventId: string, updates: { requires_qr_pass?: boolean }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('registrations').update(updates).eq('event_id', eventId);
    if (error) console.error('[Supabase] Failed to update registrations for event:', error.message);
    return !error;
  },

  // --- ATTENDANCE ---
  async fetchAttendance(): Promise<AttendanceRecord[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('attendance_records').select('*').order('check_in_time', { ascending: false });
    if (error) {
      console.warn('[Supabase] Failed to fetch attendance:', error.message);
      return null;
    }
    return data.map(mapAttendanceFromDb);
  },

  async insertAttendance(record: AttendanceRecord): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('attendance_records').insert(mapAttendanceToDb(record));
    if (error) console.error('[Supabase] Failed to record attendance:', error.message);
    return !error;
  },

  async deleteAttendance(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('attendance_records').delete().eq('id', id);
    if (error) console.error('[Supabase] Failed to remove attendance:', error.message);
    return !error;
  },

  // --- ANNOUNCEMENTS ---
  async fetchAnnouncements(): Promise<Announcement[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase] Failed to fetch announcements:', error.message);
      return null;
    }
    return data.map(mapAnnouncementFromDb);
  },

  async insertAnnouncement(ann: Announcement): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('announcements').insert(mapAnnouncementToDb(ann));
    if (error) console.error('[Supabase] Failed to insert announcement:', error.message);
    return !error;
  },

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const dbUpdates: Record<string, any> = {};
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.readBy !== undefined) dbUpdates.read_by = updates.readBy;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    const { error } = await supabase.from('announcements').update(dbUpdates).eq('id', id);
    if (error) console.error('[Supabase] Failed to update announcement:', error.message);
    return !error;
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) console.error('[Supabase] Failed to delete announcement:', error.message);
    return !error;
  },

  // --- CERTIFICATES ---
  async fetchCertificates(): Promise<Certificate[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase] Failed to fetch certificates:', error.message);
      return null;
    }
    return data.map(mapCertificateFromDb);
  },

  async insertCertificate(cert: Certificate): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('certificates').insert(mapCertificateToDb(cert));
    if (error) console.error('[Supabase] Failed to insert certificate:', error.message);
    return !error;
  },

  async bulkInsertCertificates(certs: Certificate[]): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || certs.length === 0) return false;
    const { error } = await supabase.from('certificates').insert(certs.map(mapCertificateToDb));
    if (error) console.error('[Supabase] Failed to bulk insert certificates:', error.message);
    return !error;
  },

  // --- COMMITTEES ---
  async fetchCommittees(): Promise<Committee[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('committees').select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn('[Supabase] Failed to fetch committees:', error.message);
      return null;
    }
    return data.map(mapCommitteeFromDb);
  },

  async upsertCommittee(comm: Committee): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('committees').upsert(mapCommitteeToDb(comm));
    if (error) console.error('[Supabase] Failed to upsert committee:', error.message);
    return !error;
  },

  // --- RESEARCH SURVEYS ---
  async fetchSurveys(): Promise<ResearchSurvey[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('research_surveys').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase] Failed to fetch surveys:', error.message);
      return null;
    }
    return data.map(mapSurveyFromDb);
  },

  async upsertSurvey(surv: ResearchSurvey): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('research_surveys').upsert(mapSurveyToDb(surv));
    if (error) console.error('[Supabase] Failed to upsert survey:', error.message);
    return !error;
  },

  async submitSurveyResponse(surveyId: string, studentId: string, answers: Record<string, string | number>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error: respError } = await supabase.from('survey_responses').insert({
      id: 'sr_' + Math.random().toString(36).substring(2, 9),
      survey_id: surveyId,
      student_id: studentId,
      submitted_at: new Date().toISOString(),
      answers,
    });
    if (respError) {
      console.error('[Supabase] Failed to save survey response:', respError.message);
      return false;
    }

    // Increment responses_count in survey table
    const { data: survey } = await supabase.from('research_surveys').select('responses_count, total_responses').eq('id', surveyId).single();
    if (survey) {
      await supabase.from('research_surveys').update({
        responses_count: (survey.responses_count || 0) + 1,
        total_responses: (survey.total_responses || 0) + 1,
      }).eq('id', surveyId);
    }
    return true;
  },

  async deleteSurvey(surveyId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      // First delete associated survey responses
      await supabase.from('survey_responses').delete().eq('survey_id', surveyId);
      // Delete survey from research_surveys table
      const { error } = await supabase.from('research_surveys').delete().eq('id', surveyId);
      if (error) {
        console.error('[Supabase] Failed to delete survey:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Supabase] Error deleting survey:', err);
      return false;
    }
  },

  // --- HERO SETTINGS ---
  async fetchHeroSettings(): Promise<HeroBannerSettings | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('hero_settings').select('*').eq('id', 'current').single();
    if (error) {
      console.warn('[Supabase] Failed to fetch hero settings:', error.message);
      return null;
    }
    return mapHeroFromDb(data);
  },

  async updateHeroSettings(settings: HeroBannerSettings): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('hero_settings').upsert(mapHeroToDb(settings));
    if (error) console.error('[Supabase] Failed to update hero settings:', error.message);
    return !error;
  },

  // --- DAILY QUOTE ---
  async fetchDailyQuote(): Promise<DailyQuote | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('daily_quotes').select('*').eq('id', 'today').single();
    if (error) {
      console.warn('[Supabase] Failed to fetch daily quote:', error.message);
      return null;
    }
    return mapDailyQuoteFromDb(data);
  },

  async updateDailyQuote(quote: DailyQuote): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('daily_quotes').upsert(mapDailyQuoteToDb(quote));
    if (error) console.error('[Supabase] Failed to update daily quote:', error.message);
    return !error;
  },

  // --- SHOWCASE ITEMS ---
  async fetchShowcaseItems(): Promise<ShowcaseItem[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('showcase_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      console.warn('[Supabase] Failed to fetch showcase items:', error.message);
      return null;
    }
    return data.map(mapShowcaseFromDb);
  },

  async upsertShowcaseItem(item: ShowcaseItem, sortOrder: number = 0): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase
      .from('showcase_items')
      .upsert(mapShowcaseToDb(item, sortOrder));
    if (error) console.error('[Supabase] Failed to upsert showcase item:', error.message);
    return !error;
  },

  async deleteShowcaseItem(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    // Also delete by alias if it's darpan-fest <-> showcase_darpan etc.
    const idsToDelete = [id];
    if (id === 'darpan-fest') idsToDelete.push('showcase_darpan');
    if (id === 'showcase_darpan') idsToDelete.push('darpan-fest');
    if (id === 'talk-series') idsToDelete.push('showcase_talkseries');
    if (id === 'showcase_talkseries') idsToDelete.push('talk-series');
    if (id === 'quantum-tech') idsToDelete.push('showcase_ai_conclave');
    if (id === 'showcase_ai_conclave') idsToDelete.push('quantum-tech');

    const { error } = await supabase
      .from('showcase_items')
      .delete()
      .in('id', idsToDelete);
    if (error) console.error('[Supabase] Failed to delete showcase item:', error.message);
    return !error;
  },

  async bulkSyncShowcaseItems(items: ShowcaseItem[]): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const rows = items.map((item, idx) => mapShowcaseToDb(item, idx));
    const { error } = await supabase.from('showcase_items').upsert(rows);
    if (error) console.error('[Supabase] Failed to bulk sync showcase items:', error.message);
    return !error;
  },

  // --- STUDENT INQUIRIES ---
  async fetchInquiries(): Promise<StudentInquiry[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('student_inquiries')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) {
      console.warn('[Supabase] Failed to fetch student inquiries:', error.message);
      return null;
    }
    return data.map(mapInquiryFromDb);
  },

  async insertInquiry(inquiry: StudentInquiry): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase
      .from('student_inquiries')
      .insert(mapInquiryToDb(inquiry));
    if (error) console.error('[Supabase] Failed to insert student inquiry:', error.message);
    return !error;
  },

  async updateInquiryStatus(id: string, status: string, adminResponse?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const updates: Record<string, any> = { status };
    if (adminResponse !== undefined) updates.admin_response = adminResponse;
    const { error } = await supabase
      .from('student_inquiries')
      .update(updates)
      .eq('id', id);
    if (error) console.error('[Supabase] Failed to update inquiry status:', error.message);
    return !error;
  },

  async deleteInquiry(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase
      .from('student_inquiries')
      .delete()
      .eq('id', id);
    if (error) console.error('[Supabase] Failed to delete inquiry:', error.message);
    return !error;
  },
};
