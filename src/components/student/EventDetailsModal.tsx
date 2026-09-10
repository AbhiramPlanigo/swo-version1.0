import React from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem } from '../../types';
import { Modal } from '../common/Modal';
import { AppleButton } from '../common/AppleButton';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  HelpCircle,
  ArrowRight,
  Ticket,
  QrCode
} from 'lucide-react';

interface EventDetailsModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (event: EventItem) => void;
  onViewTicket?: (ticketCode: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegister,
  onViewTicket,
}) => {
  const { registrations, studentUser } = useApp();

  // Cache last active event so modal can animate exit smoothly when event is unselected
  const [cachedEvent, setCachedEvent] = React.useState<EventItem | null>(event);
  React.useEffect(() => {
    if (event) setCachedEvent(event);
  }, [event]);

  const activeEvent = event || cachedEvent;
  if (!activeEvent) return null;

  const existingRegistration = registrations.find(
    (r) => r.eventId === activeEvent.id && r.studentId === studentUser?.id && r.status !== 'Cancelled'
  );

  const fillPct = Math.min(100, Math.round((activeEvent.registeredCount / activeEvent.capacity) * 100));
  const isFull = activeEvent.registeredCount >= activeEvent.capacity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6">
        {/* Banner with Badge Overlay */}
        <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 -mt-2">
          <img
            src={activeEvent.bannerUrl}
            alt={activeEvent.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#002147] text-white shadow-md">
              {activeEvent.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/60 backdrop-blur-md text-[#1D1D1F] dark:text-white">
              {activeEvent.organizingCommittee}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md inline-flex items-center gap-1 ${
              activeEvent.requiresQrPass !== false
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {activeEvent.requiresQrPass !== false ? (
                <>
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Pass Required</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Open Walk-in</span>
                </>
              )}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              {activeEvent.title}
            </h2>
            {activeEvent.subtitle && (
              <p className="text-xs sm:text-sm text-white/80 mt-1 line-clamp-1">
                {activeEvent.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Existing Registration Alert Pill */}
        {existingRegistration && (
          <div className="p-3.5 rounded-2xl bg-[#34C759]/10 dark:bg-[#34C759]/20 border border-[#34C759]/20 dark:border-[#34C759]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
              <div>
                <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">
                  You are registered for this event!
                </p>
                <p className="text-[11px] text-[#515154] dark:text-slate-300">
                  {activeEvent.requiresQrPass !== false ? (
                    <>Ticket Pass: <strong className="font-mono">{existingRegistration.ticketCode}</strong> ({existingRegistration.status})</>
                  ) : (
                    <>Open Entry • Show your Student ID card at the venue entrance</>
                  )}
                </p>
              </div>
            </div>
            {activeEvent.requiresQrPass !== false && onViewTicket && (
              <AppleButton
                variant="primary"
                size="sm"
                icon={<Ticket className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onViewTicket(existingRegistration.ticketCode);
                }}
              >
                View Pass
              </AppleButton>
            )}
          </div>
        )}

        {/* Schedule, Venue & Eligibility Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#0071E3] dark:text-[#93C5FD] font-semibold">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(activeEvent.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#515154] dark:text-slate-300">
              <Clock className="w-4 h-4 text-[#86868B] dark:text-slate-400" />
              <span>{activeEvent.time}</span>
            </div>
            <div className="flex items-center gap-2 text-[#515154] dark:text-slate-300">
              <MapPin className="w-4 h-4 text-[#FF3B30]" />
              <span className="font-medium text-[#1D1D1F] dark:text-white">{activeEvent.venue}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#1D1D1F] dark:text-white font-semibold">
              <UserCheck className="w-4 h-4 text-[#34C759]" />
              <span>Eligibility & Audience</span>
            </div>
            <p className="text-[#515154] dark:text-slate-300 leading-relaxed">
              {activeEvent.eligibility}
            </p>
            <p className="text-[11px] text-[#86868B] dark:text-slate-400">
              Deadline: {new Date(activeEvent.registrationDeadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        {/* Event Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400 mb-2">
            About This Event
          </h4>
          <p className="text-sm text-[#3A3A3C] dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {activeEvent.description}
          </p>
        </div>

        {/* Distinguished Speaker / Mentor if present */}
        {activeEvent.speaker && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#002147]/5 to-[#0071E3]/5 dark:from-[#3A5982]/15 dark:to-[#0071E3]/15 border border-[#002147]/10 dark:border-white/10 flex items-start gap-4">
            <img
              src={activeEvent.speaker.avatar}
              alt={activeEvent.speaker.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/50 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#002147] text-white">
                  Featured Speaker
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white mt-1">
                {activeEvent.speaker.name}
              </h4>
              <p className="text-xs text-[#0071E3] dark:text-[#93C5FD] font-medium mt-0.5">
                {activeEvent.speaker.role}
              </p>
              <p className="text-xs text-[#515154] dark:text-slate-300 mt-1.5 leading-relaxed">
                {activeEvent.speaker.bio}
              </p>
            </div>
          </div>
        )}

        {/* Capacity Progress */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-[#86868B] dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium text-[#1D1D1F] dark:text-white">
              <Users className="w-4 h-4 text-[#0071E3] dark:text-[#93C5FD]" /> Registration Capacity
            </span>
            <span className="font-semibold text-[#1D1D1F] dark:text-white">
              {activeEvent.registeredCount} booked of {activeEvent.capacity} seats ({fillPct}%)
            </span>
          </div>
          <div className="w-full h-2 bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                fillPct > 90 ? 'bg-[#FF3B30]' : fillPct > 70 ? 'bg-[#FF9500]' : 'bg-[#0071E3]'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          {isFull && (
            <p className="text-[11px] text-[#FF9500] font-medium mt-2 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> All standard seats allocated. New registrations will be automatically placed on the waitlist.
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-black/[0.05] dark:border-white/10 flex items-center justify-between gap-3">
          <AppleButton variant="secondary" size="md" onClick={onClose}>
            Close
          </AppleButton>

          {!existingRegistration ? (
            <AppleButton
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => {
                onClose();
                onRegister(activeEvent);
              }}
            >
              {isFull ? 'Join Priority Waitlist' : 'Proceed to Registration'}
            </AppleButton>
          ) : (
            <span className="text-xs text-[#34C759] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Registration Active
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};
