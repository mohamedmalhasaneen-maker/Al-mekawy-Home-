import React from 'react';
import { motion } from 'motion/react';
import { Layers, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';
import { PROFILES, ADDONS } from '../constants';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(value) + ' ج.م';
};

export default function PricingTable() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 mb-12 shadow-sm relative overflow-hidden print:hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0F172A]/5 rounded-full blur-3xl" />

      <div className="relative text-right mb-8">
        <span className="bg-[#FACC15] text-[#0F172A] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          قائمة الأسعار المعتمدة
        </span>
        <h2 className="text-2xl font-display font-black text-[#0F172A] mt-3 mb-1">
          أسعار القطاعات والإضافات بالتفصيل
        </h2>
        <p className="text-slate-500 text-sm">
          جميع الأسعار شفافة ومحدثة باستمرار لمساعدتك في تخطيط وحساب التكلفة بدقة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Profiles Section */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 md:p-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5 mb-4">
            <h3 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <Layers size={20} className="text-[#FACC15]" />
              <span>أسعار قطاعات الـ UPVC</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">سعر المتر المربع</span>
          </div>
          
          <div className="space-y-3">
            {Object.values(PROFILES).map((profile) => (
              <div 
                key={profile.id}
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-150 transition-all hover:shadow-md hover:border-[#FACC15]/30"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A]">{profile.name}</h4>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-[#0F172A] font-mono leading-none">
                    {formatCurrency(profile.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 bg-[#0F172A]/5 p-3 rounded-xl border border-[#0F172A]/10">
            <ShieldCheck size={16} className="text-[#0F172A] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-normal font-bold">
              جميع قطاعات الـ UPVC لدينا تتميز بمقاومتها الشديدة للعوامل الجوية والحرارة وعزل تام للصوت والتربة.
            </p>
          </div>
        </div>

        {/* Addons / Options Section */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 md:p-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5 mb-4">
            <h3 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <Sliders size={20} className="text-[#FACC15]" />
              <span>الإضافات والأنظمة الخاصة</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">تكلفة إضافية</span>
          </div>

          <div className="space-y-3">
            {Object.values(ADDONS).map((addon) => (
              <div 
                key={addon.id}
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-150 transition-all hover:shadow-md hover:border-[#FACC15]/30"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FACC15] shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A]">{addon.name}</h4>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-sm font-black text-[#0F172A] font-mono leading-none">
                    {addon.id === 'panda' ? (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 font-bold block">
                        سعر المتر × 1.5
                      </span>
                    ) : (
                      `${formatCurrency(addon.price)} / م²`
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 bg-yellow-50/70 p-3 rounded-xl border border-yellow-100">
            <span className="text-amber-600 font-black text-xs shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-slate-500 leading-normal font-bold">
              يتم دمج واحتساب قيمة الإضافات المختارة ضمن تكلفة البند تلقائياً في حاسبة الأسعار بالأسفل.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
