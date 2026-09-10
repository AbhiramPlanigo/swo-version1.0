import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventResult } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { 
  Trophy, 
  Medal, 
  Award, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Search,
  MessageSquare
} from 'lucide-react';

interface ResultsViewProps {
  onViewCertificates: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ onViewCertificates }) => {
  const { results, studentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResults = (results || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.eventTitle.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.positions.some((p) => p.winnerName.toLowerCase().includes(q) || p.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFD60A]/20 dark:bg-[#FFD60A]/25 text-[#B78103] dark:text-[#E6C98F]">
              Official Outcomes
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Yeshwanthpur Campus SWO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Competition Results & Honors
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-1">
            Official scorecards, winner podiums, and adjudicator remarks for completed festivals and championships.
          </p>
        </div>

        <AppleButton
          variant="secondary"
          size="sm"
          icon={<Award className="w-4 h-4 text-[#AF52DE]" />}
          onClick={onViewCertificates}
        >
          View My Certificates
        </AppleButton>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by championship, team name, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] shadow-xs"
        />
      </div>

      {/* Results List */}
      <div className="space-y-5">
        {filteredResults.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/10">
            <Trophy className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-[#1D1D1F] dark:text-white">No Results Found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No championship results currently match your search criteria.
            </p>
          </div>
        ) : (
          filteredResults.map((res) => {
            // Check if current student is in the winners (safely check studentUser)
            const studentWon = studentUser
              ? res.positions.some(
                  (p) => p.regNo === studentUser.regNo || p.winnerName.toLowerCase().includes(studentUser.name.toLowerCase().split(' ')[0])
                )
              : false;

            return (
              <AppleCard key={res.id} padding="lg" className="border border-black/[0.06] dark:border-white/10 space-y-5">
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] dark:border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#93C5FD]">
                        {res.category}
                      </span>
                      <span className="text-xs text-[#86868B] dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(res.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {studentWon && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/15 text-[#28A745] dark:text-[#34C759] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> You Placed on Podium!
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                      {res.eventTitle}
                    </h3>
                  </div>

                  {res.certificateEligible && (
                    <AppleButton
                      variant="ghost"
                      size="sm"
                      className="self-start sm:self-auto text-xs"
                      onClick={onViewCertificates}
                    >
                      Claim Digital Certificate →
                    </AppleButton>
                  )}
                </div>

                {/* Podium Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {res.positions.map((pos) => {
                    const isCurrentStudentWinner = studentUser
                      ? (pos.regNo === studentUser.regNo || pos.winnerName.toLowerCase().includes(studentUser.name.toLowerCase().split(' ')[0]))
                      : false;

                    const medalColors = {
                      1: 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-300/40',
                      2: 'bg-slate-300/30 text-slate-700 dark:text-slate-200 border-slate-300/50',
                      3: 'bg-orange-300/20 text-orange-700 dark:text-orange-300 border-orange-300/40',
                    }[pos.rank] || 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';

                    return (
                      <div
                        key={pos.rank}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrentStudentWinner
                            ? 'bg-[#34C759]/5 border-[#34C759]/30 ring-1 ring-[#34C759]/30'
                            : 'bg-black/[0.015] dark:bg-white/[0.03] border-black/[0.05] dark:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${medalColors} flex items-center gap-1`}>
                            <Trophy className="w-3 h-3" />
                            {pos.title}
                          </span>
                          {pos.prize && (
                            <span className="text-[10px] font-semibold text-[#86868B] dark:text-slate-400">{pos.prize}</span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                          {pos.winnerName}
                        </h4>
                        <p className="text-xs text-[#515154] dark:text-slate-300 mt-0.5">
                          {pos.department}
                        </p>
                        <p className="text-[10px] font-mono text-[#86868B] dark:text-slate-400 mt-1">
                          Reg: {pos.regNo}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Judges' Remarks */}
                {res.judgesRemarks && (
                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/10 text-xs text-[#515154] dark:text-slate-300 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#1D1D1F] dark:text-white block mb-0.5">Adjudicators' Official Citation</span>
                      <p className="italic leading-relaxed text-[#515154] dark:text-slate-300">"{res.judgesRemarks}"</p>
                    </div>
                  </div>
                )}
              </AppleCard>
            );
          })
        )}
      </div>
    </div>
  );
};
