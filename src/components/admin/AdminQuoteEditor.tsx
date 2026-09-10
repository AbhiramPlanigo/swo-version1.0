import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyQuote } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { 
  Quote as QuoteIcon, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Check, 
  Calendar, 
  User, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  Eye
} from 'lucide-react';

const ADMIN_QUOTE_PRESETS: Omit<DailyQuote, 'id' | 'updatedAt'>[] = [
  {
    quote: 'Knowledge illuminates the intellect, but selfless service sanctifies the heart. Walk with courage, lead with empathy, and elevate every space you enter.',
    author: 'St. Kuriakose Elias Chavara',
    authorTitle: 'Founder Patron of Christ Institutions & Visionary Educational Reformer',
    date: 'Tuesday, September 08, 2026',
    category: 'Wisdom & Leadership',
    postedBy: 'Directorate of Student Welfare'
  },
  {
    quote: 'Learning gives creativity, creativity leads to thinking, thinking provides knowledge, and knowledge makes you great.',
    author: 'Dr. A. P. J. Abdul Kalam',
    authorTitle: '11th President of India & Distinguished Aerospace Scientist',
    date: 'Wednesday, September 09, 2026',
    category: 'Student Excellence',
    postedBy: 'Academic Welfare Council'
  },
  {
    quote: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela',
    authorTitle: 'Nobel Peace Laureate & Champion of Human Rights',
    date: 'Thursday, September 10, 2026',
    category: 'Global Purpose',
    postedBy: 'Social Responsibility Cell'
  },
  {
    quote: 'You cannot cross the sea merely by standing and staring at the water. Step into the arena of action with unwavering resolve.',
    author: 'Rabindranath Tagore',
    authorTitle: 'Nobel Laureate in Literature & Philosopher of Education',
    date: 'Friday, September 11, 2026',
    category: 'Courage & Action',
    postedBy: 'Cultural & Literary Directorate'
  },
  {
    quote: 'Arise, awake, and stop not until the goal is reached. Strength is life, weakness is death.',
    author: 'Swami Vivekananda',
    authorTitle: 'Spiritual Visionary & Pioneer of Modern Youth Awakening',
    date: 'Saturday, September 12, 2026',
    category: 'Youth Empowerment',
    postedBy: 'Student Leadership Committee'
  },
  {
    quote: 'Try not to become a person of success, but rather try to become a person of value. Integrity is the foundation of genuine scholarship.',
    author: 'Albert Einstein',
    authorTitle: 'Theoretical Physicist & Nobel Laureate',
    date: 'Sunday, September 13, 2026',
    category: 'Character & Ethics',
    postedBy: 'Deanery of Sciences & Innovation'
  }
];

export const AdminQuoteEditor: React.FC = () => {
  const { dailyQuote, updateDailyQuote, showToast } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  // Form draft state
  const [quoteText, setQuoteText] = useState(dailyQuote.quote);
  const [author, setAuthor] = useState(dailyQuote.author);
  const [authorTitle, setAuthorTitle] = useState(dailyQuote.authorTitle);
  const [category, setCategory] = useState(dailyQuote.category || 'Wisdom & Leadership');
  const [date, setDate] = useState(dailyQuote.date);
  const [postedBy, setPostedBy] = useState(dailyQuote.postedBy || 'Directorate of Student Welfare');
  const [isSaved, setIsSaved] = useState(false);

  const handleApplyPreset = (p: typeof ADMIN_QUOTE_PRESETS[0]) => {
    setQuoteText(p.quote);
    setAuthor(p.author);
    setAuthorTitle(p.authorTitle);
    setCategory(p.category);
    setDate(p.date);
    setPostedBy(p.postedBy);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim() || !author.trim()) return;

    updateDailyQuote({
      quote: quoteText.trim(),
      author: author.trim(),
      authorTitle: authorTitle.trim(),
      category: category.trim(),
      date: date.trim(),
      postedBy: postedBy.trim(),
    });

    setIsSaved(true);
    showToast('Quote of the Day Updated', `Daily quote by ${author} published to the public portal.`, 'success');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetToCurrent = () => {
    setQuoteText(dailyQuote.quote);
    setAuthor(dailyQuote.author);
    setAuthorTitle(dailyQuote.authorTitle);
    setCategory(dailyQuote.category);
    setDate(dailyQuote.date);
    setPostedBy(dailyQuote.postedBy);
  };

  return (
    <AppleCard padding="none" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] overflow-hidden">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#C5A063]/15 text-[#C5A063] flex items-center justify-center shrink-0 border border-[#C5A063]/20">
            <QuoteIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#C5A063]/15 text-[#9E7D42] dark:text-[#E8C581] border border-[#C5A063]/30">
                Public Portal Feature
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                {dailyQuote.date}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-white truncate mt-0.5">
              Daily Inspiration & Quote of the Day Manager
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
              Currently Live: "{dailyQuote.quote.slice(0, 65)}..." — {dailyQuote.author}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#0071E3] dark:text-blue-400 hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Manage Quote'}
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Editor Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 border-t border-black/[0.06] dark:border-white/10 bg-slate-50/50 dark:bg-black/20 space-y-6 animate-in fade-in duration-200">
          
          {/* Live Preview Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A2232] border border-black/[0.06] dark:border-white/10 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-black/[0.04] dark:border-white/5">
              <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-[#C5A063]">
                <Eye className="w-3.5 h-3.5" /> Public Viewport Live Preview
              </span>
              <span>{category} • {date}</span>
            </div>
            <blockquote className="font-serif italic text-sm sm:text-base text-[#1D1D1F] dark:text-slate-100 leading-relaxed">
              "{quoteText || 'Enter a quote below...'}"
            </blockquote>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="font-bold text-[#002147] dark:text-[#93C5FD]">{author || 'Author Name'}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400">{authorTitle || 'Designation'}</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick University & Historical Presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {ADMIN_QUOTE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 hover:bg-[#C5A063]/15 dark:hover:bg-[#C5A063]/25 hover:text-[#9E7D42] dark:hover:text-[#E8C581] border border-black/[0.06] dark:border-white/10 transition-colors shadow-2xs"
                >
                  {preset.author}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Quote Content *
              </label>
              <textarea
                rows={3}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Enter today's inspiring quote..."
                required
                className="w-full p-3.5 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 leading-relaxed font-serif"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Author Name *
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. St. Kuriakose Elias Chavara"
                  required
                  className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Author Title / Background
                </label>
                <input
                  type="text"
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  placeholder="e.g. Founder Patron & Visionary Educator"
                  className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Theme / Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Wisdom & Leadership"
                  className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Display Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Tuesday, September 08, 2026"
                  className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Publishing Authority
                </label>
                <input
                  type="text"
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value)}
                  placeholder="e.g. Directorate of Student Welfare"
                  className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToCurrent}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Live Quote</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Saved to Public Portal</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish Quote of the Day</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppleCard>
  );
};
