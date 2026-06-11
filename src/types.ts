/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NoteItem {
  id: string;
  text: string;
  amount: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  date: string;
  deliveryDate?: string;
  discountType?: 'percentage' | 'cash';
  discountValue?: number;
  notes?: string;
  notesAmount?: number;
  additionalNotes?: NoteItem[];
}

export interface Profile {
  id: string;
  name: string;
  price: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  isFlat?: boolean;
  unit?: string;
}

export interface QuoteItem {
  id: number;
  title: string;
  itemType: 'window' | 'door' | 'balcony';
  width: number;
  height: number;
  profile: string;
  opening: string;
  innerType?: 'glass' | 'panel' | 'panel_glass';
  glassType: string;
  hingePanes?: string;
  addons: string[];
}

export interface CalculatedItem extends QuoteItem {
  area: number;
  itemTotal: number;
  profilePrice: number;
  addonsPrice: number;
  flatAddonsPrice?: number;
}

export interface CalculationResult {
  itemsCalculated: CalculatedItem[];
  totalArea: number;
  totalPrice: number;
}
