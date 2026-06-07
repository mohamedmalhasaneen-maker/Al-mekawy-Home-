import React from 'react';
import { CustomerInfo, CalculatedItem, CalculationResult } from '../types';
import { PROFILES, ADDONS } from '../constants';
import { Shield, Medal, Award, Globe, Phone, FileText, CheckCircle, ExternalLink, ThumbsUp, Instagram } from 'lucide-react';
import logoUrl from '../assets/images/almekawy_logo_1780823019540.png';

interface Props {
  customer: CustomerInfo;
  calculations: CalculationResult;
  formatCurrency: (value: number) => string;
}

export default function DetailedQuoteView({ customer, calculations, formatCurrency }: Props) {
  const quoteNumber = React.useMemo(() => {
    const today = new Date();
    const random = Math.floor(100 + Math.random() * 900);
    return `MH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-${random}`;
  }, []);

  return (
    <div className="mt-16 bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm hover:border-[#FACC15] transition-all duration-300 print:border-none print:shadow-none print:rounded-none">
      
      {/* Visual Indicator of Quotation Form */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-4 border-[#FACC15] print:hidden">
        <div>
          <span className="bg-[#FACC15] text-[#0F172A] px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider mb-2 inline-block">
            معاينة حية للمستند الرسمي
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white flex items-center gap-3">
            <FileText size={26} className="text-[#FACC15]" />
            عرض السعر التفصيلي للعميل
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            هذا هو الشكل النهائي لعرض السعر الذي سيتم طباعته أو حفظه كـ PDF ليُقدّم للعميل المحترم بصورة رسمية.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#FACC15] hover:bg-yellow-400 text-[#0F172A] px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition duration-200 active:scale-95 cursor-pointer shrink-0 self-start lg:self-center"
        >
          <FileText size={18} />
          طباعة عرض السعر التفصيلي للعميل
        </button>
      </div>

      {/* Actual Statement Sheet Area */}
      <div className="p-6 sm:p-10 bg-white text-slate-900 print:p-0" id="quotation-print-sheet">
        
        {/* Document Header (For print as well) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6 pb-8 border-b-4 border-slate-900">
          <div className="flex items-center gap-4 text-right">
            <img 
              src={logoUrl} 
              alt="Al-mekawy Home Logo" 
              className="w-20 h-20 rounded-2xl border-2 border-[#0F172A] object-cover shadow-sm print:border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] tracking-tighter">المكاوي هوم</h1>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-wider mt-1.5">
                Al-mekawy Home • أعمال وتوريدات الـ UPVC الفاخرة للشبابيك والأبواب
              </p>
            </div>
          </div>
          
          <div className="flex flex-col justify-end text-right md:text-left">
            
            <div className="mt-6 space-y-2 text-sm text-slate-600 font-bold">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">تاريخ العرض:</span>
                <span className="font-mono text-slate-900">{customer.date || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">رقم العرض:</span>
                <span className="font-mono text-slate-900">{quoteNumber}</span>
              </div>
            </div>
          </div>

          {/* Customer Metadata Card */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 md:min-w-[350px] space-y-3 text-right flex-none print:bg-slate-50 print:border-slate-300">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">بيانات العميل المحترم</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0 font-bold">اسم العميل:</span>
                <span className="font-black text-slate-900 text-base">{customer.name || "عميل مكاوي هوم الموقر"}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0 font-bold">رقم الهاتف:</span>
                <span className="font-bold text-slate-900 font-mono" dir="ltr">{customer.phone || "لم يحدد بشكل تفصيلي"}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0 font-bold">موقع التركيب:</span>
                <span className="font-bold text-slate-900">{customer.address || "بناءً على مقاسات العميل"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="my-6 text-right">
          <p className="text-slate-600 leading-relaxed text-sm">
            بناًء على طلبكم الكريم، يسعدنا في <strong className="text-slate-900 font-black">المكاوي هوم لأعمال الـ UPVC</strong> تقديم عرض الأسعار والمواصفات الفنية التالية للشبابيك والفتحات المطلوبة. جميع قطاعاتنا تركية/أوروبية تتميز بأعلى معايير الجودة ومقاومة العوامل الجوية المختلفة وعوازل تام للأتربة والصوت.
          </p>
        </div>

        {/* Detailed Sheet Table */}
        <div className="overflow-x-auto my-8 border-2 border-slate-900 rounded-2xl overflow-hidden print:border-slate-800">
          <table className="w-full border-collapse text-right text-sm">
            <thead>
              <tr className="bg-[#0F172A] text-white font-display border-b-2 border-slate-900 font-black text-xs uppercase tracking-wider print:bg-[#0F172A] print:text-white">
                <th className="py-4 px-3 text-center w-12 border-l border-slate-800">م</th>
                <th className="py-4 px-4 border-l border-slate-800">بيان البند والموقع التوضيحي</th>
                <th className="py-4 px-3 text-center border-l border-slate-800">المقاسات (سم)</th>
                <th className="py-4 px-3 text-center border-l border-slate-800">المساحة م²</th>
                <th className="py-4 px-4 border-l border-slate-800">تفاصيل القطاع والزجاج</th>
                <th className="py-4 px-4 border-l border-slate-800">الإضافات الاختيارية</th>
                <th className="py-4 px-4 text-left">إجمالي البند</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {calculations.itemsCalculated.map((item, idx) => {
                const threshold = 1.0;
                const isMinArea = (item.width * item.height) / 10000 < threshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                    {/* Item Serial */}
                    <td className="py-4 px-3 text-center font-mono font-bold text-slate-400 border-l border-slate-100">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    
                    {/* Title */}
                    <td className="py-4 px-4 border-l border-slate-100">
                      <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                        {item.title}
                        <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded print:bg-slate-200">
                          {item.itemType === 'door' ? 'باب' : 'شباك'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">نظام الفتح: {item.opening}</div>
                    </td>

                    {/* Width x Height */}
                    <td className="py-4 px-3 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100" dir="ltr">
                      {item.width} × {item.height}
                    </td>

                    {/* Area Calculations */}
                    <td className="py-4 px-3 text-center border-l border-slate-100">
                      <div className="font-bold text-[#0F172A]">{item.area.toFixed(2)} م²</div>
                      {isMinArea && (
                        <div className="text-[10px] text-amber-600 font-extrabold mt-0.5 whitespace-nowrap print:text-amber-700">
                          (الحد الأدنى الصناعي {threshold.toFixed(1)} م²)
                        </div>
                      )}
                    </td>

                    {/* Specs & glass */}
                    <td className="py-4 px-4 border-l border-slate-100">
                      <div className="font-medium text-slate-800">
                        {PROFILES[item.profile]?.name || item.profile}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">الزجاج: {item.glassType}</div>
                    </td>

                    {/* Addons list */}
                    <td className="py-4 px-4 border-l border-slate-100 text-xs text-slate-600">
                      {item.addons.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {item.addons.map(addonId => (
                            <span key={addonId} className="inline-flex items-center gap-1 font-bold text-slate-700">
                              • {ADDONS[addonId]?.name || addonId}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">لا توجد إضافات</span>
                      )}
                    </td>

                    {/* Total Rate & cost */}
                    <td className="py-4 px-4 text-left">
                      <div className="font-black text-[#0F172A] font-display text-base">
                        {formatCurrency(item.itemTotal)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        بمعدل {formatCurrency(item.profilePrice + item.addonsPrice)} / م²
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grand Total Area and Calculations */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 print:bg-slate-100 print:text-[#0F172A] print:border-2 print:border-slate-800">
          <div className="text-right">
            <h4 className="font-display font-black text-xl mb-1 text-white print:text-[#0F172A]">مجموع مسطحات الأعمال</h4>
            <p className="text-slate-400 text-sm print:text-slate-500">
              إجمالي المساحة الفعلية للفتحات المحسوبة تبلغ بالامتار المسطحة:
            </p>
          </div>
          <div className="flex items-center gap-8 shrink-0">
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-black tracking-wider block mb-1">إجمالي الأمتار</span>
              <span className="text-2xl font-black font-mono leading-none" dir="ltr">{calculations.totalArea.toFixed(2)} m²</span>
            </div>
            <div className="bg-[#334155]/50 h-10 w-[2px] print:bg-slate-300" />
            <div className="text-right">
              <span className="text-xs text-amber-400 print:text-slate-500 uppercase font-black tracking-wider block mb-1">صافي القيمة الكلية</span>
              <span className="text-3xl sm:text-4xl font-black font-display text-yellow-400 print:text-slate-900 leading-none">
                {formatCurrency(calculations.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="mt-10 border-t-2 border-slate-200 pt-8 text-right">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">الشروط والمواصفات وجودة المكاوي هوم</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed font-medium">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <p>
                  <strong className="text-slate-900 font-bold">المنتجات والضمان:</strong> جميع قطاعات الـ UPVC المستخدمة تشمل ضمانًا معتمدًا لمدة 10 سنوات ضد تغير الألوان، عيوب التصنيع وثبات المقطع.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <p>
                  <strong className="text-slate-900 font-bold">إحكام العزل:</strong> الشبابيك مزودة بجوانات كاوتشوك مزدوجة تمنع تمامًا تسريب الغبار أو مياة الأمطار وعازلة ممتازة للأصوات الخارجية.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <p>
                  <strong className="text-slate-900 font-bold">الرفع الفعلي للمقاسات:</strong> يعتبر هذا العرض مبدئي بناءً على مقاساتكم الأولية. يتوجه مهندسو المكاوي هوم لرفع مقاسات دقيقة بالموقع لتجنب أي تفاوت.
                </p>
              </li>
            </ul>

            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <p>
                  <strong className="text-slate-900 font-bold">الإكسسوارات والمقابض:</strong> نلتزم باستخدام إكسسوارات (G-U/مكفولة ومستوردة) المقاومة للتآكل والصدأ لضمان سلاسة الفتح والجر.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <p>
                  <strong className="text-slate-900 font-bold">الزجاج ونوعيته:</strong> الزجاج دبل جلاس عازل أو عاكس حسب اختياركم مع الالتزام بأحدث تقنيات الحقن والخلو من الشوائب.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                <p>
                  <strong className="text-slate-900 font-bold">تواصل مباشرة معنا:</strong> اضغط على روابط تواصلنا لحجز موعد المعاينة وتأكيد الطلب.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Clickable Links (Requested by User) */}
        <div className="mt-10 p-5 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
          <div className="text-right">
            <h4 className="font-bold text-[#0F172A]">روابط التواصل السريع والتفاعل</h4>
            <p className="text-xs text-slate-500">انقر على أي مما يلي للتواصل الفوري أو الانتقال لموقعنا الرسمي</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a 
              href="tel:+201141761261" 
              className="py-2.5 px-4 bg-[#0F172A] text-white hover:bg-black text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Phone size={14} />
              اتصال: 01141761261
            </a>
            <a 
              href="tel:+201060524985" 
              className="py-2.5 px-4 bg-[#0F172A] text-white hover:bg-black text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Phone size={14} />
              اتصال: 01060524985
            </a>
            <a 
              href="https://wa.me/201141761261" 
              target="_blank" 
              rel="noreferrer" 
              className="py-2.5 px-4 bg-green-650 text-white hover:bg-green-700 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>واتساب: 01141761261</span>
            </a>
            <a 
              href="https://www.facebook.com/share/1Bfwi9XFow/" 
              target="_blank" 
              rel="noreferrer" 
              className="py-2.5 px-5 bg-[#1877F2] text-white hover:bg-[#155fc0] text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Globe size={14} />
              فيسبوك
              <ExternalLink size={12} />
            </a>
            <a 
              href="https://www.instagram.com/almekawy.home?igsh=bXBqZmw3NGt4bzVs" 
              target="_blank" 
              rel="noreferrer" 
              className="py-2.5 px-5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-95 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Instagram size={14} />
              إنستغرام
              <ExternalLink size={12} />
            </a>
            <a 
              href="https://www.tiktok.com/@almekawy.home?_r=1&_t=ZS-971BmNPuWbk" 
              target="_blank" 
              rel="noreferrer" 
              className="py-2.5 px-5 bg-black hover:bg-slate-900 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer border border-slate-800"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" className="inline">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.14.99 1.13 2.37 1.83 3.84 2.01v3.98c-1.42-.02-2.83-.37-4.11-1.02-.78-.4-1.48-.95-2.05-1.63V15.5c-.01 2.22-.9 4.34-2.48 5.86-1.58 1.52-3.76 2.32-5.98 2.21-2.41-.12-4.66-1.4-5.88-3.5-1.22-2.09-1.29-4.71-.16-6.86 1.12-2.14 3.32-3.53 5.75-3.64v3.95c-1.12.06-2.17.69-2.73 1.67-.56.97-.56 2.18-.01 3.16.55.98 1.58 1.63 2.7 1.7 1.16.07 2.29-.41 2.97-1.35.53-.73.74-1.64.74-2.54V.02h.64z" />
              </svg>
              تيك توك
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Space for Signatures */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-sm font-bold border-t border-slate-200 pt-8">
          <div>
            <p className="text-slate-400 mb-8 font-black uppercase text-xs tracking-wider">توقيع واعتماد العميل</p>
            <div className="border-b-2 border-slate-350 border-dashed w-40 mx-auto" />
            <p className="text-slate-900 text-xs font-black mt-2">{customer.name || "العميل المحترم"}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-8 font-black uppercase text-xs tracking-wider">الاعتماد الرسمي للمركز المعني</p>
            <div className="border-b-2 border-slate-350 border-dashed w-40 mx-auto" />
            <p className="text-[#0F172A] font-black text-xs mt-2">مهندس/ حامد مكاوي</p>
          </div>
        </div>

        {/* Small footer citation */}
        <div className="mt-10 border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">
          <p>© {new Date().getFullYear()} AL-MAKKAWI HOME • OFFICIAL QUOTATION</p>
          <p className="hidden print:block flex items-center gap-1">
            <span>فيسبوك: </span>
            <span className="font-mono text-slate-800 lowercase">https://www.facebook.com/share/1Bfwi9XFow/</span>
          </p>
        </div>

      </div>
    </div>
  );
}
