import React from 'react';
import { User, Phone, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { CustomerInfo } from '../types';
import { motion } from 'motion/react';

interface Props {
  customer: CustomerInfo;
  onChange: (field: keyof CustomerInfo, value: any) => void;
}

export default function CustomerForm({ customer, onChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:border-[#FACC15] border-r-8 border-r-[#FACC15] p-6 sm:p-8 mb-10 print:hidden transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-display font-black text-[#0F172A] flex items-center gap-3">
            <User className="text-[#0F172A]" size={26} />
            بيانات العميل والمشروع
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            أدخل بيانات العميل ليتم توليد وتصميم عرض سعر رسمي مفصل باسمه ومقاسات مشروعه الخاصة تلقائياً.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 py-1 px-3 bg-green-50 text-green-700 rounded-full text-xs font-black">
          <CheckCircle2 size={14} />
          جاهز للطباعة بالتفاصيل
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-slate-400" />
            اسم العميل المحترم *
          </label>
          <input
            type="text"
            required
            value={customer.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="مثال: م. أحمد عبد العزيز"
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all font-bold placeholder:text-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={13} className="text-slate-400" />
            رقم الهاتف للتواصل
          </label>
          <input
            type="text"
            value={customer.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="مثال: 01xxxxxxxxx"
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all font-mono font-bold placeholder:text-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-400" />
            عنوان المعاينة / المشروع
          </label>
          <input
            type="text"
            value={customer.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="مثال: التجمع الخامس، فيلا 12"
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all font-bold placeholder:text-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            تاريخ عرض السعر
          </label>
          <input
            type="date"
            value={customer.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all font-bold cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
}
