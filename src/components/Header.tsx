import { Phone, MessageCircle, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import logoUrl from '../assets/images/almekawy_logo_1780823019540.png';

export default function Header() {
  return (
    <header className="bg-[#0F172A] text-white py-6 border-b-4 border-[#FACC15] shadow-lg print:bg-white print:text-[#0F172A] print:border-b-2 print:border-slate-800 print:shadow-none">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 text-right"
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
            <p className="text-[#94A3B8] text-xs mt-1.5 font-bold tracking-widest uppercase print:text-slate-500">UPVC WINDOWS & DOORS SOLUTIONS</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row flex-wrap items-center sm:items-stretch gap-6 print:gap-4 text-right"
        >
          <div className="border-r-2 border-[#334155] pr-4 print:border-slate-300 text-right flex flex-col justify-center">
            <p className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-wider print:text-slate-400">اتصل بنا</p>
            <div className="flex flex-col sm:flex-row gap-x-3 gap-y-1">
              <a href="tel:+201141761261" className="text-base sm:text-lg font-bold font-mono tracking-tight hover:text-[#FACC15] transition-colors print:text-[#0F172A] flex items-center gap-1">
                <Phone size={13} className="text-[#64748B] print:hidden" />
                +20 114 176 1261
              </a>
              <span className="text-[#334155] hidden sm:inline print:hidden">|</span>
              <a href="tel:+201060524985" className="text-base sm:text-lg font-bold font-mono tracking-tight hover:text-[#FACC15] transition-colors print:text-[#0F172A] flex items-center gap-1">
                <Phone size={13} className="text-[#64748B] print:hidden" />
                +20 106 052 4985
              </a>
            </div>
          </div>
          <div className="border-r-2 border-[#334155] pr-4 print:border-slate-300 text-right flex flex-col justify-center">
            <p className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-wider print:text-slate-400">واتساب</p>
            <a 
              href="https://wa.me/201141761261" 
              target="_blank" 
              rel="noreferrer" 
              className="text-lg font-bold font-mono tracking-tight text-green-400 hover:text-green-300 transition-colors flex items-center gap-1.5 justify-end print:text-green-700"
            >
              +20 114 176 1261
              <MessageCircle size={16} className="inline print:hidden" />
            </a>
          </div>
          <div className="border-r-2 border-[#334155] pr-4 print:hidden flex items-center">
            <a 
              href="https://www.facebook.com/share/1Bfwi9XFow/" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#1877F2] hover:bg-[#155fc0] text-white px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Globe size={13} />
              صفحة فيسبوك
            </a>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
