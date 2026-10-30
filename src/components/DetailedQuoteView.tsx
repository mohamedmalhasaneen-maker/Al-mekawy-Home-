import React from 'react';
import { CustomerInfo, CalculatedItem, CalculationResult, Profile, Addon } from '../types';
import {
  FileText,
  Download,
  Share2,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Phone,
  ChevronDown,
  Copy,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import jspdf from 'jspdf';
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import logoUrl from '../assets/images/almekawy_logo_1780823019540.png';

interface Props {
  customer: CustomerInfo;
  calculations: CalculationResult;
  formatCurrency: (value: number) => string;
  profiles: Record<string, Profile>;
  addons: Record<string, Addon>;
  onBack?: () => void;
}

const BASE_PAGE_WIDTH = 794; // Canonical A4 portrait width at 96 DPI (210mm)
const A4_MIN_HEIGHT = 1123;  // Canonical A4 portrait height at 96 DPI (297mm)
const ITEMS_PER_PAGE = 10;

// Dynamic Per-Item Typography Auto-Fit Constants
const ABSOLUTE_MIN_FONT_PX = 5.0;        // Emergency minimum floor (~3.75pt) prioritizing full content visibility
const READABILITY_WARNING_FONT_PX = 6.5; // Threshold (~5pt) below which a legibility review notice is shown
const FONT_STEP_PX = 0.25;

// Exact inner text container widths inside the fixed 726px table (<colgroup>: 34, 196, 78, 72, 42, 118, 92, 98)
const DESC_BOX_WIDTH_PX = 120;
const PROFILE_BOX_WIDTH_PX = 98;
const ADDONS_BOX_WIDTH_PX = 72;
const NOTES_BOX_WIDTH_PX = 696;

interface PageLayoutMetrics {
  rowInnerHeightPx: number;
  cellContentHeightPx: number;
  safeMeasureHeightPx: number;
  svgBoxSizePx: number;
  notesContentMaxHeightPx: number;
}

function getPageLayoutMetrics(params: {
  pageIdx: number;
  totalPages: number;
  pageItemCount: number;
  totalActiveNotes: number;
}): PageLayoutMetrics {
  const { pageIdx, totalPages, pageItemCount, totalActiveNotes } = params;
  const isFirstPage = pageIdx === 0;
  const isLastPage = pageIdx === totalPages - 1;
  const hasNotes = totalActiveNotes > 0;

  let rowInnerHeightPx = 60;
  let notesContentMaxHeightPx = 0;

  if (!isLastPage) {
    // Intermediate pages always carry 10 items and distribute them evenly across the page's table area
    rowInnerHeightPx = isFirstPage ? 73 : 82;
    notesContentMaxHeightPx = 0;
  } else if (isFirstPage) {
    if (pageItemCount >= 9) {
      rowInnerHeightPx = hasNotes ? 51 : 57;
      notesContentMaxHeightPx = pageItemCount === 10 ? 52 : 100;
    } else {
      rowInnerHeightPx = 60;
      const savedRowsPx = Math.max(0, 10 - pageItemCount) * 57;
      notesContentMaxHeightPx = 56 + savedRowsPx;
    }
  } else {
    // Multi-page final sheet (compact continuation header leaves +115px extra vertical budget)
    if (pageItemCount >= 9) {
      rowInnerHeightPx = hasNotes ? 57 : 65;
      notesContentMaxHeightPx = pageItemCount === 10 ? 90 : 145;
    } else {
      rowInnerHeightPx = 62;
      const savedRowsPx = Math.max(0, 10 - pageItemCount) * 61;
      notesContentMaxHeightPx = 90 + savedRowsPx;
    }
  }

  const cellContentHeightPx = rowInnerHeightPx - 4; // 2px top + 2px bottom inner padding
  const safeMeasureHeightPx = Math.max(24, cellContentHeightPx - 1);
  const svgBoxSizePx = rowInnerHeightPx < 54 ? 38 : 42;

  return {
    rowInnerHeightPx,
    cellContentHeightPx,
    safeMeasureHeightPx,
    svgBoxSizePx,
    notesContentMaxHeightPx
  };
}

interface CellFitStyle {
  fontSizePx: number;
  secondaryFontSizePx: number;
  lineHeight: number;
  secondaryLineHeight: number;
  gapPx: number;
  isShrunk: boolean;
  overflowed: boolean;
  unreadable: boolean;
}

interface NoteFitStyle {
  fontSizePx: number;
  lineHeight: number;
  isShrunk: boolean;
  overflowed: boolean;
  unreadable: boolean;
}

interface QuoteAutoFitWarning {
  id: string;
  label: string;
  reason: 'overflow' | 'tiny-font';
}

interface QuoteAutoFitResult {
  itemFits: Record<
    number,
    {
      description: CellFitStyle;
      profileGlass: CellFitStyle;
      addons: CellFitStyle;
      rowOverflowed: boolean;
    }
  >;
  primaryNoteFit: NoteFitStyle;
  additionalNoteFits: Record<string, NoteFitStyle>;
  warnings: QuoteAutoFitWarning[];
}

const DEFAULT_DESCRIPTION_FIT: CellFitStyle = {
  fontSizePx: 12,
  secondaryFontSizePx: 10.5,
  lineHeight: 1.3,
  secondaryLineHeight: 1.22,
  gapPx: 1.5,
  isShrunk: false,
  overflowed: false,
  unreadable: false
};

const DEFAULT_PROFILE_FIT: CellFitStyle = {
  fontSizePx: 11,
  secondaryFontSizePx: 10,
  lineHeight: 1.32,
  secondaryLineHeight: 1.25,
  gapPx: 2,
  isShrunk: false,
  overflowed: false,
  unreadable: false
};

const DEFAULT_ADDONS_FIT: CellFitStyle = {
  fontSizePx: 10.5,
  secondaryFontSizePx: 10.5,
  lineHeight: 1.32,
  secondaryLineHeight: 1.32,
  gapPx: 2,
  isShrunk: false,
  overflowed: false,
  unreadable: false
};

const DEFAULT_NOTE_FIT: NoteFitStyle = {
  fontSizePx: 12,
  lineHeight: 1.55,
  isShrunk: false,
  overflowed: false,
  unreadable: false
};

function buildFontSteps(
  startPx: number,
  minPx: number = ABSOLUTE_MIN_FONT_PX,
  stepPx: number = FONT_STEP_PX
): number[] {
  const steps: number[] = [];
  let cur = startPx;
  while (cur > minPx + 0.01) {
    steps.push(Number(cur.toFixed(2)));
    cur -= stepPx;
  }
  steps.push(minPx);
  return steps;
}

let cachedMeasureStage: HTMLDivElement | null = null;

function getOrCreateAutoFitStage(): HTMLDivElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  if (cachedMeasureStage && document.body.contains(cachedMeasureStage)) {
    return cachedMeasureStage;
  }

  let host = document.getElementById('almekawy-quote-autofit-host') as HTMLDivElement | null;
  if (!host) {
    host = document.createElement('div');
    host.id = 'almekawy-quote-autofit-host';
    host.setAttribute('aria-hidden', 'true');
    host.setAttribute('dir', 'rtl');
    host.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:0',
      'height:0',
      'overflow:hidden',
      'visibility:hidden',
      'pointer-events:none',
      'z-index:-9999'
    ].join(';');
    document.body.appendChild(host);
  }

  const stage = document.createElement('div');
  stage.setAttribute('dir', 'rtl');
  stage.style.cssText = [
    `width:${BASE_PAGE_WIDTH}px`,
    'font-family:"Cairo", ui-sans-serif, system-ui, -apple-system, sans-serif',
    'direction:rtl',
    'text-align:right',
    'box-sizing:border-box',
    '-webkit-text-size-adjust:100%'
  ].join(';');
  host.innerHTML = '';
  host.appendChild(stage);
  cachedMeasureStage = stage;
  return stage;
}

function getItemTypeLabel(itemType: CalculatedItem['itemType']): string {
  if (itemType === 'armored_door') return 'باب مصفح';
  if (itemType === 'door') return 'باب';
  if (itemType === 'balcony') return 'بلكونة';
  return 'شباك';
}

