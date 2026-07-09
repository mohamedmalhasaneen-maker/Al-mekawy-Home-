import { useState } from 'react';
import { Phone, MessageCircle, Facebook, Instagram, Settings, Sun, Moon, FileText, Save, Check } from 'lucide-react';
import { motion } from 'motion/react';
import logoUrl from '../assets/images/almekawy_logo_1780823019540.png';

const TikTokIcon = ({ className = '', size = 14 }: { className?: string, size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.14.99 1.13 2.37 1.83 3.84 2.01v3.98c-1.42-.02-2.83-.37-4.11-1.02-.78-.4-1.48-.95-2.05-1.63V15.5c-.01 2.22-.9 4.34-2.48 5.86-1.58 1.52-3.76 2.32-5.98 2.21-2.41-.12-4.66-1.4-5.88-3.5-1.22-2.09-1.29-4.71-.16-6.86 1.12-2.14 3.32-3.53 5.75-3.64v3.95c-1.12.06-2.17.69-2.73 1.67-.56.97-.56 2.18-.01 3.16.55.98 1.58 1.63 2.7 1.7 1.16.07 2.29-.41 2.97-1.35.53-.73.74-1.64.74-2.54V.02h.64z" />
  </svg>
);

interface HeaderProps {
  onOpenDevSettings: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  savedQuotesCount: number;
  onOpenSavedQuotes: () => void;
  onSaveQuoteAuto: () => void;
}

export default function Header({ 
  onOpenDevSettings, 
  theme, 
  onToggleTheme, 
  savedQuotesCount, 
  onOpenSavedQuotes,
  onSaveQuoteAuto
}: HeaderProps) {
  const [justSaved, setJustSaved] = useState(false);

  const handleAutoSave = () => {
    onSaveQuoteAuto();
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 2000);
  };

  return (
    <header className="bg-[#0F172A] text-white py-6 border-b-4 border-[#FACC15] shadow-lg print:hidden">
      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-6 text-right">
        {/* Brand Area and dense links line */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 text-right w-full lg:w-auto"
          >
            <img 
              src={logoUrl} 
              alt="Al-mekawy Home Logo" 
              className="w-16 h-16 rounded-2xl border-2 border-[#FACC15] object-cover shadow-md print:border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="text-right">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none font-display text-white print:text-[#0F172A] flex items-center gap-2">
                Al-mekawy Home
                <span className="text-xs font-black bg-[#FACC15] text-[#0F172A] px-2 py-0.5 rounded-md">المكاوي هوم</span>
              </h1>
              <p className="text-[#94A3B8] text-[10px] sm:text-xs mt-1.5 font-bold tracking-widest uppercase print:text-slate-500">UPVC WINDOWS & DOORS SOLUTIONS</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto text-right justify-start lg:justify-end"
          >
            {/* Save current Quote button */}
            <button
              type="button"
              onClick={handleAutoSave}
              disabled={justSaved}
              className={`${
                justSaved 
                  ? 'bg-teal-600 hover:bg-teal-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-emerald-950/20 group/btn`}
              title="حفظ عرض السعر الحالي تلقائياً"
            >
              {justSaved ? (
                <>
                  <Check size={14} className="text-white animate-bounce" />
                  <span>تم حفظ العرض بنجاح! ✓</span>
                </>
              ) : (
                <>
                  <Save size={14} className="text-white" />
                  <span>حفظ عرض السعر</span>
                </>
              )}
            </button>

            {/* Saved Quotes dropdown trigger */}
            <button
              type="button"
              onClick={onOpenSavedQuotes}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-indigo-950/20 group/btn"
              title="عرض وإدارة عروض الأسعار المحفوظة في المكاوي هوم"
            >
              <FileText size={14} className="text-white" />
              <span>عروض الأسعار {savedQuotesCount > 0 ? `(${savedQuotesCount})` : ''}</span>
            </button>

            {/* Developer Settings Trigger Button */}
            <button
              type="button"
              onClick={onOpenDevSettings}
              className="bg-[#FACC15] hover:bg-[#E2B90F] text-[#0F172A] font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-amber-955/20 group/btn"
              title="تعديل جدول الأسعار الأساسية للمصنع"
            >
              <Settings size={14} className="text-[#0F172A] group-hover/btn:rotate-90 transition-transform duration-300" />
              <span>إعدادات المطور</span>
            </button>

            {/* Phones */}
            <div className="flex gap-2">
              <a 
                href="tel:+201141761261" 
                className="bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs px-3 py-2 rounded-xl border border-slate-700/50 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
              >
                <Phone size={12} className="text-[#FACC15]" />
                <span>01141761261</span>
              </a>
              <a 
                href="tel:+201060524985" 
                className="bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs px-3 py-2 rounded-xl border border-slate-700/50 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
              >
                <Phone size={12} className="text-[#FACC15]" />
                <span>01060524985</span>
              </a>
            </div>

            {/* Green WhatsApp Button */}
            <a 
              href="https://wa.me/201141761261" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-green-950/10"
            >
              <MessageCircle size={14} className="text-white" />
              <span>واتساب</span>
            </a>

            {/* Social channels */}
            <div className="flex gap-2">
              <a 
                href="https://www.facebook.com/share/1Bfwi9XFow/" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-[#1877F2] hover:bg-[#155fc0] text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Facebook size={13} />
                <span className="hidden sm:inline">فيسبوك</span>
              </a>
              <a 
                href="https://www.instagram.com/almekawy.home?igsh=bXBqZmw3NGt4bzVs" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-95 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Instagram size={13} />
                <span className="hidden sm:inline">إنستغرام</span>
              </a>
              <a 
                href="https://www.tiktok.com/@almekawy.home?_r=1&_t=ZS-971BmNPuWbk" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-black hover:bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <TikTokIcon size={13} />
                <span className="hidden sm:inline">تيك توك</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
