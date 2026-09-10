import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem, Registration } from '../../types';
import { Modal } from '../common/Modal';
import { AppleButton } from '../common/AppleButton';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Building, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  QrCode, 
  Download, 
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Printer,
  FileText,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import { downloadTicketAsJpeg, downloadTicketAsPdf, printTicketPass } from '../../utils/ticketExporter';

interface RegistrationModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationComplete: (reg: Registration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegistrationComplete,
}) => {
  const { studentUser, registerForEvent, openLoginModal } = useApp();

  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [confirmedReg, setConfirmedReg] = useState<Registration | null>(null);
  const [agreedGuidelines, setAgreedGuidelines] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Cache event for exit animation
  const [cachedEvent, setCachedEvent] = React.useState<EventItem | null>(event);
  React.useEffect(() => {
    if (event) setCachedEvent(event);
  }, [event]);

  const activeEvent = event || cachedEvent;
  if (!activeEvent) return null;

  const handleResetAndClose = () => {
    setStep('form');
    setCustomAnswers({});
    setConfirmedReg(null);
    setErrorMessage('');
    onClose();
  };

  if (!studentUser) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleResetAndClose}
        title="Institutional Login Required"
        subtitle={`To register for "${activeEvent.title}", authenticate with your official Christ account.`}
        maxWidth="md"
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-[#3A5982]/10 border border-[#3A5982]/20 flex items-center justify-center mx-auto text-[#3A5982]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-[#16212F] dark:text-white">
              Restricted to @christuniversity.in
            </h3>
            <p className="text-xs text-[#536275] dark:text-slate-300 leading-relaxed">
              Public visitors can explore campus activities and the event calendar. Registering for tickets and issuing verified certificates requires your institutional Google account.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <AppleButton
              variant="secondary"
              onClick={handleResetAndClose}
            >
              Cancel
            </AppleButton>
            <AppleButton
              variant="navy"
              onClick={() => {
                handleResetAndClose();
                openLoginModal(
                  `Sign in with your @christuniversity.in institutional account to register for "${event.title}".`
                );
              }}
            >
              Sign In with Christ ID
            </AppleButton>
          </div>
        </div>
      </Modal>
    );
  }

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setCustomAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check required custom fields
    if (activeEvent.customFields) {
      for (const field of activeEvent.customFields) {
        if (field.required && !customAnswers[field.id]) {
          setErrorMessage(`Please fill out required field: "${field.label}"`);
          return;
        }
      }
    }

    if (!agreedGuidelines) {
      setErrorMessage('Please agree to Christ University SWO event guidelines.');
      return;
    }

    const result = registerForEvent(activeEvent.id, customAnswers);
    if (!result.success) {
      setErrorMessage(result.message || 'Registration failed.');
      return;
    }

    if (result.registration) {
      setConfirmedReg(result.registration);
      setStep('confirmation');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0071E3', '#C59B27', '#002147', '#34C759'],
      });

      onRegistrationComplete(result.registration);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={step === 'form' ? 'Event Registration' : 'Registration Confirmed! 🎉'}
      subtitle={
        step === 'form'
          ? `Completing registration for "${activeEvent.title}"`
          : 'Your official SWO entry pass has been generated'
      }
      maxWidth={step === 'confirmation' ? 'md' : 'lg'}
    >
      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Event Quick Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1D1D1F] dark:text-white line-clamp-1">{activeEvent.title}</p>
              <p className="text-[11px] text-[#86868B] dark:text-slate-400 mt-0.5">
                {new Date(activeEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {activeEvent.venue}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#93C5FD]">
              {activeEvent.category}
            </span>
          </div>

          {/* Auto-filled Student Details from Profile */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400">
                Student Identity (Auto-Filled)
              </h4>
              <span className="text-[10px] text-[#34C759] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Student Profile
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10">
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">Full Name</span>
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{studentUser.name}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10">
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">Register Number</span>
                <span className="text-xs font-semibold font-mono text-[#0071E3] dark:text-[#93C5FD]">{studentUser.regNo}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10">
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">Department & Batch</span>
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate block">
                  {studentUser.department} ({studentUser.year})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10">
                <span className="text-[10px] text-[#86868B] dark:text-slate-400 block">University Email</span>
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate block">{studentUser.email}</span>
              </div>
            </div>
          </div>

          {/* Event-Specific Custom Fields (if configured by Admin) */}
          {activeEvent.customFields && activeEvent.customFields.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400">
                Event Specific Requirements
              </h4>

              {activeEvent.customFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white flex items-center justify-between">
                    <span>
                      {field.label} {field.required && <span className="text-[#FF3B30]">*</span>}
                    </span>
                  </label>

                  {field.type === 'select' && field.options ? (
                    <select
                      value={customAnswers[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
                    >
                      <option value="">Select option...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-xs text-[#515154] dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customAnswers[field.id] === 'Yes'}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.checked ? 'Yes' : '')}
                        required={field.required}
                        className="rounded text-[#0071E3] focus:ring-[#0071E3]"
                      />
                      <span>I acknowledge and confirm this requirement</span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      placeholder="Your response..."
                      value={customAnswers[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Terms & Decorum Checkbox */}
          <div className="pt-2 border-t border-black/[0.05] dark:border-white/10">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#515154] dark:text-slate-300">
              <input
                type="checkbox"
                checked={agreedGuidelines}
                onChange={(e) => setAgreedGuidelines(e.target.checked)}
                className="mt-0.5 rounded text-[#0071E3] focus:ring-[#0071E3]"
              />
              <span>
                I agree to adhere to Christ University auditorium decorum, campus dress code, and punctual seating protocols.
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <AppleButton type="button" variant="secondary" size="md" onClick={handleResetAndClose}>
              Cancel
            </AppleButton>
            <AppleButton type="submit" variant="primary" size="md">
              {event?.requiresQrPass !== false ? 'Confirm & Generate Pass' : 'Confirm Registration'}
            </AppleButton>
          </div>
        </form>
      ) : (
        /* Confirmation Screen with Ticket Pass & QR Code or Open Walk-in Notice */
        confirmedReg && (
          (event?.requiresQrPass !== false && confirmedReg.requiresQrPass !== false) ? (
            <div className="space-y-6 text-center">
              {/* Ticket Card styled after Apple Wallet Pass */}
              <div id="booking-qr-pass" className="p-6 sm:p-7 pb-8 rounded-3xl bg-gradient-to-b from-[#002147] to-[#0A2540] text-white shadow-[0_16px_36px_rgba(0,33,71,0.28)] border border-white/10 text-left relative overflow-hidden">
                <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase block">
                      CHRIST UNIVERSITY • SWO ENTRY PASS
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                      {confirmedReg.eventTitle}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FFD60A]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 text-xs mb-6 relative z-10">
                  <div>
                    <span className="text-[10.5px] font-medium text-white/70 block mb-1">Student Attendee</span>
                    <span className="font-bold text-white text-sm tracking-tight block leading-snug">{confirmedReg.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-medium text-white/70 block mb-1">Register Number</span>
                    <span className="font-mono font-black text-[#FFD60A] text-sm tracking-wider block leading-snug">{confirmedReg.studentRegNo}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-medium text-white/70 block mb-1">Date & Time</span>
                    <span className="text-xs font-semibold text-white/95 block leading-relaxed">
                      {new Date(confirmedReg.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {confirmedReg.eventTime ? ` • ${confirmedReg.eventTime}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-medium text-white/70 block mb-1">Venue</span>
                    <span className="text-xs font-semibold text-white/95 block leading-relaxed break-words" title={confirmedReg.eventVenue}>
                      {confirmedReg.eventVenue}
                    </span>
                  </div>
                </div>

                {/* QR Code Barcode Box */}
                <div className="p-6 pt-5 pb-6 rounded-2xl bg-white text-[#1D1D1F] flex flex-col items-center justify-center text-center shadow-xl relative z-10">
                  {/* Real High-Resolution Scannable QR Code */}
                  <div className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center justify-center shadow-inner">
                    <QRCodeDisplay
                      value={confirmedReg.ticketCode}
                      size={144}
                      fgColor="#002147"
                      centerLogo={true}
                    />
                  </div>

                  <span className="font-mono text-sm font-black tracking-widest text-[#002147] mt-3.5 select-all">
                    {confirmedReg.ticketCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 mt-1 pb-0.5">
                    Scan at Auditorium Gate for Verified Check-In
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 flex-wrap">
                <AppleButton
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<FileText className="w-4 h-4 text-[#0071E3]" />}
                  disabled={isExportingPdf}
                  onClick={async () => {
                    try {
                      setIsExportingPdf(true);
                      await downloadTicketAsPdf(
                        'booking-qr-pass',
                        `Christ_University_Pass_${confirmedReg.ticketCode}_${confirmedReg.studentRegNo}`
                      );
                    } catch (err) {
                      console.error(err);
                      alert('Could not download PDF. Please try again or use Print.');
                    } finally {
                      setIsExportingPdf(false);
                    }
                  }}
                >
                  {isExportingPdf ? 'Saving PDF...' : 'Download Pass (PDF)'}
                </AppleButton>

                <AppleButton
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<ImageIcon className="w-4 h-4 text-[#AF52DE]" />}
                  disabled={isExportingJpeg}
                  onClick={async () => {
                    try {
                      setIsExportingJpeg(true);
                      await downloadTicketAsJpeg(
                        'booking-qr-pass',
                        `Christ_University_Pass_${confirmedReg.ticketCode}_${confirmedReg.studentRegNo}`
                      );
                    } catch (err) {
                      console.error(err);
                      alert('Could not download JPEG. Please try again or use Print.');
                    } finally {
                      setIsExportingJpeg(false);
                    }
                  }}
                >
                  {isExportingJpeg ? 'Saving JPEG...' : 'Download Pass (JPEG)'}
                </AppleButton>

                <AppleButton
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => printTicketPass('booking-qr-pass')}
                >
                  Print Pass
                </AppleButton>

                <AppleButton
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={handleResetAndClose}
                >
                  Done
                </AppleButton>
              </div>
            </div>
          ) : (
            /* Open Campus Walk-in Confirmation (No QR Pass required) */
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#064E3B] to-[#022C22] text-white shadow-xl border border-emerald-500/20 text-center relative overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-white/10 text-emerald-300 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase block">
                  OPEN CAMPUS WALK-IN • NO QR PASS NEEDED
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {confirmedReg.eventTitle}
                </h3>
                <p className="text-xs text-emerald-100/80 mt-1 max-w-sm mx-auto">
                  Your registration is confirmed. Anyone can just register and step in.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs mt-5 p-4 rounded-2xl bg-black/20 text-left border border-white/10">
                  <div>
                    <span className="text-[10px] text-white/60 block">Attendee</span>
                    <span className="font-semibold text-white">{confirmedReg.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 block">Register Number</span>
                    <span className="font-mono font-bold text-emerald-300">{confirmedReg.studentRegNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 block">Date</span>
                    <span className="text-white/90">
                      {new Date(confirmedReg.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 block">Venue</span>
                    <span className="text-white/90 truncate block">{confirmedReg.eventVenue}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Walk-in: Please carry your Christ University Student ID card to the venue.</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <AppleButton
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto px-8"
                  onClick={handleResetAndClose}
                >
                  Done
                </AppleButton>
              </div>
            </div>
          )
        )
      )}
    </Modal>
  );
};
