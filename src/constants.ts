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
  panda: { id: 'panda', name: 'نظام باندا (ضلفة على ضلفة)', price: 0 }
};

export const GLASS_TYPES = [
  'أبيض شفاف', 'مصنفر', 'بني عاكس', 'أبيض عاكس', 'بني سن دبوس',
  'أزرق عاكس', 'أخضر عاكس', 'أسود عاكس', 'مع جورجيا'
];

export const OPENING_TYPES = [
  'مفصلي', 'جرار', 'قلاب', 'ثابت'
];
