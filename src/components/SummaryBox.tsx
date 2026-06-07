import { Printer } from 'lucide-react';
import { CalculationResult } from '../types';
import { motion } from 'motion/react';

interface Props {
  calculations: CalculationResult;
  formatCurrency: (value: number) => string;
  handlePrint: () => void;
}

export default function SummaryBox({ calculations, formatCurrency, handlePrint }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-12 bg-[#F1F5F9] border-2 border-slate-200 rounded-3xl p-8 md:p-10 relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:rounded-none lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-8"
    >
      <div className="max-w-xl text-right flex-1 mb-8 lg:mb-0">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 font-display">عرض الاسعار الاجمالي</h3>
        <h2 className="text-3xl font-display font-black text-[#0F172A] mb-4">الملخص النهائي لعرض السعر</h2>
        <p className="text-slate-600 leading-relaxed text-base print:text-gray-600">هذا العرض مبدئي ويتم تأكيده بعد المعاينة ورفع المقاسات الفعّلية بواسطة مهندسينا لضمان جودة وأعلى دقة في التصنيع والتركيب.</p>
      </div>
      
      <div className="w-full lg:w-[350px] flex-none flex flex-col gap-6">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 font-display">ملخص التكلفة</h3>
          <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#0F172A]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <span className="text-slate-500 font-bold">إجمالي الأمتار</span>
              <span className="text-xl font-black text-[#0F172A] font-mono" dir="ltr">{calculations.totalArea.toFixed(2)} م²</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 mb-1">صافي المبلغ المطلوب</p>
              <p className="text-4xl font-black text-[#0F172A] tracking-tighter sm:text-5xl">
                {formatCurrency(calculations.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full bg-[#FACC15] text-[#0F172A] hover:bg-yellow-400 py-4.5 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] transition active:scale-95 flex items-center justify-center gap-3 print:hidden"
        >
          <Printer size={22} />
          طباعة أو حفظ كـ PDF
        </button>
      </div>
    </motion.div>
  );
}
