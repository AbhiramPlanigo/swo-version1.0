import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate, CertificateTemplateId } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { CertificateRenderer, CERTIFICATE_TEMPLATES } from '../common/CertificateRenderer';
import { 
  Award, 
  Download, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  QrCode,
  Image as ImageIcon,
  Loader2,
  Upload
} from 'lucide-react';
import { 
  downloadCertificateAsPdf, 
  downloadCertificateAsJpeg,
  printCertificate
} from '../../utils/certificateExporter';

interface CertificatesViewProps {
  onExploreEvents: () => void;
  onOpenMediaUpload?: (category?: 'event' | 'hero' | 'poster' | 'avatar' | 'moment') => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ 
  onExploreEvents,
  onOpenMediaUpload
}) => {
  const { certificates, studentUser, openLoginModal } = useApp();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [viewTemplate, setViewTemplate] = useState<CertificateTemplateId | undefined>(undefined);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);

  // If student is not authenticated, show Apple institutional gate
  if (!studentUser) {
    return (
      <div className="space-y-6 pb-16">
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#141A26] border border-black/[0.08] dark:border-white/10 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#C5A063]/15 text-[#C5A063] flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C5A063]/15 text-[#9E7D42] dark:text-[#E8C581]">
              Institutional Verification Required
            </span>
            <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Earned Certificates & Honors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Sign in with your official Christ University institutional account (<strong>@christuniversity.in</strong>) to view, download vector A4 PDFs, and claim your verified certificates.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openLoginModal('Sign in to view and download your verified certificates.')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#002147] hover:bg-[#002E62] dark:bg-[#0071E3] dark:hover:bg-[#0077ED] text-white text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              Sign In with @christuniversity.in
            </button>
            <button
              onClick={onExploreEvents}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-black/[0.05] dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-black/[0.08] dark:hover:bg-white/15 active:scale-95 transition-all"
            >
              Explore Campus Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter certificates for current student
  const studentCerts = (certificates || []).filter(
    (c) => c.studentRegNo === studentUser.regNo || c.studentName.toLowerCase().includes(studentUser.name.toLowerCase().split(' ')[0])
  );

  const handlePrint = () => {
    printCertificate('student-certificate-view');
  };

  const handleDownloadPdf = async () => {
    if (!selectedCert) return;
    try {
      setIsExportingPdf(true);
      await downloadCertificateAsPdf(
        'student-certificate-view', 
        `Certificate_${selectedCert.certificateNo}_${selectedCert.studentName}`
      );
    } catch (err) {
      console.error(err);
      alert('Could not export PDF. Please try again or use the Print button.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJpeg = async () => {
    if (!selectedCert) return;
    try {
      setIsExportingJpeg(true);
      await downloadCertificateAsJpeg(
        'student-certificate-view', 
        `Certificate_${selectedCert.certificateNo}_${selectedCert.studentName}`
      );
    } catch (err) {
      console.error(err);
      alert('Could not export JPEG image. Please try again.');
    } finally {
      setIsExportingJpeg(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#AF52DE]/10 dark:bg-[#AF52DE]/25 text-[#AF52DE] dark:text-[#E9D5FF]">
              Digital Credentials
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Yeshwanthpur Campus SWO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            My Earned Certificates
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-300 mt-1">
            Tamper-proof digital certificates authorized by the Student Welfare Office with unique cryptographic verification codes.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {onOpenMediaUpload && (
            <button
              type="button"
              onClick={() => onOpenMediaUpload('avatar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0071E3] dark:text-blue-300 bg-[#0071E3]/10 hover:bg-[#0071E3]/20 border border-[#0071E3]/20 transition-all cursor-pointer shadow-xs"
              title="Upload Official Seal / Signature Asset (Allowed Ratio: 1:1 or 3:1)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Seal / Asset (1:1 Ratio)</span>
            </button>
          )}

          <span className="text-xs text-[#86868B] dark:text-slate-400 font-medium">
            {studentCerts.length} Verified Credentials Available
          </span>
        </div>
      </div>

      {/* Certificates Grid */}
      {studentCerts.length === 0 ? (
        <EmptyState
          icon={<Award className="w-7 h-7" />}
          title="No Certificates Issued Yet"
          description="Certificates are published directly to your portal once event attendance is marked and validated by SWO organizers."
          actionLabel="Browse Upcoming Events"
          onAction={onExploreEvents}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentCerts.map((cert) => (
            <AppleCard
              key={cert.id}
              hoverEffect
              padding="none"
              className="border border-black/[0.06] dark:border-white/10 overflow-hidden flex flex-col justify-between bg-white dark:bg-[#141A26]"
            >
              {/* Certificate Preview Card Header */}
              <div className="p-6 bg-gradient-to-b from-[#002147]/5 via-white to-white dark:from-[#002147]/40 dark:via-[#141A26] dark:to-[#141A26] border-b border-black/[0.05] dark:border-white/10">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#002147] dark:bg-[#0071E3] text-white">
                    {cert.type}
                  </span>
                  <span className="text-[10px] font-mono text-[#86868B] dark:text-slate-400">
                    {cert.certificateNo}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white tracking-tight line-clamp-2">
                  {cert.eventTitle}
                </h3>
                <p className="text-xs text-[#0071E3] dark:text-[#93C5FD] font-medium mt-1">
                  Presented to {cert.studentName}
                </p>
              </div>

              {/* Card Details & Actions */}
              <div className="p-5 space-y-4">
                <div className="space-y-1 text-xs text-[#515154] dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868B] dark:text-slate-400">Event Date:</span>
                    <span className="font-medium text-[#1D1D1F] dark:text-white">{cert.eventDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868B] dark:text-slate-400">Issued On:</span>
                    <span className="font-medium text-[#1D1D1F] dark:text-white">{cert.issuedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868B] dark:text-slate-400">Authorized By:</span>
                    <span className="font-medium text-[#1D1D1F] dark:text-white truncate max-w-[150px]">{cert.authorizedBy}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/[0.05] dark:border-white/10 flex items-center gap-2">
                  <AppleButton
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setSelectedCert(cert);
                      setViewTemplate(cert.templateId || 'classic-gold');
                    }}
                  >
                    View Full Certificate
                  </AppleButton>
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    className="p-2 shrink-0"
                    title="Print Official Certificate"
                    onClick={() => {
                      setSelectedCert(cert);
                      setViewTemplate(cert.templateId || 'classic-gold');
                      setTimeout(() => {
                        printCertificate('student-certificate-view');
                      }, 250);
                    }}
                  >
                    <Printer className="w-4 h-4" />
                  </AppleButton>
                </div>
              </div>
            </AppleCard>
          ))}
        </div>
      )}

      {/* Official Certificate Full Screen Modal & Printable View */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          maxWidth="5xl"
        >
          <div className="space-y-6">
            {/* Template Selector / Style Switcher for students */}
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-black/[0.06] dark:border-white/10 pb-3">
              <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400">
                Official Presentation Format:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CERTIFICATE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setViewTemplate(tmpl.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      (viewTemplate || selectedCert.templateId || 'classic-gold') === tmpl.id
                        ? 'bg-[#0071E3] text-white shadow-xs'
                        : 'bg-black/[0.04] dark:bg-white/10 text-[#1D1D1F] dark:text-slate-200 hover:bg-black/[0.08]'
                    }`}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Render with CertificateRenderer (supports 4 templates & 1-4 signatories) */}
            <div className="overflow-x-auto">
              <CertificateRenderer
                certificate={selectedCert}
                customTemplateId={viewTemplate}
                elementId="student-certificate-view"
              />
            </div>

            {/* Modal Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#86868B]">
                This credential is permanently registered with Christ University SWO records.
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <AppleButton
                  variant="secondary"
                  size="md"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={handlePrint}
                >
                  Print Certificate
                </AppleButton>
                <AppleButton
                  variant="secondary"
                  size="md"
                  icon={<ImageIcon className="w-4 h-4 text-[#AF52DE]" />}
                  onClick={handleDownloadJpeg}
                  disabled={isExportingJpeg}
                >
                  {isExportingJpeg ? 'Saving JPEG...' : 'Download JPEG'}
                </AppleButton>
                <AppleButton
                  variant="primary"
                  size="md"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleDownloadPdf}
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
