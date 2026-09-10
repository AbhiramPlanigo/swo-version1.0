import React, { useState } from 'react';
import { Modal } from './Modal';
import { AppleButton } from './AppleButton';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Heart, 
  Lightbulb, 
  Users, 
  Calendar, 
  MessageSquare,
  Award
} from 'lucide-react';

interface StudentWelfareCharterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentWelfareCharterModal: React.FC<StudentWelfareCharterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { studentUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'charter' | 'suggest'>('suggest');

  // Event Suggestion form state
  const [proposerName, setProposerName] = useState(studentUser?.name || '');
  const [proposerRegNo, setProposerRegNo] = useState(studentUser?.regNo || '');
  const [eventTitle, setEventTitle] = useState('');
  const [category, setCategory] = useState('Cultural Fest');
  const [concept, setConcept] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Departments');
  const [proposedMonth, setProposedMonth] = useState('October 2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !concept.trim()) {
      alert('Please provide an event title and concept description.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newSuggestion = {
        id: `sug_${Date.now()}`,
        title: eventTitle.trim(),
        category,
        concept: concept.trim(),
        proposerName: proposerName.trim() || 'Anonymous Student',
        proposerRegNo: proposerRegNo.trim() || 'N/A',
        targetAudience,
        proposedMonth,
        status: 'Under Review',
        submittedAt: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem('cu_swo_event_suggestions') || '[]');
        stored.push(newSuggestion);
        localStorage.setItem('cu_swo_event_suggestions', JSON.stringify(stored));
      } catch (err) {
        console.warn('Failed to persist suggestion to localStorage:', err);
      }

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      showToast(
        'Event Proposal Submitted!',
        `Your event idea "${eventTitle}" has been received by the SWO Directorate for review.`,
        'success'
      );
    }, 450);
  };

  const handleResetForm = () => {
    setEventTitle('');
    setConcept('');
    setSubmittedSuccess(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl" title="Student Welfare Charter & Initiative Proposals">
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('suggest')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'suggest'
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/10 text-[#1D1D1F] dark:text-slate-300 hover:bg-black/[0.08]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Suggest an Event / Initiative</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] font-extrabold uppercase">
                Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('charter')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'charter'
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/10 text-[#1D1D1F] dark:text-slate-300 hover:bg-black/[0.08]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Welfare Charter & Student Rights</span>
            </button>
          </div>
          <span className="text-[11px] text-[#86868B] dark:text-slate-400 font-medium">
            SWO Bangalore Yeshwanthpur
          </span>
        </div>

        {/* TAB 1: SUGGEST AN EVENT */}
        {activeTab === 'suggest' && (
          <div className="space-y-5">
            {/* Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#002147] via-[#003B7A] to-[#0071E3] text-white space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFD60A]">
                <Sparkles className="w-4 h-4" /> Student-Led Campus Initiatives
              </div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                Pitch an Event or Conclave to the Directorate
              </h3>
              <p className="text-xs text-white/85 leading-relaxed max-w-2xl">
                Have an idea for a cultural festival, inter-college hackathon, theatrical play, open mic, esports tournament, or mental wellness circle? Submit your concept directly to the Student Welfare Office committee.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  Proposal Successfully Dispatched!
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                  Thank you for contributing to campus life! The SWO student advisory council reviews event proposals during bi-weekly committee assemblies. You will be contacted regarding logistics if shortlisted.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <AppleButton variant="secondary" size="sm" onClick={handleResetForm}>
                    Submit Another Idea
                  </AppleButton>
                  <AppleButton variant="primary" size="sm" onClick={onClose}>
                    Done
                  </AppleButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={proposerName}
                      onChange={(e) => setProposerName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                      Register Number
                    </label>
                    <input
                      type="text"
                      value={proposerRegNo}
                      onChange={(e) => setProposerRegNo(e.target.value)}
                      placeholder="e.g. 2447101"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs font-mono text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                      Proposed Event / Initiative Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Battle of the Bands: Inter-Campus Acoustic Slam"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#141A26] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    >
                      <option value="Cultural Fest">Cultural Fest</option>
                      <option value="Music & Performing Arts">Music & Performing Arts</option>
                      <option value="Literature & Debating">Literature & Debating</option>
                      <option value="Tech & Innovation">Tech & Innovation</option>
                      <option value="Social Outreach & CSR">Social Outreach & CSR</option>
                      <option value="Mental Wellness & Sports">Mental Wellness & Sports</option>
                      <option value="Campus Special">Campus Special</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                    Event Concept & Expected Student Impact *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Describe what the event is about, why students will love it, proposed format (competitions, stalls, talks, workshops), and what resources you might need from SWO..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3] leading-relaxed resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                      Target Departments / Audience
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Open to All, or School of Sciences, etc."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                      Preferred Timeline / Month
                    </label>
                    <input
                      type="text"
                      value={proposedMonth}
                      onChange={(e) => setProposedMonth(e.target.value)}
                      placeholder="e.g. November 2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <AppleButton variant="secondary" size="md" type="button" onClick={onClose}>
                    Cancel
                  </AppleButton>
                  <AppleButton
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={isSubmitting}
                    icon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Dispatching...' : 'Submit Event Proposal'}
                  </AppleButton>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: WELFARE CHARTER */}
        {activeTab === 'charter' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-[#0071E3]/[0.06] border border-[#0071E3]/20 space-y-1">
              <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-wider">
                Institutional Mandate
              </span>
              <h4 className="text-sm font-bold text-[#002147] dark:text-white">
                The Student Welfare Office (SWO) Charter of Rights & Commitments
              </h4>
              <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed">
                The Student Welfare Office at Christ University, Bangalore Yeshwanthpur Campus, serves as the premier student-centered catalyst for holistic formation, talent incubation, wellness advocacy, and democratic campus participation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-black/[0.06] dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1D1D1F] dark:text-white">
                  <Award className="w-4 h-4 text-[#C59B27]" />
                  <span>Merit-Based Event Access</span>
                </div>
                <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed">
                  Every bona fide student has equal, non-discriminatory access to campus event participation, auditions, cultural conclaves, and university representation without favoritism.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-black/[0.06] dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1D1D1F] dark:text-white">
                  <Users className="w-4 h-4 text-[#0071E3]" />
                  <span>Student Leadership & Agency</span>
                </div>
                <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed">
                  SWO supports 12+ student-driven committees spanning media, literary arts, dance, music, theater, and social outreach, empowering students to orchestrate major university fests.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-black/[0.06] dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1D1D1F] dark:text-white">
                  <Heart className="w-4 h-4 text-[#FF3B30]" />
                  <span>Confidential Mental Wellbeing</span>
                </div>
                <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed">
                  Access to licensed campus student counselors, peer mentorship circles, and confidential psychological support without academic stigmatization.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-black/[0.06] dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1D1D1F] dark:text-white">
                  <MessageSquare className="w-4 h-4 text-[#34C759]" />
                  <span>Open Feedback & Suggestion Loop</span>
                </div>
                <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed">
                  Direct channels for student ideas, event proposals, and campus welfare feedback to reach the Directorate leadership and campus authorities.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <AppleButton variant="primary" size="sm" onClick={() => setActiveTab('suggest')}>
                Pitch an Event Idea Now
              </AppleButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
