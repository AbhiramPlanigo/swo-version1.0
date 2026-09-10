import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Quote as QuoteIcon, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Calendar 
} from 'lucide-react';

export const QuoteOfTheDaySection: React.FC = () => {
  const { dailyQuote, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `"${dailyQuote.quote}" — ${dailyQuote.author} (${dailyQuote.authorTitle})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('Quote Copied', 'Daily quote copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Copied', textToCopy, 'info');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Christ University SWO • Quote of the Day',
      text: `"${dailyQuote.quote}" — ${dailyQuote.author}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <section className="relative w-full">
      {/* Apple-styled Glassmorphic Editorial Quote Card (Pure Read-Only Public Display) */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-white/95 via-slate-50/80 to-[#F1F5F9]/60 dark:from-[#141A26]/95 dark:via-[#101520]/90 dark:to-[#0B0F17]/95 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 lg:p-12 transition-all">
        
        {/* Ambient Subtle Luminous Gradients */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[110px] bg-[#C5A063]/15 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[110px] bg-[#002147]/10 dark:bg-[#0071E3]/15 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:gap-8">
          
          {/* Header Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#C5A063]/15 dark:bg-[#C5A063]/25 text-[#9E7D42] dark:text-[#E8C581] border border-[#C5A063]/30">
                <Sparkles className="w-3 h-3 text-[#C5A063]" />
                Quote of the Day
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-black/[0.04] dark:bg-white/10 text-slate-600 dark:text-slate-300">
                <Calendar className="w-3 h-3 text-slate-400" />
                {dailyQuote.date}
              </span>
              {dailyQuote.category && (
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  • {dailyQuote.category}
                </span>
              )}
            </div>

            {/* Public Quick Actions: Copy & Share only (No editing on public side) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy quote to clipboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.07] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-semibold active:scale-95 transition-all shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                title="Share this quote"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.07] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 active:scale-90 transition-all shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Main Editorial Quote Voice */}
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="hidden sm:flex shrink-0 p-3 rounded-2xl bg-[#C5A063]/10 dark:bg-[#C5A063]/20 text-[#C5A063] border border-[#C5A063]/20">
              <QuoteIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-4 flex-1">
              <blockquote className="font-serif italic text-lg sm:text-2xl lg:text-3xl text-[#0F172A] dark:text-white leading-relaxed font-normal tracking-tight">
                "{dailyQuote.quote}"
              </blockquote>

              {/* Author Lockup with Gold Anchor */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#C5A063] to-[#D4AF37]" />
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-[#93C5FD] tracking-tight">
                    {dailyQuote.author}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {dailyQuote.authorTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
