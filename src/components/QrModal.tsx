import { motion } from 'motion/react';
import { X, MessageCircle, Facebook, ExternalLink, QrCode, Instagram } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TikTokIcon = ({ className = '', size = 16 }: { className?: string, size?: number }) => (
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

export default function QrModal({ isOpen, onClose }: QrModalProps) {
  if (!isOpen) return null;

  // Real, scannable QR Codes pointing to El-Mekawy Home details
  const whatsappQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://wa.me/201141761261')}`;
  const facebookQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://www.facebook.com/share/1Bfwi9XFow/')}`;
  const instagramQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://www.instagram.com/almekawy.home?igsh=bXBqZmw3NGt4bzVs')}`;
  const tiktokQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://www.tiktok.com/@almekawy.home?_r=1&_t=ZS-971BmNPuWbk')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-150 z-10 flex flex-col text-right scrollbar-thin"
        dir="rtl"
      >
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500" />

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-[#0F172A] text-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <QrCode size={22} className="text-[#FACC15]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-display text-white">روابط الاستجابة السريعة (QR Grid)</h3>
              <p className="text-xs text-slate-300">امسح الكود بكاميرا هاتفك المحمول للتواصل الفوري</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center md:text-right max-w-lg mx-auto md:mx-0">
            <h4 className="text-slate-800 font-extrabold text-base mb-1">المكاوي هوم للـ UPVC والألوميتال</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              قم بمسح أي من الرموز التالية باستخدام تطبيق الكاميرا الخاص بهاتفك للاتصال المباشر بفريق الدعم أو تصفح معرض أعمالنا على منصات التواصل الاجتماعي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp QR */}
            <div className="flex flex-col items-center p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:shadow-md transition-all">
              <div className="flex items-center gap-1.5 text-emerald-800 font-black text-sm mb-3">
                <MessageCircle size={16} />
                <span>المحادثة المباشرة (واتساب)</span>
              </div>
              
              <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-center">
                <img 
                  src={whatsappQrUrl} 
                  alt="WhatsApp QR Code" 
                  className="w-36 h-36 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-slate-400 font-mono text-[10px] mt-2 mb-3">01141761261</span>
              
              <a 
                href="https://wa.me/201141761261"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer animate-none"
              >
                <span>افتح المحادثة مباشرة</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Facebook QR */}
            <div className="flex flex-col items-center p-5 bg-blue-50/50 rounded-2xl border border-blue-100 hover:shadow-md transition-all">
              <div className="flex items-center gap-1.5 text-[#1877F2] font-black text-sm mb-3">
                <Facebook size={16} />
                <span>صفحتنا على فيسبوك</span>
              </div>
              
              <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-center">
                <img 
                  src={facebookQrUrl} 
                  alt="Facebook Page QR Code" 
                  className="w-36 h-36 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-slate-400 font-mono text-[10px] mt-2 mb-3">AL-MAKKAWI HOME</span>
              
              <a 
                href="https://www.facebook.com/share/1Bfwi9XFow/"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2 bg-[#1877F2] hover:bg-[#155fc0] text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>انتقل لموقع فيسبوك</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Instagram QR */}
            <div className="flex flex-col items-center p-5 bg-pink-50/50 rounded-2xl border border-pink-100 hover:shadow-md transition-all">
              <div className="flex items-center gap-1.5 text-[#E1306C] font-black text-sm mb-3">
                <Instagram size={16} />
                <span>حسابنا على إنستغرام</span>
              </div>
              
              <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-sm flex items-center justify-center">
                <img 
                  src={instagramQrUrl} 
                  alt="Instagram QR Code" 
                  className="w-36 h-36 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-slate-400 font-mono text-[10px] mt-2 mb-3">almekawy.home</span>
              
              <a 
                href="https://www.instagram.com/almekawy.home?igsh=bXBqZmw3NGt4bzVs"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-95 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>تصفح على إنستغرام</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* TikTok QR */}
            <div className="flex flex-col items-center p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-1.5 text-black font-black text-sm mb-3">
                <TikTokIcon size={14} className="text-black" />
                <span>صفحتنا على تيك توك</span>
              </div>
              
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                <img 
                  src={tiktokQrUrl} 
                  alt="TikTok QR Code" 
                  className="w-36 h-36 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-slate-400 font-mono text-[10px] mt-2 mb-3">@almekawy.home</span>
              
              <a 
                href="https://www.tiktok.com/@almekawy.home?_r=1&_t=ZS-971BmNPuWbk"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2 bg-[#000000] hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>تابعنا على تيك توك</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-extrabold text-slate-400">© {new Date().getFullYear()} AL-MAKKAWI HOME</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-200 hover:bg-[#0F172A] hover:text-white text-[#0F172A] text-xs font-black rounded-xl transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </motion.div>
    </div>
  );
}
