import React from 'react';
import { Phone, MessageCircle, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'phone' | 'whatsapp' | 'all';
}

export const ContactSelectModal: React.FC<ContactSelectModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  if (!isOpen) return null;

  const contacts = [
    {
      label: 'الفرع الرئيسي والمبيعات',
      phoneDisplay: '01141761261',
      telLink: 'tel:+201141761261',
      waLink: 'https://wa.me/201141761261',
      badge: 'الرقم الأول'
    },
    {
      label: 'المبيعات والدعم الفني',
      phoneDisplay: '01060524985',
      telLink: 'tel:+201060524985',
      waLink: 'https://wa.me/201060524985',
      badge: 'الرقم الثاني'
    }
  ];

  const isWhatsApp = type === 'whatsapp';
  const isPhone = type === 'phone';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-[#0F172A] border-2 border-[#FACC15] text-white rounded-3xl shadow-2xl p-5 z-10 overflow-hidden text-right"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-2xl ${isWhatsApp ? 'bg-[#25D366] text-white' : 'bg-[#FACC15] text-[#0F172A]'}`}>
                {isWhatsApp ? <MessageCircle size={20} /> : <Phone size={20} />}
              </div>
              <div>
                <h3 className="font-black text-sm text-white">
                  {isWhatsApp ? 'اختر رقم الواتساب' : isPhone ? 'اختر رقم الاتصال' : 'اختر رقم التواصل'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  {isWhatsApp ? 'انقر على الرقم الذي تود مراسلته عبر واتساب' : 'انقر على الرقم الذي تود الاتصال به مباشرة'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contact Numbers Options */}
          <div className="py-4 space-y-3">
            {contacts.map((contact, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-3.5 rounded-2xl space-y-2.5 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white block">{contact.label}</span>
                    <span className="font-mono text-sm font-black text-[#FACC15] inline-block mt-0.5" dir="ltr">
                      {contact.phoneDisplay}
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    {contact.badge}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {(isPhone || type === 'all') && (
                    <a
                      href={contact.telLink}
                      onClick={onClose}
                      className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-[#FACC15] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-600 transition active:scale-95 cursor-pointer"
                    >
                      <Phone size={14} />
                      <span>اتصال {contact.phoneDisplay}</span>
                    </a>
                  )}

                  {(isWhatsApp || type === 'all') && (
                    <a
                      href={contact.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      <MessageCircle size={14} />
                      <span>واتساب {contact.phoneDisplay}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-extrabold flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>المكاوي هوم • خدمة العملاء والمبيعات متواجدة لخدمتكم</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
