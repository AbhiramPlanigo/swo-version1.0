import React, { useState } from 'react';
import { Modal } from './Modal';
import { AppleButton } from './AppleButton';
import { 
  ShieldCheck, 
  BookOpen, 
  IdCard, 
  Clock, 
  AlertTriangle, 
  HeartHandshake, 
  Sparkles, 
  ExternalLink,
  Search,
  CheckCircle2
} from 'lucide-react';

interface CodeOfConductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeOfConductModal: React.FC<CodeOfConductModalProps> = ({ isOpen, onClose }) => {
  const [filterSearch, setFilterSearch] = useState('');

  const sections = [
    {
      id: 'preamble',
      icon: <BookOpen className="w-4 h-4 text-[#0071E3]" />,
      title: 'Preamble & Institutional Ethos',
      content:
        'Christ (Deemed to be University) is dedicated to holistic student development anchored on the motto "Excellence and Service". Students are expected to conduct themselves with high moral integrity, academic discipline, and mutual respect toward peers, faculty, staff, and campus visitors at all times.',
    },
    {
      id: 'id-card',
      icon: <IdCard className="w-4 h-4 text-[#C59B27]" />,
      title: 'Mandatory Smartcard & Identity Protocol',
      content:
        'All enrolled students must visibly wear their official Christ University smartcard on the university lanyard at all times upon entering the campus. Entry to campus gates, the central library, examination halls, and SWO auditorium events is strictly conditional on physical smartcard tap verification.',
    },
    {
      id: 'decorum',
      icon: <CheckCircle2 className="w-4 h-4 text-[#34C759]" />,
      title: 'Campus Decorum & Formal Dress Code',
      content:
        'Students must adhere to the university prescribed dress code on all working days. Formal, neat, and modest attire is mandatory. Dignity and respectful silence must be maintained in academic corridors, seminar halls, laboratories, and the Main Auditorium.',
    },
    {
      id: 'attendance',
      icon: <Clock className="w-4 h-4 text-[#AF52DE]" />,
      title: 'Punctuality & Attendance Thresholds',
      content:
        'A minimum of 85% attendance is mandatory in each registered course to be eligible for end-semester examinations. Participation in authorized SWO cultural events, conclaves, or outreach drives requires prior official duty leave approvals endorsed by the Department and SWO Directorate.',
    },
    {
      id: 'anti-ragging',
      icon: <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />,
      title: 'Zero-Tolerance Anti-Ragging Policy',
      content:
        'Ragging in any form—verbal, physical, psychological, or digital—is strictly prohibited under UGC guidelines and Supreme Court mandates. Any student found engaging in or abetting ragging faces immediate suspension, disciplinary hearing, and potential expulsion alongside statutory legal reporting.',
    },
    {
      id: 'substance-free',
      icon: <ShieldCheck className="w-4 h-4 text-[#FF9500]" />,
      title: 'Substance-Free Campus Environment',
      content:
        'Christ University maintains a strict zero-tolerance policy regarding tobacco, alcohol, narcotics, vapes, or any psychotropic substances. Possession, consumption, or association with illicit substances on campus or at university-affiliated events triggers immediate disciplinary action.',
    },
    {
      id: 'digital',
      icon: <Sparkles className="w-4 h-4 text-[#0071E3]" />,
      title: 'Digital Citizenship & Cyber Ethics',
      content:
        'Campus Wi-Fi, LMS portals, and institutional computing assets are intended exclusively for academic, research, and authorized co-curricular activities. Cyberbullying, hate speech, unauthorized media recording, and tampering with campus technological infrastructure are punishable offenses.',
    },
    {
      id: 'redressal',
      icon: <HeartHandshake className="w-4 h-4 text-[#34C759]" />,
      title: 'Grievance Redressal & Student Advocacy',
      content:
        'Students have the institutional right to fair representation and grievance escalation through the Student Welfare Office, Campus Grievance Redressal Cell, and Equal Opportunity Cell. All representations are treated with confidentiality and procedural justice.',
    },
  ];

  const filtered = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.content.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl" title="Official Student Code of Conduct">
      <div className="space-y-6">
        {/* Header Branding Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#002147] via-[#0A2540] to-[#00142A] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/christ-university-crest.png"
                alt="Christ University Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C59B27]">
                  Statutory Regulations
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                  Academic Year 2026–2027
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight mt-0.5">
                Christ (Deemed to be University)
              </h3>
              <p className="text-xs text-white/80">
                Bangalore Yeshwanthpur Campus • Directorate of Student Welfare
              </p>
            </div>
          </div>

          <a
            href="https://christuniversity.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <span>University Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search regulations (e.g. ID card, anti-ragging, attendance, dress code)..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-slate-400 focus:outline-none focus:border-[#0071E3]"
          />
        </div>

        {/* Regulations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
          {filtered.map((sec) => (
            <div
              key={sec.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-black/[0.06] dark:border-white/10 hover:border-[#0071E3]/30 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#1D1D1F] dark:text-white">
                <div className="w-6 h-6 rounded-lg bg-black/[0.03] dark:bg-white/5 flex items-center justify-center shrink-0">
                  {sec.icon}
                </div>
                <span>{sec.title}</span>
              </div>
              <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed">
                {sec.content}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-[#86868B] dark:text-slate-400">
              No specific regulations found matching "{filterSearch}".
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868B] dark:text-slate-400">
          <span>By enrolling in academic programs, students agree to uphold these institutional standards.</span>
          <AppleButton variant="primary" size="sm" onClick={onClose}>
            Acknowledge & Close
          </AppleButton>
        </div>
      </div>
    </Modal>
  );
};
