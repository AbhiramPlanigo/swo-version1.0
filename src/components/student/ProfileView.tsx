import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { Modal } from '../common/Modal';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  GraduationCap, 
  MapPin, 
  Edit3, 
  Calendar, 
  Award, 
  Ticket, 
  CheckCircle2,
  ShieldCheck,
  Camera,
  Upload,
  Trash2,
  Users,
  Sparkles,
  ExternalLink,
  Eye,
  Printer,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { CertificateRenderer, CERTIFICATE_TEMPLATES } from '../common/CertificateRenderer';
import { downloadCertificateAsPdf, downloadCertificateAsJpeg, printCertificate } from '../../utils/certificateExporter';
import { Certificate, CertificateTemplateId } from '../../types';
import { ImageUploadField } from '../common/ImageUploadField';

export const ProfileView: React.FC = () => {
  const { studentUser, updateStudentProfile, registrations, certificates, openLoginModal, committees } = useApp();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: studentUser?.name || '',
    phone: studentUser?.phone || '',
    department: studentUser?.department || '',
    year: studentUser?.year || '',
    avatar: studentUser?.avatar || '',
  });

  // If student is not authenticated, show Apple institutional gate
  if (!studentUser) {
    return (
      <div className="space-y-6 pb-16">
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#141A26] border border-black/[0.08] dark:border-white/10 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#93C5FD] flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C5A063]/15 text-[#9E7D42] dark:text-[#E8C581]">
              Institutional Verification Required
            </span>
            <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Student Profile & Digital ID
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Please sign in with your official Christ University institutional account (<strong>@christuniversity.in</strong>) to access your digital student identity card, attendance logs, and profile records.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openLoginModal('Sign in to view your verified student profile and digital ID.')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#002147] hover:bg-[#002E62] dark:bg-[#0071E3] dark:hover:bg-[#0077ED] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Sign In with @christuniversity.in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Committee Lookup based on student registration number
  const studentRegNoClean = (studentUser.regNo || '').trim().toLowerCase();
  const studentAffiliations = (committees || []).flatMap((comm) => {
    if (!comm.members || comm.members.length === 0) return [];
    const matches = comm.members.filter(
      (m) => m.regNo && m.regNo.trim().toLowerCase() === studentRegNoClean
    );
    return matches.map((member) => ({ committee: comm, member }));
  });

  // Filter certificates for current student
  const studentCerts = (certificates || []).filter(
    (c) => 
      (c.studentRegNo && studentRegNoClean && c.studentRegNo.trim().toLowerCase() === studentRegNoClean) ||
      (studentUser.name && c.studentName && c.studentName.toLowerCase().includes(studentUser.name.toLowerCase().split(' ')[0]))
  );

  const totalRegistered = (registrations || []).filter(
    (r) => r.studentId === studentUser.id && r.status !== 'Cancelled'
  ).length;

  const totalAttended = (registrations || []).filter(
    (r) => r.studentId === studentUser.id && r.status === 'Attended'
  ).length;

  const totalCerts = studentCerts.length;

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certTemplate, setCertTemplate] = useState<CertificateTemplateId>('classic-gold');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);

  const handlePrintCert = (cert: Certificate) => {
    setSelectedCert(cert);
    setCertTemplate(cert.templateId || 'classic-gold');
    setTimeout(() => {
      printCertificate('profile-certificate-view');
    }, 250);
  };

  const handleDownloadPdf = async () => {
    if (!selectedCert) return;
    try {
      setIsExportingPdf(true);
      await downloadCertificateAsPdf(
        'profile-certificate-view',
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
        'profile-certificate-view',
        `Certificate_${selectedCert.certificateNo}_${selectedCert.studentName}`
      );
    } catch (err) {
      console.error(err);
      alert('Could not export JPEG. Please try again.');
    } finally {
      setIsExportingJpeg(false);
    }
  };

  const handleOpenEdit = () => {
    setFormData({
      name: studentUser.name || '',
      phone: studentUser.phone || '',
      department: studentUser.department || '',
      year: studentUser.year || '',
      avatar: studentUser.avatar || '',
    });
    setIsEditOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size should be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(formData);
    setIsEditOpen(false);
  };

  const initials = studentUser.name
    ? studentUser.name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'CU';

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0071E3]/10 text-[#0071E3] dark:text-[#93C5FD]">
              University Records
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Yeshwanthpur Campus, Bengaluru</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Student Identity Profile
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-1">
            Official student record linked to SWO event attendances, digital passes, and verified credentials.
          </p>
        </div>

        <AppleButton
          variant="secondary"
          size="sm"
          icon={<Edit3 className="w-4 h-4 text-[#0071E3] dark:text-[#93C5FD]" />}
          onClick={handleOpenEdit}
        >
          Edit Profile
        </AppleButton>
      </div>

      {/* Main Profile Hero Card */}
      <AppleCard padding="lg" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar / Initials Badge */}
          <div className="relative group">
            {studentUser.avatar ? (
              <img
                src={studentUser.avatar}
                alt={studentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-[#0071E3]/15 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#002147] via-[#0D3664] to-[#0071E3] flex flex-col items-center justify-center text-white ring-4 ring-[#0071E3]/15 shadow-md select-none">
                <span className="text-2xl sm:text-3xl font-black tracking-wider">
                  {initials}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#E6C98F] uppercase mt-0.5">
                  Student
                </span>
              </div>
            )}
            
            {/* Active Status Badge */}
            <span className="absolute bottom-1 right-1 p-1.5 rounded-full bg-[#34C759] text-white ring-2 ring-white dark:ring-[#141A26]" title="Active Institutional Student">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>

            {/* Quick Edit Overlay Button */}
            <button
              onClick={handleOpenEdit}
              className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 backdrop-blur-xs cursor-pointer"
              title="Edit Profile & Photo"
            >
              <Camera className="w-5 h-5" />
              <span>Change</span>
            </button>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                {studentUser.name || 'Student Name'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#002147] dark:bg-[#0071E3] text-white">
                {studentUser.regNo || 'Reg No Not Set'}
              </span>
            </div>

            <p className="text-sm font-medium text-[#0071E3] dark:text-[#93C5FD] flex items-center gap-1.5 flex-wrap">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{studentUser.department || 'Department Not Specified'}</span>
              {studentUser.year ? (
                <>
                  <span>•</span>
                  <span>{studentUser.year}</span>
                </>
              ) : (
                <button
                  onClick={handleOpenEdit}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  (+ Add Academic Year)
                </button>
              )}
            </p>

            <p className="text-xs text-[#86868B] dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
              {studentUser.campus || 'Yeshwanthpur Campus, Bengaluru'}
            </p>
          </div>
        </div>

        {/* Co-Curricular Summary Stats */}
        <div className="mt-8 pt-6 border-t border-black/[0.05] dark:border-white/10 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/5">
            <p className="text-2xl font-extrabold text-[#0071E3] dark:text-[#93C5FD]">{totalRegistered}</p>
            <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium mt-0.5">Events Registered</p>
          </div>
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/5">
            <p className="text-2xl font-extrabold text-[#34C759]">{totalAttended}</p>
            <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium mt-0.5">Attended & Verified</p>
          </div>
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/5">
            <p className="text-2xl font-extrabold text-[#AF52DE]">{totalCerts}</p>
            <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium mt-0.5">Digital Certificates</p>
          </div>
        </div>
      </AppleCard>

      {/* Profile Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact & Registration Information */}
        <AppleCard padding="md" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400">
              Official Communication
            </h4>
            <button
              onClick={handleOpenEdit}
              className="text-xs font-semibold text-[#0071E3] dark:text-[#93C5FD] hover:underline cursor-pointer"
            >
              Update Contact
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/5 flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#0071E3] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">Christ University Institutional Email</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white truncate block">{studentUser.email}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/5 flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#34C759] shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">Primary Mobile (SMS Alerts)</span>
                {studentUser.phone ? (
                  <span className="font-semibold text-[#1D1D1F] dark:text-white">{studentUser.phone}</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Not provided — <button onClick={handleOpenEdit} className="text-[#0071E3] dark:text-[#93C5FD] not-italic hover:underline cursor-pointer">+ Add Phone</button>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/5 flex items-center gap-3">
              <Building className="w-4 h-4 text-[#FF9500] shrink-0" />
              <div>
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">Affiliated Academic School / Department</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white">
                  {studentUser.department || 'Not Specified'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/5 flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-[#AF52DE] shrink-0" />
              <div>
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">Current Academic Year / Cohort</span>
                {studentUser.year ? (
                  <span className="font-semibold text-[#1D1D1F] dark:text-white">{studentUser.year}</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Not set — <button onClick={handleOpenEdit} className="text-[#0071E3] dark:text-[#93C5FD] not-italic hover:underline cursor-pointer">+ Set Year</button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </AppleCard>

        {/* SWO Leadership & Committee Wing Affiliations (Dynamic) */}
        <AppleCard padding="md" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400">
              SWO Committee Wing Affiliation
            </h4>
            <span className="text-[11px] font-semibold text-[#86868B] dark:text-slate-400">
              {studentAffiliations.length} Appointed {studentAffiliations.length === 1 ? 'Role' : 'Roles'}
            </span>
          </div>

          {studentAffiliations.length > 0 ? (
            <div className="space-y-3">
              {studentAffiliations.map(({ committee, member }) => (
                <div 
                  key={committee.id + member.id}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#002147]/5 to-[#0071E3]/5 dark:from-blue-950/20 dark:to-indigo-950/20 border border-[#002147]/10 dark:border-white/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002147] dark:bg-[#0071E3] text-white">
                      {committee.wing || 'SWO Leadership'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Official Appointment
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-[#1D1D1F] dark:text-white">
                      {committee.name}
                    </h5>
                    <p className="text-xs text-[#0071E3] dark:text-[#93C5FD] font-bold mt-0.5">
                      Designation: {member.role}
                    </p>
                  </div>

                  <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed">
                    {committee.description}
                  </p>

                  {member.assignedEvents && member.assignedEvents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#86868B] dark:text-slate-400 font-semibold">Assigned Portfolios:</span>
                      {member.assignedEvents.map((evt, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/[0.04] dark:bg-white/10 text-[#1D1D1F] dark:text-white"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  )}

                  {committee.facultyCoordinator && (
                    <div className="text-[11px] text-[#86868B] dark:text-slate-400 border-t border-black/[0.04] dark:border-white/10 pt-2 flex items-center justify-between">
                      <span>Faculty Coordinator: <strong className="text-[#1D1D1F] dark:text-white">{committee.facultyCoordinator}</strong></span>
                      <span className="text-[10px]">AY 2026-27</span>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex items-center gap-2 text-xs text-[#34C759] font-medium pt-1">
                <ShieldCheck className="w-4 h-4" /> Good Academic & Disciplinary Standing (Verified by SWO)
              </div>
            </div>
          ) : (
            /* Clean Empty State when Admin hasn't assigned any committee yet */
            <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-dashed border-black/10 dark:border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-[#1D1D1F] dark:text-white">
                  No Committee Affiliation Assigned
                </h5>
                <p className="text-xs text-[#86868B] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  SWO committee wings and volunteer leadership roles are officially assigned by the Student Welfare Office administration.
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> General Student Body Member
                </span>
              </div>
            </div>
          )}
        </AppleCard>
      </div>

      {/* Verified Digital Certificates & Academic Honors Section */}
      <AppleCard padding="lg" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#AF52DE]/10 text-[#AF52DE] dark:text-[#D8B4FE]">
                Official Credentials
              </span>
              <span className="text-xs text-[#86868B] dark:text-slate-400">
                {studentCerts.length} Verified {studentCerts.length === 1 ? 'Certificate' : 'Certificates'}
              </span>
            </div>
            <h4 className="text-xl font-black text-[#1D1D1F] dark:text-white tracking-tight mt-1">
              My Digital Certificates & Honors
            </h4>
            <p className="text-xs sm:text-sm text-[#86868B] dark:text-slate-400 mt-0.5">
              Permanently recorded, cryptographically stamped credentials for campus events, competitions, and merit awards.
            </p>
          </div>
          {studentCerts.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4" /> Directorate Authenticated
            </span>
          )}
        </div>

        {studentCerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentCerts.map((cert) => (
              <div
                key={cert.id}
                className="group relative rounded-2xl p-5 bg-gradient-to-br from-[#002147]/[0.03] to-[#0071E3]/[0.03] dark:from-white/[0.02] dark:to-white/[0.05] border border-black/[0.06] dark:border-white/10 hover:border-[#0071E3]/30 transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#002147] dark:bg-[#0071E3] text-white">
                      {cert.type}
                    </span>
                    <span className="text-[10px] font-mono text-[#86868B] dark:text-slate-400 truncate max-w-[120px]">
                      {cert.certificateNo}
                    </span>
                  </div>

                  <h5 className="text-base font-bold text-[#1D1D1F] dark:text-white line-clamp-2 group-hover:text-[#0071E3] dark:group-hover:text-[#93C5FD] transition-colors">
                    {cert.eventTitle}
                  </h5>

                  <div className="space-y-1 text-xs text-[#515154] dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[#86868B] dark:text-slate-400 text-[11px]">Event Date:</span>
                      <span className="font-medium text-[11px] text-[#1D1D1F] dark:text-white">{cert.eventDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#86868B] dark:text-slate-400 text-[11px]">Issued Date:</span>
                      <span className="font-medium text-[11px] text-[#1D1D1F] dark:text-white">{cert.issuedDate}</span>
                    </div>
                    {cert.authorizedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#86868B] dark:text-slate-400 text-[11px]">Signatory:</span>
                        <span className="font-medium text-[11px] text-[#1D1D1F] dark:text-white truncate max-w-[130px]">
                          {cert.authorizedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-black/[0.05] dark:border-white/10 flex items-center gap-2">
                  <AppleButton
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSelectedCert(cert);
                      setCertTemplate(cert.templateId || 'classic-gold');
                    }}
                  >
                    View & Export
                  </AppleButton>
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    className="p-2 shrink-0"
                    title="Print 1-Page Official Certificate"
                    onClick={() => handlePrintCert(cert)}
                  >
                    <Printer className="w-3.5 h-3.5 text-[#1D1D1F] dark:text-white" />
                  </AppleButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-dashed border-black/10 dark:border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="text-base font-bold text-[#1D1D1F] dark:text-white">
                No Digital Certificates Issued Yet
              </h5>
              <p className="text-xs text-[#86868B] dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                When you attend verified SWO university events, participate in campus festivals, or lead student committees, your official digital certificates will be minted here.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Direct Vector A4 PDF & Print Enabled
              </span>
            </div>
          </div>
        )}
      </AppleCard>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Profile"
        subtitle="Update contact preferences, academic year, and avatar"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Preview & Upload */}
          <div>
            <ImageUploadField
              label="Student Profile Picture / Avatar"
              value={formData.avatar}
              onChange={(url) => setFormData({ ...formData, avatar: url })}
              aspectRatio="1:1"
              recommendedDimensions="400 × 400 px"
              description="This is the ratio of the image allowed: 1:1 Square (Recommended: 400×400 px). Balanced symmetrical ratio ensures your profile picture displays crisply on event passes and gate registers."
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          {/* Registration Number (Read-only verified) */}
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Registration Number
            </label>
            <input
              type="text"
              value={studentUser.regNo}
              readOnly
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-black/[0.08] dark:border-white/10 text-xs font-mono text-[#86868B] dark:text-slate-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-[#86868B] dark:text-slate-400 mt-0.5">
              Institutional ID verified via Christ Single Sign-On.
            </p>
          </div>

          {/* Mobile Contact */}
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Primary Mobile Number (SMS Alerts)
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98450 12345"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Academic Year / Batch
            </label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/10 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            >
              <option value="">-- Select Academic Year --</option>
              <option value="1st Year (UG - Semester 1/2)">1st Year (UG - Semester 1/2)</option>
              <option value="2nd Year (UG - Semester 3/4)">2nd Year (UG - Semester 3/4)</option>
              <option value="3rd Year (UG - Semester 5/6)">3rd Year (UG - Semester 5/6)</option>
              <option value="4th Year (UG - Semester 7/8)">4th Year (UG - Semester 7/8)</option>
              <option value="1st Year (PG - Master's)">1st Year (PG - Master's)</option>
              <option value="2nd Year (PG - Master's)">2nd Year (PG - Master's)</option>
              <option value="Research Scholar / PhD">Research Scholar / PhD</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Department / School
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science & Engineering"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/[0.05] dark:border-white/10">
            <AppleButton type="button" variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </AppleButton>
            <AppleButton type="submit" variant="primary" size="sm">
              Save Changes
            </AppleButton>
          </div>
        </form>
      </Modal>

      {/* Official Certificate Full View Modal in Profile */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          maxWidth="5xl"
        >
          <div className="space-y-6">
            {/* Presentation Format Switcher */}
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-black/[0.06] dark:border-white/10 pb-3">
              <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400">
                Official Presentation Format:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CERTIFICATE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setCertTemplate(tmpl.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      (certTemplate || selectedCert.templateId || 'classic-gold') === tmpl.id
                        ? 'bg-[#0071E3] text-white shadow-xs'
                        : 'bg-black/[0.04] dark:bg-white/10 text-[#1D1D1F] dark:text-slate-200 hover:bg-black/[0.08]'
                    }`}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Container with CertificateRenderer */}
            <div className="overflow-x-auto">
              <CertificateRenderer
                certificate={selectedCert}
                customTemplateId={certTemplate}
                elementId="profile-certificate-view"
              />
            </div>

            {/* Modal Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#86868B] dark:text-slate-400">
                Official verified credential permanently registered with Christ University SWO records.
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <AppleButton
                  variant="secondary"
                  size="md"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => printCertificate('profile-certificate-view')}
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
