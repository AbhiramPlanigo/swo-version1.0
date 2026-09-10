import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate, CertificateType, CertificateTemplateId, CertificateSignatory } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { 
  CertificateRenderer, 
  CERTIFICATE_TEMPLATES, 
  DEFAULT_SIGNATORIES 
} from '../common/CertificateRenderer';
import { ImageUploadField } from '../common/ImageUploadField';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Send, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Search, 
  Calendar,
  Layers,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Printer,
  Info,
  Check,
  Loader2,
  FileText
} from 'lucide-react';
import { 
  downloadCertificateAsPdf, 
  downloadCertificateAsJpeg,
  printCertificate
} from '../../utils/certificateExporter';

/**
 * Proportional scale wrapper that renders the authentic 900px × 636px certificate
 * fitted cleanly to the available width with zero overflow and zero clipping.
 */
export const CertificatePreviewScaleWrapper: React.FC<{ children: React.ReactNode; maxScale?: number }> = ({ 
  children,
  maxScale = 1 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        // 900px is the physical standard A4 landscape design width
        const calculatedScale = Math.min(maxScale, Math.max(0.35, availableWidth / 900));
        setScale(calculatedScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
    };
  }, [maxScale]);

  return (
    <div ref={containerRef} className="w-full flex justify-center items-start overflow-hidden py-1">
      <div
        style={{
          width: '900px',
          height: '636px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: `-${636 * (1 - scale)}px`,
        }}
        className="transition-transform duration-150 ease-out shrink-0"
      >
        {children}
      </div>
    </div>
  );
};

