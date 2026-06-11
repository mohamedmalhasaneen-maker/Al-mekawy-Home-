/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, Addon } from './types';

export const PROFILES: Record<string, Profile> = {
  newline: { id: 'newline', name: 'نيولاين (مصري اقتصادي)', price: 3400 },
  premier: { id: 'premier', name: 'بريمير (أوروبي – تقفيل مصري)', price: 3800 },
  craftline: { id: 'craftline', name: 'كرافت لاين (تركي – تقفيل مصري)', price: 4000 },
  wintech: { id: 'wintech', name: 'وينتك Wintech (تركي – تقفيل تركي)', price: 4500 },
  proline: { id: 'proline', name: 'برو لاين (تركي – تقفيل تركي)', price: 4500 },
  kompen: { id: 'kompen', name: 'كومبن (تركي – تقفيل تركي)', price: 5000 }
};

export const ADDONS: Record<string, Addon> = {
  pleated: { id: 'pleated', name: 'سلك بليسيه للحشرات', price: 850 },
  blackout: { id: 'blackout', name: 'بلاك أوت + سلك بليسيه', price: 1600 },
  doubleGlass: { id: 'doubleGlass', name: 'زجاج دبل جلاس (عادي)', price: 850 },
  colorGlass: { id: 'colorGlass', name: 'زجاج دبل ألوان خاصة', price: 1000 },
  specialColor: { id: 'specialColor', name: 'ألوان قطاعات خاصة (خشبي - أرو - رمادي - أسود)', price: 1800 },
  panda: { id: 'panda', name: 'نظام باندا (ضلفة على ضلفة)', price: 0 },
  pombe: { id: 'pombe', name: 'نظام البومبي', price: 4000, isFlat: true, unit: 'للقطعة' },
  dawr: { id: 'dawr', name: 'نظام الدوران', price: 700, isFlat: true, unit: 'للقطعة' },
  doubleHandle: { id: 'doubleHandle', name: 'نظام اتنين مقبض', price: 650, isFlat: true, unit: 'للفتحة' },
  skewWindow1: { id: 'skewWindow1', name: 'مفصلي قلاب شبابيك (ضلفة واحدة)', price: 700, isFlat: true, unit: 'للضلفة' },
  skewWindow2: { id: 'skewWindow2', name: 'مفصلي قلاب شبابيك (ضلفتين)', price: 1400, isFlat: true, unit: 'للضلفتين' },
  skewBalcony1: { id: 'skewBalcony1', name: 'مفصلي قلاب بلكونات (ضلفة واحدة)', price: 850, isFlat: true, unit: 'للضلفة' },
  skewBalcony2: { id: 'skewBalcony2', name: 'مفصلي قلاب بلكونات (ضلفتين)', price: 1400, isFlat: true, unit: 'للضلفتين' },
  singleColorGlass: { id: 'singleColorGlass', name: 'زجاج سنجل ألوان خاصة', price: 200 }
};

export const GLASS_TYPES = [
  'أبيض شفاف', 'مصنفر', 'بني عاكس', 'أبيض عاكس', 'بني سن دبوس',
  'أزرق عاكس', 'أخضر عاكس', 'أسود عاكس'
];

export const OPENING_TYPES = [
  'مفصلي', 'جرار', 'قلاب', 'ثابت'
];
