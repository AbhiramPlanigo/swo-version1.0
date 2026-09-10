import React, { useState } from 'react';
import { SWOLogo } from '../common/SWOLogo';
import { StudentNavTab } from '../navigation/StudentNavbar';
import { CodeOfConductModal } from '../common/CodeOfConductModal';
import { StudentWelfareCharterModal } from '../common/StudentWelfareCharterModal';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  ShieldCheck,
  Building2, 
  ArrowUpRight,
  BookOpen,
  Heart
} from 'lucide-react';

interface StudentFooterProps {
  onSelectTab: (tab: StudentNavTab) => void;
}

export const StudentFooter: React.FC<StudentFooterProps> = ({ onSelectTab }) => {
  const [isCodeOfConductOpen, setIsCodeOfConductOpen] = useState(false);
  const [isCharterOpen, setIsCharterOpen] = useState(false);

  return (
    <footer className="relative w-full bg-white dark:bg-[#0E131F] text-[#16212F] dark:text-[#F8FAFC] border-t border-[#E2E8F0] dark:border-white/10 pt-16 pb-28 lg:pb-14 mt-16 lg:mt-20 overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Top Header Row with Logo & Quick Contact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-[#E2E8F0] dark:border-white/10">
          <SWOLogo size="lg" showText={true} />
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-[#536275] dark:text-[#94A3B8]">Need immediate support or have an inquiry?</span>
            <a
              href="mailto:swo.yeshwanthpur@christuniversity.in"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full bg-[#3A5982] dark:bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#2D476C] dark:hover:bg-[#0062C4] transition-colors shadow-xs"
            >
              <span>Contact Student Welfare Office</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 4-Column Editorial Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          
          {/* Col 1: Mission & Heritage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#16212F] dark:text-white uppercase tracking-wider">
              Student Welfare Office
            </h4>
            <p className="text-[#536275] dark:text-[#94A3B8] leading-relaxed text-[13px]">
              The Student Welfare Office champions student expression, leadership development, holistic well-being, and premier cultural traditions at Christ University, Bangalore Yeshwanthpur Campus.
            </p>
            <div className="inline-flex items-center gap-2 pt-2 px-3 py-1.5 rounded-full bg-[#C5A063]/15 dark:bg-[#C5A063]/20 text-[#9D7A3E] dark:text-[#E2C78A] font-semibold text-[11px] border border-[#C5A063]/25 dark:border-[#C5A063]/40">
              <ShieldCheck className="w-4 h-4 text-[#C5A063]" /> NAAC A+ Accredited Institution
            </div>
          </div>

          {/* Col 2: Services & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#16212F] dark:text-white uppercase tracking-wider">
              Direct Portals & Services
            </h4>
            <ul className="space-y-1 text-[#536275] dark:text-[#94A3B8]">
              <li>
                <button
                  onClick={() => onSelectTab('calendar')}
                  className="min-h-[36px] py-1.5 hover:text-[#3A5982] dark:hover:text-[#6BA3E8] hover:underline transition-colors text-left flex items-center gap-1 font-semibold text-[#3A5982] dark:text-[#6BA3E8]"
                >
                  <span>Interactive Campus Calendar</span>
                  <span className="px-1.5 py-0.2 bg-[#C5A063]/20 dark:bg-[#C5A063]/30 text-[#9D7A3E] dark:text-[#E2C78A] text-[9px] font-bold rounded-full">New</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('events')}
                  className="min-h-[36px] py-1.5 hover:text-[#3A5982] dark:hover:text-[#6BA3E8] hover:underline transition-colors text-left flex items-center"
                >
                  Campus Events, Fests & Conclaves
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('my-registrations')}
                  className="min-h-[36px] py-1.5 hover:text-[#3A5982] dark:hover:text-[#6BA3E8] hover:underline transition-colors text-left flex items-center"
                >
                  My Registrations & Entry QR Passes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('announcements')}
                  className="min-h-[36px] py-1.5 hover:text-[#3A5982] dark:hover:text-[#6BA3E8] hover:underline transition-colors text-left flex items-center"
                >
                  Official Circulars & Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('results')}
                  className="min-h-[36px] py-1.5 hover:text-[#3A5982] dark:hover:text-[#6BA3E8] hover:underline transition-colors text-left flex items-center"
                >
                  Tournament Results & Hall of Fame
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('certificates')}
                  className="min-h-[36px] py-1.5 hover:text-[#3A5982] dark:hover:text-[#6BA3E8] hover:underline transition-colors text-left flex items-center"
                >
                  Digital Verified Certificates
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#16212F] dark:text-white uppercase tracking-wider">
              Student Welfare Office Desk
            </h4>
            <div className="space-y-2.5 text-[#536275] dark:text-[#94A3B8]">
              <p className="flex items-start gap-2 text-[13px]">
                <MapPin className="w-4 h-4 text-[#3A5982] dark:text-[#6BA3E8] shrink-0 mt-0.5" />
                <span>
                  CHRIST (Deemed to be University), Yeshwanthpur Campus, Nagasandra Post, Near Tumkur Road, Bengaluru, Karnataka 560073
                </span>
              </p>
              <p className="flex items-center gap-2 text-[13px]">
                <Clock className="w-4 h-4 text-[#C5A063] shrink-0" />
                <span>Monday – Saturday: 08:30 AM – 05:00 PM</span>
              </p>
              <p className="flex items-center gap-2 text-[13px]">
                <Building2 className="w-4 h-4 text-[#3A5982] dark:text-[#6BA3E8] shrink-0" />
                <span>Room 104, Ground Floor, Central Block</span>
              </p>
            </div>
          </div>

          {/* Col 4: Helpdesk & Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#16212F] dark:text-white uppercase tracking-wider">
              Helplines & Wellbeing
            </h4>
            <div className="space-y-2.5 text-[#536275] dark:text-[#94A3B8]">
              <p className="flex items-center gap-2 text-[13px]">
                <Mail className="w-4 h-4 text-[#3A5982] dark:text-[#6BA3E8] shrink-0" />
                <span className="font-mono text-[12px] text-[#16212F] dark:text-white">swo.yeshwanthpur@christuniversity.in</span>
              </p>
              <p className="flex items-center gap-2 text-[13px]">
                <Phone className="w-4 h-4 text-[#C5A063] shrink-0" />
                <span>+91 80 4012 9100 (Ext. 204)</span>
              </p>
              <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-[#E2E8F0] dark:border-white/10 text-[12px] text-[#536275] dark:text-[#94A3B8] leading-relaxed">
                <span className="text-[#3A5982] dark:text-[#6BA3E8] font-bold block mb-0.5">Confidential Student Counseling:</span>
                Campus Student Counselor: <strong className="text-[#16212F] dark:text-white">counselor.ypr@christuniversity.in</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 border-t border-[#E2E8F0] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C9AA9] dark:text-[#64748B]">
          <p>© {new Date().getFullYear()} Student Welfare Office • Christ University, Yeshwanthpur Campus. All rights reserved.</p>
          <div className="flex items-center space-x-6 flex-wrap gap-y-2">
            <button
              type="button"
              onClick={() => setIsCodeOfConductOpen(true)}
              className="hover:text-[#16212F] dark:hover:text-white transition-colors cursor-pointer text-xs font-medium inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Code of Conduct</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCharterOpen(true)}
              className="hover:text-[#16212F] dark:hover:text-white transition-colors cursor-pointer text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#FF3B30]" />
              <span>Student Welfare Charter & Event Proposals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code of Conduct Modal */}
      <CodeOfConductModal
        isOpen={isCodeOfConductOpen}
        onClose={() => setIsCodeOfConductOpen(false)}
      />

      {/* Student Welfare Charter & Suggest an Event Modal */}
      <StudentWelfareCharterModal
        isOpen={isCharterOpen}
        onClose={() => setIsCharterOpen(false)}
      />

      {/* Giant Oxford-style Watermark Typography Across the Base of the Footer */}
      <div className="w-full overflow-hidden pointer-events-none select-none flex justify-center opacity-[0.04] dark:opacity-[0.03] mt-6">
        <span className="font-serif tracking-[0.2em] text-[#16212F] dark:text-white text-[18vw] font-black uppercase leading-none whitespace-nowrap">
          CHRIST
        </span>
      </div>
    </footer>
  );
};
