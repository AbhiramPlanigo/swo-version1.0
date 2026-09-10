import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResearchSurvey, SurveyQuestion } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Send, 
  Star, 
  Sparkles, 
  HelpCircle, 
  MessageSquarePlus, 
  Lightbulb,
  ShieldCheck,
  Building2,
  Calendar,
  Filter,
  Upload
} from 'lucide-react';

interface ResearchSurveysViewProps {
  onOpenMediaUpload?: (category?: 'event' | 'hero' | 'poster' | 'avatar' | 'moment') => void;
}

export const ResearchSurveysView: React.FC<ResearchSurveysViewProps> = ({
  onOpenMediaUpload,
}) => {
  const { 
    surveys, 
    submitSurveyResponse, 
    surveyResponses, 
    studentInquiries, 
    submitStudentInquiry, 
    studentUser, 
    openLoginModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'surveys' | 'inquiries'>('surveys');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedSurvey, setSelectedSurvey] = useState<ResearchSurvey | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string | number>>({});
  const [generalComment, setGeneralComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSurveyId, setSubmittedSurveyId] = useState<string | null>(null);

  // Inquiry Form State
  const [inquiryCategory, setInquiryCategory] = useState<'Event Speaker' | 'Venue & Acoustics' | 'Event Timing' | 'Theme Suggestion' | 'General Welfare'>('Theme Suggestion');
  const [inquiryQuestion, setInquiryQuestion] = useState('');

  // Check which surveys this student has already submitted
  const completedSurveyIds = new Set(
    surveyResponses
      .filter((r) => studentUser && r.studentId === studentUser.id)
      .map((r) => r.surveyId)
  );

  const categories = ['All', 'Post-Event Feedback', 'Campus Welfare Research', 'Infrastructure & Logistics'];

  const filteredSurveys = surveys.filter((s) => {
    if (categoryFilter === 'All') return true;
    return s.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const handleOpenSurvey = (survey: ResearchSurvey) => {
    setSelectedSurvey(survey);
    setSurveyAnswers({});
    setGeneralComment('');
  };

  const handleRatingSelect = (questionId: string, rating: number) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleChoiceSelect = (questionId: string, choice: string) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitSurveyResponse(selectedSurvey.id, surveyAnswers, generalComment);
      setSubmittedSurveyId(selectedSurvey.id);
      setIsSubmitting(false);
      setSelectedSurvey(null);
    }, 400);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryQuestion.trim()) return;

    if (!studentUser) {
      openLoginModal('Please sign in to post event improvement questions and suggestions.', () => {});
      return;
    }

    submitStudentInquiry({
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentRegNo: studentUser.regNo,
      studentDept: studentUser.department,
      studentEmail: studentUser.email,
      category: inquiryCategory,
      question: inquiryQuestion.trim(),
    });

    setInquiryQuestion('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#002147] via-[#0A2540] to-[#0071E3] text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-white border border-white/20">
              Institutional Research & Campus Voice
            </span>
            <span className="text-xs text-white/70">Bangalore Yeshwanthpur Campus</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Research, Surveys & Event Feedback
          </h1>

          <p className="text-sm sm:text-base text-white/85 leading-relaxed">
            Your evaluation and ideas directly shape university events, speaker selections, cultural fests, and campus welfare initiatives. Participate in active surveys or submit direct event improvement proposals to the Student Welfare Office.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('surveys')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'surveys'
                  ? 'bg-white text-[#002147] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Active Surveys ({surveys.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-white text-[#002147] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Ask Questions & Suggest Improvements ({studentInquiries.length})
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ACTIVE SURVEYS */}
      {activeTab === 'surveys' && (
        <div className="space-y-6">
          {/* Category Filter Chips */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter className="w-4 h-4 text-[#86868B] dark:text-slate-400 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#0071E3] text-white shadow-xs'
                      : 'bg-black/[0.04] dark:bg-white/10 text-[#515154] dark:text-slate-300 hover:bg-black/[0.08]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {onOpenMediaUpload && (
                <button
                  type="button"
                  onClick={() => onOpenMediaUpload('poster')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0071E3] dark:text-blue-300 bg-[#0071E3]/10 hover:bg-[#0071E3]/20 border border-[#0071E3]/20 transition-all cursor-pointer shadow-xs"
                  title="Upload Survey Poster (Allowed Ratio: 4:3 or 16:9)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Survey Poster (4:3)</span>
                </button>
              )}

              <span className="text-xs text-[#86868B] dark:text-slate-400 font-medium">
                Showing {filteredSurveys.length} surveys
              </span>
            </div>
          </div>

          {/* Surveys Grid */}
          {filteredSurveys.length === 0 ? (
            <EmptyState
              title="No Surveys in this Category"
              description="Check back soon or select another category above."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSurveys.map((survey) => {
                const isCompleted = completedSurveyIds.has(survey.id) || submittedSurveyId === survey.id;
                const total = survey.totalResponses || 0;
                const target = survey.targetSample || 100;
                const progressPct = Math.min(100, Math.round((total / target) * 100));

                return (
                  <AppleCard
                    key={survey.id}
                    hoverEffect
                    padding="none"
                    className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] flex flex-col justify-between transition-all"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#002147]/10 dark:bg-blue-900/30 text-[#002147] dark:text-blue-300">
                          {survey.category}
                        </span>
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] dark:text-emerald-400 bg-[#16A34A]/10 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#86868B] dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5" /> Until {survey.deadline}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight leading-snug">
                        {survey.title}
                      </h3>

                      <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed line-clamp-3">
                        {survey.description}
                      </p>

                      {/* Participation stats */}
                      <div className="space-y-1.5 pt-2 border-t border-black/[0.05] dark:border-white/10">
                        <div className="flex items-center justify-between text-xs text-[#86868B] dark:text-slate-400">
                          <span>Responses Logged:</span>
                          <span className="font-bold text-[#1D1D1F] dark:text-white">
                            {total} / {target} students
                          </span>
                        </div>
                        <div className="w-full h-2 bg-black/[0.05] dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0071E3] to-[#AF52DE] rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      {isCompleted ? (
                        <div className="w-full py-2 text-center text-xs font-semibold text-[#16A34A] dark:text-emerald-400 bg-[#16A34A]/5 dark:bg-emerald-950/20 rounded-xl border border-[#16A34A]/20">
                          Feedback Recorded • Thank you!
                        </div>
                      ) : (
                        <AppleButton
                          variant="primary"
                          size="sm"
                          className="w-full text-xs font-bold"
                          onClick={() => handleOpenSurvey(survey)}
                        >
                          Take Survey ({survey.questions?.length || 4} Questions)
                        </AppleButton>
                      )}
                    </div>
                  </AppleCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ASK QUESTIONS & SUGGEST IMPROVEMENTS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-8">
          {/* Submission Card */}
          <AppleCard className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26]">
            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-[#0071E3]" />
                <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                  Ask a Question or Propose an Event Improvement
                </h3>
              </div>
              <p className="text-xs text-[#515154] dark:text-slate-300">
                Have an idea for our next Talk Series theme, an auditorium sound feedback, or a guest speaker recommendation? Submit directly to the SWO Student Council.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                    Area of Feedback
                  </label>
                  <select
                    value={inquiryCategory}
                    onChange={(e) => setInquiryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value="Theme Suggestion">Theme Suggestion for Upcoming Fests</option>
                    <option value="Event Speaker">Distinguished Speaker Recommendation</option>
                    <option value="Venue & Acoustics">Auditorium Acoustics & Seating</option>
                    <option value="Event Timing">Event Timing & Schedule Clashes</option>
                    <option value="General Welfare">General Campus Student Welfare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                    Submitted As
                  </label>
                  <div className="px-3 py-2 text-xs rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-[#515154] dark:text-slate-300 truncate">
                    {studentUser ? `${studentUser.name} (${studentUser.regNo})` : 'Guest / Sign in recommended'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                  Your Specific Question or Event Improvement Idea
                </label>
                <textarea
                  rows={3}
                  value={inquiryQuestion}
                  onChange={(e) => setInquiryQuestion(e.target.value)}
                  placeholder="e.g. Can we arrange an interactive workshop on AI Robotics with an industry leader during the upcoming tech symposium?"
                  className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <AppleButton
                  variant="primary"
                  size="md"
                  type="submit"
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Proposal to SWO
                </AppleButton>
              </div>
            </form>
          </AppleCard>

          {/* Student Submissions Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400">
                Recent Student Proposals & Welfare Ideas
              </h4>
              <span className="text-xs text-[#86868B] dark:text-slate-400">
                {studentInquiries.length} logged
              </span>
            </div>

            {studentInquiries.length === 0 ? (
              <EmptyState
                title="No Inquiries Logged Yet"
                description="Be the first to suggest an event theme or ask a question to the Student Welfare Office."
              />
            ) : (
              <div className="space-y-3">
                {studentInquiries.map((inq) => (
                  <AppleCard
                    key={inq.id}
                    className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 dark:bg-blue-900/30 text-[#0071E3] dark:text-blue-300">
                          {inq.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-[#1D1D1F] dark:text-white leading-relaxed">
                        "{inq.question}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-[#86868B] dark:text-slate-400 pt-1">
                        <span>Submitted by: <strong>{inq.studentName}</strong> ({inq.studentDept})</span>
                        <span>{new Date(inq.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </AppleCard>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE SURVEY MODAL */}
      {selectedSurvey && (
        <Modal
          isOpen={!!selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          title={selectedSurvey.title}
          subtitle={`SWO Institutional Feedback • ${selectedSurvey.category}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitSurvey} className="space-y-6 pt-2">
            <p className="text-xs sm:text-sm text-[#515154] dark:text-slate-300 leading-relaxed border-b border-black/[0.06] dark:border-white/10 pb-3">
              {selectedSurvey.description}
            </p>

            {/* Questions List */}
            <div className="space-y-6">
              {(selectedSurvey.questions || []).map((q: SurveyQuestion, qIdx: number) => (
                <div key={q.id} className="space-y-2.5 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/10">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0071E3] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <label className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-white leading-snug">
                      {q.label}
                    </label>
                  </div>

                  {/* Rating Type Question (1-5 stars) */}
                  {q.type === 'rating' && (
                    <div className="flex items-center gap-3 pt-2">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const currentVal = (surveyAnswers[q.id] as number) || 0;
                        const isFilled = starVal <= currentVal;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => handleRatingSelect(q.id, starVal)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-hidden"
                            title={`Rate ${starVal} of 5`}
                          >
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                isFilled
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-semibold text-[#86868B] dark:text-slate-400 ml-2">
                        {surveyAnswers[q.id] ? `${surveyAnswers[q.id]} / 5 Stars` : 'Select rating'}
                      </span>
                    </div>
                  )}

                  {/* Choice Type Question (Radio Options) */}
                  {q.type === 'choice' && q.options && (
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt) => (
                        <label
                          key={opt}
                          onClick={() => handleChoiceSelect(q.id, opt)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all text-xs ${
                            surveyAnswers[q.id] === opt
                              ? 'bg-[#0071E3]/10 border-[#0071E3] text-[#0071E3] dark:text-blue-300 font-bold'
                              : 'bg-white dark:bg-[#1C2433] border-black/5 dark:border-white/10 text-[#515154] dark:text-slate-300 hover:bg-black/[0.02]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`choice-${q.id}`}
                            checked={surveyAnswers[q.id] === opt}
                            onChange={() => handleChoiceSelect(q.id, opt)}
                            className="text-[#0071E3] focus:ring-0"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Text Input Question */}
                  {q.type === 'text' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        value={(surveyAnswers[q.id] as string) || ''}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="Write your recommendation here..."
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#1C2433] border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* General Feedback Box */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-[#515154] dark:text-slate-300">
                  Additional Comments or Observations (Optional)
                </label>
                <textarea
                  rows={2}
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  placeholder="Anything else you would like the Student Welfare Office to know?"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/10">
              <span className="text-[11px] text-[#86868B] dark:text-slate-400">
                Responses are stored anonymously for welfare analytics.
              </span>
              <div className="flex items-center gap-2">
                <AppleButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setSelectedSurvey(null)}
                >
                  Cancel
                </AppleButton>
                <AppleButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Recording...' : 'Submit Feedback'}
                </AppleButton>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