function measureQuoteAutoFit(params: {
  items: CalculatedItem[];
  notes: string;
  notesAmount: number;
  additionalNotes: NonNullable<CustomerInfo['additionalNotes']>;
  profiles: Record<string, Profile>;
  addons: Record<string, Addon>;
  totalPages: number;
  lastPageItemCount: number;
  formatCurrency: (val: number) => string;
}): QuoteAutoFitResult {
  const {
    items,
    notes,
    notesAmount,
    additionalNotes,
    profiles,
    addons,
    totalPages,
    lastPageItemCount,
    formatCurrency
  } = params;

  const fallbackResult: QuoteAutoFitResult = {
    itemFits: {},
    primaryNoteFit: DEFAULT_NOTE_FIT,
    additionalNoteFits: {},
    warnings: []
  };

  const stage = getOrCreateAutoFitStage();
  if (!stage) return fallbackResult;

  const warnings: QuoteAutoFitWarning[] = [];
  const itemFits: QuoteAutoFitResult['itemFits'] = {};

  // Count active quote notes upfront so every page's row & note height budget matches rendering 1:1
  const activeAdditional = additionalNotes
    .map((n, idx) => ({ note: n, idx, key: String(n.id || idx) }))
    .filter(entry => Boolean(entry.note.text?.trim()));
  const hasPrimaryNote = Boolean(notes?.trim());
  const totalActiveNotes = (hasPrimaryNote ? 1 : 0) + activeAdditional.length;

  const descSteps = buildFontSteps(12, ABSOLUTE_MIN_FONT_PX, FONT_STEP_PX);
  const profileSteps = buildFontSteps(11, ABSOLUTE_MIN_FONT_PX, FONT_STEP_PX);
  const addonSteps = buildFontSteps(10.5, ABSOLUTE_MIN_FONT_PX, FONT_STEP_PX);
  const noteSteps = buildFontSteps(12, ABSOLUTE_MIN_FONT_PX, FONT_STEP_PX);

  // Reusable probe box inside stage
  const box = document.createElement('div');
  box.setAttribute('dir', 'rtl');
  stage.innerHTML = '';
  stage.appendChild(box);

  items.forEach((item, idx) => {
    const itemNumStr = String(idx + 1).padStart(2, '0');
    const typeName = getItemTypeLabel(item.itemType);

    const pageIdx = Math.floor(idx / ITEMS_PER_PAGE);
    const pageItemCount = Math.min(ITEMS_PER_PAGE, Math.max(1, items.length - pageIdx * ITEMS_PER_PAGE));
    const pageMetrics = getPageLayoutMetrics({
      pageIdx,
      totalPages,
      pageItemCount,
      totalActiveNotes
    });
    const safeCellHeightPx = pageMetrics.safeMeasureHeightPx;

    // 1. Measure Item Description (title + opening/type subtitle) inside fixed cell budget
    box.innerHTML = '';
    box.style.cssText = `width:${DESC_BOX_WIDTH_PX}px;box-sizing:border-box;direction:rtl;text-align:right;`;

    const titleEl = document.createElement('div');
    titleEl.style.cssText =
      'font-weight:800;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;margin:0;padding:0;';
    titleEl.textContent = item.title || ' ';

    const subEl = document.createElement('div');
    subEl.style.cssText =
      'font-weight:600;overflow-wrap:anywhere;word-break:break-word;margin:0;padding:0;';
    subEl.textContent = `${typeName} · فتح ${item.opening}`;

    box.appendChild(titleEl);
    box.appendChild(subEl);

    let descFit: CellFitStyle | null = null;
    for (let s = 0; s < descSteps.length; s++) {
      const fPx = descSteps[s];
      const ratio = Math.max(0, Math.min(1, (fPx - ABSOLUTE_MIN_FONT_PX) / (12 - ABSOLUTE_MIN_FONT_PX)));
      const subPx =
        s === 0
          ? 10.5
          : Math.max(
              ABSOLUTE_MIN_FONT_PX,
              Number((ABSOLUTE_MIN_FONT_PX + ratio * (10.5 - ABSOLUTE_MIN_FONT_PX)).toFixed(2))
            );
      const mainLH = s === 0 ? 1.3 : Number((1.08 + ratio * (1.3 - 1.08)).toFixed(2));
      const subLH = s === 0 ? 1.22 : Number((1.06 + ratio * (1.22 - 1.06)).toFixed(2));
      const gapPx = fPx <= 8 ? 0 : fPx <= 10.5 ? 1 : 1.5;

      titleEl.style.fontSize = `${fPx}px`;
      titleEl.style.lineHeight = String(mainLH);
      subEl.style.fontSize = `${subPx}px`;
      subEl.style.lineHeight = String(subLH);
      subEl.style.marginTop = `${gapPx}px`;

      if (box.scrollHeight <= safeCellHeightPx && box.scrollWidth <= DESC_BOX_WIDTH_PX + 1) {
        const unreadable = fPx < READABILITY_WARNING_FONT_PX;
        descFit = {
          fontSizePx: fPx,
          secondaryFontSizePx: subPx,
          lineHeight: mainLH,
          secondaryLineHeight: subLH,
          gapPx,
          isShrunk: s > 0,
          overflowed: false,
          unreadable
        };
        if (unreadable) {
          warnings.push({
            id: `item-${item.id}-desc-tiny`,
            label: `البند رقم ${itemNumStr} (بيان البند والموقع)`,
            reason: 'tiny-font'
          });
        }
        break;
      }
    }

    if (!descFit) {
      descFit = {
        fontSizePx: ABSOLUTE_MIN_FONT_PX,
        secondaryFontSizePx: ABSOLUTE_MIN_FONT_PX,
        lineHeight: 1.08,
        secondaryLineHeight: 1.06,
        gapPx: 0,
        isShrunk: true,
        overflowed: true,
        unreadable: true
      };
      warnings.push({
        id: `item-${item.id}-desc`,
        label: `البند رقم ${itemNumStr} (بيان البند والموقع)`,
        reason: 'overflow'
      });
    }

    // 2. Measure Profile & Glass Details inside fixed cell budget
    box.innerHTML = '';
    box.style.cssText = `width:${PROFILE_BOX_WIDTH_PX}px;box-sizing:border-box;direction:rtl;text-align:right;`;

    const profEl = document.createElement('div');
    profEl.style.cssText = 'font-weight:800;overflow-wrap:anywhere;word-break:break-word;margin:0;padding:0;';
    profEl.textContent = profiles[item.profile]?.name || item.profile;

    const glassEl = document.createElement('div');
    glassEl.style.cssText = 'font-weight:400;overflow-wrap:anywhere;word-break:break-word;margin:0;padding:0;';
    glassEl.textContent =
      item.innerType === 'panel'
        ? 'بنل بالكامل'
        : item.innerType === 'panel_glass'
        ? `بنل + ${item.glassType}`
        : item.glassType;

    box.appendChild(profEl);
    box.appendChild(glassEl);

    let hingeEl: HTMLDivElement | null = null;
    if (item.opening === 'مفصلي') {
      hingeEl = document.createElement('div');
      hingeEl.style.cssText = 'font-weight:600;overflow-wrap:anywhere;word-break:break-word;margin:0;padding:0;';
      hingeEl.textContent = item.hingePanes || 'ضلفة';
      box.appendChild(hingeEl);
    }

    let profileFit: CellFitStyle | null = null;
    for (let s = 0; s < profileSteps.length; s++) {
      const fPx = profileSteps[s];
      const ratio = Math.max(0, Math.min(1, (fPx - ABSOLUTE_MIN_FONT_PX) / (11 - ABSOLUTE_MIN_FONT_PX)));
      const subPx =
        s === 0
          ? 10
          : Math.max(
              ABSOLUTE_MIN_FONT_PX,
              Number((ABSOLUTE_MIN_FONT_PX + ratio * (10 - ABSOLUTE_MIN_FONT_PX)).toFixed(2))
            );
      const mainLH = s === 0 ? 1.32 : Number((1.08 + ratio * (1.32 - 1.08)).toFixed(2));
      const subLH = s === 0 ? 1.25 : Number((1.06 + ratio * (1.25 - 1.06)).toFixed(2));
      const gapPx = fPx <= 8 ? 0 : fPx <= 10.25 ? 1 : 2;

      profEl.style.fontSize = `${fPx}px`;
      profEl.style.lineHeight = String(mainLH);
      glassEl.style.fontSize = `${subPx}px`;
      glassEl.style.lineHeight = String(subLH);
      glassEl.style.marginTop = `${gapPx}px`;
      if (hingeEl) {
        hingeEl.style.fontSize = `${subPx}px`;
        hingeEl.style.lineHeight = String(subLH);
      }

      if (box.scrollHeight <= safeCellHeightPx && box.scrollWidth <= PROFILE_BOX_WIDTH_PX + 1) {
        const unreadable = fPx < READABILITY_WARNING_FONT_PX;
        profileFit = {
          fontSizePx: fPx,
          secondaryFontSizePx: subPx,
          lineHeight: mainLH,
          secondaryLineHeight: subLH,
          gapPx,
          isShrunk: s > 0,
          overflowed: false,
          unreadable
        };
        if (unreadable) {
          warnings.push({
            id: `item-${item.id}-profile-tiny`,
            label: `البند رقم ${itemNumStr} (القطاع والزجاج)`,
            reason: 'tiny-font'
          });
        }
        break;
      }
    }

    if (!profileFit) {
      profileFit = {
        fontSizePx: ABSOLUTE_MIN_FONT_PX,
        secondaryFontSizePx: ABSOLUTE_MIN_FONT_PX,
        lineHeight: 1.08,
        secondaryLineHeight: 1.06,
        gapPx: 0,
        isShrunk: true,
        overflowed: true,
        unreadable: true
      };
      warnings.push({
        id: `item-${item.id}-profile`,
        label: `البند رقم ${itemNumStr} (القطاع والزجاج)`,
        reason: 'overflow'
      });
    }

    // 3. Measure Addons Details inside fixed cell budget
    let addonsFit: CellFitStyle = DEFAULT_ADDONS_FIT;
    if (item.addons.length > 0) {
      box.innerHTML = '';
      box.style.cssText = `width:${ADDONS_BOX_WIDTH_PX}px;box-sizing:border-box;direction:rtl;text-align:right;display:flex;flex-direction:column;`;

      const addonNodes = item.addons.map(addonId => {
        const lineEl = document.createElement('div');
        lineEl.style.cssText = 'font-weight:700;overflow-wrap:anywhere;word-break:break-word;margin:0;padding:0;';
        lineEl.textContent = `· ${addons[addonId]?.name || addonId}`;
        box.appendChild(lineEl);
        return lineEl;
      });

      let resolvedAddonsFit: CellFitStyle | null = null;
      for (let s = 0; s < addonSteps.length; s++) {
        const fPx = addonSteps[s];
        const ratio = Math.max(0, Math.min(1, (fPx - ABSOLUTE_MIN_FONT_PX) / (10.5 - ABSOLUTE_MIN_FONT_PX)));
        const lh = s === 0 ? 1.32 : Number((1.08 + ratio * (1.32 - 1.08)).toFixed(2));
        const gapPx = fPx <= 8.5 ? 0 : fPx < 10 ? 0.5 : 2;

        box.style.gap = `${gapPx}px`;
        addonNodes.forEach(node => {
          node.style.fontSize = `${fPx}px`;
          node.style.lineHeight = String(lh);
        });

        if (box.scrollHeight <= safeCellHeightPx && box.scrollWidth <= ADDONS_BOX_WIDTH_PX + 1) {
          const unreadable = fPx < READABILITY_WARNING_FONT_PX;
          resolvedAddonsFit = {
            fontSizePx: fPx,
            secondaryFontSizePx: fPx,
            lineHeight: lh,
            secondaryLineHeight: lh,
            gapPx,
            isShrunk: s > 0,
            overflowed: false,
            unreadable
          };
          if (unreadable) {
            warnings.push({
              id: `item-${item.id}-addons-tiny`,
              label: `البند رقم ${itemNumStr} (الإضافات)`,
              reason: 'tiny-font'
            });
          }
          break;
        }
      }

      if (!resolvedAddonsFit) {
        resolvedAddonsFit = {
          fontSizePx: ABSOLUTE_MIN_FONT_PX,
          secondaryFontSizePx: ABSOLUTE_MIN_FONT_PX,
          lineHeight: 1.08,
          secondaryLineHeight: 1.08,
          gapPx: 0,
          isShrunk: true,
          overflowed: true,
          unreadable: true
        };
        warnings.push({
          id: `item-${item.id}-addons`,
          label: `البند رقم ${itemNumStr} (الإضافات)`,
          reason: 'overflow'
        });
      }
      addonsFit = resolvedAddonsFit;
    }

    itemFits[item.id] = {
      description: descFit,
      profileGlass: profileFit,
      addons: addonsFit,
      rowOverflowed: descFit.overflowed || profileFit.overflowed || addonsFit.overflowed
    };
  });

  // 4. Measure Special Notes & Additional Notes inside 696px width & exact final-page budget
  let primaryNoteFit: NoteFitStyle = DEFAULT_NOTE_FIT;
  const additionalNoteFits: Record<string, NoteFitStyle> = {};

  if (totalActiveNotes > 0) {
    const finalPageMetrics = getPageLayoutMetrics({
      pageIdx: Math.max(0, totalPages - 1),
      totalPages,
      pageItemCount: lastPageItemCount,
      totalActiveNotes
    });
    const dividersPx = Math.max(0, totalActiveNotes - 1) * 10;
    const perNoteBudgetPx = Math.max(
      18,
      Math.floor((finalPageMetrics.notesContentMaxHeightPx - dividersPx) / totalActiveNotes)
    );

    const measureSingleNote = (text: string, amount: number, warningId: string, warningLabel: string): NoteFitStyle => {
      box.innerHTML = '';
      box.style.cssText = [
        `width:${NOTES_BOX_WIDTH_PX}px`,
        'box-sizing:border-box',
        'direction:rtl',
        'text-align:right',
        'font-weight:600',
        'white-space:pre-wrap',
        'overflow-wrap:anywhere',
        'word-break:break-word'
      ].join(';');

      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      box.appendChild(textSpan);

      if (amount !== 0) {
        const badgeSpan = document.createElement('span');
        badgeSpan.style.cssText = 'margin-right:8px;font-weight:800;';
        badgeSpan.textContent = `(${amount > 0 ? 'إضافة: ' : 'خصم: '}${formatCurrency(Math.abs(amount))})`;
        box.appendChild(badgeSpan);
      }

      for (let s = 0; s < noteSteps.length; s++) {
        const fPx = noteSteps[s];
        const ratio = Math.max(0, Math.min(1, (fPx - ABSOLUTE_MIN_FONT_PX) / (12 - ABSOLUTE_MIN_FONT_PX)));
        const lh = s === 0 ? 1.55 : Number((1.12 + ratio * (1.55 - 1.12)).toFixed(2));

        box.style.fontSize = `${fPx}px`;
        box.style.lineHeight = String(lh);

        if (box.scrollHeight <= perNoteBudgetPx && box.scrollWidth <= NOTES_BOX_WIDTH_PX + 1) {
          const unreadable = fPx < READABILITY_WARNING_FONT_PX;
          if (unreadable) {
            warnings.push({ id: `${warningId}-tiny`, label: warningLabel, reason: 'tiny-font' });
          }
          return {
            fontSizePx: fPx,
            lineHeight: lh,
            isShrunk: s > 0,
            overflowed: false,
            unreadable
          };
        }
      }

      warnings.push({ id: warningId, label: warningLabel, reason: 'overflow' });
      return {
        fontSizePx: ABSOLUTE_MIN_FONT_PX,
        lineHeight: 1.12,
        isShrunk: true,
        overflowed: true,
        unreadable: true
      };
    };

    if (notes) {
      primaryNoteFit = measureSingleNote(
        notes,
        notesAmount,
        'primary-note',
        'الملاحظات الخاصة بعرض السعر'
      );
    }

    additionalNotes.forEach((n, idx) => {
      if (!n.text) return;
      const key = String(n.id || idx);
      additionalNoteFits[key] = measureSingleNote(
        n.text,
        n.amount || 0,
        `additional-note-${key}`,
        `ملاحظة إضافية رقم ${idx + 2}`
      );
    });
  }

  box.innerHTML = '';
  return {
    itemFits,
    primaryNoteFit,
    additionalNoteFits,
    warnings
  };
}

const TRANSPARENT_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const FALLBACK_LOGO_DATA_URL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="136" height="136" viewBox="0 0 136 136">' +
      '<rect width="136" height="136" rx="24" fill="#0F172A"/>' +
      '<rect x="6" y="6" width="124" height="124" rx="20" fill="none" stroke="#FACC15" stroke-width="4"/>' +
      '<text x="68" y="66" text-anchor="middle" fill="#FACC15" font-family="Arial, sans-serif" font-weight="900" font-size="38">MH</text>' +
      '<text x="68" y="100" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-weight="700" font-size="16">Al-Mekawy</text>' +
      '</svg>'
  );

let cachedSafeLogoPromise: Promise<string> | null = null;

/**
 * Decodes the brand logo once and converts it into a compact, genuine data:image/jpeg URI.
 * Fixes MIME mismatch (JPEG bytes inside a .png filename) and reduces 880KB base64 bloat to ~14KB
 * so SVG <foreignObject> serialization stays well below browser data-URL limits.
 */
