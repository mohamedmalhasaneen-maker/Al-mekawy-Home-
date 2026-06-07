/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  date: string;
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
}

export interface QuoteItem {
  id: number;
  title: string;
  width: number;
  height: number;
  profile: string;
  opening: string;
  glassType: string;
  addons: string[];
}

export interface CalculatedItem extends QuoteItem {
  area: number;
  itemTotal: number;
  profilePrice: number;
  addonsPrice: number;
}

export interface CalculationResult {
  itemsCalculated: CalculatedItem[];
  totalArea: number;
  totalPrice: number;
}
