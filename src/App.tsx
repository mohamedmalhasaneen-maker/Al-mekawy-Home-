import { useState, useMemo } from 'react';
import { Plus, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { QuoteItem, CalculationResult, CustomerInfo } from './types';
import { PROFILES, ADDONS } from './constants';

import Header from './components/Header';
import ItemCard from './components/ItemCard';
import CustomerForm from './components/CustomerForm';
import DetailedQuoteView from './components/DetailedQuoteView';
import SummaryBox from './components/SummaryBox';
import Features from './components/Features';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ar-EG', { 
    style: 'currency', 
    currency: 'EGP', 
    maximumFractionDigits: 0 
  }).format(value);
};

export default function App() {
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
      
      // Industrial norm: minimum 1m² per item
      if (area > 0 && area < 1) area = 1; 
      
      totalArea += area;

      const profilePrice = PROFILES[item.profile]?.price || 0;
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
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-yellow-105 selection:bg-yellow-200 selection:text-[#0F172A]" dir="rtl">
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

        <CustomerForm customer={customer} onChange={handleCustomerChange} />

        <div className="space-y-8">
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
            className="flex items-center gap-3 bg-[#0F172A] hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-xl shadow-lg transition-all w-full md:w-auto justify-center cursor-pointer"
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

        <Features />

        <footer className="mt-20 text-center text-slate-400 text-sm print:mt-10 border-t border-slate-200/65 pt-10 pb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-extrabold tracking-wide text-xs text-slate-400">© {new Date().getFullYear()} AL-MAKKAWI HOME • ALL RIGHTS RESERVED</p>
          <div className="flex gap-4 text-xs font-black uppercase text-[#0F172A]">
            <span>خامات معتمدة</span>
            <span>•</span>
            <span>تركيب احترافي</span>
            <span>•</span>
            <span>معاينة مجانية</span>
          </div>
        </footer>
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