function getSafeLogoDataUrl(): Promise<string> {
  if (cachedSafeLogoPromise) return cachedSafeLogoPromise;

  cachedSafeLogoPromise = new Promise<string>(resolve => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(FALLBACK_LOGO_DATA_URL);
      return;
    }

    let settled = false;
    const finish = (val: string) => {
      if (!settled) {
        settled = true;
        resolve(val);
      }
    };

    const timer = window.setTimeout(() => finish(FALLBACK_LOGO_DATA_URL), 4000);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const maxDim = 240;
        const natW = img.naturalWidth || 240;
        const natH = img.naturalHeight || 240;
        const scale = Math.min(1, maxDim / Math.max(natW, natH));
        const targetW = Math.max(1, Math.round(natW * scale));
        const targetH = Math.max(1, Math.round(natH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(FALLBACK_LOGO_DATA_URL);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        finish(dataUrl && dataUrl.startsWith('data:image/') ? dataUrl : FALLBACK_LOGO_DATA_URL);
      } catch {
        finish(FALLBACK_LOGO_DATA_URL);
      }
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish(FALLBACK_LOGO_DATA_URL);
    };
    img.src = logoUrl;
  });

  return cachedSafeLogoPromise;
}

let cachedFontCssPromise: Promise<string> | null = null;

/**
 * Fetches and deduplicates only Arabic & Latin webfont subsets once per session.
 * Avoids embedding 35 redundant variable-font blocks (~1.8MB) on every page export.
 */
function getCompactFontEmbedCss(): Promise<string> {
  if (cachedFontCssPromise) return cachedFontCssPromise;

  cachedFontCssPromise = (async () => {
    if (typeof document === 'undefined' || typeof fetch === 'undefined') return '';
    try {
      const fontLinks = Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      )
        .map(l => l.href)
        .filter(href => href && href.includes('fonts.googleapis.com'));

      if (fontLinks.length === 0) return '';

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);
      let combinedCss = '';
      try {
        const responses = await Promise.all(
          fontLinks.map(href => fetch(href, { signal: controller.signal }).then(r => (r.ok ? r.text() : '')))
        );
        combinedCss = responses.join('\n');
      } finally {
        window.clearTimeout(timeoutId);
      }

      if (!combinedCss) return '';

      // Keep only @font-face blocks needed for Arabic & Basic Latin rendering
      const blockRegex = /(?:\/\*\s*([a-z-]+)\s*\*\/\s*)?@font-face\s*\{[^}]+\}/gi;
      const keptBlocks: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = blockRegex.exec(combinedCss)) !== null) {
        const subsetComment = (match[1] || '').toLowerCase();
        if (
          !subsetComment ||
          subsetComment === 'arabic' ||
          subsetComment === 'latin'
        ) {
          keptBlocks.push(match[0]);
        }
      }

      if (keptBlocks.length === 0) return '';

      const urlRegex = /url\((['"]?)(https:\/\/[^)'"]+)\1\)/gi;
      const uniqueUrls = new Set<string>();
      for (const block of keptBlocks) {
        let uMatch: RegExpExecArray | null;
        urlRegex.lastIndex = 0;
        while ((uMatch = urlRegex.exec(block)) !== null) {
          uniqueUrls.add(uMatch[2]);
        }
      }

      const urlToDataMap = new Map<string, string>();
      await Promise.all(
        Array.from(uniqueUrls).map(async fontUrl => {
          try {
            const res = await fetch(fontUrl);
            if (!res.ok) return;
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
            }
            const mime = fontUrl.includes('.woff2') ? 'font/woff2' : 'font/truetype';
            urlToDataMap.set(fontUrl, `data:${mime};base64,${window.btoa(binary)}`);
          } catch {
            // Ignore individual font subset fetch failures
          }
        })
      );

      return keptBlocks
        .map(block =>
          block.replace(urlRegex, (full, _quote, fontUrl) => {
            const inlined = urlToDataMap.get(fontUrl);
            return inlined ? `url("${inlined}")` : full;
          })
        )
        .filter(block => !/url\(['"]?https?:\/\//i.test(block))
        .join('\n');
    } catch {
      return '';
    }
  })();

  return cachedFontCssPromise;
}

function utf8SvgToBase64DataUrl(svgXml: string): string {
  const bytes = new TextEncoder().encode(svgXml);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return `data:image/svg+xml;base64,${window.btoa(binary)}`;
}

function loadImageElement(src: string, timeoutMs = 8000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let done = false;
    const timer = window.setTimeout(() => {
      if (!done) {
        done = true;
        reject(new Error('Image decode timed out during PDF export'));
      }
    }, timeoutMs);

    img.onload = async () => {
      if (done) return;
      window.clearTimeout(timer);
      try {
        if (typeof img.decode === 'function') {
          await img.decode();
        }
      } catch {
        // onload already succeeded; safe to draw onto canvas
      }
      done = true;
      resolve(img);
    };

    img.onerror = () => {
      if (done) return;
      window.clearTimeout(timer);
      done = true;
      reject(new Error('SVG foreignObject image failed to load'));
    };

    img.src = src;
  });
}