export const AdminCertificatesView: React.FC = () => {
  const { events, registrations, certificates, bulkGenerateCertificates } = useApp();

  // Active Studio Tab: 'headings' | 'signatories' | 'dispatch'
  const [activeStudioTab, setActiveStudioTab] = useState<'headings' | 'signatories' | 'dispatch'>('headings');

  // 1. Template & Credential Selection
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [certType, setCertType] = useState<CertificateType>('Participation');
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplateId>('classic-gold');

  // 2. Institutional Branding (Fully Editable)
  const [universityTitle, setUniversityTitle] = useState('CHRIST (Deemed to be University)');
  const [campusSubtitle, setCampusSubtitle] = useState('Bangalore Yeshwanthpur Campus');
  const [officeSubtitle, setOfficeSubtitle] = useState('STUDENT WELFARE OFFICE');

  // 3. Award Heading & Conferral Tagline (Fully Editable)
  const [certificateHeading, setCertificateHeading] = useState('Certificate of Participation');
  const [conferralLine, setConferralLine] = useState('THIS IS PROUDLY CONFERRED UPON');

  // 4. Recipient Information (Fully Editable)
  const [previewStudentName, setPreviewStudentName] = useState('Aarav Sharma');
  const [previewRegNo, setPreviewRegNo] = useState('2447101');
  const [previewDepartment, setPreviewDepartment] = useState('School of Sciences (Computer Science)');

  // 5. Event & Commendation Citation (Fully Editable)
  const [previewEventTitle, setPreviewEventTitle] = useState(events[0]?.title || 'Flagship Campus Conclave');
  const [previewEventDate, setPreviewEventDate] = useState(events[0]?.date || 'March 14, 2026');
  const [citationNote, setCitationNote] = useState('');
  
  // 6. Security Footer & Verification (Fully Editable)
  const [previewCertNo, setPreviewCertNo] = useState('CU-SWO-2026-PREVIEW-8841');
  const [verificationBadgeText, setVerificationBadgeText] = useState('Verified by Directorate Seal • Bangalore Yeshwanthpur');
  const [previewIssuedDate, setPreviewIssuedDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );

  // 7. Dynamic Signatories state (1 to 4)
  const [signatories, setSignatories] = useState<CertificateSignatory[]>(DEFAULT_SIGNATORIES);
  
  const [searchIssued, setSearchIssued] = useState('');
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleDownloadPdf = async (elementId = 'printable-certificate', name?: string) => {
    try {
      setIsExportingPdf(true);
      await downloadCertificateAsPdf(elementId, name || `Christ_Certificate_${currentEvent?.title || 'Credential'}`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Could not export PDF. Please try again or use the Print button.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJpeg = async (elementId = 'printable-certificate', name?: string) => {
    try {
      setIsExportingJpeg(true);
      await downloadCertificateAsJpeg(elementId, name || `Christ_Certificate_${currentEvent?.title || 'Credential'}`);
    } catch (err) {
      console.error('JPEG export error:', err);
      alert('Could not export JPEG image. Please try again.');
    } finally {
      setIsExportingJpeg(false);
    }
  };

  // Synchronize when certificate type changes with authentic diploma terminology
  const handleCertTypeChange = (newType: CertificateType) => {
    setCertType(newType);
    if (newType === 'Winner') {
      setCertificateHeading('Certificate of Merit');
      setConferralLine('AWARDED FOR SECURING FIRST PLACE • DISTINGUISHED EXCELLENCE');
    } else if (newType === 'Runner-up') {
      setCertificateHeading('Certificate of Merit');
      setConferralLine('AWARDED FOR SECURING SECOND PLACE • DISTINGUISHED EXCELLENCE');
    } else if (newType === 'Merit') {
      setCertificateHeading('Certificate of Merit');
      setConferralLine('AWARDED FOR OUTSTANDING MERIT, LEADERSHIP & DEDICATED SERVICE');
    } else if (newType === 'Excellence') {
      setCertificateHeading('Certificate of Excellence');
      setConferralLine('CONFERRED FOR EXCEPTIONAL CAMPUS LEADERSHIP & EXEMPLARY VALOR');
    } else if (newType === 'Appreciation') {
      setCertificateHeading('Certificate of Appreciation');
      setConferralLine('CONFERRED IN SINCERE GRATITUDE FOR DEDICATED SERVICE & SUPPORT');
    } else if (newType === 'Distinction') {
      setCertificateHeading('Certificate of Distinction');
      setConferralLine('ACADEMIC HONOR & DISTINCTION • AWARDED TO');
    } else if (newType === 'Volunteer') {
      setCertificateHeading('Certificate of Recognition');
      setConferralLine('AWARDED IN HONOUR OF COMMENDABLE VOLUNTEER SERVICE');
    } else {
      setCertificateHeading(`Certificate of ${newType}`);
      setConferralLine('THIS IS PROUDLY CONFERRED UPON');
    }
  };

  // Synchronize when event selection changes
  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const evt = events.find((e) => e.id === eventId);
    if (evt) {
      setPreviewEventTitle(evt.title);
      setPreviewEventDate(evt.date);
    }
  };

  // Populate citation editor with authentic official wording
  const handlePopulateDefaultCitation = () => {
    const defaultText = `in formal recognition of commendable participation and meritorious contribution to "${
      previewEventTitle || currentEvent?.title || 'Flagship Campus Conclave'
    }", organized under the auspices of the Student Welfare Office, Bangalore Yeshwanthpur Campus on ${
      previewEventDate || currentEvent?.date || 'March 14, 2026'
    }, demonstrating exemplary dedication to campus life and academic excellence.`;
    setCitationNote(defaultText);
  };

  // Reset all certificate fields to official Christ University standards
  const handleResetAllToDefaults = () => {
    setUniversityTitle('CHRIST (Deemed to be University)');
    setCampusSubtitle('Bangalore Yeshwanthpur Campus');
    setOfficeSubtitle('STUDENT WELFARE OFFICE');
    setCertificateHeading('Certificate of Participation');
    setConferralLine('THIS IS PROUDLY CONFERRED UPON');
    setPreviewStudentName('Aarav Sharma');
    setPreviewRegNo('2447101');
    setPreviewDepartment('School of Sciences (Computer Science)');
    setCitationNote('');
    setPreviewCertNo('CU-SWO-2026-PREVIEW-8841');
    setVerificationBadgeText('Verified by Directorate Seal • Bangalore Yeshwanthpur');
    setPreviewIssuedDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  };

  // Eligible attendees for selected event
  const eligibleAttendees = registrations.filter(
    (r) => r.eventId === currentEvent?.id && r.status === 'Attended'
  );

  // Signatory management
  const handleAddSignatory = () => {
    if (signatories.length >= 4) return;
    const newId = `sig-${Date.now()}`;
    setSignatories([
      ...signatories,
      {
        id: newId,
        name: 'Dr. Thomas C. Mathew',
        designation: 'Vice Chancellor, Christ University',
      },
    ]);
  };

  const handleRemoveSignatory = (id: string) => {
    if (signatories.length <= 1) return;
    setSignatories(signatories.filter((s) => s.id !== id));
  };

  const handleUpdateSignatory = (id: string, field: 'name' | 'designation', value: string) => {
    setSignatories(
      signatories.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSignatureUpload = (id: string, file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Please upload a valid JPEG or PNG image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSignatories(
        signatories.map((s) => (s.id === id ? { ...s, signatureUrl: dataUrl } : s))
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignatureImage = (id: string) => {
    setSignatories(
      signatories.map((s) => (s.id === id ? { ...s, signatureUrl: undefined } : s))
    );
  };

  const handleSetSignatoryCount = (count: number) => {
    const fullList: CertificateSignatory[] = [
      {
        id: 'sig-b1',
        name: 'Dr. Fr. Benny Thomas',
        designation: 'Director, Bangalore Yeshwanthpur Campus',
      },
      {
        id: 'sig-j2',
        name: 'Dr. Joby Thomas',
        designation: 'Dean, Bangalore Yeshwanthpur Campus',
      },
      {
        id: 'sig-t3',
        name: 'Dr. Thomas C. Mathew',
        designation: 'Vice Chancellor, Christ University',
      },
      {
        id: 'sig-m4',
        name: 'Dr. Mathew K. Varghese',
        designation: 'Director, Student Welfare Office',
      },
    ];

    if (count <= signatories.length) {
      setSignatories(signatories.slice(0, count));
    } else {
      const needed = fullList.slice(signatories.length, count);
      setSignatories([...signatories, ...needed]);
    }
  };

  const handleQuickPreset = (presetType: 'benny-joby' | 'three-signatories' | 'four-signatories') => {
    if (presetType === 'benny-joby') {
      setSignatories([
        {
          id: 'sig-b1',
          name: 'Dr. Fr. Benny Thomas',
          designation: 'Director, Bangalore Yeshwanthpur Campus',
        },
        {
          id: 'sig-j2',
          name: 'Dr. Joby Thomas',
          designation: 'Dean, Bangalore Yeshwanthpur Campus',
        }
      ]);
    } else if (presetType === 'three-signatories') {
      setSignatories([
        {
          id: 'sig-b1',
          name: 'Dr. Fr. Benny Thomas',
          designation: 'Director, Bangalore Yeshwanthpur Campus',
        },
        {
          id: 'sig-j2',
          name: 'Dr. Joby Thomas',
          designation: 'Dean, Bangalore Yeshwanthpur Campus',
        },
        {
          id: 'sig-m3',
          name: 'Dr. Mathew K. Varghese',
          designation: 'Director, Student Welfare Office',
        }
      ]);
    } else {
      setSignatories([
        {
          id: 'sig-b1',
          name: 'Dr. Fr. Benny Thomas',
          designation: 'Director, Bangalore Yeshwanthpur Campus',
        },
        {
          id: 'sig-j2',
          name: 'Dr. Joby Thomas',
          designation: 'Dean, Bangalore Yeshwanthpur Campus',
        },
        {
          id: 'sig-t3',
          name: 'Dr. Thomas C. Mathew',
          designation: 'Vice Chancellor, Christ University',
        },
        {
          id: 'sig-m4',
          name: 'Dr. Mathew K. Varghese',
          designation: 'Director, Student Welfare Office',
        }
      ]);
    }
  };

  const handleBulkGenerate = () => {
    if (!currentEvent) return;

    if (eligibleAttendees.length === 0) {
      alert('No attendees marked as "Attended" for this event yet. Please mark attendance at gates first!');
      return;
    }

    const leadSig = signatories[0]?.name || 'Dr. Fr. Benny Thomas';
    const leadDes = signatories[0]?.designation || 'Director, Bangalore Yeshwanthpur Campus';

    bulkGenerateCertificates(
      currentEvent.id,
      certType,
      leadSig,
      leadDes,
      selectedTemplate,
      signatories,
      citationNote.trim() || undefined,
      {
        universityTitle: universityTitle.trim() || undefined,
        campusSubtitle: campusSubtitle.trim() || undefined,
        officeSubtitle: officeSubtitle.trim() || undefined,
        certificateHeading: certificateHeading.trim() || undefined,
        conferralLine: conferralLine.trim() || undefined,
        verificationBadgeText: verificationBadgeText.trim() || undefined,
      }
    );

    // Confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C5A063', '#0071E3', '#7E1D2D'],
    });

    setGenerationNotice(
      `Successfully generated and dispatched ${eligibleAttendees.length} custom certificates with ${signatories.length} official signatories to student portals!`
    );

    setTimeout(() => {
      setGenerationNotice(null);
    }, 6000);
  };

  const filteredIssued = certificates.filter((c) => {
    if (!searchIssued.trim()) return true;
    const q = searchIssued.toLowerCase();
    return (
      c.studentName.toLowerCase().includes(q) ||
      c.studentRegNo.toLowerCase().includes(q) ||
      c.certificateNo.toLowerCase().includes(q) ||
      c.eventTitle.toLowerCase().includes(q)
    );
  });

  // Real-time live certificate preview model bound to all inputs
  const livePreviewData = {
    certificateNo: previewCertNo,
    studentName: previewStudentName,
    studentRegNo: previewRegNo,
    department: previewDepartment,
    eventTitle: previewEventTitle || currentEvent?.title || 'Flagship Campus Conclave',
    eventDate: previewEventDate || currentEvent?.date || 'March 14, 2026',
    type: certType,
    issuedDate: previewIssuedDate,
    templateId: selectedTemplate,
    signatories: signatories,
    citationText: citationNote.trim() || undefined,
    universityTitle: universityTitle.trim() || undefined,
    campusSubtitle: campusSubtitle.trim() || undefined,
    officeSubtitle: officeSubtitle.trim() || undefined,
    certificateHeading: certificateHeading.trim() || undefined,
    conferralLine: conferralLine.trim() || undefined,
    verificationBadgeText: verificationBadgeText.trim() || undefined,
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#AF52DE]/10 text-[#AF52DE] dark:bg-purple-950/40 dark:text-purple-400">
              Credential Studio & Customization Engine
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Yeshwanthpur Campus SWO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Certificate Studio & Signatory Engine
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-1">
            Every element is fully customizable—from university branding, award heading, and citation to 1–4 authorized signatories and verification seals.
          </p>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: TEMPLATE SELECTOR (4 OFFICIAL CHRIST TEMPLATES)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#002147] dark:text-[#93C5FD] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C5A063]" />
            1. Select Official Certificate Template (3-4 Specialized Styles)
          </label>
          <span className="text-[11px] text-[#86868B] dark:text-slate-400">
            Click any style to switch live preview instantly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CERTIFICATE_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-[#1E293B] border-[#0071E3] dark:border-[#38BDF8] ring-2 ring-[#0071E3]/20 shadow-md scale-[1.01]'
                    : 'bg-white dark:bg-[#141A26] border-black/[0.08] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#0071E3] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${tmpl.badgeColor}`}>
                    {tmpl.id}
                  </span>
                  <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-[#86868B] dark:text-slate-400 mt-1 leading-snug">
                    {tmpl.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: CUSTOMIZATION STUDIO & LIVE PREVIEW (SPLIT LAYOUT)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Full Customization Studio (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Studio Navigation Segmented Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveStudioTab('headings')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeStudioTab === 'headings'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0071E3] dark:text-[#38BDF8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Text & Headings</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStudioTab('signatories')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeStudioTab === 'signatories'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0071E3] dark:text-[#38BDF8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Signatories ({signatories.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStudioTab('dispatch')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeStudioTab === 'dispatch'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0071E3] dark:text-[#38BDF8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>3. Dispatch</span>
            </button>
          </div>

          {/* TAB 1: ALL HEADINGS & TEXT EDITORS */}
          {activeStudioTab === 'headings' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Reset to defaults header banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0071E3]/[0.06] border border-[#0071E3]/20">
                <div className="text-xs">
                  <span className="font-bold text-[#0071E3] dark:text-blue-400 block">Live Certificate Text Studio</span>
                  <span className="text-[11px] text-[#86868B] dark:text-slate-400">All edits update the preview instantly</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetAllToDefaults}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Reset Defaults
                </button>
              </div>

              {/* 1. Institutional Branding */}
              <AppleCard padding="md" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#002147] dark:text-[#93C5FD]">
                    Institutional Branding & Header
                  </span>
                  <span className="text-[10px] text-[#86868B]">Single-line layout</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      University Title (Primary Heading)
                    </label>
                    <input
                      type="text"
                      value={universityTitle}
                      onChange={(e) => setUniversityTitle(e.target.value)}
                      placeholder="e.g. CHRIST (Deemed to be University)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                        Campus Subtitle
                      </label>
                      <input
                        type="text"
                        value={campusSubtitle}
                        onChange={(e) => setCampusSubtitle(e.target.value)}
                        placeholder="e.g. Bangalore Yeshwanthpur Campus"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                        Office Subtitle
                      </label>
                      <input
                        type="text"
                        value={officeSubtitle}
                        onChange={(e) => setOfficeSubtitle(e.target.value)}
                        placeholder="e.g. STUDENT WELFARE OFFICE"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                      />
                    </div>
                  </div>
                </div>
              </AppleCard>

              {/* 2. Certificate Award Title & Conferral Tagline */}
              <AppleCard padding="md" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#002147] dark:text-[#93C5FD]">
                    Award Heading & Conferral Tagline
                  </span>
                  <span className="text-[10px] text-[#0071E3] font-semibold">Fully Editable</span>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                        Preset Credential Type
                      </label>
                      <select
                        value={certType}
                        onChange={(e) => handleCertTypeChange(e.target.value as CertificateType)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                      >
                        <option value="Participation">Participation</option>
                        <option value="Merit">Merit</option>
                        <option value="Winner">Winner</option>
                        <option value="Excellence">Excellence</option>
                        <option value="Organizing Team">Organizing Team</option>
                        <option value="Volunteer">Volunteer Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                        Certificate Heading (Main Title) *
                      </label>
                      <input
                        type="text"
                        value={certificateHeading}
                        onChange={(e) => setCertificateHeading(e.target.value)}
                        placeholder="e.g. Certificate of Participation"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs font-bold text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Conferral Line (Tagline between rules)
                    </label>
                    <input
                      type="text"
                      value={conferralLine}
                      onChange={(e) => setConferralLine(e.target.value)}
                      placeholder="e.g. AWARDED FOR OUTSTANDING MERIT, LEADERSHIP & DEDICATED SERVICE"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                </div>
              </AppleCard>

              {/* 3. Recipient Information */}
              <AppleCard padding="md" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#002147] dark:text-[#93C5FD]">
                  Recipient Student Details (Preview & Single)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={previewStudentName}
                      onChange={(e) => setPreviewStudentName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Registration No *
                    </label>
                    <input
                      type="text"
                      value={previewRegNo}
                      onChange={(e) => setPreviewRegNo(e.target.value)}
                      placeholder="e.g. 2447101"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs font-mono text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Department / School
                    </label>
                    <input
                      type="text"
                      value={previewDepartment}
                      onChange={(e) => setPreviewDepartment(e.target.value)}
                      placeholder="e.g. School of Sciences"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                </div>
              </AppleCard>

              {/* 4. Event Title & Citation Paragraph */}
              <AppleCard padding="md" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#002147] dark:text-[#93C5FD]">
                    Event & Citation Commendation Paragraph
                  </span>
                  <button
                    type="button"
                    onClick={handlePopulateDefaultCitation}
                    className="text-[11px] text-[#0071E3] dark:text-blue-400 font-semibold hover:underline"
                  >
                    Load Official SWO Citation
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={previewEventTitle}
                      onChange={(e) => setPreviewEventTitle(e.target.value)}
                      placeholder="e.g. Flagship Campus Conclave"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Event Date / Conclave Date
                    </label>
                    <input
                      type="text"
                      value={previewEventDate}
                      onChange={(e) => setPreviewEventDate(e.target.value)}
                      placeholder="e.g. March 14, 2026"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                    Citation Paragraph (Edit any phrase directly)
                  </label>
                  <textarea
                    rows={4}
                    value={citationNote}
                    onChange={(e) => setCitationNote(e.target.value)}
                    placeholder="Leave empty to use the official formatted Christ SWO citation, or edit directly..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs leading-relaxed text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </AppleCard>

              {/* 5. Footer Security & Verification Metadata */}
              <AppleCard padding="md" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#002147] dark:text-[#93C5FD]">
                  Institutional Footer & Security Metadata
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Certificate ID / Serial
                    </label>
                    <input
                      type="text"
                      value={previewCertNo}
                      onChange={(e) => setPreviewCertNo(e.target.value)}
                      placeholder="CU-SWO-2026-..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs font-mono text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Verification Badge Text
                    </label>
                    <input
                      type="text"
                      value={verificationBadgeText}
                      onChange={(e) => setVerificationBadgeText(e.target.value)}
                      placeholder="Verified by Directorate Seal..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      value={previewIssuedDate}
                      onChange={(e) => setPreviewIssuedDate(e.target.value)}
                      placeholder="September 9, 2026"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                </div>
              </AppleCard>
            </div>
          )}

          {/* TAB 2: SIGNATORIES STUDIO (1 TO 4 PEOPLE, JPEG UPLOADS & RATIO GUIDE) */}
          {activeStudioTab === 'signatories' && (
            <AppleCard padding="lg" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-4 transition-colors animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#002147] dark:text-[#93C5FD] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#C5A063]" />
                    Signatory Studio ({signatories.length} of 4)
                  </h3>
                  <p className="text-[11px] text-[#86868B] dark:text-slate-400">
                    Customizable signatories & official JPEG signatures
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSignatory}
                  disabled={signatories.length >= 4}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    signatories.length >= 4
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/5'
                      : 'bg-[#0071E3] text-white hover:bg-[#005bb5] active:scale-95 shadow-xs'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Person</span>
                </button>
              </div>

              {/* Layout Signatory Count Switcher (1, 2, 3, or 4) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#86868B] dark:text-slate-400 uppercase font-semibold">
                    Select Signatories Count:
                  </span>
                  <span className="text-[10px] text-[#0071E3] dark:text-blue-400 font-semibold">
                    {signatories.length === 1 && '1 Person (Centered)'}
                    {signatories.length === 2 && '2 People (Symmetrically Balanced Left & Right)'}
                    {signatories.length === 3 && '3 People (3 Balanced Columns)'}
                    {signatories.length === 4 && '4 People (4 Columns Across A4 Sheet)'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSetSignatoryCount(num)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                        signatories.length === num
                          ? 'bg-white dark:bg-[#1E293B] text-[#0071E3] dark:text-[#38BDF8] shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {num} {num === 1 ? 'Person' : 'People'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick preset templates */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 uppercase font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('benny-joby')}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[#1D1D1F] dark:text-slate-200 hover:bg-[#C5A063]/20 transition-colors"
                >
                  Dr. Benny + Dr. Joby (2)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('three-signatories')}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[#1D1D1F] dark:text-slate-200 hover:bg-[#C5A063]/20 transition-colors"
                >
                  Benny + Joby + Mathew (3)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('four-signatories')}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[#1D1D1F] dark:text-slate-200 hover:bg-[#C5A063]/20 transition-colors"
                >
                  Full 4-Person Panel
                </button>
              </div>

              {/* Aspect Ratio Guide Box */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                  <Info className="w-3.5 h-3.5" /> Signature Upload Specifications
                </div>
                <p className="leading-relaxed">
                  • <strong>Recommended Aspect Ratio: 3:1</strong> (e.g. 300 × 100 px or 450 × 150 px).<br />
                  • Format: <strong>JPEG or PNG</strong> with clean white or transparent background.<br />
                  • File size limit: Under 2MB for high-resolution vector scaling.
                </p>
              </div>

              {/* List of Signatories */}
              <div className="space-y-4">
                {signatories.map((sig, idx) => (
                  <div
                    key={sig.id}
                    className="p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#002147] dark:text-[#93C5FD]">
                        Signatory #{idx + 1}
                      </span>
                      {signatories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSignatory(sig.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove signatory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                          Signatory Name *
                        </label>
                        <input
                          type="text"
                          value={sig.name}
                          onChange={(e) => handleUpdateSignatory(sig.id, 'name', e.target.value)}
                          placeholder="e.g. Dr. Fr. Benny Thomas"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#86868B] dark:text-slate-400 block mb-1">
                          Designation / Title *
                        </label>
                        <input
                          type="text"
                          value={sig.designation}
                          onChange={(e) => handleUpdateSignatory(sig.id, 'designation', e.target.value)}
                          placeholder="e.g. Director, Bangalore Yeshwanthpur"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                        />
                      </div>
                    </div>

                    {/* JPEG / PNG Signature Asset with Crop & Zoom */}
                    <div className="pt-2">
                      <ImageUploadField
                        label="Official Authorized Signature Asset"
                        value={sig.signatureUrl || ''}
                        onChange={(url) => {
                          setSignatories(
                            signatories.map((s) => (s.id === sig.id ? { ...s, signatureUrl: url || undefined } : s))
                          );
                        }}
                        aspectRatio="3:1"
                        recommendedDimensions="1200 × 400 px"
                        description="This is the ratio of the image allowed: 3:1 Banner Strip. Clean transparent PNG or crisp scanned signature (authentic serif script rendered if left blank)."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AppleCard>
          )}

          {/* TAB 3: DISPATCH PIPELINE & ATTENDEE GENERATION */}
          {activeStudioTab === 'dispatch' && (
            <AppleCard padding="lg" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-4 transition-colors animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-[#002147] dark:text-[#93C5FD] uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#AF52DE] dark:text-purple-400" /> Dispatch Pipeline
              </div>

              {/* Select Event */}
              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">Select Event *</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs font-medium text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-blue-500/30 focus:outline-none"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id} className="bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white">
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendee count pill */}
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#86868B] dark:text-slate-400">Verified Attendees:</span>
                <span className="font-bold text-[#28A745] dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {eligibleAttendees.length} students
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0071E3]/[0.06] border border-[#0071E3]/20 text-xs text-[#0071E3] dark:text-blue-300 space-y-1">
                <span className="font-bold block">Customized Configuration Applied</span>
                <p className="text-[11px] text-[#86868B] dark:text-slate-400 leading-relaxed">
                  All generated certificates will inherit your customized university branding, heading, tagline, citation, and {signatories.length} authorized signatories.
                </p>
              </div>

              {generationNotice && (
                <div className="p-3 rounded-xl bg-[#34C759]/10 border border-[#34C759]/30 text-xs text-[#28A745] dark:text-emerald-400 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generationNotice}</span>
                </div>
              )}

              <div className="pt-2">
                <AppleButton
                  variant="primary"
                  size="md"
                  className="w-full text-xs"
                  icon={<Send className="w-4 h-4" />}
                  onClick={handleBulkGenerate}
                >
                  Sign & Bulk Dispatch ({eligibleAttendees.length} Attendees)
                </AppleButton>
              </div>
            </AppleCard>
          )}
        </div>

        {/* Right Column: Real-Time Live Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A063]" />
              Real-Time Live Certificate Output Preview
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] dark:text-blue-300 border border-[#0071E3]/20">
                A4 Landscape: 297 mm × 210 mm
              </span>
              <span className="text-[10px] text-[#86868B] dark:text-slate-400 font-medium">
                {signatories.length} {signatories.length === 1 ? 'Signatory' : 'Signatories'} Aligned
              </span>
              
              {/* Direct Download & Print Action Buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={() => handleDownloadPdf('printable-certificate', `Christ_Certificate_${selectedTemplate}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#005bb5] active:scale-95 transition-all shadow-xs disabled:opacity-50"
                  title="Download A4 Landscape PDF directly"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  disabled={isExportingJpeg}
                  onClick={() => handleDownloadJpeg('printable-certificate', `Christ_Certificate_${selectedTemplate}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#AF52DE] text-white hover:bg-purple-600 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                  title="Download high-resolution JPEG image"
                >
                  {isExportingJpeg ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  <span>{isExportingJpeg ? 'Exporting...' : 'Download JPEG'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => printCertificate('printable-certificate')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-[#1D1D1F] dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 active:scale-95 transition-all"
                  title="Print / Save as PDF via browser print"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time CertificateRenderer mount with auto-fitting scale */}
          <div className="pb-4">
            <CertificatePreviewScaleWrapper>
              <CertificateRenderer
                certificate={livePreviewData}
                customTemplateId={selectedTemplate}
                previewSignatories={signatories}
              />
            </CertificatePreviewScaleWrapper>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ALREADY DISPATCHED CERTIFICATES REGISTRY TABLE
          ========================================================================= */}
      <div className="space-y-4 pt-6 border-t border-black/[0.08] dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight">
              Issued Credentials Registry ({certificates.length})
            </h3>
            <p className="text-xs text-[#86868B] dark:text-slate-400">
              Inspect student credentials, view active template designs, or reprint.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, reg no, event..."
              value={searchIssued}
              onChange={(e) => setSearchIssued(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white dark:bg-[#141A26] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 shadow-xs"
            />
          </div>
        </div>

        <AppleCard padding="none" className="border border-black/[0.06] dark:border-white/10 overflow-hidden dark:bg-[#141A26]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F7] dark:bg-[#1E293B] text-[#86868B] dark:text-slate-400 font-semibold border-b border-black/[0.06] dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/10 text-[#1D1D1F] dark:text-slate-200">
                {filteredIssued.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#86868B] dark:text-slate-400">
                      No certificates match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIssued.map((c) => (
                    <tr key={c.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0071E3] dark:text-[#60A5FA]">
                        {c.certificateNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1D1D1F] dark:text-white">{c.studentName}</div>
                        <div className="text-[10px] text-[#86868B] dark:text-slate-400">{c.studentRegNo}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[220px] truncate">{c.eventTitle}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] dark:bg-blue-950/40 dark:text-blue-300">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10px] font-mono capitalize">
                        {c.templateId || 'classic-gold'}
                      </td>
                      <td className="py-3 px-4 text-[#86868B] dark:text-slate-400">{c.issuedDate}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setPreviewCert(c)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F5F7] dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#1D1D1F] dark:text-white transition-colors"
                        >
                          View & Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AppleCard>
      </div>

      {/* Modal for viewing single already-issued certificate */}
      {previewCert && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewCert(null)}
          title={`Certificate: ${previewCert.certificateNo}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <CertificatePreviewScaleWrapper>
              <CertificateRenderer certificate={previewCert} elementId="modal-certificate" />
            </CertificatePreviewScaleWrapper>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#86868B]">
                Cryptographically registered on official Christ University SWO registry.
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <AppleButton
                  variant="secondary"
                  size="md"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => printCertificate('modal-certificate')}
                >
                  Print Certificate
                </AppleButton>
                <AppleButton
                  variant="secondary"
                  size="md"
                  icon={<ImageIcon className="w-4 h-4 text-[#AF52DE]" />}
                  onClick={() => handleDownloadJpeg('modal-certificate', `Certificate_${previewCert.certificateNo}_${previewCert.studentName}`)}
                  disabled={isExportingJpeg}
                >
                  {isExportingJpeg ? 'Saving JPEG...' : 'Download JPEG'}
                </AppleButton>
                <AppleButton
                  variant="primary"
                  size="md"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => handleDownloadPdf('modal-certificate', `Certificate_${previewCert.certificateNo}_${previewCert.studentName}`)}
                  disabled={isExportingPdf}
                >
                  {isExportingPdf ? 'Generating PDF...' : 'Download Official PDF'}
                </AppleButton>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
