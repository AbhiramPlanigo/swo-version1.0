import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Registration, RegistrationStatus } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  QrCode, 
  Ticket, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock3, 
  Download,
  Share2,
  Sparkles,
  ClipboardList,
  Printer,
  FileText,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import { downloadTicketAsJpeg, downloadTicketAsPdf, printTicketPass } from '../../utils/ticketExporter';
import { motion, AnimatePresence } from 'motion/react';

interface MyRegistrationsViewProps {
  onExploreEvents: () => void;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  onExploreEvents,
}) => {
  const { registrations, cancelRegistration, studentUser, openLoginModal, events } = useApp();

  const [activeTicket, setActiveTicket] = useState<Registration | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // If student is not authenticated, show Apple institutional gate
  if (!studentUser) {
    return (
      <div className="space-y-6 pb-16">
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#141A26] border border-black/[0.08] dark:border-white/10 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#93C5FD] flex items-center justify-center mx-auto">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C5A063]/15 text-[#9E7D42] dark:text-[#E8C581]">
              Institutional Verification Required
            </span>
            <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Access Your Event Passes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Please sign in with your official Christ University institutional account (<strong>@christuniversity.in</strong>) to view your registered events and entry QR passes.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openLoginModal('Sign in to view your registered passes and QR tickets.')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#002147] hover:bg-[#002E62] dark:bg-[#0071E3] dark:hover:bg-[#0077ED] text-white text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              Sign In with @christuniversity.in
            </button>
            <button
              onClick={onExploreEvents}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-black/[0.05] dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-black/[0.08] dark:hover:bg-white/15 active:scale-95 transition-all"
            >
              Browse Campus Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter registrations for current student
  const studentRegs = (registrations || []).filter((r) => r.studentId === studentUser.id);

  const filteredRegs = studentRegs.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'Registered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] flex items-center gap-1.5 border border-[#34C759]/25 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
            </span>
            Active Pass
          </span>
        );
      case 'Attended':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0071E3]/15 text-[#0071E3] flex items-center gap-1 border border-[#0071E3]/20">
            <Sparkles className="w-3.5 h-3.5" /> Attended ✓
          </span>
        );
      case 'Waitlisted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF9500]/15 text-[#FF9500] flex items-center gap-1.5 border border-[#FF9500]/25">
            <span className="h-2 w-2 rounded-full bg-[#FF9500] animate-pulse"></span>
            Waitlisted
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/[0.06] dark:bg-white/[0.06] text-[#86868B]">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#34C759]/10 text-[#34C759]">
              Active Passes
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Student: {studentUser.name}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            My Event Registrations
          </h2>
          <p className="text-sm text-[#86868B] dark:text-[#A1A1A6] mt-1">
            View your entry QR tickets, status updates, and venue instructions for registered SWO events.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-white dark:bg-white/[0.07] p-1 rounded-full border border-black/[0.08] dark:border-white/[0.1] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar">
          {['all', 'Registered', 'Attended', 'Waitlisted'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`relative min-h-[38px] px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center ${
                statusFilter === st
                  ? 'text-white font-semibold'
                  : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              {statusFilter === st && (
                <motion.div
                  layoutId="activeRegStatusFilter"
                  className="absolute inset-0 bg-[#002147] dark:bg-[#0071E3] rounded-full shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{st === 'all' ? 'All' : st}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegs.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-7 h-7" />}
          title="No Registrations Found"
          description="You haven't registered for any events matching this filter. Explore upcoming talk series and campus fests to secure your seat."
          actionLabel="Browse Events"
          onAction={onExploreEvents}
        />
      ) : (
        <motion.div layout className="space-y-3.5">
          <AnimatePresence mode="popLayout">
            {filteredRegs.map((reg) => {
              const isActive = reg.status === 'Registered';
              const targetEvt = events?.find((e) => e.id === reg.eventId);
              const isPassRequired = targetEvt ? targetEvt.requiresQrPass !== false : reg.requiresQrPass !== false;
              return (
                <motion.div
                  key={reg.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                >
                  <AppleCard
                    glass
                    padding="none"
                    className={`relative overflow-hidden p-5 transition-all duration-300 ${
                      isActive
                        ? 'border border-[#0071E3]/25 dark:border-[#2997FF]/30 active-pass-pulse bg-gradient-to-r from-white via-[#F8FAFC] to-white dark:from-[#151D2A] dark:via-[#192436] dark:to-[#151D2A]'
                        : 'border border-black/[0.06] dark:border-white/[0.08]'
                    } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
                  >
                    {/* Active Pass Subtle Shimmer & Brand Accent Strip */}
                    {isActive && (
                      <>
                        <div className="ticket-shimmer-effect" aria-hidden="true" />
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0071E3] via-[#34C759] to-[#0071E3] rounded-l-full" />
                      </>
                    )}

                    <div className="space-y-1.5 min-w-0 z-10 pl-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(reg.status)}
                        {isPassRequired ? (
                          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${
                            isActive 
                              ? 'text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/8 dark:bg-[#0071E3]/20 border-[#0071E3]/20 shadow-2xs' 
                              : 'text-[#86868B] dark:text-[#A1A1A6] bg-black/[0.03] dark:bg-white/[0.05] border-black/[0.05] dark:border-white/[0.05]'
                          }`}>
                            Ticket: {reg.ticketCode}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md border text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            Open Walk-in
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                        {reg.eventTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#515154] dark:text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
                          {new Date(reg.eventDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#86868B] dark:text-[#A1A1A6]" />
                          {reg.eventTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#FF3B30]" />
                          {reg.eventVenue}
                        </span>
                      </div>

                      {reg.customAnswers && Object.keys(reg.customAnswers).length > 0 && (
                        <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] pt-1">
                          Preferences:{' '}
                          {Object.entries(reg.customAnswers)
                            .map(([_, v]) => v)
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end md:self-center shrink-0 z-10 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05] dark:border-white/[0.08]">
                      {reg.status !== 'Cancelled' && (
                        isPassRequired ? (
                          <AppleButton
                            variant="primary"
                            size="sm"
                            icon={<QrCode className="w-4 h-4" />}
                            onClick={() => setActiveTicket(reg)}
                            className={isActive ? 'shadow-md shadow-[#0071E3]/15 flex-1 sm:flex-none justify-center' : 'flex-1 sm:flex-none justify-center'}
                          >
                            View QR Pass
                          </AppleButton>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Show Student ID</span>
                          </div>
                        )
                      )}

                      {reg.status === 'Registered' && (
                        <AppleButton
                          variant="secondary"
                          size="sm"
                          className="text-[#FF3B30] hover:bg-[#FF3B30]/10 flex-1 sm:flex-none justify-center"
                          onClick={() => setCancelTargetId(reg.id)}
                        >
                          Cancel
                        </AppleButton>
                      )}
                    </div>
                  </AppleCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Ticket Pass Modal */}
      {activeTicket && (
        <Modal
          isOpen={!!activeTicket}
          onClose={() => setActiveTicket(null)}
          title="Official Event Pass"
          subtitle="Christ University Student Welfare Office"
          maxWidth="md"
        >
          <div className="space-y-6 text-center">
            <div id="active-ticket-pass" className="p-6 sm:p-7 pb-8 rounded-3xl bg-gradient-to-b from-[#002147] to-[#0A2540] text-white text-left shadow-2xl relative overflow-hidden">
              {/* Subtle metallic sweep animation on active modal pass */}
              <div className="ticket-shimmer-effect opacity-30" aria-hidden="true" />
              <div className="border-b border-white/15 pb-3 mb-4 relative z-10">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                  ENTRY PASS • YESHWANTHPUR AUDITORIUM
                </span>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">
                  {activeTicket.eventTitle}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 text-xs mb-6 relative z-10">
                <div>
                  <span className="text-[10.5px] font-medium text-white/70 block mb-1">Student Attendee</span>
                  <span className="font-bold text-white text-sm tracking-tight block leading-snug">{activeTicket.studentName}</span>
                </div>
                <div>
                  <span className="text-[10.5px] font-medium text-white/70 block mb-1">Register Number</span>
                  <span className="font-mono font-black text-[#FFD60A] text-sm tracking-wider block leading-snug">{activeTicket.studentRegNo}</span>
                </div>
                <div>
                  <span className="text-[10.5px] font-medium text-white/70 block mb-1">Date & Time</span>
                  <span className="text-xs font-semibold text-white/95 block leading-relaxed">
                    {new Date(activeTicket.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {activeTicket.eventTime ? ` • ${activeTicket.eventTime}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-medium text-white/70 block mb-1">Venue</span>
                  <span className="text-xs font-semibold text-white/95 block leading-relaxed break-words" title={activeTicket.eventVenue}>
                    {activeTicket.eventVenue}
                  </span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="p-6 pt-5 pb-6 rounded-2xl bg-white text-[#1D1D1F] flex flex-col items-center justify-center shadow-xl relative z-10">
                <div className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center justify-center shadow-inner">
                  <QRCodeDisplay
                    value={activeTicket.ticketCode}
                    size={144}
                    fgColor="#002147"
                    centerLogo={true}
                  />
                </div>
                <p className="font-mono text-sm font-black tracking-widest text-[#002147] mt-3.5 select-all">
                  {activeTicket.ticketCode}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1 pb-0.5">
                  Valid for 1 Student • Gate Check-In Active
                </p>
              </div>
            </div>

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
                      'active-ticket-pass',
                      `Christ_University_Pass_${activeTicket.ticketCode}_${activeTicket.studentRegNo}`
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
                      'active-ticket-pass',
                      `Christ_University_Pass_${activeTicket.ticketCode}_${activeTicket.studentRegNo}`
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
                onClick={() => printTicketPass('active-ticket-pass')}
              >
                Print Pass
              </AppleButton>

              <AppleButton
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setActiveTicket(null)}
              >
                Close Pass
              </AppleButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelTargetId && (
        <Modal
          isOpen={!!cancelTargetId}
          onClose={() => setCancelTargetId(null)}
          title="Cancel Registration?"
          subtitle="Are you sure you want to release your seat for this event?"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#515154] dark:text-[#94A3B8] leading-relaxed">
              Cancelling your registration will immediately release this seat to the next waitlisted student on campus.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <AppleButton
                variant="secondary"
                size="sm"
                onClick={() => setCancelTargetId(null)}
              >
                Keep Seat
              </AppleButton>
              <AppleButton
                variant="danger"
                size="sm"
                onClick={() => {
                  cancelRegistration(cancelTargetId);
                  setCancelTargetId(null);
                }}
              >
                Yes, Cancel Pass
              </AppleButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
