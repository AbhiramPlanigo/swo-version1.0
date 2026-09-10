import React from 'react';
import { CertificateSignatory, CertificateTemplateId, CertificateType } from '../../types';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { CHRIST_CREST_DATA_URL, SWO_LOGO_DATA_URL } from '../../assets/certificateAssets';

export interface CertificateRendererProps {
  certificate: {
    certificateNo: string;
    studentName: string;
    studentRegNo: string;
    department?: string;
    eventTitle: string;
    eventDate: string;
    type: CertificateType;
    issuedDate?: string;
    qrVerifyCode?: string;
    templateId?: CertificateTemplateId;
    signatories?: CertificateSignatory[];
    citationText?: string;
    universityTitle?: string;
    campusSubtitle?: string;
    officeSubtitle?: string;
    certificateHeading?: string;
    conferralLine?: string;
    verificationBadgeText?: string;
  };
  customTemplateId?: CertificateTemplateId;
  previewSignatories?: CertificateSignatory[];
  className?: string;
  elementId?: string;
}

export const DEFAULT_SIGNATORIES: CertificateSignatory[] = [
  {
    id: 'sig-1',
    name: 'Dr. Fr. Benny Thomas',
    designation: 'Director, Bangalore Yeshwanthpur Campus',
  },
  {
    id: 'sig-2',
    name: 'Dr. Joby Thomas',
    designation: 'Dean, Bangalore Yeshwanthpur Campus',
  },
  {
    id: 'sig-3',
    name: 'Dr. Mathew K. Varghese',
    designation: 'Director, Student Welfare Office',
  },
];

