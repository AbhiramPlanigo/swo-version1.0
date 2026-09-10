import React, { useState } from 'react';
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ChristLogo } from './ChristLogo';
import { SWOLogo } from './SWOLogo';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  GraduationCap, 
  Mail, 
  QrCode,
  ArrowLeft,
  Building,
  Sparkles,
  Ticket
} from 'lucide-react';
import { AppleCard } from './AppleCard';
import { AppleButton } from './AppleButton';

export const TicketVerificationView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const params = useParams<{ ticketCode?: string }>();
  const navigate = useNavigate();
  const { registrations, events, markAttendance, adminUser } = useApp();

  const [markedLocally, setMarkedLocally] = useState(false);

  // Extract ticket query param or route param
  const queryTicket = searchParams.get('ticket') || searchParams.get('code') || params.ticketCode || '';
  const cleanTicket = queryTicket.trim();

  const reg = registrations.find(
    (r) =>
      r.ticketCode.toLowerCase() === cleanTicket.toLowerCase() ||
      r.studentRegNo.toLowerCase() === cleanTicket.toLowerCase()
  );

  const event = reg ? events.find((e) => e.id === reg.eventId) : null;

  const handleMarkPresent = () => {
    if (!reg) return;
    const res = markAttendance(reg.eventId, reg.ticketCode, 'QR');
    if (res.success) {
      setMarkedLocally(true);
    }
  };

  const isAttended = reg?.status === 'Attended' || markedLocally;

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0F17] text-[#1D1D1F] dark:text-white py-10 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Top University & Office Header */}
      <div className="w-full max-w-lg mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ChristLogo className="w-10 h-10" />
          <SWOLogo className="w-10 h-10" />
        </div>
        <h1 className="text-sm font-black tracking-widest text-[#002147] dark:text-white uppercase">
          Christ (Deemed to be University)
        </h1>
        <p className="text-[11px] font-semibold text-[#A67C1E] dark:text-[#E5C07B] tracking-wider uppercase">
          Bangalore Yeshwanthpur Campus • Student Welfare Office
        </p>
      </div>

      {/* Verification Card */}
      <div className="w-full max-w-lg">
        {cleanTicket && reg ? (
          <AppleCard padding="lg" className="border border-black/[0.08] dark:border-white/10 shadow-xl overflow-hidden relative">
            {/* Top Status Header */}
            <div className={`p-4 -mx-6 -mt-6 mb-6 text-center border-b ${
              reg.status === 'Cancelled'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                : isAttended
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-[#0071E3] dark:text-[#38BDF8]'
            }`}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 bg-white dark:bg-white/10 shadow-xs">
                {reg.status === 'Cancelled' ? (
                  <XCircle className="w-6 h-6 text-rose-500" />
                ) : isAttended ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-[#0071E3] dark:text-[#38BDF8]" />
                )}
              </div>

              <h2 className="text-base font-bold uppercase tracking-wider">
                {reg.status === 'Cancelled'
                  ? 'Registration Cancelled'
                  : isAttended
                  ? 'Attendance Recorded & Verified'
                  : 'Official Entry Pass Verified'}
              </h2>
              <p className="text-xs mt-0.5 opacity-80">
                {reg.status === 'Cancelled'
                  ? 'This pass has been cancelled and is no longer valid for entry.'
                  : isAttended
                  ? 'Attendee is checked in and present at the venue.'
                  : 'Valid for 1 Student admission at Yeshwanthpur Campus Gate.'}
              </p>
            </div>

            {/* Event Summary */}
            <div className="p-4 rounded-2xl bg-[#002147] text-white mb-6 relative overflow-hidden shadow-inner">
              <span className="text-[10px] font-bold text-[#FFD60A] uppercase tracking-wider block">
                Confirmed Event
              </span>
              <h3 className="text-lg font-black mt-1 leading-snug">{reg.eventTitle}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-white/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>{reg.eventDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>{reg.eventTime || 'Official Schedule'}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF3B30]" />
                  <span className="truncate">{reg.eventVenue}</span>
                </div>
              </div>
            </div>

            {/* Attendee Details */}
            <div className="space-y-3 text-xs mb-6">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Attendee Identification
              </h4>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Student Name</span>
                  <span className="font-bold text-[#1D1D1F] dark:text-white text-sm">{reg.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Register Number</span>
                  <span className="font-mono font-bold text-[#0071E3] dark:text-[#38BDF8] text-sm">{reg.studentRegNo}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Department</span>
                  <span className="font-medium text-[#1D1D1F] dark:text-slate-200">{reg.studentDept}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Ticket Token</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{reg.ticketCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Campus</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Yeshwanthpur</span>
                </div>
              </div>
            </div>

            {/* Admin / Coordinator Gate Check-In Action */}
            {adminUser && !isAttended && reg.status !== 'Cancelled' && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-2">
                  Directorate / Coordinator Gate Action
                </p>
                <AppleButton
                  variant="primary"
                  size="md"
                  className="w-full justify-center shadow-md"
                  onClick={handleMarkPresent}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Mark Attendee Present at Gate
                </AppleButton>
              </div>
            )}

            {/* Footer Back Action */}
            <div className="pt-2 flex items-center justify-between border-t border-black/[0.06] dark:border-white/10 text-xs">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-[#0071E3] hover:underline font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Campus Portal
              </Link>
              <span className="font-mono text-[10px] text-slate-400">
                SWO-GATE-VERIFY-OK
              </span>
            </div>
          </AppleCard>
        ) : (
          <AppleCard padding="lg" className="border border-black/[0.08] dark:border-white/10 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto text-2xl font-bold">
              ✕
            </div>
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              Pass Not Found or Invalid
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {cleanTicket
                ? `No active entry pass registration was found matching code "${cleanTicket}". Please confirm with the Student Welfare Office.`
                : 'No ticket parameter was provided in the verification URL. Please scan an authentic Christ University event pass QR code.'}
            </p>

            <div className="pt-3">
              <AppleButton
                variant="primary"
                size="md"
                className="justify-center"
                onClick={() => navigate('/')}
              >
                Go to Campus Portal
              </AppleButton>
            </div>
          </AppleCard>
        )}
      </div>
    </div>
  );
};
