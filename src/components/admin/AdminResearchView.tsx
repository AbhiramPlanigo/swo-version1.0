import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResearchSurvey, SurveyResponse } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { ImageUploadField } from '../common/ImageUploadField';
import { 
  BarChart3, 
  FileText, 
  Plus, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Search,
  Sparkles,
  MessageSquare,
  Trash2,
  Filter
} from 'lucide-react';

export const AdminResearchView: React.FC = () => {
  const { 
    researchSurveys, 
    addResearchSurvey, 
    surveyResponses, 
    studentInquiries, 
    deleteSurvey 
  } = useApp();

  const [selectedSurvey, setSelectedSurvey] = useState<ResearchSurvey | null>(null);
  const [activeTab, setActiveTab] = useState<'surveys' | 'inquiries'>('surveys');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ResearchSurvey>>({
    title: '',
    category: 'Post-Event Feedback',
    description: '',
    deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    targetSample: 250,
    status: 'Active',
    bannerUrl: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSurvey: ResearchSurvey = {
      id: `survey-${Date.now()}`,
      title: formData.title || 'Untitled Survey',
      category: formData.category || 'Post-Event Feedback',
      description: formData.description || '',
      deadline: formData.deadline || new Date().toISOString().split('T')[0],
      bannerUrl: formData.bannerUrl,
      totalResponses: 0,
      responsesCount: 0,
      targetSample: Number(formData.targetSample) || 200,
      status: 'Active',
      questionsCount: 4,
      questions: [
        {
          id: 'q1',
          label: 'Overall rating of this initiative or event',
          type: 'rating',
        },
        {
          id: 'q2',
          label: 'How was the organization and facility arrangements?',
          type: 'choice',
          options: ['Excellent', 'Good', 'Needs Improvement'],
        },
        {
          id: 'q3',
          label: 'What specific improvement would you recommend?',
          type: 'text',
        },
      ],
    };
    addResearchSurvey(newSurvey);
    setIsCreateOpen(false);
    setFormData({
      title: '',
      category: 'Post-Event Feedback',
      description: '',
      deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      targetSample: 250,
      status: 'Active',
    });
  };

  const handleDownloadCSV = (survey: ResearchSurvey) => {
    const matchingResponses = surveyResponses.filter((r) => r.surveyId === survey.id);

    let csvRows = ['Response ID,Student Reg No,Student Name,Department,Answers Summary,Additional Feedback,Timestamp'];

    if (matchingResponses.length > 0) {
      matchingResponses.forEach((r) => {
        const answersStr = JSON.stringify(r.answers).replace(/"/g, '""');
        const feedback = (r.generalFeedback || '').replace(/"/g, '""');
        csvRows.push(
          `"${r.id}","${r.studentRegNo || 'N/A'}","${r.studentName || 'Student'}","${r.studentDept || 'General'}","${answersStr}","${feedback}","${r.submittedAt}"`
        );
      });
    } else {
      csvRows.push('"NO_DATA","N/A","N/A","N/A","No responses logged yet for this survey","",""');
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${survey.title.replace(/\s+/g, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute live statistics
  const totalResponsesAcrossSurveys = surveyResponses.length;
  const activeSurveysCount = researchSurveys.filter((s) => s.status === 'Active').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#AF52DE]/10 text-[#AF52DE] dark:bg-purple-950/40 dark:text-purple-400">
              SWO Research Directorate
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Bangalore Yeshwanthpur Campus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Research, Surveys & Event Feedback
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-1">
            Monitor post-event audience audits, campus welfare studies, and student event improvement proposals in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AppleButton
            variant="navy"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            New Survey
          </AppleButton>
        </div>
      </div>

      {/* Tabs: Surveys vs Student Inquiries */}
      <div className="flex items-center gap-3 border-b border-black/[0.06] dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('surveys')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'surveys'
              ? 'bg-[#002147] text-white shadow-xs'
              : 'bg-black/[0.04] dark:bg-white/10 text-[#515154] dark:text-slate-300 hover:bg-black/[0.08]'
          }`}
        >
          Active Surveys ({researchSurveys.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'inquiries'
              ? 'bg-[#002147] text-white shadow-xs'
              : 'bg-black/[0.04] dark:bg-white/10 text-[#515154] dark:text-slate-300 hover:bg-black/[0.08]'
          }`}
        >
          Student Event Improvement Proposals ({studentInquiries.length})
        </button>
      </div>

      {/* TAB 1: SURVEYS */}
      {activeTab === 'surveys' && (
        <div className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AppleCard className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium">Active Research Surveys</p>
                  <p className="text-2xl font-black text-[#1D1D1F] dark:text-white mt-1">{activeSurveysCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
            </AppleCard>

            <AppleCard className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium">Student Responses Logged</p>
                  <p className="text-2xl font-black text-[#1D1D1F] dark:text-white mt-1">{totalResponsesAcrossSurveys}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </AppleCard>

            <AppleCard className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium">Event Proposals Received</p>
                  <p className="text-2xl font-black text-[#1D1D1F] dark:text-white mt-1">{studentInquiries.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
            </AppleCard>
          </div>

          {/* Survey Cards */}
          {researchSurveys.length === 0 ? (
            <EmptyState
              title="No Surveys Available"
              description="Click 'New Survey' to create your first post-event feedback or campus welfare audit."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {researchSurveys.map((survey) => {
                const matchingResponses = surveyResponses.filter((r) => r.surveyId === survey.id);
                const actualCount = matchingResponses.length || survey.totalResponses || 0;
                const progress = Math.min(100, Math.round((actualCount / survey.targetSample) * 100));

                return (
                  <AppleCard
                    key={survey.id}
                    hoverEffect
                    padding="none"
                    className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] flex flex-col justify-between transition-colors"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#93C5FD]">
                          {survey.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              survey.status === 'Active'
                                ? 'bg-[#34C759]/15 text-[#28A745] dark:text-emerald-400'
                                : 'bg-black/[0.06] dark:bg-white/10 text-[#86868B] dark:text-slate-400'
                            }`}
                          >
                            {survey.status}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete "${survey.title}"?`)) {
                                deleteSurvey(survey.id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Survey"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                        {survey.title}
                      </h3>

                      <p className="text-xs text-[#515154] dark:text-slate-300 leading-relaxed line-clamp-2">
                        {survey.description}
                      </p>

                      <div className="pt-2 text-xs text-[#86868B] dark:text-slate-400 flex items-center justify-between">
                        <span>Target Deadline:</span>
                        <span className="font-semibold text-[#1D1D1F] dark:text-white">{survey.deadline}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs text-[#86868B] dark:text-slate-400">
                          <span>Responses Collected</span>
                          <span className="font-semibold text-[#1D1D1F] dark:text-white">
                            {actualCount} / {survey.targetSample} ({progress}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#AF52DE] rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-black/[0.05] dark:border-white/10 flex items-center gap-2">
                        <AppleButton
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs font-semibold"
                          onClick={() => setSelectedSurvey(survey)}
                        >
                          View Metrics ({actualCount})
                        </AppleButton>
                        <AppleButton
                          variant="primary"
                          size="sm"
                          className="p-2 shrink-0"
                          title="Export Dataset"
                          onClick={() => handleDownloadCSV(survey)}
                        >
                          <Download className="w-4 h-4" />
                        </AppleButton>
                      </div>
                    </div>
                  </AppleCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT EVENT INQUIRIES & PROPOSALS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white">
              Student Event Proposals & Questions Log
            </h3>
            <span className="text-xs text-[#86868B] dark:text-slate-400">
              {studentInquiries.length} submissions logged
            </span>
          </div>

          {studentInquiries.length === 0 ? (
            <EmptyState
              title="No Inquiries or Proposals Logged"
              description="Student proposals and questions submitted via the public portal will appear here."
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
                      <div className="flex items-center gap-2 text-xs text-[#86868B] dark:text-slate-400">
                        <span>{new Date(inq.submittedAt).toLocaleString()}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {inq.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-[#1D1D1F] dark:text-white leading-relaxed">
                      "{inq.question}"
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#515154] dark:text-slate-400 pt-2 border-t border-black/[0.04] dark:border-white/10">
                      <span>Submitted by: <strong>{inq.studentName}</strong> ({inq.studentRegNo}) • {inq.studentDept}</span>
                      <a href={`mailto:${inq.studentEmail}`} className="text-[#0071E3] hover:underline font-semibold">
                        {inq.studentEmail}
                      </a>
                    </div>
                  </div>
                </AppleCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metrics Inspector Modal */}
      {selectedSurvey && (
        <Modal
          isOpen={!!selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          title={selectedSurvey.title}
          subtitle={`SWO Research Initiative • ${selectedSurvey.category}`}
          maxWidth="lg"
        >
          {(() => {
            const matchingResponses = surveyResponses.filter((r) => r.surveyId === selectedSurvey.id);
            const count = matchingResponses.length;

            return (
              <div className="space-y-5">
                <p className="text-xs sm:text-sm text-[#515154] dark:text-slate-300 leading-relaxed">
                  {selectedSurvey.description}
                </p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04]">
                    <p className="text-xl font-extrabold text-[#0071E3] dark:text-blue-400">{count}</p>
                    <p className="text-[11px] text-[#86868B] dark:text-slate-400 mt-0.5">Responses Logged</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04]">
                    <p className="text-xl font-extrabold text-[#34C759] dark:text-emerald-400">
                      {selectedSurvey.targetSample}
                    </p>
                    <p className="text-[11px] text-[#86868B] dark:text-slate-400 mt-0.5">Target Sample</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04]">
                    <p className="text-xl font-extrabold text-[#AF52DE] dark:text-purple-400">
                      {count > 0 ? `${Math.round((count / selectedSurvey.targetSample) * 100)}%` : '0%'}
                    </p>
                    <p className="text-[11px] text-[#86868B] dark:text-slate-400 mt-0.5">Progress to Target</p>
                  </div>
                </div>

                {/* Submissions Log */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#86868B] dark:text-slate-400">
                    Live Response Submissions ({count})
                  </h4>

                  {count === 0 ? (
                    <div className="p-6 text-center text-xs text-[#86868B] dark:text-slate-400 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/10">
                      No student responses logged yet for this survey.
                      <p className="text-[11px] mt-1 text-slate-400">Share this survey link with students in the public portal.</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {matchingResponses.map((resp, rIdx) => (
                        <div
                          key={resp.id || rIdx}
                          className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/10 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[#86868B] dark:text-slate-400">
                            <span className="font-bold text-[#1D1D1F] dark:text-white">
                              {resp.studentName || 'Student'} ({resp.studentRegNo || '2447000'})
                            </span>
                            <span>{new Date(resp.submittedAt).toLocaleDateString()}</span>
                          </div>
                          {resp.generalFeedback && (
                            <p className="text-[#515154] dark:text-slate-300 italic">
                              "{resp.generalFeedback}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.05] dark:border-white/10">
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownloadCSV(selectedSurvey)}
                  >
                    Export CSV Dataset
                  </AppleButton>
                  <AppleButton
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedSurvey(null)}
                  >
                    Close
                  </AppleButton>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Create Survey Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Research Survey"
          subtitle="Formulate post-event feedback or campus welfare study"
          maxWidth="md"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                Survey Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Post-Event Feedback: University Talk Series 2026"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                >
                  <option value="Post-Event Feedback">Post-Event Feedback</option>
                  <option value="Campus Welfare Research">Campus Welfare Research</option>
                  <option value="Infrastructure & Logistics">Infrastructure & Logistics</option>
                  <option value="Cultural & Arts">Cultural & Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                  Target Sample Size
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={formData.targetSample}
                  onChange={(e) => setFormData({ ...formData, targetSample: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#515154] dark:text-slate-300 mb-1">
                Objective & Scope
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the purpose of this evaluation and what campus decisions will be informed by the results."
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0071E3]"
                required
              />
            </div>

            <div>
              <ImageUploadField
                label="Survey Cover Poster / Illustration (Optional)"
                value={formData.bannerUrl || ''}
                onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
                aspectRatio="4:3"
                recommendedDimensions="1200 × 900 px"
                description="This is the ratio of the image allowed: 4:3 Standard Landscape. Perfect for research posters, bulletin illustrations, and survey cards."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.05] dark:border-white/10">
              <AppleButton
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </AppleButton>
              <AppleButton
                variant="primary"
                size="sm"
                type="submit"
              >
                Publish Survey
              </AppleButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
