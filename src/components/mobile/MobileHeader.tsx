import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Phone, 
  Globe, 
  Images, 
  Settings, 
  QrCode, 
  Sun, 
  Moon, 
  Save, 
  Check, 
  MessageCircle, 
  FileText, 
  Users, 
  ShieldCheck, 
  ChevronLeft,
  Facebook,
  Instagram 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoUrl from '../../assets/images/almekawy_logo_1780823019540.png';

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

interface MobileHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  savedQuotesCount: number;
  customersCount: number;
  onOpenSavedQuotes: () => void;
  onOpenCustomers: () => void;
  onOpenDevSettings: () => void;
  onOpenQr: () => void;
  onSaveQuoteAuto: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  theme,
  onToggleTheme,
  savedQuotesCount,
  customersCount,
  onOpenSavedQuotes,
  onOpenCustomers,
  onOpenDevSettings,
  onOpenQr,
  onSaveQuoteAuto
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleAutoSave = () => {
    onSaveQuoteAuto();
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 2200);
  };

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b-2 border-[#FACC15] shadow-md px-3 py-2.5 print:hidden">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={logoUrl} 
              alt="Al-mekawy Home Logo" 
              className="w-10 h-10 rounded-xl border border-[#FACC15] object-cover shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm text-white font-display tracking-tight truncate">
                  Al-mekawy Home
                </span>
                <span className="text-[10px] font-black bg-[#FACC15] text-[#0F172A] px-1.5 py-0.2 rounded shrink-0">
                  المكاوي
                </span>
              </div>
              <p className="text-[#94A3B8] text-[9px] font-bold tracking-widest uppercase truncate">
                UPVC WINDOWS & DOORS
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Auto Save Button */}
            <button
              type="button"
              onClick={handleAutoSave}
              disabled={justSaved}
              className={`p-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                justSaved 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
              title="حفظ تلقائي"
            >
              {justSaved ? (
                <Check size={16} className="animate-bounce" />
              ) : (
                <Save size={16} />
              )}
            </button>

            {/* Quick WhatsApp Link Button */}
            <a
              href="https://wa.me/201141761261"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl transition active:scale-95 shadow-sm flex items-center justify-center"
              title="تواصل عبر واتساب"
            >
              <MessageCircle size={16} />
            </a>

            {/* Direct Phone Call Button */}
            <a
              href="tel:+201141761261"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-[#FACC15] rounded-xl border border-slate-700 transition active:scale-95"
              title="اتصال بالمبيعات"
            >
              <Phone size={16} />
            </a>

            {/* Drawer Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 bg-[#FACC15] text-[#0F172A] rounded-xl font-black transition active:scale-95 shadow-sm"
              title="القائمة"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Over Drawer Menu */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end print:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-xs bg-[#0F172A] text-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto"
              dir="rtl"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-10 h-10 rounded-xl border border-[#FACC15] object-cover"
                  />
                  <div>
                    <h3 className="font-black text-sm text-white">Al-mekawy Home</h3>
                    <p className="text-[10px] text-[#FACC15] font-bold">المكاوي هوم للـ UPVC</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body Items */}
              <div className="p-4 space-y-3 flex-1">
                {/* Theme Toggle */}
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300">مظهر التطبيق:</span>
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun size={14} className="text-[#FACC15]" />
                        <span>مظهر فاتح</span>
                      </>
                    ) : (
                      <>
                        <Moon size={14} className="text-indigo-300" />
                        <span>مظهر داكن</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick App Actions */}
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    قوائم النظام والحسابات
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenSavedQuotes();
                    }}
                    className="w-full p-3 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-200 rounded-2xl font-black text-xs flex items-center justify-between transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-indigo-400" />
                      <span>عروض الأسعار المحفوظة</span>
                    </div>
                    <span className="bg-indigo-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg">
                      {savedQuotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenCustomers();
                    }}
                    className="w-full p-3 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-200 rounded-2xl font-black text-xs flex items-center justify-between transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users size={16} className="text-emerald-400" />
                      <span>دليل العملاء المسجلين</span>
                    </div>
                    <span className="bg-emerald-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg">
                      {customersCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenDevSettings();
                    }}
                    className="w-full p-3 bg-[#FACC15]/15 border border-[#FACC15]/30 hover:bg-[#FACC15]/25 text-amber-200 rounded-2xl font-black text-xs flex items-center justify-between transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings size={16} className="text-[#FACC15]" />
                      <span>إعدادات المطور والمشرف</span>
                    </div>
                    <ChevronLeft size={14} className="text-slate-400" />
                  </button>
                </div>

                {/* External Links */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    روابط سريعة ومعارض الأعمال
                  </p>

                  <a
                    href="https://almekawy-home-official.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-between border border-slate-700/60 transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe size={16} className="text-amber-400" />
                      <span>الموقع الرسمي لشركة Al-mekawy Home</span>
                    </div>
                    <ChevronLeft size={14} className="text-slate-500" />
                  </a>

                  <a
                    href="https://al-mekawy-home-upvc-photo.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-between border border-slate-700/60 transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <Images size={16} className="text-indigo-400" />
                      <span>معرض الصور وأعمالنا الرسمية</span>
                    </div>
                    <ChevronLeft size={14} className="text-slate-500" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenQr();
                    }}
                    className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-between border border-slate-700/60 transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode size={16} className="text-teal-400" />
                      <span>رمز الاستجابة السريعة (QR Code)</span>
                    </div>
                    <ChevronLeft size={14} className="text-slate-500" />
                  </button>
                </div>

                {/* Social Media & Communication Channels */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    صفحاتنا ووسائل التواصل الاجتماعي
                  </p>
                  
                  {/* Green WhatsApp Button */}
                  <a
                    href="https://wa.me/201141761261"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-black text-xs flex items-center justify-between shadow-md transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle size={18} className="text-white" />
                      <span>واتساب المبيعات المباشر</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg font-mono">01141761261</span>
                  </a>

                  {/* Facebook, Instagram, TikTok Channels Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <a
                      href="https://www.facebook.com/share/1Bfwi9XFow/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-[#1877F2] hover:bg-[#155fc0] text-white rounded-xl text-center font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 shadow-sm"
                    >
                      <Facebook size={18} />
                      <span className="text-[10px]">فيسبوك</span>
                    </a>

                    <a
                      href="https://www.instagram.com/almekawy.home?igsh=bXBqZmw3NGt4bzVs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] text-white rounded-xl text-center font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 shadow-sm"
                    >
                      <Instagram size={18} />
                      <span className="text-[10px]">إنستغرام</span>
                    </a>

                    <a
                      href="https://www.tiktok.com/@almekawy.home?_r=1&_t=ZS-971BmNPuWbk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-black hover:bg-slate-900 border border-slate-700 text-white rounded-xl text-center font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 shadow-sm"
                    >
                      <TikTokIcon size={18} />
                      <span className="text-[10px]">تيك توك</span>
                    </a>
                  </div>
                </div>

                {/* Sales Phones */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    أرقام المبيعات والدعم الفني
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="tel:+201141761261"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-center font-mono font-bold text-xs text-[#FACC15] border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Phone size={13} />
                      <span>01141761261</span>
                    </a>
                    <a
                      href="tel:+201060524985"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-center font-mono font-bold text-xs text-[#FACC15] border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Phone size={13} />
                      <span>01060524985</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-center">
                <p className="text-[10px] font-extrabold text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>المكاوي هوم • خامات معتمدة وتركيب احترافي</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
