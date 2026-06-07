import React from 'react';
import { Trash2 } from 'lucide-react';
import { CalculatedItem } from '../types';
import { PROFILES, ADDONS, GLASS_TYPES, OPENING_TYPES } from '../constants';
import { motion } from 'motion/react';

interface Props {
  item: CalculatedItem;
  index: number;
  updateItem: (id: number, field: string, value: any) => void;
  removeItem: (id: number) => void;
  toggleAddon: (itemId: number, addonId: string) => void;
  formatCurrency: (value: number) => string;
}

const ItemCard: React.FC<Props> = ({ item, index, updateItem, removeItem, toggleAddon, formatCurrency }) => {
  const itemNumber = String(index + 1).padStart(2, '0');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:border-[#FACC15] border-r-8 border-r-[#FACC15] transition-all duration-300 print:shadow-none print:border-b print:rounded-none print:mb-8"
    >
      <div className="bg-[#F8F9FA] px-6 py-4 border-b-2 border-slate-200 flex justify-between items-center print:bg-white print:border-slate-800">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-slate-200/60 rounded-xl flex items-center justify-center font-black text-lg text-slate-500 print:hidden">
            {itemNumber}
          </div>
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateItem(item.id, 'title', e.target.value)}
            className="bg-transparent font-display font-black text-xl text-[#0F172A] focus:outline-none focus:border-b-2 focus:border-[#0F172A] w-1/2 print:border-none print:w-auto"
            placeholder="اسم البند (مثال: شباك المطبخ)"
          />
        </div>
        <button 
          onClick={() => removeItem(item.id)}
          className="text-red-500 hover:text-red-700 p-2.5 rounded-full hover:bg-red-50 transition print:hidden"
          title="حذف البند"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* المقاسات */}
        <div className="space-y-4">
          <h3 className="font-black text-[#0F172A] border-b-2 border-slate-100 pb-2 text-sm uppercase tracking-wider">المقاسات</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-500 mb-1 uppercase tracking-wider">العرض (سم)</label>
              <input
                type="number"
                min="0"
                value={item.width}
                onChange={(e) => updateItem(item.id, 'width', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all print:border-none print:p-0 print:font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-500 mb-1 uppercase tracking-wider">الارتفاع (سم)</label>
              <input
                type="number"
                min="0"
                value={item.height}
                onChange={(e) => updateItem(item.id, 'height', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all print:border-none print:p-0 print:font-bold"
              />
            </div>
            <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/60 print:bg-transparent print:p-0 print:border-none space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold">المساحة:</span>
                <span className="text-base text-[#0F172A] font-black">{item.area.toFixed(2)} م²</span>
              </div>
              {((item.width * item.height) / 10000) < 1.0 && (
                <div className="text-[10px] text-amber-600 font-extrabold text-right">
                  * تم تطبيق الحد الأدنى (1.0 م²)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* المواصفات الأساسية */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h3 className="font-black text-[#0F172A] border-b-2 border-slate-100 pb-2 text-sm uppercase tracking-wider">المواصفات</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#64748B] mb-1.5 uppercase tracking-wider">نوع البند</label>
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl print:hidden">
                <button
                  type="button"
                  onClick={() => updateItem(item.id, 'itemType', 'window')}
                  className={`flex-1 py-1.5 px-3 text-center rounded-lg font-black text-xs transition-all cursor-pointer ${item.itemType === 'window' ? 'bg-[#0F172A] text-white shadow-sm' : 'hover:text-[#0F172A] text-slate-500 hover:bg-slate-55'}`}
                >
                  شباك
                </button>
                <button
                  type="button"
                  onClick={() => updateItem(item.id, 'itemType', 'door')}
                  className={`flex-1 py-1.5 px-3 text-center rounded-lg font-black text-xs transition-all cursor-pointer ${item.itemType === 'door' ? 'bg-[#0F172A] text-white shadow-sm' : 'hover:text-[#0F172A] text-slate-500 hover:bg-slate-55'}`}
                >
                  باب
                </button>
              </div>
              <div className="hidden print:block font-bold text-slate-905">{item.itemType === 'door' ? 'باب' : 'شباك'}</div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-500 mb-1 uppercase tracking-wider">نوع القطاع (UPVC)</label>
              <select
                value={item.profile}
                onChange={(e) => updateItem(item.id, 'profile', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all print:appearance-none print:border-none print:p-0 print:font-bold cursor-pointer"
              >
                {Object.entries(PROFILES).map(([key, profile]) => (
                  <option key={key} value={key}>{profile.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-extrabold text-slate-500 mb-1 uppercase tracking-wider">نوع الفتح</label>
              <select
                value={item.opening}
                onChange={(e) => updateItem(item.id, 'opening', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all print:appearance-none print:border-none print:p-0 print:font-bold cursor-pointer"
              >
                {OPENING_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-500 mb-1 uppercase tracking-wider">نوع الزجاج</label>
              <select
                value={item.glassType}
                onChange={(e) => updateItem(item.id, 'glassType', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-[#0F172A] focus:bg-white outline-none transition-all print:appearance-none print:border-none print:p-0 print:font-bold cursor-pointer"
              >
                {GLASS_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* الإضافات */}
        <div className="space-y-4">
          <h3 className="font-black text-[#0F172A] border-b-2 border-slate-100 pb-2 text-sm uppercase tracking-wider">إضافات اختيارية</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {Object.entries(ADDONS).map(([key, addon]) => {
              const isDoubleGlass = key === 'doubleGlass';
              const isColorGlass = key === 'colorGlass';
              const isPleated = key === 'pleated';
              const isBlackout = key === 'blackout';

              // Determine if disabled because of a mutually exclusive selection
              const isDisabled = 
                (isDoubleGlass && item.addons.includes('colorGlass')) ||
                (isColorGlass && item.addons.includes('doubleGlass')) ||
                (isPleated && item.addons.includes('blackout')) ||
                (isBlackout && item.addons.includes('pleated'));

              // Friendly conflict explanations in Arabic
              let conflictTag = '';
              if (isDoubleGlass && item.addons.includes('colorGlass')) {
                conflictTag = ' (تم اختيار ألوان خاصة)';
              } else if (isColorGlass && item.addons.includes('doubleGlass')) {
                conflictTag = ' (تم اختيار زجاج عادي)';
              } else if (isPleated && item.addons.includes('blackout')) {
                conflictTag = ' (تم اختيار بلاك أوت)';
              } else if (isBlackout && item.addons.includes('pleated')) {
                conflictTag = ' (تم اختيار سلك بليسيه)';
              }

              return (
                <label 
                  key={key} 
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors duration-200 ${
                    isDisabled 
                      ? 'opacity-40 cursor-not-allowed bg-slate-50/50' 
                      : 'hover:bg-slate-50 cursor-pointer group'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.addons.includes(key)}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && toggleAddon(item.id, key)}
                      className={`w-4 h-4 text-[#0F172A] rounded border-gray-300 focus:ring-[#FACC15] ${
                        isDisabled ? 'cursor-not-allowed text-slate-300' : 'cursor-pointer'
                      }`}
                    />
                    <span className={`text-sm font-bold transition-colors duration-200 ${
                      isDisabled 
                        ? 'text-slate-400' 
                        : 'text-slate-700 group-hover:text-[#0F172A]'
                    }`}>
                      {addon.name}
                    </span>
                  </div>
                  {isDisabled && (
                    <span className="text-[10px] text-amber-600 font-extrabold px-1.5 py-0.5 bg-amber-50 rounded">
                      {conflictTag}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* إجمالي البند */}
      <div className="bg-slate-50 p-5 border-t-2 border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:bg-white print:border-t-2 print:border-slate-800">
        <div className="text-slate-500 text-sm font-bold">
          سعر المتر المربع لهذا البند: <span className="font-bold text-slate-800">{formatCurrency(item.profilePrice + item.addonsPrice)}</span>
        </div>
        <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
          إجمالي البند: 
          <span className="text-2xl font-black text-[#0F172A] font-display">{formatCurrency(item.itemTotal)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
