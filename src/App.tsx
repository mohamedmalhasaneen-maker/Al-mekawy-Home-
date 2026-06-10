import { useState, useMemo } from 'react';
import { Plus, Calculator, QrCode, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { QuoteItem, CalculationResult, CustomerInfo } from './types';
import { PROFILES, ADDONS } from './constants';

import Header from './components/Header';
import ItemCard from './components/ItemCard';
import CustomerForm from './components/CustomerForm';
import DetailedQuoteView from './components/DetailedQuoteView';
import SummaryBox from './components/SummaryBox';
import PricingTable from './components/PricingTable';
import Features from './components/Features';
import QrModal from './components/QrModal';
import AiMekawyChat from './components/AiMekawyChat';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(value) + ' ج.م';
};

export default function App() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: Date.now(),
      title: 'بند رقم 1 (مثال: شباك غرفه)',
      itemType: 'window',
      width: 120,
      height: 120,
      profile: 'newline',
      opening: 'جرار',
      glassType: 'أبيض شفاف',
      addons: []
    }
  ]);

  const addNewItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        title: `بند رقم ${items.length + 1}`,
        itemType: 'window',
        width: 100,
        height: 100,
        profile: 'newline',
        opening: 'جرار',
        glassType: 'أبيض شفاف',
        addons: []
      }
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert('يجب أن يحتوي العرض على بند واحد على الأقل.');
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };
        
        // Logical constraints for add-ons
        if (field === 'addons') {
            const newAddons = [...value];
            if (value.includes('blackout') && item.addons.indexOf('blackout') === -1) {
                const index = newAddons.indexOf('pleated');
                if (index > -1) newAddons.splice(index, 1);
            }
            if (value.includes('pleated') && item.addons.indexOf('pleated') === -1) {
                 const index = newAddons.indexOf('blackout');
                 if (index > -1) newAddons.splice(index, 1);
            }
            if (value.includes('doubleGlass') && item.addons.indexOf('doubleGlass') === -1) {
                 const index = newAddons.indexOf('colorGlass');
                 if (index > -1) newAddons.splice(index, 1);
            }
            if (value.includes('colorGlass') && item.addons.indexOf('colorGlass') === -1) {
                 const index = newAddons.indexOf('doubleGlass');
                 if (index > -1) newAddons.splice(index, 1);
            }
            updatedItem.addons = newAddons;
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const toggleAddon = (itemId: number, addonId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    let newAddons = [...item.addons];
    if (newAddons.includes(addonId)) {
      newAddons = newAddons.filter(a => a !== addonId);
    } else {
      newAddons.push(addonId);
    }
    updateItem(itemId, 'addons', newAddons);
  };

  const calculations = useMemo<CalculationResult>(() => {
    let totalArea = 0;
    let totalPrice = 0;

    const itemsCalculated = items.map(item => {
      const w = item.width || 0;
      const h = item.height || 0;
      let area = (w * h) / 10000;
      
      // Industrial norm: minimum 1m² for both windows and doors
      const minArea = 1.0;
      if (area > 0 && area < minArea) area = minArea; 
      
      totalArea += area;

      let profilePrice = PROFILES[item.profile]?.price || 0;
      if (item.addons.includes('panda')) {
        profilePrice = profilePrice * 1.5;
      }
      let addonsPrice = 0;
      
      item.addons.forEach(id => {
        addonsPrice += ADDONS[id]?.price || 0;
      });

      const itemTotal = area * (profilePrice + addonsPrice);
      totalPrice += itemTotal;

      return { ...item, area, itemTotal, profilePrice, addonsPrice };
    });

    return { itemsCalculated, totalArea, totalPrice };
  }, [items]);

  const handleCustomerChange = (field: keyof CustomerInfo, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const el = document.getElementById('detailed-quote-view');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('ring-4', 'ring-[#FACC15]', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-[#FACC15]', 'ring-offset-2');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-yellow-105 selection:bg-yellow-200 selection:text-[#0F172A] pb-24 md:pb-0" dir="rtl">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border-2 border-slate-200 border-r-8 border-r-[#0F172A] p-8 mb-12 print:hidden overflow-hidden relative shadow-sm"
        >
          <h2 className="text-2xl font-display font-black text-[#0F172A] mb-4 flex items-center gap-3">
            <Calculator className="text-[#0F172A]" size={26} />
            بوابة المكاوي هوم للتسعير التفاعلي
          </h2>
          <p className="text-slate-500 leading-relaxed text-base max-w-3xl">
            أدخل مقاسات الفتحات لديك (العرض والارتفاع بالسنتيمتر)، ثم اختر نوع القطاع والإضافات التي ترغب بها لكل بند. سيقوم النظام تلقائياً بحساب المساحات (المتر المربع) وعرض التكلفة الإجمالية بدقة وبشفافية تامة.
          </p>
        </motion.div>

        <PricingTable />

        <CustomerForm customer={customer} onChange={handleCustomerChange} />

        <div className="space-y-8 print:hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {calculations.itemsCalculated.map((item, index) => (
              <ItemCard 
                key={item.id}
                item={item}
                index={index}
                updateItem={updateItem}
                removeItem={removeItem}
                toggleAddon={toggleAddon}
                formatCurrency={formatCurrency}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center print:hidden">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addNewItem}
            className="hidden md:flex items-center gap-3 bg-[#0F172A] hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-xl shadow-lg transition-all w-full md:w-auto justify-center cursor-pointer"
          >
            <Plus size={28} />
            إضافة بند جديد (شباك / باب)
          </motion.button>
        </div>

        <SummaryBox 
          calculations={calculations}
          formatCurrency={formatCurrency}
          handlePrint={handlePrint}
        />

        <DetailedQuoteView 
          customer={customer}
          calculations={calculations}
          formatCurrency={formatCurrency}
        />

        <div className="print:hidden">
          <Features />
        </div>

        <footer className="mt-20 text-center text-slate-400 text-sm print:hidden border-t border-slate-200/65 pt-10 pb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="font-extrabold tracking-wide text-xs text-slate-400">© {new Date().getFullYear()} AL-MAKKAWI HOME • ALL RIGHTS RESERVED</p>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#0F172A]/5 hover:bg-[#FACC15] hover:text-[#0F172A] text-[#0F172A] border border-slate-200 hover:border-transparent transition-all duration-200 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              <QrCode size={13} />
              <span>رمز الاستجابة السريعة (QR)</span>
            </button>
          </div>
          <div className="flex gap-4 text-xs font-black uppercase text-[#0F172A]">
            <span>خامات معتمدة</span>
            <span>•</span>
            <span>تركيب احترافي</span>
            <span>•</span>
            <span>معاينة مجانية</span>
          </div>
        </footer>

        <AnimatePresence>
          {isQrModalOpen && (
            <QrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
          )}
        </AnimatePresence>

        <AiMekawyChat />

        {/* Mobile Sticky Bottom Navigation Bar for easy one-handed use */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-40 flex items-center gap-3 md:hidden print:hidden">
          <button
            type="button"
            onClick={addNewItem}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-black text-white py-4 rounded-2xl font-black text-base shadow-lg active:scale-95 transition-all text-center cursor-pointer"
          >
            <Plus size={20} />
            <span>إضافة بند جديد</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-4 bg-amber-500 hover:bg-amber-600 text-[#0F172A] rounded-2xl font-black text-sm shadow-md active:scale-95 transition-all text-center cursor-pointer flex items-center gap-1.5"
            title="معاينة وتحميل ملف PDF منظم"
          >
            <FileText size={20} />
            <span>عرض السعر (PDF)</span>
          </button>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background-color: white !important; }
          .print\\:hidden { display: none !important; }
          input[type="number"], input[type="text"], select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background: transparent;
          }
        }
      `}} />
    </div>
  );
}