export const CERTIFICATE_TEMPLATES: {
  id: CertificateTemplateId;
  name: string;
  tagline: string;
  badgeColor: string;
}[] = [
  {
    id: 'classic-gold',
    name: 'Classic Gold Crest',
    tagline: 'Imperial Navy & Gold Filigree • Formal Convocation Style',
    badgeColor: 'bg-[#C59B27] text-white',
  },
  {
    id: 'modern-blue',
    name: 'Modern Executive Blue',
    tagline: 'Contemporary Sapphire & Platinum • Clean Architectural Lines',
    badgeColor: 'bg-[#0071E3] text-white',
  },
  {
    id: 'minimal-academic',
    name: 'Minimalist Academic Seal',
    tagline: 'Understated Platinum Slate • Timeless Precision Monogram',
    badgeColor: 'bg-[#475569] text-white',
  },
  {
    id: 'heritage-distinction',
    name: 'Heritage Honor Roll',
    tagline: 'Ivory Parchment & Deep Burgundy • Ornate Calligraphic Heraldry',
    badgeColor: 'bg-[#7E1D2D] text-white',
  },
];

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  certificate,
  customTemplateId,
  previewSignatories,
  className = '',
  elementId = 'printable-certificate',
}) => {
  const activeTemplate: CertificateTemplateId =
    customTemplateId || certificate.templateId || 'classic-gold';

  const signatories: CertificateSignatory[] =
    previewSignatories && previewSignatories.length > 0
      ? previewSignatories
      : certificate.signatories && certificate.signatories.length > 0
      ? certificate.signatories
      : DEFAULT_SIGNATORIES;

  // Stately, authentic university title and subtitles
  const universityTitle =
    certificate.universityTitle?.trim() || 'CHRIST (Deemed to be University)';

  const campusSubtitle =
    certificate.campusSubtitle?.trim() ||
    (activeTemplate === 'heritage-distinction'
      ? 'Bangalore Yeshwanthpur Campus • Institutional Honor Roll'
      : activeTemplate === 'modern-blue'
      ? 'Directorate of Student Welfare • Bangalore Yeshwanthpur'
      : 'Bangalore Yeshwanthpur Campus');

  const officeSubtitle =
    certificate.officeSubtitle?.trim() ||
    (activeTemplate === 'modern-blue'
      ? 'OFFICIAL EXECUTIVE CREDENTIAL'
      : 'STUDENT WELFARE OFFICE');

  // Intelligent, grammatically authentic default headings based on type
  const defaultCertificateHeading = (() => {
    const t = certificate.type;
    if (t === 'Winner') return 'Certificate of Merit';
    if (t === 'Runner-up') return 'Certificate of Merit';
    if (t === 'Excellence') return 'Certificate of Excellence';
    if (t === 'Appreciation') return 'Certificate of Appreciation';
    if (t === 'Volunteer') return 'Certificate of Recognition';
    if (t === 'Distinction') return 'Certificate of Distinction';
    return `Certificate of ${t || 'Participation'}`;
  })();

  const certificateHeading =
    certificate.certificateHeading?.trim() || defaultCertificateHeading;

  const defaultConferralLine = (() => {
    const t = certificate.type;
    if (t === 'Winner') return 'AWARDED FOR SECURING FIRST PLACE • DISTINGUISHED EXCELLENCE';
    if (t === 'Runner-up') return 'AWARDED FOR SECURING SECOND PLACE • DISTINGUISHED EXCELLENCE';
    if (t === 'Excellence') return 'CONFERRED FOR EXCEPTIONAL CAMPUS LEADERSHIP & EXEMPLARY VALOR';
    if (t === 'Appreciation') return 'CONFERRED IN SINCERE GRATITUDE FOR DEDICATED SERVICE & SUPPORT';
    if (t === 'Volunteer') return 'AWARDED IN HONOUR OF COMMENDABLE VOLUNTEER SERVICE';
    if (activeTemplate === 'heritage-distinction') return 'AWARDED FOR OUTSTANDING MERIT, LEADERSHIP & DEDICATED SERVICE';
    if (activeTemplate === 'modern-blue') return 'CONFERRED FOR DISTINGUISHED ACHIEVEMENT & INSTITUTIONAL MERIT';
    if (activeTemplate === 'minimal-academic') return 'ACADEMIC HONOR & DISTINCTION • AWARDED TO';
    return 'THIS IS PROUDLY CONFERRED UPON';
  })();

  const conferralLine =
    certificate.conferralLine?.trim() || defaultConferralLine;

  const verificationBadgeText =
    certificate.verificationBadgeText?.trim() ||
    (activeTemplate === 'modern-blue'
      ? 'Cryptographically Validated • Directorate Registry'
      : activeTemplate === 'minimal-academic'
      ? 'Direct Institutional Verification Seal'
      : activeTemplate === 'heritage-distinction'
      ? 'Verified by Directorate Seal • Bangalore Yeshwanthpur'
      : 'Institutional Directorate Seal • Bangalore Yeshwanthpur');

  // Stately, elegant 2-3 line commendation citation
  const citation =
    certificate.citationText ||
    `in formal recognition of commendable participation and meritorious contribution to "${
      certificate.eventTitle || 'Flagship Campus Conclave'
    }", organized under the auspices of the Student Welfare Office, Bangalore Yeshwanthpur Campus on ${
      certificate.eventDate || 'academic year 2025–26'
    }, demonstrating exemplary dedication to campus life and academic excellence.`;

  // =========================================================================
  // HELPER: SIGNATORIES ROW RENDERER (STRICT UNIFORM HEIGHT & BASELINE)
  // Guaranteed shrink-0 with authentic handwritten script, zero clipping, and generous clearance
  // =========================================================================
  const renderSignatoriesSection = (theme: 'navy' | 'blue' | 'slate' | 'burgundy') => {
    const count = signatories.length;

    let containerClass = '';
    let itemClass = '';

    if (count === 1) {
      containerClass = 'flex justify-center items-start';
      itemClass = 'w-72 text-center';
    } else if (count === 2) {
      containerClass = 'flex justify-around items-start px-12 w-full max-w-2xl mx-auto';
      itemClass = 'w-56 text-center';
    } else if (count === 3) {
      containerClass = 'grid grid-cols-3 gap-6 items-start w-full px-8 max-w-4xl mx-auto';
      itemClass = 'text-center w-full';
    } else {
      containerClass = 'grid grid-cols-4 gap-3 items-start w-full px-4';
      itemClass = 'text-center w-full';
    }

    const scriptColorClass =
      theme === 'navy'
        ? 'text-[#002147]'
        : theme === 'blue'
        ? 'text-[#0071E3]'
        : theme === 'slate'
        ? 'text-slate-800'
        : 'text-[#7E1D2D]';

    const lineBgClass =
      theme === 'navy'
        ? 'bg-[#002147]/50'
        : theme === 'blue'
        ? 'bg-[#0071E3]/50'
        : theme === 'slate'
        ? 'bg-slate-400'
        : 'bg-[#7E1D2D]/50';

    const designationColorClass =
      theme === 'burgundy'
        ? 'text-[#5C4033]'
        : theme === 'slate'
        ? 'text-slate-600'
        : 'text-[#4A4A4D]';

    return (
      <div
        className={`pt-2 border-t ${
          theme === 'slate' ? 'border-slate-200' : 'border-black/[0.08]'
        } ${containerClass}`}
      >
        {signatories.map((sig, idx) => {
          // Format natural script name (e.g. "Benny Thomas", "Joby Thomas")
          const scriptName =
            sig.name
              .split(' ')
              .filter((n) => !n.startsWith('Dr.') && !n.startsWith('Fr.') && !n.startsWith('Rev.'))
              .join(' ') || sig.name;

          return (
            <div key={sig.id || `sig-${idx}`} className={`${itemClass} flex flex-col items-center justify-start`}>
              {/* 1. Signature Asset or Authentic Calligraphic Signature Script */}
              <div className="h-9 w-full flex items-center justify-center overflow-visible">
                {sig.signatureUrl ? (
                  <img
                    src={sig.signatureUrl}
                    alt={`Signature of ${sig.name}`}
                    className="h-8 max-w-[130px] object-contain select-none filter contrast-125"
                  />
                ) : (
                  <span
                    className={`font-signature text-[25px] tracking-wide select-none leading-none transform -rotate-1 ${scriptColorClass}`}
                  >
                    {scriptName}
                  </span>
                )}
              </div>

              {/* 2. Horizontal Underline - Strictly Identical Across Columns */}
              <div className={`h-[1px] w-28 sm:w-36 mx-auto mt-0.5 mb-1 rounded-full ${lineBgClass}`} />

              {/* 3. Signatory Name (NO truncate, NO line-clamp, clean leading-normal) */}
              <p className="font-bold text-[#0F172A] text-[11px] leading-normal text-center whitespace-nowrap">
                {sig.name}
              </p>

              {/* 4. Signatory Designation (NO line-clamp, clean leading-normal) */}
              <p
                className={`text-[9.5px] font-medium leading-normal max-w-[190px] mx-auto text-center mt-0.5 ${designationColorClass}`}
              >
                {sig.designation}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Exact physical A4 Landscape proportions: 900px × 636px (297mm : 210mm)
  // Generous padding (pt-4 pb-3 px-8) guarantees 100% visibility and zero clipping
  const a4LandscapeClass =
    'w-[900px] h-[636px] min-w-[900px] max-w-[900px] min-h-[636px] max-h-[636px] mx-auto flex flex-col justify-between relative select-none shadow-2xl px-10 pt-5 pb-7 rounded-2xl overflow-hidden box-border print:m-0 print:shadow-none print:w-[297mm] print:h-[210mm] print:min-h-[210mm] print:max-h-[210mm] print:p-[8mm_12mm] print:rounded-none';

  // =========================================================================
  // TEMPLATE 1: CLASSIC GOLD CREST (A4 Landscape - Rich, Filled & Balanced)
  // =========================================================================
  if (activeTemplate === 'classic-gold') {
    return (
      <div
        id={elementId}
        className={`${a4LandscapeClass} bg-[#FCFAF6] border-[10px] border-[#002147] text-center ${className}`}
      >
        {/* Double Gold Filigree Framing Inlay */}
        <div className="absolute inset-2.5 border-2 border-[#C59B27]/90 pointer-events-none rounded-xl" />
        <div className="absolute inset-3.5 border border-[#C59B27]/40 pointer-events-none rounded-lg" />

        {/* Ornate Corner Accents */}
        <div className="absolute font-serif text-[#C59B27] select-none pointer-events-none text-base" style={{ top: '16px', left: '20px' }}>⚜</div>
        <div className="absolute font-serif text-[#C59B27] select-none pointer-events-none text-base" style={{ top: '16px', right: '20px' }}>⚜</div>
        <div className="absolute font-serif text-[#C59B27] select-none pointer-events-none text-base" style={{ bottom: '16px', left: '20px' }}>⚜</div>
        <div className="absolute font-serif text-[#C59B27] select-none pointer-events-none text-base" style={{ bottom: '16px', right: '20px' }}>⚜</div>

        {/* High-Resolution Centered Crest Watermark (Subtle & Dignified) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <img
            src={CHRIST_CREST_DATA_URL}
            alt="Crest Watermark"
            className="w-72 h-72 object-contain select-none -translate-y-6"
          />
        </div>

        {/* DUAL LOGOS HEADER */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-0.5 shrink-0 h-[66px]">
          {/* Left: Christ University Crest */}
          <div className="w-[52px] h-[52px] rounded-full border border-[#C59B27]/50 p-1 flex items-center justify-center shrink-0 bg-white/40 shadow-xs">
            <img
              src={CHRIST_CREST_DATA_URL}
              alt="Christ University Crest"
              className="w-full h-full object-contain select-none drop-shadow-xs"
            />
          </div>

          {/* Center Institutional Typography */}
          <div className="flex-1 px-4 flex flex-col items-center justify-center">
            <h1 className="text-xl font-cinzel font-bold tracking-[0.14em] text-[#002147] uppercase leading-tight whitespace-nowrap">
              {universityTitle}
            </h1>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#A67C1E] uppercase mt-0.5 text-center">
              {campusSubtitle}
            </p>
            <div className="flex items-center gap-2.5 my-1 w-full max-w-xs justify-center">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C59B27] to-[#002147]" />
              <span className="text-[#C59B27] text-xs">❖</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C59B27] to-[#002147]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#1E293B] text-center">
              {officeSubtitle}
            </p>
          </div>

          {/* Right: SWO Logo in Matching Frame */}
          <div className="w-[52px] h-[52px] rounded-full border border-[#C59B27]/50 p-0.5 flex items-center justify-center shrink-0 bg-white/40 shadow-xs overflow-hidden">
            <img
              src={SWO_LOGO_DATA_URL}
              alt="Student Welfare Office Logo"
              className="w-full h-full object-contain select-none drop-shadow-xs rounded-full"
            />
          </div>
        </div>

        {/* MAIN BODY: Unified, Balanced Proportions (Award Title -> Recipient -> Citation) */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center gap-2.5 py-1">
          {/* Certificate Award Title */}
          <div className="text-center">
            <h2 className="text-[26px] font-serif italic font-bold text-[#002147] leading-tight">
              {certificateHeading}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="h-[1px] w-12 bg-[#C59B27]/60" />
              <p className="text-[10px] text-[#52525B] uppercase tracking-[0.24em] font-semibold">
                {conferralLine}
              </p>
              <span className="h-[1px] w-12 bg-[#C59B27]/60" />
            </div>
          </div>

          {/* Recipient Name Box (The Focal Centerpiece) */}
          <div className="text-center my-0.5">
            <h3 className="text-[32px] sm:text-[35px] font-serif font-bold text-[#0F172A] tracking-wide leading-tight">
              {certificate.studentName}
            </h3>
            <div className="h-[1.5px] w-48 bg-gradient-to-r from-transparent via-[#002147]/60 to-transparent mx-auto my-1" />
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#334155]">
              <span>Registration No: <strong className="font-serif text-[#002147] tracking-wider font-bold">{certificate.studentRegNo}</strong></span>
              {certificate.department && (
                <>
                  <span className="text-[#C59B27] font-bold">•</span>
                  <span className="text-[#0F172A]">{certificate.department}</span>
                </>
              )}
            </div>
          </div>

          {/* Elegant Commendation Citation Text with Balanced Indentation */}
          <div className="max-w-[680px] mx-auto text-[12px] text-[#1E293B] leading-[1.65] px-6 font-normal text-center">
            {citation}
          </div>
        </div>

        {/* BOTTOM SECTION: Signatories + Footer with Guaranteed Zero Clipping */}
        <div className="relative z-10 shrink-0 flex flex-col gap-1.5">
          {renderSignatoriesSection('navy')}

          {/* Institutional Verification Footer */}
          <div className="h-5 flex items-center justify-between text-[9px] text-[#52525B] border-t border-black/[0.08] px-4 pt-0.5">
            <span className="font-mono font-bold text-[#002147]">Cert ID: {certificate.certificateNo}</span>
            <span className="flex items-center gap-1.5 text-[#166534] font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" /> {verificationBadgeText}
            </span>
            <span className="font-medium">Issued: {certificate.issuedDate || 'Academic Year 2025–26'}</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 2: MODERN EXECUTIVE BLUE (A4 Landscape - Rich, Filled & Balanced)
  // =========================================================================
  if (activeTemplate === 'modern-blue') {
    return (
      <div
        id={elementId}
        className={`${a4LandscapeClass} bg-gradient-to-b from-[#F8FAFC] via-white to-[#F0F4F8] border-[10px] border-[#0071E3] text-center ${className}`}
      >
        {/* Top Sapphire & Gold Framing Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#002147] via-[#0071E3] to-[#38BDF8]" />
        <div className="absolute inset-2.5 border border-[#0071E3]/25 pointer-events-none rounded-xl" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <img
            src={CHRIST_CREST_DATA_URL}
            alt="Crest Watermark"
            className="w-72 h-72 object-contain select-none -translate-y-6"
          />
        </div>

        {/* DUAL LOGOS HEADER */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-0.5 shrink-0 h-[66px]">
          <div className="w-[52px] h-[52px] rounded-full border border-[#0071E3]/30 p-1 flex items-center justify-center shrink-0 bg-white/40 shadow-xs">
            <img
              src={CHRIST_CREST_DATA_URL}
              alt="CHRIST Crest"
              className="w-full h-full object-contain select-none drop-shadow-xs"
            />
          </div>

          <div className="flex-1 px-4 flex flex-col items-center justify-center">
            <h1 className="text-xl font-black tracking-[0.14em] text-[#002147] uppercase leading-tight whitespace-nowrap">
              {universityTitle}
            </h1>
            <p className="text-xs font-bold text-[#0071E3] tracking-widest uppercase mt-0.5 text-center">
              {campusSubtitle}
            </p>
            <div className="mt-1 px-3 py-0.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/30 text-[#0071E3] font-extrabold text-[10px] tracking-widest uppercase">
              {officeSubtitle}
            </div>
          </div>

          <div className="w-[52px] h-[52px] rounded-full border border-[#0071E3]/30 p-0.5 flex items-center justify-center shrink-0 bg-white/40 shadow-xs overflow-hidden">
            <img
              src={SWO_LOGO_DATA_URL}
              alt="SWO Logo"
              className="w-full h-full object-contain select-none drop-shadow-xs rounded-full"
            />
          </div>
        </div>

        {/* BODY SECTION: Unified Proportions */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center gap-2.5 py-1">
          <div className="text-center">
            <h2 className="text-[26px] font-black tracking-tight text-[#0B192C] leading-tight">
              {certificateHeading}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="h-[1px] w-12 bg-[#0071E3]/30" />
              <p className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase">
                {conferralLine}
              </p>
              <span className="h-[1px] w-12 bg-[#0071E3]/30" />
            </div>
          </div>

          <div className="text-center my-0.5">
            <h3 className="text-[32px] sm:text-[35px] font-black text-[#002147] tracking-tight leading-tight">
              {certificate.studentName}
            </h3>
            <div className="h-[2px] w-44 bg-gradient-to-r from-transparent via-[#0071E3] to-transparent mx-auto my-1" />
            <p className="text-xs font-bold text-[#0071E3] tracking-wide">
              {certificate.studentRegNo} {certificate.department ? `| ${certificate.department}` : ''}
            </p>
          </div>

          <div className="max-w-[680px] mx-auto text-[12px] text-[#334155] leading-[1.65] px-6 font-medium text-center">
            {citation}
          </div>
        </div>

        {/* BOTTOM SECTION: Signatories + Footer */}
        <div className="relative z-10 shrink-0 flex flex-col gap-1.5">
          {renderSignatoriesSection('blue')}

          {/* Verification Footer */}
          <div className="h-5 flex items-center justify-between text-[9px] text-[#64748B] border-t border-slate-200 px-4 pt-0.5">
            <span className="font-mono font-bold text-[#0071E3]">Ref: {certificate.certificateNo}</span>
            <span className="text-[#0071E3] font-bold flex items-center gap-1.5 tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" /> {verificationBadgeText}
            </span>
            <span>Dispatched: {certificate.issuedDate || 'Academic Year 2025–26'}</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 3: MINIMALIST ACADEMIC SEAL (A4 Landscape - Rich, Filled & Balanced)
  // =========================================================================
  if (activeTemplate === 'minimal-academic') {
    return (
      <div
        id={elementId}
        className={`${a4LandscapeClass} bg-white border-8 border-slate-700 text-center ${className}`}
      >
        <div className="absolute inset-2.5 border border-slate-300 pointer-events-none rounded-xl" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <img
            src={CHRIST_CREST_DATA_URL}
            alt="Crest Watermark"
            className="w-72 h-72 object-contain select-none -translate-y-6"
          />
        </div>

        {/* DUAL LOGOS HEADER */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-0.5 shrink-0 h-[66px]">
          <div className="w-[52px] h-[52px] rounded-full border border-slate-300 p-1 flex items-center justify-center shrink-0 bg-white/40">
            <img
              src={CHRIST_CREST_DATA_URL}
              alt="CHRIST Crest"
              className="w-full h-full object-contain select-none"
            />
          </div>

          <div className="flex-1 px-4 flex flex-col items-center justify-center">
            <h1 className="text-xl font-bold tracking-[0.22em] text-[#1E293B] uppercase leading-tight whitespace-nowrap">
              {universityTitle}
            </h1>
            <p className="text-xs font-semibold tracking-widest text-[#64748B] uppercase mt-0.5 text-center">
              {campusSubtitle} • {officeSubtitle}
            </p>
          </div>

          <div className="w-[52px] h-[52px] rounded-full border border-slate-300 p-0.5 flex items-center justify-center shrink-0 bg-white/40 overflow-hidden">
            <img
              src={SWO_LOGO_DATA_URL}
              alt="SWO Logo"
              className="w-full h-full object-contain select-none rounded-full"
            />
          </div>
        </div>

        {/* BODY SECTION: Unified Proportions */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center gap-2.5 py-1">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B]">
              {conferralLine}
            </p>
            <h2 className="text-[26px] font-light tracking-tight text-[#0F172A] mt-0.5 leading-tight">
              {certificateHeading}
            </h2>
          </div>

          <div className="text-center my-0.5">
            <p className="text-[9px] text-[#64748B] uppercase tracking-widest font-semibold">Awarded To</p>
            <h3 className="text-[32px] sm:text-[35px] font-semibold text-[#0F172A] tracking-tight leading-tight mt-0.5">
              {certificate.studentName}
            </h3>
            <div className="h-[1px] w-36 bg-slate-300 mx-auto my-1" />
            <p className="text-xs font-medium text-[#475569] tracking-wide">
              {certificate.studentRegNo} {certificate.department ? `• ${certificate.department}` : ''}
            </p>
          </div>

          <div className="max-w-[680px] mx-auto text-[12px] text-[#334155] leading-[1.65] px-6 text-center">
            {citation}
          </div>
        </div>

        {/* BOTTOM SECTION: Signatories + Footer */}
        <div className="relative z-10 shrink-0 flex flex-col gap-1.5">
          {renderSignatoriesSection('slate')}

          {/* Verification Footer */}
          <div className="h-5 flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-200 px-4 pt-0.5">
            <span className="font-mono font-semibold">ID: {certificate.certificateNo}</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-500" /> {verificationBadgeText}
            </span>
            <span>Issued: {certificate.issuedDate || 'Academic Year 2025–26'}</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 4: HERITAGE HONOR ROLL (A4 Landscape - Rich, Filled & Balanced)
  // =========================================================================
  return (
    <div
      id={elementId}
      className={`${a4LandscapeClass} bg-[#FAF6F0] border-[10px] border-[#7E1D2D] text-center ${className}`}
    >
      {/* Antique Calligraphic Framing Inlay */}
      <div className="absolute inset-2.5 border-2 border-[#A67C1E] pointer-events-none rounded-xl" />
      <div className="absolute inset-3.5 border border-[#7E1D2D]/35 pointer-events-none rounded-lg" />

      {/* Decorative Corner Stars */}
      <div className="absolute font-serif text-[#A67C1E] text-base pointer-events-none" style={{ top: '16px', left: '20px' }}>✦</div>
      <div className="absolute font-serif text-[#A67C1E] text-base pointer-events-none" style={{ top: '16px', right: '20px' }}>✦</div>
      <div className="absolute font-serif text-[#A67C1E] text-base pointer-events-none" style={{ bottom: '16px', left: '20px' }}>✦</div>
      <div className="absolute font-serif text-[#A67C1E] text-base pointer-events-none" style={{ bottom: '16px', right: '20px' }}>✦</div>

      {/* Watermark: Subtle & Dignified */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
        <img
          src={CHRIST_CREST_DATA_URL}
          alt="Crest Watermark"
          className="w-72 h-72 object-contain select-none -translate-y-6"
        />
      </div>

      {/* DUAL LOGOS HEADER */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-0.5 shrink-0 h-[66px]">
        {/* Left: Christ Crest in Antique Framing */}
        <div className="w-[52px] h-[52px] rounded-full border border-[#A67C1E]/50 p-1 flex items-center justify-center shrink-0 bg-white/40 shadow-xs">
          <img
            src={CHRIST_CREST_DATA_URL}
            alt="CHRIST Crest"
            className="w-full h-full object-contain select-none drop-shadow-xs"
          />
        </div>

        {/* Center: Stately Typography */}
        <div className="flex-1 px-4 flex flex-col items-center justify-center">
          <h1 className="text-xl font-cinzel font-bold tracking-[0.14em] text-[#7E1D2D] uppercase leading-tight whitespace-nowrap">
            {universityTitle}
          </h1>
          <p className="text-xs font-serif font-bold tracking-[0.22em] text-[#8C6218] uppercase mt-0.5 text-center">
            {campusSubtitle}
          </p>
          <div className="flex items-center gap-2.5 my-1 w-full max-w-xs justify-center">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8C6218] to-transparent" />
            <span className="text-[#8C6218] text-[10px]">✦</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#8C6218] to-transparent" />
          </div>
          <p className="text-[10px] font-serif font-bold tracking-widest text-[#5C1D24] uppercase text-center">
            {officeSubtitle}
          </p>
        </div>

        {/* Right: SWO Logo in Matching Frame */}
        <div className="w-[52px] h-[52px] rounded-full border border-[#A67C1E]/50 p-0.5 flex items-center justify-center shrink-0 bg-white/40 shadow-xs overflow-hidden">
          <img
            src={SWO_LOGO_DATA_URL}
            alt="SWO Logo"
            className="w-full h-full object-contain select-none drop-shadow-xs rounded-full"
          />
        </div>
      </div>

      {/* BODY SECTION: Unified Proportions */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center gap-2.5 py-1">
        {/* Award Title */}
        <div className="text-center">
          <h2 className="text-[26px] font-serif italic font-bold text-[#7E1D2D] leading-tight">
            {certificateHeading}
          </h2>
          <div className="flex items-center justify-center gap-2.5 mt-1">
            <span className="h-[1px] w-10 bg-[#7E1D2D]/30" />
            <p className="text-[10px] font-serif tracking-[0.22em] text-[#7E1D2D]/90 uppercase font-bold">
              {conferralLine}
            </p>
            <span className="h-[1px] w-10 bg-[#7E1D2D]/30" />
          </div>
        </div>

        {/* Recipient */}
        <div className="text-center my-0.5">
          <h3 className="text-[32px] sm:text-[35px] font-serif font-bold text-[#1D1D1F] tracking-wide leading-tight">
            {certificate.studentName}
          </h3>
          <div className="h-[1.5px] w-48 bg-gradient-to-r from-transparent via-[#7E1D2D]/60 to-transparent mx-auto my-1" />
          <p className="text-xs font-serif text-[#5C4033] font-medium leading-normal">
            Student Identification No: <strong className="font-serif text-[#7E1D2D] font-bold tracking-wider">{certificate.studentRegNo}</strong>
            {certificate.department ? ` • ${certificate.department}` : ''}
          </p>
        </div>

        {/* Citation */}
        <div className="max-w-[680px] mx-auto text-[12px] font-serif text-[#3E2723] leading-[1.65] px-6 text-center">
          {citation}
        </div>
      </div>

      {/* BOTTOM SECTION: Signatories + Footer */}
      <div className="relative z-10 shrink-0 flex flex-col gap-1.5">
        {renderSignatoriesSection('burgundy')}

        {/* Verification Footer */}
        <div className="h-5 flex items-center justify-between text-[9px] text-[#5C4033] border-t border-[#7E1D2D]/25 px-4 pt-0.5">
          <span className="font-mono font-bold text-[#7E1D2D]">Credential No: {certificate.certificateNo}</span>
          <span className="font-serif italic text-[#7E1D2D] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#7E1D2D]" /> {verificationBadgeText}
          </span>
          <span className="font-medium">Issued: {certificate.issuedDate || 'Academic Year 2025–26'}</span>
        </div>
      </div>
    </div>
  );
};