async function renderSvgDataUriToJpeg(
  svgDataUri: string,
  elW: number,
  elH: number,
  pixelRatio: number
): Promise<string> {
  const commaIdx = svgDataUri.indexOf(',');
  const rawEncoded = commaIdx >= 0 ? svgDataUri.slice(commaIdx + 1) : svgDataUri;
  const decodedSvg = svgDataUri.includes(';base64,')
    ? new TextDecoder().decode(Uint8Array.from(window.atob(rawEncoded), c => c.charCodeAt(0)))
    : decodeURIComponent(rawEncoded);

  // Strip illegal XML 1.0 control chars, externalResourcesRequired, and any non-data external URLs
  const cleanSvg = decodedSvg
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/\s*externalResourcesRequired="true"/gi, '')
    .replace(
      /url\((['"]?)(?:https?:|chrome-extension:|moz-extension:|safari-extension:)[^)'"]*\1\)/gi,
      'none'
    );

  const drawToJpeg = (img: HTMLImageElement): string => {
    const maxCanvasSide = 4096;
    const effectiveRatio = Math.min(
      pixelRatio,
      maxCanvasSide / Math.max(1, elW),
      maxCanvasSide / Math.max(1, elH)
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(elW * effectiveRatio));
    canvas.height = Math.max(1, Math.round(elH * effectiveRatio));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D canvas context unavailable');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Prefer base64 data URI when under Chromium's 2MB GURL limit (avoids WebKit blob taint);
  // automatically fall back to Blob URL when larger.
  const base64Url = utf8SvgToBase64DataUrl(cleanSvg);
  if (base64Url.length < 1_900_000) {
    try {
      const img = await loadImageElement(base64Url);
      return drawToJpeg(img);
    } catch {
      // Fall through to Blob URL loader
    }
  }

  const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);
  try {
    const img = await loadImageElement(blobUrl);
    return drawToJpeg(img);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * Normalizes Tailwind CSS v4 modern color functions (oklch, oklab, color-mix) to rgba()
 * inside a cloned html2canvas document so html2canvas v1.4 never fails parsing stylesheets.
 */
function normalizeModernColorsForHtml2Canvas(clonedDoc: Document, clonedPageEl: HTMLElement) {
  let curr: HTMLElement | null = clonedPageEl;
  while (curr && curr !== clonedDoc.body) {
    curr.style.overflow = 'visible';
    curr.style.opacity = '1';
    curr.style.visibility = 'visible';
    if (curr !== clonedPageEl) {
      curr.style.width = 'auto';
      curr.style.height = 'auto';
      curr.style.position = 'static';
    }
    curr = curr.parentElement;
  }

  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = 1;
  probeCanvas.height = 1;
  const ctx = probeCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const cache = new Map<string, string>();
  const toRgba = (expr: string): string => {
    const hit = cache.get(expr);
    if (hit) return hit;
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000000';
      ctx.fillStyle = expr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      const resolved =
        a === 255
          ? `rgb(${r}, ${g}, ${b})`
          : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
      cache.set(expr, resolved);
      return resolved;
    } catch {
      return '#0f172a';
    }
  };

  const modernColorRegex = /(?:oklch|oklab|lch|lab|color-mix|color)\([^;{}!]+\)/gi;
  clonedDoc.querySelectorAll('style').forEach(styleEl => {
    const txt = styleEl.textContent;
    if (txt && modernColorRegex.test(txt)) {
      modernColorRegex.lastIndex = 0;
      styleEl.textContent = txt.replace(modernColorRegex, match => toRgba(match));
    }
  });
}

function formatErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'type' in err) {
    return `DOM Event (${String((err as Event).type)})`;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function MiniItemPreview({ item }: { item: CalculatedItem }) {
  const width = item.width || 100;
  const height = item.height || 100;
  const aspect = width / height;
  const clampedAspect = Math.max(0.5, Math.min(2.0, aspect));

  let svgWidth = 42;
  let svgHeight = 42;
  if (clampedAspect > 1) {
    svgHeight = Math.round(42 / clampedAspect);
    svgWidth = 42;
  } else {
    svgWidth = Math.round(42 * clampedAspect);
    svgHeight = 42;
  }

  const isDoor = item.itemType === 'door';
  const opening = item.opening;
  const innerType = item.innerType || 'glass';
  const hasSpecialColor = item.addons.includes('specialColor');

  const frameOuterColor = hasSpecialColor ? '#334155' : '#E2E8F0';
  const frameInnerColor = hasSpecialColor ? '#1E293B' : '#F1F5F9';
  const frameStrokeColor = hasSpecialColor ? '#0F172A' : '#94A3B8';

  let glassFill = 'rgba(224, 242, 254, 0.4)';
  switch (item.glassType) {
    case 'أبيض شفاف':
      glassFill = 'rgba(186, 230, 253, 0.35)';
      break;
    case 'مصنفر':
      glassFill = 'rgba(241, 245, 249, 0.75)';
      break;
    case 'بني عاكس':
      glassFill = 'rgba(180, 83, 9, 0.4)';
      break;
    case 'أبيض عاكس':
      glassFill = 'rgba(226, 232, 240, 0.6)';
      break;
    case 'بني سن دبوس':
      glassFill = 'rgba(120, 53, 4, 0.45)';
      break;
    case 'أزرق عاكس':
      glassFill = 'rgba(29, 78, 216, 0.4)';
      break;
    case 'أخضر عاكس':
      glassFill = 'rgba(4, 120, 87, 0.4)';
      break;
    case 'أسود عاكس':
      glassFill = 'rgba(15, 23, 42, 0.7)';
      break;
    case 'مع جورجيا':
      glassFill = 'rgba(186, 230, 253, 0.35)';
      break;
    default:
      glassFill = 'rgba(186, 230, 253, 0.3)';
  }

  const pSize = 2.8;
  const margin = 1.5;
  const drawW = svgWidth - margin * 2;
  const drawH = svgHeight - margin * 2;

  const renderContent = () => {
    const paneX = margin + pSize;
    const paneY = margin + pSize;
    const paneW = drawW - pSize * 2;
    const paneH = drawH - pSize * 2;

    const isDoubleSash =
      opening === 'جرار' ||
      (opening === 'مفصلي' &&
        (item.hingePanes === 'ضلفتين' ||
          item.addons.includes('skewWindow2') ||
          item.addons.includes('skewBalcony2')));

    if (isDoor) {
      if (innerType === 'panel') {
        if (isDoubleSash) {
          const midX = paneX + paneW / 2;
          return (
            <g>
              <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 6 }).map((_, i) => {
                const ly = paneY + (paneH / 7) * (i + 1);
                return <line key={i} x1={paneX + 1} y1={ly} x2={midX - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}
              <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 6 }).map((_, i) => {
                const ly = paneY + (paneH / 7) * (i + 1);
                return <line key={i} x1={midX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}
            </g>
          );
        }
        return (
          <g>
            <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
            {Array.from({ length: 6 }).map((_, i) => {
              const ly = paneY + (paneH / 7) * (i + 1);
              return <line key={i} x1={paneX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
            })}
          </g>
        );
      } else if (innerType === 'panel_glass') {
        const splitY = paneY + paneH * 0.45;
        if (isDoubleSash) {
          const midX = paneX + paneW / 2;
          return (
            <g>
              <rect x={paneX} y={paneY} width={paneW / 2} height={splitY - paneY} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <path d={`M ${paneX + 1} ${paneY + 1} L ${midX - 1} ${paneY + 1} L ${paneX + 1} ${splitY - 1} Z`} fill="rgba(255,255,255,0.15)" />
              <rect x={paneX - 0.5} y={splitY} width={paneW / 2 + 0.5} height="2.5" fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <rect x={paneX} y={splitY + 2.5} width={paneW / 2} height={paneH - (splitY - paneY) - 2.5} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              <rect x={midX} y={paneY} width={paneW / 2} height={splitY - paneY} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <rect x={midX} y={splitY} width={paneW / 2 + 0.5} height="2.5" fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <rect x={midX} y={splitY + 2.5} width={paneW / 2} height={paneH - (splitY - paneY) - 2.5} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
            </g>
          );
        }
        return (
          <g>
            <rect x={paneX} y={paneY} width={paneW} height={splitY - paneY} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
            <path d={`M ${paneX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${paneX + 1} ${splitY - 1} Z`} fill="rgba(255,255,255,0.15)" />
            <rect x={paneX - 0.5} y={splitY} width={paneW + 1} height="2.5" fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="0.5" />
            <rect x={paneX} y={splitY + 2.5} width={paneW} height={paneH - (splitY - paneY) - 2.5} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
          </g>
        );
      } else {
        if (isDoubleSash) {
          const midX = paneX + paneW / 2;
          return (
            <g>
              <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
            </g>
          );
        }
        return (
          <g>
            <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
            <path d={`M ${paneX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${paneX + 1} ${paneY + paneH - 1} Z`} fill="rgba(255,255,255,0.15)" />
          </g>
        );
      }
    }

    if (innerType === 'panel') {
      if (isDoubleSash) {
        const midX = paneX + paneW / 2;
        return (
          <g>
            <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
            <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
          </g>
        );
      }
      return (
        <g>
          <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
        </g>
      );
    }

    if (opening === 'جرار') {
      const midX = paneX + paneW / 2;
      return (
        <g>
          <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
          <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
          <rect x={paneX + 1} y={paneY + 1} width={paneW / 2 - 2} height={paneH - 2} fill="none" stroke={frameInnerColor} strokeWidth="1" />
          <rect x={midX + 1} y={paneY + 1} width={paneW / 2 - 2} height={paneH - 2} fill="none" stroke={frameInnerColor} strokeWidth="1" />
          <path d={`M ${paneX + 2} ${paneY + paneH / 2} L ${paneX + 5} ${paneY + paneH / 2}`} stroke="#475569" strokeWidth="0.5" />
          <path d={`M ${midX + paneW / 2 - 2} ${paneY + paneH / 2} L ${midX + paneW / 2 - 5} ${paneY + paneH / 2}`} stroke="#475569" strokeWidth="0.5" />
          {innerType === 'panel_glass' && (
            <g>
              <rect x={paneX + 0.5} y={paneY + paneH * 0.6} width={paneW / 2 - 1} height={paneH * 0.4} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <rect x={midX + 0.5} y={paneY + paneH * 0.6} width={paneW / 2 - 1} height={paneH * 0.4} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
            </g>
          )}
        </g>
      );
    } else if (opening === 'مفصلي') {
      if (isDoubleSash) {
        const midX = paneX + paneW / 2;
        return (
          <g>
            <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
            <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
            <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
              <polyline points={`${midX - 1},${paneY + 1} ${paneX + 1},${paneY + paneH / 2} ${midX - 1},${paneY + paneH - 1}`} />
              <polyline points={`${midX + 1},${paneY + 1} ${paneX + paneW - 1},${paneY + paneH / 2} ${midX + 1},${paneY + paneH - 1}`} />
            </g>
          </g>
        );
      }
      return (
        <g>
          <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
          <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
            <polyline points={`${paneX + paneW - 1},${paneY + 1} ${paneX + 1},${paneY + paneH / 2} ${paneX + paneW - 1},${paneY + paneH - 1}`} />
          </g>
        </g>
      );
    } else if (opening === 'قلاب') {
      return (
        <g>
          <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
          <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
            <polyline points={`${paneX + 1},${paneY + paneH - 1} ${paneX + paneW / 2},${paneY + 1} ${paneX + paneW - 1},${paneY + paneH - 1}`} />
          </g>
        </g>
      );
    }

    return (
      <g>
        <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
        <path d={`M ${paneX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${paneX + 1} ${paneY + paneH - 1} Z`} fill="rgba(255,255,255,0.15)" />
      </g>
    );
  };

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="mx-auto block max-w-full max-h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={margin} y={margin} width={drawW} height={drawH} fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="1" rx="1.5" />
      {renderContent()}
    </svg>
  );
}

export default function DetailedQuoteView({
  customer,
  calculations,
  formatCurrency,
  profiles,
  addons,
  onBack
}: Props) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isWhatsAppPickerOpen, setIsWhatsAppPickerOpen] = React.useState(false);
  const [customWaPhone, setCustomWaPhone] = React.useState('');
  const [preparedPdf, setPreparedPdf] = React.useState<{
    file: File;
    blobUrl: string;
    fileName: string;
  } | null>(null);
  const [copiedSummary, setCopiedSummary] = React.useState(false);
  const [shareFeedback, setShareFeedback] = React.useState<string | null>(null);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const [safeLogoSrc, setSafeLogoSrc] = React.useState<string>(logoUrl);

  React.useEffect(() => {
    let active = true;
    getSafeLogoDataUrl().then(dataUrl => {
      if (active && dataUrl) {
        setSafeLogoSrc(dataUrl);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const [currentPage, setCurrentPage] = React.useState(0);

  const stageContainerRef = React.useRef<HTMLDivElement>(null);
  const exportContainerRef = React.useRef<HTMLDivElement>(null);
  const pageRefs = React.useRef<Record<number, HTMLElement | null>>({});

  const [scaleRatio, setScaleRatio] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const initW = Math.max(200, document.documentElement?.clientWidth || window.innerWidth);
    return initW / BASE_PAGE_WIDTH;
  });

  const [pageHeights, setPageHeights] = React.useState<Record<number, number>>({});

  // Split items into pages of exactly up to 10 items per page
  const itemPages = React.useMemo(() => {
    const allItems = calculations.itemsCalculated;
    if (allItems.length === 0) return [[]];
    const chunks: CalculatedItem[][] = [];
    for (let i = 0; i < allItems.length; i += ITEMS_PER_PAGE) {
      chunks.push(allItems.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks;
  }, [calculations.itemsCalculated]);

  const totalPages = itemPages.length;
  const lastPageItemCount = itemPages[itemPages.length - 1]?.length || 0;

  const {
    discountType = 'cash',
    discountValue = 0,
    notesAmount = 0,
    notes = '',
    additionalNotes = []
  } = customer;

  // Smart Real-DOM Auto-Fit state (identical across Screen Preview, Print & PDF Export)
  const computeCurrentAutoFit = React.useCallback((): QuoteAutoFitResult => {
    return measureQuoteAutoFit({
      items: calculations.itemsCalculated,
      notes,
      notesAmount,
      additionalNotes,
      profiles,
      addons,
      totalPages,
      lastPageItemCount,
      formatCurrency
    });
  }, [
    calculations.itemsCalculated,
    notes,
    notesAmount,
    additionalNotes,
    profiles,
    addons,
    totalPages,
    lastPageItemCount,
    formatCurrency
  ]);

  const [autoFit, setAutoFit] = React.useState<QuoteAutoFitResult>(() => computeCurrentAutoFit());

  React.useLayoutEffect(() => {
    setAutoFit(computeCurrentAutoFit());
  }, [computeCurrentAutoFit]);

  React.useEffect(() => {
    let active = true;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) {
          setAutoFit(computeCurrentAutoFit());
        }
      });
    }
    return () => {
      active = false;
    };
  }, [computeCurrentAutoFit]);

  React.useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const measureAndComputeScale = React.useCallback(() => {
    const stageEl = stageContainerRef.current;
    if (!stageEl || stageEl.clientWidth === 0) return;

    const computed = window.getComputedStyle(stageEl);
    const padLeft = parseFloat(computed.paddingLeft) || 0;
    const padRight = parseFloat(computed.paddingRight) || 0;
    const availW = Math.max(200, Math.floor(stageEl.clientWidth - padLeft - padRight));

    // Measure natural unscaled heights of mounted page articles
    const measuredHeights: Record<number, number> = {};
    (Object.entries(pageRefs.current) as [string, HTMLElement | null][]).forEach(([idxStr, el]) => {
      if (el && el.offsetHeight > 0) {
        measuredHeights[Number(idxStr)] = Math.max(A4_MIN_HEIGHT, el.offsetHeight);
      }
    });

    setPageHeights(prev => {
      let changed = false;
      for (const k of Object.keys(measuredHeights)) {
        const numK = Number(k);
        if (prev[numK] !== measuredHeights[numK]) {
          changed = true;
          break;
        }
      }
      return changed ? { ...prev, ...measuredHeights } : prev;
    });

    // Always scale page width to match full available screen/stage width
    const nextScale = availW / BASE_PAGE_WIDTH;
    setScaleRatio(nextScale);
  }, [currentPage]);

  React.useLayoutEffect(() => {
    measureAndComputeScale();

    const resizeObserver = new ResizeObserver(() => {
      measureAndComputeScale();
    });

    if (stageContainerRef.current) {
      resizeObserver.observe(stageContainerRef.current);
    }
    (Object.values(pageRefs.current) as (HTMLElement | null)[]).forEach(el => {
      if (el) resizeObserver.observe(el);
    });

    const handleViewportChange = () => {
      requestAnimationFrame(measureAndComputeScale);
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    window.visualViewport?.addEventListener('resize', handleViewportChange);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
    };
  }, [measureAndComputeScale, calculations, customer, totalPages, autoFit]);

  const quoteNumber = React.useMemo(() => {
    const today = new Date();
    const random = Math.floor(100 + Math.random() * 900);
    return `MH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-${random}`;
  }, []);

  const discountAmount = React.useMemo(() => {
    const amount =
      discountType === 'percentage'
        ? (calculations.totalPrice * discountValue) / 100
        : discountValue;
    return amount > calculations.totalPrice ? calculations.totalPrice : amount;
  }, [calculations.totalPrice, discountType, discountValue]);

  const totalNotesAmount = React.useMemo(() => {
    return notesAmount + additionalNotes.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [notesAmount, additionalNotes]);

  const finalPrice = React.useMemo(() => {
    return Math.max(0, calculations.totalPrice - discountAmount + totalNotesAmount);
  }, [calculations.totalPrice, discountAmount, totalNotesAmount]);

  const shareSummaryText = React.useMemo(() => {
    const todayStr = customer.date || new Date().toISOString().split('T')[0];
    const clientName = (customer.name || 'عميل مكاوي هوم الموقر').trim();
    const clientPhone = (customer.phone || 'غير محدد').trim();
    const clientAddress = (customer.address || 'بناءً على مقاسات العميل').trim();
    const deliveryStr = customer.deliveryDate ? `تاريخ التوريد المتوقع: ${customer.deliveryDate}\n` : '';

    const itemsText = calculations.itemsCalculated
      .map((item, idx) => {
        const typeLabel = item.itemType === 'door' ? 'باب' : item.itemType === 'balcony' ? 'بلكونة' : 'شباك';
        const qty = item.quantity || 1;
        const addonsList = item.addons.map(addonId => addons[addonId]?.name || addonId).join('، ');
        const addonsStr = addonsList ? ` (إضافات: ${addonsList})` : '';
        return `[${idx + 1}] ${item.title} (${typeLabel})\nالمقاس: ${item.width} × ${item.height} سم | المساحة: ${item.area.toFixed(2)} م²\nالقطاع: ${profiles[item.profile]?.name || item.profile} | ${item.glassType}${addonsStr}\nالعدد: ${qty} | الإجمالي: ${formatCurrency(item.itemTotal)}`;
      })
      .join('\n\n');

    const discountStr = discountValue > 0 ? `الخصم: - ${formatCurrency(discountAmount)}\n` : '';
    const notesStr =
      totalNotesAmount !== 0
        ? `تسويات وملاحظات إضافية: ${totalNotesAmount > 0 ? '+' : ''}${formatCurrency(totalNotesAmount)}\n`
        : '';

    return `السلام عليكم ورحمة الله وبركاته،
عرض سعر تفصيلي من المكاوي هوم (Al-Mekawy Home)
رقم العرض: ${quoteNumber}

بيانات العميل:
الاسم: ${clientName}
رقم الهاتف: ${clientPhone}
موقع التركيب: ${clientAddress}
تاريخ العرض: ${todayStr}
${deliveryStr}
تفاصيل البنود:
${itemsText}

الملخص المالي:
إجمالي المساحة: ${calculations.totalArea.toFixed(2)} م²
القيمة الكلية: ${formatCurrency(calculations.totalPrice)}
${discountStr}${notesStr}صافي القيمة النهائية: ${formatCurrency(finalPrice)}

المكاوي هوم لأعمال وتوريدات الـ UPVC`;
  }, [
    customer,
    calculations,
    profiles,
    addons,
    quoteNumber,
    discountValue,
    discountAmount,
    totalNotesAmount,
    finalPrice,
    formatCurrency
  ]);

  const toWhatsAppPhone = React.useCallback((raw: string): string => {
    if (!raw) return '';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let normalized = raw.trim();
    for (let i = 0; i < 10; i++) {
      normalized = normalized
        .replaceAll(arabicDigits[i], String(i))
        .replaceAll(persianDigits[i], String(i));
    }
    let digits = normalized.replace(/\D/g, '');
    if (digits.startsWith('00')) {
      digits = digits.slice(2);
    }
    if (digits.startsWith('01') && digits.length === 11) {
      return `2${digits}`;
    }
    if (
      digits.length === 10 &&
      (digits.startsWith('10') ||
        digits.startsWith('11') ||
        digits.startsWith('12') ||
        digits.startsWith('15'))
    ) {
      return `20${digits}`;
    }
    return digits;
  }, []);

  const whatsAppTargets = React.useMemo(() => {
    const base = [
      {
        id: 'main',
        label: 'الفرع الرئيسي والمبيعات',
        phoneDisplay: '01141761261',
        waPhone: '201141761261',
        badge: 'الرقم الأول'
      },
      {
        id: 'support',
        label: 'المبيعات والدعم الفني',
        phoneDisplay: '01060524985',
        waPhone: '201060524985',
        badge: 'الرقم الثاني'
      }
    ];

    const customerWa = toWhatsAppPhone(customer.phone || '');
    if (
      customerWa.length >= 10 &&
      customerWa !== '201141761261' &&
      customerWa !== '201060524985'
    ) {
      base.unshift({
        id: 'customer',
        label: customer.name?.trim()
          ? `رقم العميل (${customer.name.trim()})`
          : 'رقم العميل المسجل بالعرض',
        phoneDisplay: (customer.phone || '').trim(),
        waPhone: customerWa,
        badge: 'العميل'
      });
    }

    return base;
  }, [customer.phone, customer.name, toWhatsAppPhone]);

  React.useEffect(() => {
    if (!isShareOpen) {
      setIsWhatsAppPickerOpen(false);
      setCustomWaPhone('');
      setPdfError(null);
      setPreparedPdf(prev => {
        if (prev?.blobUrl) {
          URL.revokeObjectURL(prev.blobUrl);
        }
        return null;
      });
    }
  }, [isShareOpen]);

  // Invalidate cached PDF blob whenever customer details or item calculations change
  React.useEffect(() => {
    setPreparedPdf(prev => {
      if (prev?.blobUrl) {
        URL.revokeObjectURL(prev.blobUrl);
      }
      return null;
    });
  }, [customer, calculations]);

  const capturePageToJpeg = async (
    pageEl: HTMLElement,
    elW: number,
    elH: number,
    fontEmbedCSS: string
  ): Promise<string> => {
    const pixelRatio = 2;
    const includeStyleProperties = [
      'box-sizing',
      'display',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'overflow',
      'overflow-x',
      'overflow-y',
      'flex-direction',
      'flex-wrap',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'align-items',
      'align-self',
      'justify-content',
      'row-gap',
      'column-gap',
      'grid-template-columns',
      'grid-template-rows',
      'table-layout',
      'border-collapse',
      'border-spacing',
      'vertical-align',
      'direction',
      'unicode-bidi',
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'font-variant-numeric',
      'line-height',
      'letter-spacing',
      'text-align',
      'text-transform',
      'text-decoration-line',
      'white-space',
      'word-break',
      'overflow-wrap',
      '-webkit-line-clamp',
      '-webkit-box-orient',
      'color',
      'background-color',
      'opacity',
      'visibility',
      'object-fit',
      'border-top-width',
      'border-right-width',
      'border-bottom-width',
      'border-left-width',
      'border-top-style',
      'border-right-style',
      'border-bottom-style',
      'border-left-style',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
      'fill',
      'fill-opacity',
      'stroke',
      'stroke-width',
      'stroke-dasharray',
      'stroke-linecap',
      'stroke-linejoin'
    ];
    const baseOptions = {
      width: elW,
      height: elH,
      quality: 0.96,
      backgroundColor: '#ffffff',
      pixelRatio,
      cacheBust: false,
      includeStyleProperties,
      imagePlaceholder: TRANSPARENT_PIXEL_PNG,
      onImageErrorHandler: () => true,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        borderRadius: '0px',
        boxShadow: 'none',
        margin: '0px'
      }
    };

    // Stage 1: Native SVG foreignObject with deduplicated Arabic/Latin webfonts
    try {
      const svgUri = await htmlToImage.toSvg(pageEl, {
        ...baseOptions,
        ...(fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true })
      });
      return await renderSvgDataUriToJpeg(svgUri, elW, elH, pixelRatio);
    } catch {
      // Fall through to Stage 2
    }

    // Stage 2: Native SVG foreignObject with skipFonts (zero external stylesheet dependency)
    try {
      const svgUriNoFonts = await htmlToImage.toSvg(pageEl, {
        ...baseOptions,
        skipFonts: true,
        fontEmbedCSS: ''
      });
      return await renderSvgDataUriToJpeg(svgUriNoFonts, elW, elH, pixelRatio);
    } catch {
      // Fall through to Stage 3
    }

    // Stage 3: Direct 2D Canvas Engine fallback via html2canvas (no SVG foreignObject)
    const fallbackCanvas = await html2canvas(pageEl, {
      scale: pixelRatio,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: elW,
      height: elH,
      windowWidth: BASE_PAGE_WIDTH,
      onclone: (clonedDoc, clonedEl) => {
        normalizeModernColorsForHtml2Canvas(clonedDoc, clonedEl);
      }
    });
    return fallbackCanvas.toDataURL('image/jpeg', 0.95);
  };

  const generatePdfInstance = async (): Promise<jspdf | null> => {
    setPdfError(null);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise<void>(resolve => setTimeout(resolve, 800))
      ]);
    }

    // Ensure auto-fit metrics are freshly measured with active webfonts prior to mounting export pages
    setAutoFit(computeCurrentAutoFit());

    const resolvedLogoDataUrl = await getSafeLogoDataUrl();
    if (resolvedLogoDataUrl && resolvedLogoDataUrl !== safeLogoSrc) {
      setSafeLogoSrc(resolvedLogoDataUrl);
    }

    setIsExporting(true);
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => resolve(), 90);
        });
      });
    });

    try {
      const container = exportContainerRef.current;
      if (!container) {
        setPdfError('تعذر الوصول إلى قالب التصدير، يرجى المحاولة مرة أخرى.');
        return null;
      }

      // Guarantee every <img> inside export pages uses an inline data: URI before capture
      const imgs: HTMLImageElement[] = Array.from(container.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img: HTMLImageElement) => {
          if (!img.src.startsWith('data:')) {
            img.src = resolvedLogoDataUrl || FALLBACK_LOGO_DATA_URL;
          }
          if (img.complete) return Promise.resolve();
          return new Promise<void>(res => {
            img.onload = () => res();
            img.onerror = () => {
              img.src = FALLBACK_LOGO_DATA_URL;
              res();
            };
          });
        })
      );

      const targets: HTMLElement[] = Array.from(
        container.querySelectorAll<HTMLElement>('.quotation-export-page')
      );
      if (targets.length === 0) {
        setPdfError('لا توجد صفحات متاحة للتصدير حالياً.');
        return null;
      }

      const fontEmbedCSS = await getCompactFontEmbedCss();

      const pdf = new jspdf('p', 'mm', 'a4');
      const pdfPageW = 210;
      const pdfPageH = 297;
      // Canonical 794x1123 page already includes balanced 28px/32px inner white margins (1:1 96-DPI to A4 mm)
      const margin = 0;
      const maxW = pdfPageW - margin * 2;
      const maxH = pdfPageH - margin * 2;

      for (let i = 0; i < targets.length; i++) {
        const pageEl = targets[i];
        const elW = pageEl.offsetWidth || BASE_PAGE_WIDTH;
        const elH = pageEl.offsetHeight || A4_MIN_HEIGHT;

        const imgData = await capturePageToJpeg(pageEl, elW, elH, fontEmbedCSS);

        if (i > 0) {
          pdf.addPage();
        }

        let renderW = maxW;
        let renderH = (elH * maxW) / elW;

        if (renderH <= maxH * 1.15) {
          if (renderH > maxH) {
            const fitRatio = maxH / renderH;
            renderH = maxH;
            renderW = renderW * fitRatio;
          }
          const offsetX = (pdfPageW - renderW) / 2;
          pdf.addImage(imgData, 'JPEG', offsetX, margin, renderW, renderH, undefined, 'FAST');
        } else {
          let heightLeft = renderH;
          let sliceIdx = 0;
          pdf.addImage(imgData, 'JPEG', margin, margin, renderW, renderH, undefined, 'FAST');
          heightLeft -= maxH;
          while (heightLeft > 0) {
            sliceIdx++;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, margin - sliceIdx * maxH, renderW, renderH, undefined, 'FAST');
            heightLeft -= maxH;
          }
        }
      }

      return pdf;
    } catch (err) {
      console.warn('PDF generation failed:', formatErrorMessage(err));
      setPdfError('تعذر تجهيز ملف PDF تلقائياً، يرجى الضغط على إعادة المحاولة.');
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const getPdfFileName = () => {
    const clientNameClean = (customer.name || 'عميل').trim().replace(/\s+/g, '_');
    return `عرض_سعر_المكاوي_${clientNameClean}.pdf`;
  };

  const triggerPdfBlobDownload = (blobUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    const pdf = await generatePdfInstance();
    if (pdf) {
      const fileName = getPdfFileName();
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      triggerPdfBlobDownload(blobUrl, fileName);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    }
  };

  const ensurePreparedPdf = async () => {
    if (preparedPdf) return preparedPdf;
    if (isExporting) return null;
    const pdf = await generatePdfInstance();
    if (!pdf) return null;
    const fileName = getPdfFileName();
    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const nextPrepared = { file, blobUrl, fileName };
    setPreparedPdf(nextPrepared);
    return nextPrepared;
  };

  const whatsAppPdfMessage = React.useMemo(() => {
    const clientNameClean = (customer.name || 'عميل').trim().replace(/\s+/g, '_');
    const fileName = `عرض_سعر_المكاوي_${clientNameClean}.pdf`;
    const clientName = (customer.name || 'عميل مكاوي هوم').trim();
    return `السلام عليكم ورحمة الله وبركاته،
مرفق ملف عرض السعر PDF من المكاوي هوم (Al-Mekawy Home)
رقم العرض: ${quoteNumber}
العميل: ${clientName}
عدد البنود: ${calculations.itemsCalculated.length} | إجمالي المساحة: ${calculations.totalArea.toFixed(2)} م²
صافي القيمة النهائية: ${formatCurrency(finalPrice)}
اسم الملف: ${fileName}`;
  }, [
    customer.name,
    quoteNumber,
    calculations.itemsCalculated.length,
    calculations.totalArea,
    finalPrice,
    formatCurrency
  ]);

  const buildWhatsAppPdfUrl = (waPhone: string) => {
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(whatsAppPdfMessage)}`;
  };

  const handleToggleWhatsAppPdfShare = async () => {
    setShareFeedback(null);
    const nextOpen = !isWhatsAppPickerOpen;
    setIsWhatsAppPickerOpen(nextOpen);
    if (nextOpen && !preparedPdf && !isExporting) {
      await ensurePreparedPdf();
    }
  };

  const handleWhatsAppNumberSelected = (phoneDisplay: string) => {
    if (!preparedPdf) return;
    triggerPdfBlobDownload(preparedPdf.blobUrl, preparedPdf.fileName);
    setShareFeedback(
      `تم تنزيل ملف PDF (${preparedPdf.fileName}) وفتح محادثة واتساب (${phoneDisplay}) — أرفق الملف في المحادثة لإرساله.`
    );
  };

  const handleDirectWhatsAppFileShare = async () => {
    if (!preparedPdf) return;
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare?.({ files: [preparedPdf.file] })
      ) {
        await navigator.share({
          files: [preparedPdf.file],
          title: `عرض سعر المكاوي هوم - ${quoteNumber}`,
          text: whatsAppPdfMessage
        });
        setIsShareOpen(false);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }
  };

  const handleSharePdfFile = async () => {
    if (isExporting) return;
    setShareFeedback(null);
    const ready = await ensurePreparedPdf();
    if (!ready) return;

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare?.({ files: [ready.file] })
      ) {
        await navigator.share({
          files: [ready.file],
          title: `عرض سعر المكاوي هوم - ${quoteNumber}`,
          text: customer.name
            ? `عرض سعر للعميل ${customer.name}`
            : 'عرض سعر تفصيلي من المكاوي هوم'
        });
        setIsShareOpen(false);
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }

    triggerPdfBlobDownload(ready.blobUrl, ready.fileName);
    setShareFeedback('تم تنزيل ملف PDF بنجاح، يمكنك إرفاقه ومشاركته الآن.');
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(shareSummaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      setShareFeedback('تعذر النسخ التلقائي في هذا المتصفح.');
    }
  };

  const totalActiveNotesCount = React.useMemo(() => {
    const extraCount = additionalNotes.filter(n => Boolean(n.text?.trim())).length;
    return (notes?.trim() ? 1 : 0) + extraCount;
  }, [notes, additionalNotes]);

  // Canonical A4 Quotation Page Renderer (Fixed 794x1123px geometry — identical across Mobile, Desktop, Export & Print)
  const renderPageContent = (
    pageItems: CalculatedItem[],
    pageIdx: number,
    mode: 'screen' | 'export' | 'print'
  ) => {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;
    const pageStartNum = pageIdx * ITEMS_PER_PAGE + 1;
    const pageEndNum = pageIdx * ITEMS_PER_PAGE + pageItems.length;
    const pageArea = pageItems.reduce((sum, it) => sum + it.area * (it.quantity || 1), 0);
    const pageSubtotal = pageItems.reduce((sum, it) => sum + it.itemTotal, 0);
    const displayDate = customer.date || new Date().toISOString().split('T')[0];

    const pageMetrics = getPageLayoutMetrics({
      pageIdx,
      totalPages,
      pageItemCount: Math.max(1, pageItems.length),
      totalActiveNotes: totalActiveNotesCount
    });
    const rowBoxStyle: React.CSSProperties = {
      height: `${pageMetrics.rowInnerHeightPx}px`,
      minHeight: `${pageMetrics.rowInnerHeightPx}px`,
      maxHeight: `${pageMetrics.rowInnerHeightPx}px`
    };
    const innerCellTextHeightStyle: React.CSSProperties = {
      height: `${pageMetrics.cellContentHeightPx}px`,
      minHeight: `${pageMetrics.cellContentHeightPx}px`,
      maxHeight: `${pageMetrics.cellContentHeightPx}px`
    };

    return (
      <article
        key={`${mode}-page-${pageIdx}`}
        ref={
          mode === 'screen'
            ? el => {
                pageRefs.current[pageIdx] = el;
              }
            : undefined
        }
        dir="rtl"
        data-quote-page={pageIdx + 1}
        style={{
          width: `${BASE_PAGE_WIDTH}px`,
          height: `${A4_MIN_HEIGHT}px`,
          minHeight: `${A4_MIN_HEIGHT}px`,
          maxHeight: `${A4_MIN_HEIGHT}px`,
          padding: '18px 32px',
          overflow: 'hidden'
        }}
        className={`pdf-paper-sheet quotation-page-sheet flex flex-col justify-between bg-white text-[#0F172A] box-border ${
          mode === 'screen'
            ? 'border-b border-slate-200 shadow-xs'
            : ''
        } ${mode === 'export' ? 'quotation-export-page' : ''} ${
          mode === 'print' && !isLastPage ? 'quotation-page-break' : ''
        }`}
      >
        {/* Top & Body Content */}
        <div className="w-full box-border">
          {isFirstPage ? (
            <>
              {/* Official Full Header (Deterministic Horizontal Row) */}
              <div className="flex flex-row items-stretch justify-between gap-5 pb-2.5 border-b-[3px] border-[#0F172A]">
                {/* Brand & Quote Metadata */}
                <div className="flex-1 min-w-0 flex flex-col justify-between text-right">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={mode === 'export' ? (safeLogoSrc.startsWith('data:') ? safeLogoSrc : FALLBACK_LOGO_DATA_URL) : safeLogoSrc}
                      alt="Al-mekawy Home Logo"
                      className="w-[64px] h-[64px] rounded-2xl border-2 border-[#0F172A] object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h1 className="text-[26px] font-black text-[#0F172A] leading-tight tracking-tight">
                        المكاوي هوم
                      </h1>
                      <p className="text-slate-600 font-bold text-xs mt-0.5">
                        Al-Mekawy Home · قطاعات الشبابيك والأبواب UPVC
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold mt-1.5 tabular-nums">
                        <span>تاريخ العرض: <strong className="font-mono text-[#0F172A]">{displayDate}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>رقم العرض: <strong className="font-mono text-[#0F172A]">{quoteNumber}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info Box (Fixed 300px inside 730px inner width) */}
                <div className="w-[300px] shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-right flex flex-col justify-center space-y-1">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <h3 className="text-[11px] font-extrabold text-slate-500">بيانات العميل</h3>
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                      صفحة {pageIdx + 1} من {totalPages}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-[11.5px] leading-snug">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0 font-semibold">اسم العميل:</span>
                      <span className="font-extrabold text-[#0F172A] text-left break-words min-w-0 line-clamp-2">
                        {customer.name?.trim() || 'عميل المكاوي هوم الموقر'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0 font-semibold">رقم الهاتف:</span>
                      <span className="font-bold text-[#0F172A] font-mono tabular-nums" dir="ltr">
                        {customer.phone?.trim() || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0 font-semibold">موقع التركيب:</span>
                      <span className="font-bold text-[#0F172A] text-left break-words min-w-0 line-clamp-2">
                        {customer.address?.trim() || 'بناءً على مقاسات العميل'}
                      </span>
                    </div>
                    {customer.deliveryDate && (
                      <div className="flex items-start justify-between gap-2 border-t border-dashed border-slate-200 pt-0.5">
                        <span className="text-slate-500 shrink-0 font-semibold">موعد التوريد:</span>
                        <span className="font-extrabold text-[#0F172A] font-mono tabular-nums" dir="ltr">
                          {customer.deliveryDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Concise Editorial Intro */}
              <p className="my-1.5 text-right text-slate-600 leading-snug text-[11px]">
                بناءً على طلبكم الكريم، يتشرف <strong className="text-[#0F172A] font-extrabold">المكاوي هوم لأعمال الـ UPVC</strong> بتقديم عرض الأسعار والمواصفات الفنية للفتحات المطلوبة، المصنعة وفق أعلى معايير العزل الصوتي والحراري ومقاومة العوامل الجوية.
              </p>
            </>
          ) : (
            /* Compact Official Continuation Header on Page 2+ */
            <div className="flex flex-row items-center justify-between gap-4 pb-2.5 mb-2 border-b-[3px] border-[#0F172A]">
              <div className="flex items-center gap-3 text-right min-w-0">
                <img
                  src={mode === 'export' ? (safeLogoSrc.startsWith('data:') ? safeLogoSrc : FALLBACK_LOGO_DATA_URL) : safeLogoSrc}
                  alt="Al-mekawy Home Logo"
                  className="w-12 h-12 rounded-xl border-2 border-[#0F172A] object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#0F172A]">المكاوي هوم</h2>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-xs font-bold text-slate-500">تابع عرض السعر التفصيلي</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-0.5 truncate">
                    العميل: <strong className="font-extrabold text-[#0F172A]">{customer.name?.trim() || 'عميل المكاوي هوم الموقر'}</strong>
                  </p>
                </div>
              </div>

              <div className="text-left text-xs font-bold text-slate-600 shrink-0 space-y-0.5 tabular-nums">
                <div>
                  رقم العرض: <span className="font-mono text-[#0F172A]">{quoteNumber}</span> · التاريخ: <span className="font-mono text-[#0F172A]">{displayDate}</span>
                </div>
                <div className="text-[#0F172A] font-extrabold">
                  صفحة {pageIdx + 1} من {totalPages} · البنود ({pageStartNum}–{pageEndNum})
                </div>
              </div>
            </div>
          )}

          {/* Fixed-Layout Items Table (Exact 730px inner column budget — strictly uniform row heights, zero horizontal overflow) */}
          <div className="my-1.5 border-2 border-[#0F172A] rounded-xl overflow-hidden box-border">
            <table className="w-full table-fixed border-collapse text-right text-xs">
              <colgroup>
                <col className="w-[34px]" />
                <col className="w-[196px]" />
                <col className="w-[78px]" />
                <col className="w-[72px]" />
                <col className="w-[42px]" />
                <col className="w-[118px]" />
                <col className="w-[92px]" />
                <col className="w-[98px]" />
              </colgroup>
              <thead>
                <tr className="bg-[#0F172A] text-white border-b border-[#0F172A] font-extrabold text-[11px]">
                  <th className="py-2 px-1 text-center border-l border-slate-700">م</th>
                  <th className="py-2 px-2.5 border-l border-slate-700">بيان البند والموقع</th>
                  <th className="py-2 px-1.5 text-center border-l border-slate-700">المقاس (سم)</th>
                  <th className="py-2 px-1.5 text-center border-l border-slate-700">المساحة م²</th>
                  <th className="py-2 px-1 text-center border-l border-slate-700">العدد</th>
                  <th className="py-2 px-2 border-l border-slate-700">القطاع والزجاج</th>
                  <th className="py-2 px-2 border-l border-slate-700">الإضافات</th>
                  <th className="py-2 px-2 text-left">إجمالي البند</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold text-sm">
                      لا توجد بنود مضافة في عرض السعر حالياً
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item, idxInPage) => {
                    const globalIdx = pageIdx * ITEMS_PER_PAGE + idxInPage;
                    const threshold = 1.0;
                    const isMinArea = (item.width * item.height) / 10000 < threshold;
                    const typeName = getItemTypeLabel(item.itemType);

                    const itemFit = autoFit.itemFits[item.id];
                    const descFit = itemFit?.description ?? DEFAULT_DESCRIPTION_FIT;
                    const profileFit = itemFit?.profileGlass ?? DEFAULT_PROFILE_FIT;
                    const addonsFit = itemFit?.addons ?? DEFAULT_ADDONS_FIT;

                    return (
                      <tr
                        key={item.id}
                        className="quote-uniform-row border-b border-slate-200 align-middle"
                        data-quote-item-row={globalIdx + 1}
                      >
                        {/* Serial */}
                        <td className="p-0 text-center font-mono font-bold text-slate-500 border-l border-slate-100 tabular-nums align-middle">
                          <div style={rowBoxStyle} className="w-full px-1 flex items-center justify-center overflow-hidden box-border">
                            {String(globalIdx + 1).padStart(2, '0')}
                          </div>
                        </td>

                        {/* Item Title & SVG Preview — Independent Per-Item Dynamic Auto-Fit */}
                        <td className="p-0 border-l border-slate-100 align-middle">
                          <div
                            style={rowBoxStyle}
                            className="w-full px-2.5 py-[2px] flex items-center justify-between gap-2 min-w-0 overflow-hidden box-border"
                          >
                            <div
                              data-autofit-cell="description"
                              data-autofit-shrunk={descFit.isShrunk ? 'true' : 'false'}
                              data-autofit-overflow={descFit.overflowed ? 'true' : 'false'}
                              data-autofit-fontsize={descFit.fontSizePx}
                              className="text-right min-w-0 flex-1 flex flex-col overflow-hidden box-border"
                              style={{
                                ...innerCellTextHeightStyle,
                                justifyContent: descFit.overflowed ? 'flex-start' : 'center'
                              }}
                            >
                              <div
                                className="font-extrabold text-[#0F172A] whitespace-pre-wrap"
                                style={{
                                  fontSize: `${descFit.fontSizePx}px`,
                                  lineHeight: descFit.lineHeight,
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {item.title}
                              </div>
                              <div
                                className="text-slate-500 font-semibold"
                                style={{
                                  fontSize: `${descFit.secondaryFontSizePx}px`,
                                  lineHeight: descFit.secondaryLineHeight,
                                  marginTop: `${descFit.gapPx}px`,
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {typeName} · فتح {item.opening}
                              </div>
                            </div>
                            <div
                              style={{
                                width: `${pageMetrics.svgBoxSizePx}px`,
                                height: `${pageMetrics.svgBoxSizePx}px`
                              }}
                              className="shrink-0 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-0.5 overflow-hidden box-border"
                            >
                              <MiniItemPreview item={item} />
                            </div>
                          </div>
                        </td>

                        {/* Dimensions (Unchanged font size, strictly uniform row box) */}
                        <td className="p-0 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-[11.5px] tabular-nums align-middle" dir="ltr">
                          <div style={rowBoxStyle} className="w-full px-1.5 flex items-center justify-center overflow-hidden box-border">
                            {item.width} × {item.height}
                          </div>
                        </td>

                        {/* Area (Unchanged font size, strictly uniform row box) */}
                        <td className="p-0 text-center border-l border-slate-100 tabular-nums align-middle">
                          <div style={rowBoxStyle} className="w-full px-1.5 flex flex-col items-center justify-center overflow-hidden box-border">
                            <div className="font-bold text-[#0F172A] text-[11.5px] leading-tight">{item.area.toFixed(2)} م²</div>
                            {isMinArea && (
                              <div className="text-[9.5px] text-amber-700 font-bold leading-tight mt-0.5">
                                أدنى {threshold.toFixed(1)} م²
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Quantity (Unchanged font size, strictly uniform row box) */}
                        <td className="p-0 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-xs tabular-nums align-middle">
                          <div style={rowBoxStyle} className="w-full px-1 flex items-center justify-center overflow-hidden box-border">
                            {item.quantity || 1}
                          </div>
                        </td>

                        {/* Profile & Glass — Independent Per-Item Dynamic Auto-Fit */}
                        <td className="p-0 border-l border-slate-100 align-middle">
                          <div style={rowBoxStyle} className="w-full px-2 py-[2px] flex flex-col justify-center overflow-hidden box-border">
                            <div
                              data-autofit-cell="profile-glass"
                              data-autofit-shrunk={profileFit.isShrunk ? 'true' : 'false'}
                              data-autofit-overflow={profileFit.overflowed ? 'true' : 'false'}
                              data-autofit-fontsize={profileFit.fontSizePx}
                              className="flex flex-col overflow-hidden box-border"
                              style={{
                                ...innerCellTextHeightStyle,
                                justifyContent: profileFit.overflowed ? 'flex-start' : 'center'
                              }}
                            >
                              <div
                                className="font-extrabold text-[#0F172A]"
                                style={{
                                  fontSize: `${profileFit.fontSizePx}px`,
                                  lineHeight: profileFit.lineHeight,
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {profiles[item.profile]?.name || item.profile}
                              </div>
                              <div
                                className="text-slate-500"
                                style={{
                                  fontSize: `${profileFit.secondaryFontSizePx}px`,
                                  lineHeight: profileFit.secondaryLineHeight,
                                  marginTop: `${profileFit.gapPx}px`,
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {item.innerType === 'panel'
                                  ? 'بنل بالكامل'
                                  : item.innerType === 'panel_glass'
                                  ? `بنل + ${item.glassType}`
                                  : item.glassType}
                              </div>
                              {item.opening === 'مفصلي' && (
                                <div
                                  className="text-slate-500 font-semibold"
                                  style={{
                                    fontSize: `${profileFit.secondaryFontSizePx}px`,
                                    lineHeight: profileFit.secondaryLineHeight,
                                    overflowWrap: 'anywhere',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {item.hingePanes || 'ضلفة'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Addons — Independent Per-Item Dynamic Auto-Fit */}
                        <td className="p-0 border-l border-slate-100 text-slate-600 align-middle">
                          <div style={rowBoxStyle} className="w-full px-2 py-[2px] flex flex-col justify-center overflow-hidden box-border">
                            <div
                              data-autofit-cell="addons"
                              data-autofit-shrunk={addonsFit.isShrunk ? 'true' : 'false'}
                              data-autofit-overflow={addonsFit.overflowed ? 'true' : 'false'}
                              data-autofit-fontsize={addonsFit.fontSizePx}
                              className="flex flex-col overflow-hidden box-border"
                              style={{
                                ...innerCellTextHeightStyle,
                                justifyContent: addonsFit.overflowed ? 'flex-start' : 'center'
                              }}
                            >
                              {item.addons.length > 0 ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: `${addonsFit.gapPx}px`
                                  }}
                                >
                                  {item.addons.map(addonId => (
                                    <div
                                      key={addonId}
                                      className="font-bold text-slate-700"
                                      style={{
                                        fontSize: `${addonsFit.fontSizePx}px`,
                                        lineHeight: addonsFit.lineHeight,
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      · {addons[addonId]?.name || addonId}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10.5px]">—</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Item Total (Font sizes untouched, strictly uniform row box) */}
                        <td className="p-0 text-left tabular-nums align-middle">
                          <div style={rowBoxStyle} className="w-full px-2 py-[2px] flex flex-col justify-center overflow-hidden box-border">
                            <div className="font-black text-[#0F172A] text-[11.5px] leading-[1.15]">
                              {formatCurrency(item.itemTotal)}
                            </div>
                            <div className="text-[9px] text-slate-500 leading-[1.15] mt-0.5">
                              {formatCurrency(item.profilePrice + item.addonsPrice)}/م²
                            </div>
                            {item.quantity && item.quantity > 1 ? (
                              <div className="text-[9px] text-slate-500 font-bold leading-[1.15]">
                                ({formatCurrency(item.itemTotal / item.quantity)} × {item.quantity})
                              </div>
                            ) : null}
                            {item.flatAddonsPrice && item.flatAddonsPrice > 0 ? (
                              <div className="text-[9px] text-emerald-700 font-bold leading-[1.15]">
                                +{formatCurrency(item.flatAddonsPrice)} مقطوع
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Intermediate Page Continuation Bar vs Final Page Grand Summary & Terms */}
          {!isLastPage ? (
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-700 tabular-nums">
              <div className="flex items-center gap-2.5">
                <span>بنود الصفحة: <strong className="text-[#0F172A] font-extrabold">{pageItems.length}</strong> ({pageStartNum}–{pageEndNum})</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>مساحة الصفحة: <strong className="text-[#0F172A] font-mono font-extrabold">{pageArea.toFixed(2)} م²</strong></span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>إجمالي الصفحة: <strong className="text-[#0F172A] font-extrabold">{formatCurrency(pageSubtotal)}</strong></span>
              </div>
              <span className="text-[#0F172A] font-extrabold text-[11px]">
                يتبع في صفحة {pageIdx + 2} من {totalPages} ←
              </span>
            </div>
          ) : (
            <>
              {/* Financial Summary Banner */}
              <div className="bg-[#0F172A] text-white rounded-xl py-2.5 px-4 flex flex-row items-center justify-between gap-4 print:bg-slate-100 print:text-[#0F172A] print:border-2 print:border-[#0F172A] print:break-inside-avoid tabular-nums">
                <div className="text-right shrink-0">
                  <h4 className="font-black text-[15px] leading-tight text-white print:text-[#0F172A]">الملخص المالي وإجمالي المسطحات</h4>
                  <p className="text-slate-300 text-[10.5px] leading-tight print:text-slate-600 mt-0.5">
                    إجمالي عدد البنود: {calculations.itemsCalculated.length} · إجمالي المساحة: <span className="font-mono font-bold" dir="ltr">{calculations.totalArea.toFixed(2)} m²</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
                  {discountValue > 0 || totalNotesAmount !== 0 ? (
                    <>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 print:text-slate-600 font-bold block leading-tight">الإجمالي قبل الخصم</span>
                        <span className="text-xs font-bold font-mono text-slate-200 print:text-slate-800">{formatCurrency(calculations.totalPrice)}</span>
                      </div>

                      {discountValue > 0 && (
                        <div className="text-right border-r border-slate-700 print:border-slate-300 pr-3.5">
                          <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block leading-tight">قيمة الخصم</span>
                          <span className="text-xs font-bold font-mono text-emerald-300 print:text-emerald-800">- {formatCurrency(discountAmount)}</span>
                        </div>
                      )}

                      {totalNotesAmount !== 0 && (
                        <div className="text-right border-r border-slate-700 print:border-slate-300 pr-3.5">
                          <span className="text-[10px] text-sky-300 print:text-sky-700 font-bold block leading-tight">إضافات الملاحظات</span>
                          <span className="text-xs font-bold font-mono text-sky-200 print:text-sky-800">
                            {totalNotesAmount > 0 ? '+' : ''}{formatCurrency(totalNotesAmount)}
                          </span>
                        </div>
                      )}

                      <div className="text-right border-r border-slate-700 print:border-slate-300 pr-3.5">
                        <span className="text-[10px] text-[#FACC15] print:text-slate-600 font-extrabold block leading-tight">صافي القيمة النهائية</span>
                        <span className="text-xl font-black text-[#FACC15] print:text-[#0F172A] leading-none">
                          {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] text-[#FACC15] print:text-slate-600 font-extrabold block leading-tight mb-0.5">صافي القيمة النهائية</span>
                      <span className="text-xl font-black text-[#FACC15] print:text-[#0F172A] leading-none">
                        {formatCurrency(calculations.totalPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Customer & Technical Notes — Independent Dynamic Auto-Fit */}
              {(notes || additionalNotes.some(n => n.text)) && (
                <div className="mt-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-right space-y-1 print:break-inside-avoid overflow-hidden box-border">
                  <h3 className="text-[10.5px] font-extrabold text-[#0F172A] leading-tight">
                    ملاحظات خاصة وتفاصيل إضافية:
                  </h3>

                  <div
                    className="space-y-1 overflow-hidden box-border"
                    style={
                      pageMetrics.notesContentMaxHeightPx > 0
                        ? { maxHeight: `${pageMetrics.notesContentMaxHeightPx}px` }
                        : undefined
                    }
                  >
                    {notes && (
                      <div
                        data-autofit-cell="primary-note"
                        data-autofit-shrunk={autoFit.primaryNoteFit.isShrunk ? 'true' : 'false'}
                        data-autofit-overflow={autoFit.primaryNoteFit.overflowed ? 'true' : 'false'}
                        className="text-slate-700 font-semibold whitespace-pre-wrap"
                        style={{
                          fontSize: `${autoFit.primaryNoteFit.fontSizePx}px`,
                          lineHeight: autoFit.primaryNoteFit.lineHeight,
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word'
                        }}
                      >
                        {notes}
                        {notesAmount !== 0 && (
                          <span className="mr-2 font-extrabold text-[#0F172A] tabular-nums">
                            ({notesAmount > 0 ? 'إضافة: ' : 'خصم: '}{formatCurrency(Math.abs(notesAmount))})
                          </span>
                        )}
                      </div>
                    )}

                    {additionalNotes.map((note, idx) => {
                      if (!note.text) return null;
                      const noteKey = String(note.id || idx);
                      const nFit = autoFit.additionalNoteFits[noteKey] ?? DEFAULT_NOTE_FIT;
                      return (
                        <div
                          key={noteKey}
                          data-autofit-cell={`additional-note-${idx}`}
                          data-autofit-shrunk={nFit.isShrunk ? 'true' : 'false'}
                          data-autofit-overflow={nFit.overflowed ? 'true' : 'false'}
                          className="pt-1 border-t border-dashed border-slate-200 text-slate-700 font-semibold whitespace-pre-wrap"
                          style={{
                            fontSize: `${nFit.fontSizePx}px`,
                            lineHeight: nFit.lineHeight,
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word'
                          }}
                        >
                          {note.text}
                          {note.amount !== 0 && (
                            <span className="mr-2 font-extrabold text-[#0F172A] tabular-nums">
                              ({note.amount > 0 ? 'إضافة: ' : 'خصم: '}{formatCurrency(Math.abs(note.amount))})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Terms & Specifications */}
              <div className="mt-2 border-t border-slate-200 pt-2 text-right terms-block print:break-inside-avoid">
                <h3 className="text-[10.5px] font-extrabold text-slate-500 mb-1">
                  الشروط والمواصفات الفنية وضمان المكاوي هوم
                </h3>
                <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-[10.5px] text-slate-600 leading-snug">
                  <p><strong className="text-[#0F172A]">· الضمان المعتمد:</strong> ضمان 10 سنوات على قطاعات الـ UPVC ضد تغير اللون وعيوب التصنيع وثبات المقطع.</p>
                  <p><strong className="text-[#0F172A]">· الإكسسوارات:</strong> إكسسوارات تركية أصلية مقاومة للصدأ <span className="font-mono text-[9.5px] text-[#0F172A]">[VORNE · FORNAX · GIVESS · ROTEX]</span>.</p>
                  <p><strong className="text-[#0F172A]">· إحكام العزل:</strong> جوانات كاوتشوك مزدوجة تمنع تسريب الأتربة ومياه الأمطار وتعزل الضوضاء الخارجية.</p>
                  <p><strong className="text-[#0F172A]">· رفع المقاسات:</strong> هذا العرض مبدئي وفق مقاساتكم الأولية، ويتم رفع المقاسات النهائية هندسياً بالموقع مجاناً.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Signatures (Final Page) & Official Footer Citation (Every Page) */}
        <div className="w-full pt-1.5 mt-1.5">
          {isLastPage && (
            <div className="grid grid-cols-2 gap-8 text-center text-xs font-bold border-t border-slate-200 pt-2 mb-2 signatures-block print:break-inside-avoid">
              <div>
                <p className="text-slate-500 mb-3.5 font-extrabold text-[10.5px]">توقيع واعتماد العميل</p>
                <div className="border-b border-dashed border-slate-400 w-44 mx-auto" />
                <p className="text-[#0F172A] text-[11.5px] font-extrabold mt-1 truncate">
                  {customer.name?.trim() || 'العميل المحترم'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-3.5 font-extrabold text-[10.5px]">اعتماد المكاوي هوم</p>
                <div className="border-b border-dashed border-slate-400 w-44 mx-auto" />
                <p className="text-[#0F172A] font-extrabold text-[11.5px] mt-1">مهندس / حامد مكاوي</p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-bold tabular-nums">
            <div className="flex items-center gap-2" dir="ltr">
              <span>© {new Date().getFullYear()} Al-Mekawy Home</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#0F172A]">01141761261 / 01060524985</span>
            </div>
            <div className="text-[#0F172A] font-extrabold">
              صفحة {pageIdx + 1} من {totalPages}
            </div>
          </div>
        </div>
      </article>
    );
  };

  const visiblePageIndices = [Math.min(currentPage, totalPages - 1)];

  return (
    <section
      id="detailed-quote-view"
      className="w-full max-w-full min-w-0 box-border flex flex-col bg-white border-y border-slate-300/90 print:bg-white print:border-none print:shadow-none print:rounded-none"
      dir="rtl"
    >
      {/* 1. Compact Executive Header & Control Bar (Screen Only) */}
      <div
        className="quote-preview-header bg-[#0F172A] text-white border-b-2 border-[#FACC15] px-3 py-2.5 sm:px-5 sm:py-3.5 w-full max-w-full box-border print:hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 w-full max-w-full">
          {/* Right Zone: Clear Title + Quote No & Customer Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={17} className="text-[#FACC15] shrink-0 hidden sm:inline" />
                <h2 className="text-sm sm:text-lg font-black text-white leading-tight truncate">
                  معاينة عرض السعر
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 mt-0.5 min-w-0 tabular-nums">
                <span className="font-mono text-[#FACC15] font-bold shrink-0">{quoteNumber}</span>
                {customer.name?.trim() && (
                  <>
                    <span aria-hidden="true" className="text-slate-500 shrink-0">·</span>
                    <span className="truncate font-semibold text-slate-200">
                      {customer.name.trim()}
                    </span>
                  </>
                )}
                <span aria-hidden="true" className="text-slate-500 shrink-0">·</span>
                <span className="text-slate-400 shrink-0">
                  {calculations.itemsCalculated.length} {calculations.itemsCalculated.length === 1 ? 'بند' : 'بنود'}
                </span>
              </div>
            </div>
          </div>

          {/* Left Zone: Organized Touch-Friendly Action Controls */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full lg:w-auto shrink-0">
            {/* Share Quote */}
            <button
              type="button"
              onClick={() => {
                setShareFeedback(null);
                setIsShareOpen(true);
              }}
              className="min-h-[40px] sm:min-h-[42px] px-2 sm:px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer whitespace-nowrap active:scale-95"
              title="مشاركة العرض"
            >
              <Share2 size={14} className="text-emerald-400 shrink-0" />
              <span>مشاركة</span>
            </button>

            {/* Primary CTA: Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="min-h-[40px] sm:min-h-[42px] px-2.5 sm:px-4 rounded-xl bg-[#FACC15] hover:bg-yellow-400 text-[#0F172A] text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-colors duration-150 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-60"
              title="تنزيل ملف PDF"
            >
              {isExporting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>جاري...</span>
                </>
              ) : (
                <>
                  <Download size={15} className="shrink-0" />
                  <span className="sm:hidden">تنزيل PDF</span>
                  <span className="hidden sm:inline">تنزيل PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Length & Legibility Review Notice (Screen Only — Never deletes item data or alters row heights) */}
      {autoFit.warnings.length > 0 && (
        <div
          role="alert"
          data-autofit-warning-banner="true"
          className="bg-amber-50 border-b border-amber-300 px-3.5 py-2.5 sm:px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-amber-950 print:hidden"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-0.5">
              <p className="font-black text-amber-950 leading-snug">
                {autoFit.warnings.some(w => w.reason === 'overflow')
                  ? 'تنبيه مراجعة وصف البند: بعض النصوص طويلة جداً وتتجاوز السعة القصوى للمساحة الثابتة مع الحفاظ على ثبات ارتفاع الصفوف'
                  : 'تنبيه وضوح القراءة: تم تصغير خط بعض البنود إلى حجم دقيق جداً لاحتواء كامل النص داخل المساحة الثابتة'}
              </p>
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed break-words">
                المواضع المتأثرة: {autoFit.warnings.map(w => w.label).join(' · ')} — يُفضل مراجعة النص أو اختصاره لضمان أفضل وضوح في المعاينة وملف الـ PDF.
              </p>
            </div>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black transition-colors cursor-pointer whitespace-nowrap"
            >
              مراجعة وتعديل البنود
            </button>
          )}
        </div>
      )}

      {/* Inline PDF Export Error Banner (only when Share modal is closed) */}
      {pdfError && !isShareOpen && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-bold text-red-800 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-red-600 shrink-0" />
            <span>{pdfError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>إعادة المحاولة</span>
            </button>
            <button
              type="button"
              onClick={() => setPdfError(null)}
              className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
              aria-label="إغلاق التنبيه"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Multi-Page Switcher Bar (Rendered cleanly when quote spans multiple pages) */}
      {totalPages > 1 && (
        <div
          className="bg-slate-900 text-slate-200 border-b border-slate-800 px-3 py-2 sm:px-5 flex items-center justify-between gap-2 w-full max-w-full box-border print:hidden"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className="min-h-[38px] px-2.5 sm:px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ChevronRight size={15} />
              <span>السابق</span>
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              className="min-h-[38px] px-2.5 sm:px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>التالي</span>
              <ChevronLeft size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-300 tabular-nums whitespace-nowrap">
              صفحة {currentPage + 1} من {totalPages}
            </span>

            <div className="hidden md:flex items-center gap-1 mr-2">
              {itemPages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                    currentPage === idx
                      ? 'bg-[#FACC15] text-[#0F172A]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main PDF Viewport Stage (Screen Only — Always Fit Full Screen Width, Zero Horizontal Overflow) */}
      <div
        ref={stageContainerRef}
        className="w-full max-w-full min-w-0 overflow-x-clip box-border p-0 flex flex-col items-center justify-start print:hidden"
      >
        {visiblePageIndices.map(pageIdx => {
          const naturalH = pageHeights[pageIdx] || A4_MIN_HEIGHT;
          const scaledW = Math.max(1, Math.round(BASE_PAGE_WIDTH * scaleRatio));
          const scaledH = Math.max(1, Math.ceil(naturalH * scaleRatio));

          return (
            <div
              key={`sizer-${pageIdx}`}
              dir="ltr"
              className="relative mx-auto box-border shrink-0 overflow-hidden"
              style={{
                width: `${scaledW}px`,
                height: `${scaledH}px`
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${BASE_PAGE_WIDTH}px`,
                  transformOrigin: '0 0',
                  transform: `scale(${scaleRatio})`
                }}
              >
                {renderPageContent(itemPages[pageIdx], pageIdx, 'screen')}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Dedicated Print Output (Active strictly during @media print — renders all pages unscaled) */}
      <div className="hidden print:block quotation-print-container w-full">
        {itemPages.map((pageItems, pageIdx) => renderPageContent(pageItems, pageIdx, 'print'))}
      </div>

      {/* 5. Flicker-Free Offscreen Canonical A4 Renderer (Mounted strictly during PDF export/share) */}
      {isExporting && (
        <div
          aria-hidden="true"
          dir="ltr"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: -50
          }}
          className="print:hidden"
        >
          <div
            ref={exportContainerRef}
            style={{
              width: `${BASE_PAGE_WIDTH}px`,
              backgroundColor: '#ffffff'
            }}
          >
            {itemPages.map((pageItems, pageIdx) => renderPageContent(pageItems, pageIdx, 'export'))}
          </div>
        </div>
      )}

      {/* 6. Clean Share Modal (Zero horizontal overflow, touch-ergonomic) */}
      {isShareOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            className="w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-3.5 text-right box-border"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">مشاركة عرض السعر</h3>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {quoteNumber} {customer.name?.trim() ? `· ${customer.name.trim()}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {autoFit.warnings.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[11px] font-bold text-amber-900 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  تنبيه: محتوى ({autoFit.warnings.map(w => w.label).join(' · ')}) طويل جداً ويُنصح بمراجعته أو اختصاره لضمان أوضح قراءة داخل المساحة الثابتة للبند.
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleSharePdfFile}
                disabled={isExporting}
                className="w-full min-h-[46px] px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-between transition-colors cursor-pointer disabled:opacity-60"
              >
                <span className="flex items-center gap-2.5">
                  <Share2 size={16} className="text-[#FACC15]" />
                  <span>{isExporting ? 'جاري تجهيز ملف PDF...' : 'مشاركة ملف PDF مباشرة'}</span>
                </span>
                <span className="text-[11px] text-slate-400">PDF</span>
              </button>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleToggleWhatsAppPdfShare}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-extrabold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageCircle size={16} />
                    <span>مشاركة ملف PDF عبر واتساب</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/95 bg-black/15 px-2 py-0.5 rounded-lg">
                    <span>اختر الرقم</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isWhatsAppPickerOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isWhatsAppPickerOpen && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-2.5">
                    {!preparedPdf ? (
                      pdfError && !isExporting ? (
                        <div className="py-2.5 px-2 text-center space-y-2">
                          <p className="text-xs font-extrabold text-red-700 flex items-center justify-center gap-1.5">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{pdfError}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => ensurePreparedPdf()}
                            className="min-h-[36px] px-3.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw size={13} />
                            <span>إعادة المحاولة</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-3 text-xs font-extrabold text-emerald-800">
                          <span className="w-4 h-4 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>جاري تجهيز ملف الـ PDF للمشاركة...</span>
                        </div>
                      )
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-900 px-0.5">
                          <span>اختر رقم الواتساب لمشاركة ملف الـ PDF:</span>
                          <span className="text-[10px] bg-emerald-600/15 text-emerald-800 px-2 py-0.5 rounded-md">
                            PDF جاهز ✓
                          </span>
                        </div>

                        <div className="space-y-2">
                          {whatsAppTargets.map(target => (
                            <a
                              key={target.id}
                              href={buildWhatsAppPdfUrl(target.waPhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleWhatsAppNumberSelected(target.phoneDisplay)}
                              className="w-full p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200/90 flex items-center justify-between gap-2 transition-colors cursor-pointer shadow-2xs"
                            >
                              <div className="min-w-0 text-right">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-[#0F172A] truncate">
                                    {target.label}
                                  </span>
                                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                    {target.badge}
                                  </span>
                                </div>
                                <span
                                  className="font-mono text-xs font-black text-emerald-700 inline-block mt-0.5"
                                  dir="ltr"
                                >
                                  {target.phoneDisplay}
                                </span>
                              </div>

                              <span className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white text-[11px] font-black flex items-center gap-1">
                                <MessageCircle size={13} />
                                <span>مشاركة PDF</span>
                              </span>
                            </a>
                          ))}
                        </div>

                        {/* Optional custom WhatsApp number input */}
                        <div className="pt-1.5 border-t border-emerald-200/70 space-y-1.5">
                          <label className="block text-[11px] font-extrabold text-slate-700">
                            أو أدخل رقم واتساب آخر:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1 min-w-0">
                              <input
                                type="tel"
                                inputMode="tel"
                                dir="ltr"
                                value={customWaPhone}
                                onChange={e => setCustomWaPhone(e.target.value)}
                                placeholder="01xxxxxxxxx"
                                className="w-full min-h-[38px] pl-3 pr-8 rounded-lg bg-white border border-slate-200 focus:border-[#25D366] outline-none font-mono text-xs font-bold text-[#0F172A] text-left box-border"
                              />
                              <Phone
                                size={13}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                              />
                            </div>
                            {toWhatsAppPhone(customWaPhone).length >= 10 ? (
                              <a
                                href={buildWhatsAppPdfUrl(toWhatsAppPhone(customWaPhone))}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleWhatsAppNumberSelected(customWaPhone.trim())}
                                className="shrink-0 min-h-[38px] px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <MessageCircle size={13} />
                                <span>إرسال PDF</span>
                              </a>
                            ) : (
                              <span className="shrink-0 min-h-[38px] px-3 rounded-lg bg-slate-200 text-slate-400 text-xs font-black flex items-center justify-center gap-1 select-none">
                                <MessageCircle size={13} />
                                <span>إرسال PDF</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Native OS file share directly into WhatsApp on supported mobile browsers */}
                        {typeof navigator !== 'undefined' &&
                          typeof navigator.share === 'function' &&
                          navigator.canShare?.({ files: [preparedPdf.file] }) && (
                            <button
                              type="button"
                              onClick={handleDirectWhatsAppFileShare}
                              className="w-full min-h-[38px] px-3 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-[#FACC15] text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Share2 size={13} />
                              <span>إرفاق ملف الـ PDF مباشرة عبر تطبيق واتساب</span>
                            </button>
                          )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full min-h-[46px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-extrabold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {copiedSummary ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} className="text-slate-600" />
                  )}
                  <span>{copiedSummary ? 'تم نسخ ملخص العرض بنجاح' : 'نسخ نص ملخص العرض'}</span>
                </span>
              </button>
            </div>

            {pdfError && !isWhatsAppPickerOpen && (
              <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <span>{pdfError}</span>
                <button
                  type="button"
                  onClick={handleSharePdfFile}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>إعادة</span>
                </button>
              </div>
            )}

            {shareFeedback && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                {shareFeedback}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
