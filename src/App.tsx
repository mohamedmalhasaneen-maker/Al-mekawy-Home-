import { useState, useMemo, useEffect } from 'react';
import { Plus, Calculator, QrCode, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { QuoteItem, CalculationResult, CustomerInfo, Profile, Addon, SavedQuote } from './types';
import { PROFILES, ADDONS } from './constants';
import { DevSettingsModal } from './components/DevSettingsModal';

import Header from './components/Header';
import ItemCard from './components/ItemCard';
import CustomerForm from './components/CustomerForm';
import DetailedQuoteView from './components/DetailedQuoteView';
import SummaryBox from './components/SummaryBox';
import PricingTable from './components/PricingTable';
import Features from './components/Features';
import QrModal from './components/QrModal';
import SavedQuotesModal from './components/SavedQuotesModal';
import PasswordModal from './components/PasswordModal';
import AiMekawyChat from './components/AiMekawyChat';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(value) + ' ج.م';
};

export default function App() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isSavedQuotesModalOpen, setIsSavedQuotesModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'input' | 'quote'>('input');

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() => {
    try {
      const saved = localStorage.getItem('almekawy_saved_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    fetch('/api/quotes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedQuotes(data);
          try {
            localStorage.setItem('almekawy_saved_quotes', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(err => {
        console.error("Error loading quotes from server:", err);
      });
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('almekawy_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      localStorage.setItem('almekawy_theme', newTheme);
    } catch (e) {}
  };

  const [profiles, setProfiles] = useState<Record<string, Profile>>(() => {
    try {
      const saved = localStorage.getItem('almekawy_custom_profiles');
      return saved ? JSON.parse(saved) : PROFILES;
    } catch (e) {
      return PROFILES;
    }
  });

  const [addons, setAddons] = useState<Record<string, Addon>>(() => {
    try {
      const saved = localStorage.getItem('almekawy_custom_addons');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...ADDONS, ...parsed };
      }
      return ADDONS;
    } catch (e) {
      return ADDONS;
    }
  });

  const handleSavePrices = (updatedProfiles: Record<string, Profile>, updatedAddons: Record<string, Addon>) => {
    setProfiles(updatedProfiles);
    setAddons(updatedAddons);
    localStorage.setItem('almekawy_custom_profiles', JSON.stringify(updatedProfiles));
    localStorage.setItem('almekawy_custom_addons', JSON.stringify(updatedAddons));
  };

  const handleResetPrices = () => {
    setProfiles(PROFILES);
    setAddons(ADDONS);
    localStorage.removeItem('almekawy_custom_profiles');
    localStorage.removeItem('almekawy_custom_addons');
  };

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    discountType: 'cash',
    discountValue: 0,
    notes: '',
    notesAmount: 0,
    additionalNotes: []
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
      innerType: 'glass',
      glassType: 'أبيض شفاف',
      addons: [],
      quantity: 1
    }
  ]);

  const addNewItem = () => {
    setActiveMainTab('input');
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
        innerType: 'glass',
        glassType: 'أبيض شفاف',
        addons: [],
        quantity: 1
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
        
        // Logical constraints when switching item type
        if (field === 'itemType') {
          let newAddons = [...item.addons];
          if (value === 'window') {
            // Remove balcony items
            newAddons = newAddons.filter(id => id !== 'skewBalcony1' && id !== 'skewBalcony2');
          } else if (value === 'balcony') {
            // Remove window items
            newAddons = newAddons.filter(id => id !== 'skewWindow1' && id !== 'skewWindow2');
          } else if (value === 'door') {
            // Remove tilt-and-turn (skew) additions, double handle, and pombe
            newAddons = newAddons.filter(id => 
              id !== 'skewWindow1' && 
              id !== 'skewWindow2' && 
              id !== 'skewBalcony1' && 
              id !== 'skewBalcony2' && 
              id !== 'doubleHandle' && 
              id !== 'pombe'
            );
          }
          updatedItem.addons = newAddons;
        }

        // Logical constraints when switching opening mechanism & sash counts (hingePanes)
        if (field === 'opening') {
          if (value !== 'مفصلي') {
            updatedItem.addons = item.addons.filter(id => 
              id !== 'skewWindow1' && 
              id !== 'skewWindow2' && 
              id !== 'skewBalcony1' && 
              id !== 'skewBalcony2'
            );
          } else {
            const currentHinge = item.hingePanes || 'ضلفة';
            if (currentHinge === 'ضلفة') {
              updatedItem.addons = item.addons.filter(id => 
                id !== 'skewWindow2' && 
                id !== 'skewBalcony2' && 
                id !== 'doubleHandle'
              );
            } else if (currentHinge === 'ضلفتين') {
              updatedItem.addons = item.addons.filter(id => 
                id !== 'skewWindow1' && 
                id !== 'skewBalcony1'
              );
            }
          }
        }

        if (field === 'hingePanes') {
          if (item.opening === 'مفصلي') {
            if (value === 'ضلفة') {
              updatedItem.addons = item.addons.filter(id => 
                id !== 'skewWindow2' && 
                id !== 'skewBalcony2' && 
                id !== 'doubleHandle'
              );
            } else if (value === 'ضلفتين') {
              updatedItem.addons = item.addons.filter(id => 
                id !== 'skewWindow1' && 
                id !== 'skewBalcony1'
              );
            }
          }
        }

        // Logical constraints for innerType (Panel vs Glass)
        if (field === 'innerType') {
          if (value === 'panel') {
            // Remove glass-related addons when Panel Only is selected
            updatedItem.addons = item.addons.filter(id => id !== 'doubleGlass' && id !== 'colorGlass');
            updatedItem.glassType = 'بدون زجاج (بنل فقط)';
          } else if ((value === 'glass' || value === 'panel_glass') && item.glassType === 'بدون زجاج (بنل فقط)') {
            updatedItem.glassType = 'أبيض شفاف';
          }
        }
        
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
            if (value.includes('skewWindow1') && item.addons.indexOf('skewWindow1') === -1) {
                 const index = newAddons.indexOf('skewWindow2');
                 if (index > -1) newAddons.splice(index, 1);
            }
            if (value.includes('skewWindow2') && item.addons.indexOf('skewWindow2') === -1) {
                 const index = newAddons.indexOf('skewWindow1');
                 if (index > -1) newAddons.splice(index, 1);
            }
            if (value.includes('skewBalcony1') && item.addons.indexOf('skewBalcony1') === -1) {
                 const index = newAddons.indexOf('skewBalcony2');
                 if (index > -1) newAddons.splice(index, 1);
            }
            if (value.includes('skewBalcony2') && item.addons.indexOf('skewBalcony2') === -1) {
                 const index = newAddons.indexOf('skewBalcony1');
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
      const qty = item.quantity || 1;
      const w = item.width || 0;
      const h = item.height || 0;
      let area = (w * h) / 10000;
      
      // Industrial norm: minimum 1m² for both windows and doors
      const minArea = 1.0;
      if (area > 0 && area < minArea) area = minArea; 
      
      totalArea += area * qty;

      let profilePrice = profiles[item.profile]?.price || 0;
      if (item.addons.includes('panda')) {
        profilePrice = profilePrice * 1.5;
      }
      let addonsPrice = 0;
      let flatAddonsPrice = 0;
      
      item.addons.forEach(id => {
        const addon = addons[id];
        if (addon) {
          if (addon.isFlat) {
            flatAddonsPrice += addon.price;
          } else {
            addonsPrice += addon.price;
          }
        }
      });

      const singleItemTotal = (area * (profilePrice + addonsPrice)) + flatAddonsPrice;
      const itemTotal = singleItemTotal * qty;
      totalPrice += itemTotal;

      return { ...item, area, itemTotal, profilePrice, addonsPrice, flatAddonsPrice };
    });

    return { itemsCalculated, totalArea, totalPrice };
  }, [items, profiles, addons]);

  const handleCustomerChange = (field: keyof CustomerInfo, value: any) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCurrentQuote = (name: string) => {
    const finalPrice = (() => {
      const val = customer.discountValue || 0;
      const type = customer.discountType || 'cash';
      const notesAmount = customer.notesAmount || 0;
      const additionalNotesSum = customer.additionalNotes?.reduce((sum, n) => sum + (n.amount || 0), 0) || 0;
      const totalNotesAmount = notesAmount + additionalNotesSum;
      const discountAmt = type === 'percentage' ? (calculations.totalPrice * (val / 100)) : val;
      return Math.max(0, calculations.totalPrice - discountAmt + totalNotesAmount);
    })();

    const newQuote: SavedQuote = {
      id: Date.now().toString(),
      name: name,
      customer: customer,
      items: items,
      date: new Date().toLocaleDateString('ar-EG'),
      totalPrice: finalPrice,
    };
    const updated = [newQuote, ...savedQuotes.filter(q => q.id !== newQuote.id)];
    setSavedQuotes(updated);
    try {
      localStorage.setItem('almekawy_saved_quotes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Save to the backend server
    fetch('/api/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newQuote),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Successfully saved quote to backend server");
        }
      })
      .catch(err => {
        console.error("Error saving quote to backend server:", err);
      });
  };

  const handleLoadQuote = (quote: SavedQuote) => {
    setCustomer(quote.customer);
    setItems(quote.items);
    setActiveMainTab('input');
  };

  const handleDeleteQuote = (id: string) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    try {
      localStorage.setItem('almekawy_saved_quotes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Delete from the backend server
    fetch(`/api/quotes/${id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Successfully deleted quote from backend server");
        }
      })
      .catch(err => {
        console.error("Error deleting quote from backend server:", err);
      });
  };

  const handleSaveQuoteAuto = () => {
    const defaultName = customer.name?.trim() 
      ? `عرض سعر - ${customer.name.trim()}`
      : `عرض سعر تلقائي - ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
    handleSaveCurrentQuote(defaultName);
  };

  const handlePrint = () => {
    setActiveMainTab('quote');
    setTimeout(() => {
      const el = document.getElementById('detailed-quote-view');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.classList.add('ring-4', 'ring-[#FACC15]', 'ring-offset-2');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-[#FACC15]', 'ring-offset-2');
        }, 1500);
      }
    }, 150);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark-mode' : ''} bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-yellow-105 selection:bg-yellow-200 selection:text-[#0F172A] pb-24 md:pb-0 transition-colors duration-300`} dir="rtl">
      <Header 
        onOpenDevSettings={() => setIsDevModalOpen(true)} 
        theme={theme}
        onToggleTheme={toggleTheme}
        savedQuotesCount={savedQuotes.length}
        onOpenSavedQuotes={() => setIsPasswordModalOpen(true)}
        onSaveQuoteAuto={handleSaveQuoteAuto}
      />

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

        {/* Navigation Tabs for adjacent pages view */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-8 max-w-xl mx-auto border border-slate-200/80 print:hidden shadow-inner relative justify-between gap-1.5">
          <button
            onClick={() => setActiveMainTab('input')}
            className={`flex-1 py-3 px-3 sm:px-5 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative z-10 select-none ${
              activeMainTab === 'input'
                ? 'bg-[#0F172A] text-[#FACC15] shadow-md shadow-slate-900/10'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-200'
            }`}
          >
            <Calculator size={18} />
            <span>بيانات العميل وحساب البنود</span>
          </button>
          <button
            onClick={() => setActiveMainTab('quote')}
            className={`flex-1 py-3 px-3 sm:px-5 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative z-10 select-none ${
              activeMainTab === 'quote'
                ? 'bg-[#0F172A] text-[#FACC15] shadow-md shadow-slate-900/10'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-200'
            }`}
          >
            <FileText size={18} />
            <span>عرض السعر التفصيلي (PDF)</span>
          </button>
        </div>

        <div className={activeMainTab === 'input' ? 'block' : 'hidden print:hidden'}>
          <PricingTable profiles={profiles} addons={addons} />

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
                  profiles={profiles}
                  addons={addons}
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
            customer={customer}
            onChange={handleCustomerChange}
            formatCurrency={formatCurrency}
            handlePrint={handlePrint}
          />
        </div>

        <div className={activeMainTab === 'quote' ? 'block' : 'hidden print:block'}>
          <DetailedQuoteView 
            customer={customer}
            calculations={calculations}
            formatCurrency={formatCurrency}
            profiles={profiles}
            addons={addons}
          />
        </div>

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

        <AnimatePresence>
          {isDevModalOpen && (
            <DevSettingsModal
              isOpen={isDevModalOpen}
              onClose={() => setIsDevModalOpen(false)}
              profiles={profiles}
              addons={addons}
              onSavePrices={handleSavePrices}
              onResetPrices={handleResetPrices}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSavedQuotesModalOpen && (
            <SavedQuotesModal
              isOpen={isSavedQuotesModalOpen}
              onClose={() => setIsSavedQuotesModalOpen(false)}
              savedQuotes={savedQuotes}
              onSaveCurrent={handleSaveCurrentQuote}
              onLoadQuote={handleLoadQuote}
              onDeleteQuote={handleDeleteQuote}
              currentCustomerName={customer.name}
              formatCurrency={formatCurrency}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPasswordModalOpen && (
            <PasswordModal
              isOpen={isPasswordModalOpen}
              onClose={() => setIsPasswordModalOpen(false)}
              onSuccess={() => {
                setIsPasswordModalOpen(false);
                setIsSavedQuotesModalOpen(true);
              }}
              requiredPassword="662006"
            />
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
