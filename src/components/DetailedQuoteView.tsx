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
  X
} from 'lucide-react';
import jspdf from 'jspdf';
import * as htmlToImage from 'html-to-image';
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
const ITEMS_PER_PAGE = 12;

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
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto block" xmlns="http://www.w3.org/2000/svg">
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
  addons
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

  // Split items into pages of up to 12 items per page
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
  }, [measureAndComputeScale, calculations, customer, totalPages]);

  const quoteNumber = React.useMemo(() => {
    const today = new Date();
    const random = Math.floor(100 + Math.random() * 900);
    return `MH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-${random}`;
  }, []);

  const {
    discountType = 'cash',
    discountValue = 0,
    notesAmount = 0,
    notes = '',
    additionalNotes = []
  } = customer;

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
      setPreparedPdf(prev => {
        if (prev?.blobUrl) {
          URL.revokeObjectURL(prev.blobUrl);
        }
        return null;
      });
    }
  }, [isShareOpen]);

  const capturePageToPng = async (pageEl: HTMLElement, elW: number, elH: number): Promise<string> => {
    const baseOptions = {
      width: elW,
      height: elH,
      quality: 0.98,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        borderRadius: '0px',
        boxShadow: 'none',
        margin: '0px'
      }
    };
    try {
      return await htmlToImage.toPng(pageEl, baseOptions);
    } catch {
      return await htmlToImage.toPng(pageEl, { ...baseOptions, skipFonts: true });
    }
  };

  const generatePdfInstance = async (): Promise<jspdf | null> => {
    setIsExporting(true);
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        setTimeout(() => resolve(), 140);
      });
    });

    try {
      const container = exportContainerRef.current;
      if (!container) return null;

      // Ensure all images (such as brand logo) inside export sheets are completely decoded
      const imgs: HTMLImageElement[] = Array.from(container.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img: HTMLImageElement) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>(res => {
                img.onload = () => res();
                img.onerror = () => res();
              })
        )
      );

      const targets: HTMLElement[] = Array.from(
        container.querySelectorAll<HTMLElement>('.quotation-export-page')
      );
      if (targets.length === 0) return null;

      const pdf = new jspdf('p', 'mm', 'a4');
      const pdfPageW = 210;
      const pdfPageH = 297;
      const margin = 4;
      const maxW = pdfPageW - margin * 2;
      const maxH = pdfPageH - margin * 2;

      for (let i = 0; i < targets.length; i++) {
        const pageEl = targets[i];
        const elW = pageEl.offsetWidth || BASE_PAGE_WIDTH;
        const elH = pageEl.offsetHeight || A4_MIN_HEIGHT;

        const imgData = await capturePageToPng(pageEl, elW, elH);

        if (i > 0) {
          pdf.addPage();
        }

        let renderW = maxW;
        let renderH = (elH * maxW) / elW;

        if (renderH <= maxH * 1.2) {
          if (renderH > maxH) {
            const fitRatio = maxH / renderH;
            renderH = maxH;
            renderW = renderW * fitRatio;
          }
          const offsetX = (pdfPageW - renderW) / 2;
          pdf.addImage(imgData, 'PNG', offsetX, margin, renderW, renderH, undefined, 'FAST');
        } else {
          let heightLeft = renderH;
          let sliceIdx = 0;
          pdf.addImage(imgData, 'PNG', margin, margin, renderW, renderH, undefined, 'FAST');
          heightLeft -= maxH;
          while (heightLeft > 0) {
            sliceIdx++;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, margin - sliceIdx * maxH, renderW, renderH, undefined, 'FAST');
            heightLeft -= maxH;
          }
        }
      }

      return pdf;
    } catch (err) {
      console.error('Error generating PDF:', err);
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const getPdfFileName = () => {
    const clientNameClean = (customer.name || 'عميل').trim().replace(/\s+/g, '_');
    return `عرض_سعر_المكاوي_${clientNameClean}.pdf`;
  };

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    const pdf = await generatePdfInstance();
    if (pdf) {
      pdf.save(getPdfFileName());
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

  const triggerPdfBlobDownload = (blobUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Canonical A4 Quotation Page Renderer (Fixed 794px geometry — identical across Mobile, Desktop, Export & Print)
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
        style={
          mode !== 'print'
            ? {
                width: `${BASE_PAGE_WIDTH}px`,
                minHeight: `${A4_MIN_HEIGHT}px`,
                padding: '28px 32px'
              }
            : undefined
        }
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
              <div className="flex flex-row items-stretch justify-between gap-5 pb-4 border-b-[3px] border-[#0F172A]">
                {/* Brand & Quote Metadata */}
                <div className="flex-1 min-w-0 flex flex-col justify-between text-right">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={logoUrl}
                      alt="Al-mekawy Home Logo"
                      className="w-[68px] h-[68px] rounded-2xl border-2 border-[#0F172A] object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h1 className="text-[28px] font-black text-[#0F172A] leading-tight tracking-tight">
                        المكاوي هوم
                      </h1>
                      <p className="text-slate-600 font-bold text-xs mt-0.5">
                        Al-Mekawy Home · قطاعات الشبابيك والأبواب UPVC
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold mt-2 tabular-nums">
                        <span>تاريخ العرض: <strong className="font-mono text-[#0F172A]">{displayDate}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>رقم العرض: <strong className="font-mono text-[#0F172A]">{quoteNumber}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info Box (Fixed 300px inside 730px inner width) */}
                <div className="w-[300px] shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3 text-right flex flex-col justify-center space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <h3 className="text-[11px] font-extrabold text-slate-500">بيانات العميل</h3>
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                      صفحة {pageIdx + 1} من {totalPages}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0 font-semibold">اسم العميل:</span>
                      <span className="font-extrabold text-[#0F172A] text-left break-words min-w-0">
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
                      <span className="font-bold text-[#0F172A] text-left break-words min-w-0">
                        {customer.address?.trim() || 'بناءً على مقاسات العميل'}
                      </span>
                    </div>
                    {customer.deliveryDate && (
                      <div className="flex items-start justify-between gap-2 border-t border-dashed border-slate-200 pt-1">
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
              <p className="my-3 text-right text-slate-600 leading-relaxed text-[11.5px]">
                بناءً على طلبكم الكريم، يتشرف <strong className="text-[#0F172A] font-extrabold">المكاوي هوم لأعمال الـ UPVC</strong> بتقديم عرض الأسعار والمواصفات الفنية للفتحات المطلوبة، المصنعة وفق أعلى معايير العزل الصوتي والحراري ومقاومة العوامل الجوية.
              </p>
            </>
          ) : (
            /* Compact Official Continuation Header on Page 2+ */
            <div className="flex flex-row items-center justify-between gap-4 pb-3.5 mb-4 border-b-[3px] border-[#0F172A]">
              <div className="flex items-center gap-3 text-right min-w-0">
                <img
                  src={logoUrl}
                  alt="Al-mekawy Home Logo"
                  className="w-12 h-12 rounded-xl border-2 border-[#0F172A] object-cover shrink-0"
                  referrerPolicy="no-referrer"
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

          {/* Fixed-Layout Items Table (Exact 730px inner column budget — zero horizontal overflow) */}
          <div className="my-3.5 border-2 border-[#0F172A] rounded-xl overflow-hidden box-border">
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
                <tr className="bg-[#0F172A] text-white border-b-2 border-[#0F172A] font-extrabold text-[11px]">
                  <th className="py-2.5 px-1 text-center border-l border-slate-700">م</th>
                  <th className="py-2.5 px-2.5 border-l border-slate-700">بيان البند والموقع</th>
                  <th className="py-2.5 px-1.5 text-center border-l border-slate-700">المقاس (سم)</th>
                  <th className="py-2.5 px-1.5 text-center border-l border-slate-700">المساحة م²</th>
                  <th className="py-2.5 px-1 text-center border-l border-slate-700">العدد</th>
                  <th className="py-2.5 px-2 border-l border-slate-700">القطاع والزجاج</th>
                  <th className="py-2.5 px-2 border-l border-slate-700">الإضافات</th>
                  <th className="py-2.5 px-2 text-left">إجمالي البند</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
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
                    const typeName =
                      item.itemType === 'armored_door'
                        ? 'باب مصفح'
                        : item.itemType === 'door'
                        ? 'باب'
                        : item.itemType === 'balcony'
                        ? 'بلكونة'
                        : 'شباك';

                    return (
                      <tr key={item.id} className="align-middle">
                        {/* Serial */}
                        <td className="py-2 px-1 text-center font-mono font-bold text-slate-500 border-l border-slate-100 tabular-nums">
                          {String(globalIdx + 1).padStart(2, '0')}
                        </td>

                        {/* Item Title & SVG Preview */}
                        <td className="py-2 px-2.5 border-l border-slate-100">
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="text-right min-w-0 flex-1">
                              <div className="font-extrabold text-[#0F172A] text-xs leading-snug break-words">
                                {item.title}
                              </div>
                              <div className="text-[10.5px] text-slate-500 font-semibold mt-0.5">
                                {typeName} · فتح {item.opening}
                              </div>
                            </div>
                            <div className="shrink-0 w-[44px] h-[44px] bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-0.5">
                              <MiniItemPreview item={item} />
                            </div>
                          </div>
                        </td>

                        {/* Dimensions */}
                        <td className="py-2 px-1.5 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-[11.5px] tabular-nums" dir="ltr">
                          {item.width} × {item.height}
                        </td>

                        {/* Area */}
                        <td className="py-2 px-1.5 text-center border-l border-slate-100 tabular-nums">
                          <div className="font-bold text-[#0F172A] text-[11.5px]">{item.area.toFixed(2)} م²</div>
                          {isMinArea && (
                            <div className="text-[9.5px] text-amber-700 font-bold leading-tight mt-0.5">
                              أدنى {threshold.toFixed(1)} م²
                            </div>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-1 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-xs tabular-nums">
                          {item.quantity || 1}
                        </td>

                        {/* Profile & Glass */}
                        <td className="py-2 px-2 border-l border-slate-100 text-[11px] leading-snug break-words">
                          <div className="font-extrabold text-[#0F172A]">
                            {profiles[item.profile]?.name || item.profile}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {item.innerType === 'panel'
                              ? 'بنل بالكامل'
                              : item.innerType === 'panel_glass'
                              ? `بنل + ${item.glassType}`
                              : item.glassType}
                          </div>
                          {item.opening === 'مفصلي' && (
                            <div className="text-[10px] text-slate-500 font-semibold">
                              {item.hingePanes || 'ضلفة'}
                            </div>
                          )}
                        </td>

                        {/* Addons */}
                        <td className="py-2 px-2 border-l border-slate-100 text-[10.5px] text-slate-600 leading-snug break-words">
                          {item.addons.length > 0 ? (
                            <div className="space-y-0.5">
                              {item.addons.map(addonId => (
                                <div key={addonId} className="font-bold text-slate-700">
                                  · {addons[addonId]?.name || addonId}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Item Total */}
                        <td className="py-2 px-2 text-left tabular-nums">
                          <div className="font-black text-[#0F172A] text-xs leading-tight">
                            {formatCurrency(item.itemTotal)}
                          </div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5">
                            {formatCurrency(item.profilePrice + item.addonsPrice)}/م²
                          </div>
                          {item.quantity && item.quantity > 1 ? (
                            <div className="text-[9.5px] text-slate-500 font-bold">
                              ({formatCurrency(item.itemTotal / item.quantity)} × {item.quantity})
                            </div>
                          ) : null}
                          {item.flatAddonsPrice && item.flatAddonsPrice > 0 ? (
                            <div className="text-[9.5px] text-emerald-700 font-bold">
                              +{formatCurrency(item.flatAddonsPrice)} مقطوع
                            </div>
                          ) : null}
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
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-700 tabular-nums">
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
              <div className="bg-[#0F172A] text-white rounded-xl p-4 flex flex-row items-center justify-between gap-4 print:bg-slate-100 print:text-[#0F172A] print:border-2 print:border-[#0F172A] print:break-inside-avoid tabular-nums">
                <div className="text-right shrink-0">
                  <h4 className="font-black text-base text-white print:text-[#0F172A]">الملخص المالي وإجمالي المسطحات</h4>
                  <p className="text-slate-300 text-[11px] print:text-slate-600 mt-0.5">
                    إجمالي عدد البنود: {calculations.itemsCalculated.length} · إجمالي المساحة: <span className="font-mono font-bold" dir="ltr">{calculations.totalArea.toFixed(2)} m²</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                  {discountValue > 0 || totalNotesAmount !== 0 ? (
                    <>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 print:text-slate-600 font-bold block">الإجمالي قبل الخصم</span>
                        <span className="text-sm font-bold font-mono text-slate-200 print:text-slate-800">{formatCurrency(calculations.totalPrice)}</span>
                      </div>

                      {discountValue > 0 && (
                        <div className="text-right border-r border-slate-700 print:border-slate-300 pr-4">
                          <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">قيمة الخصم</span>
                          <span className="text-sm font-bold font-mono text-emerald-300 print:text-emerald-800">- {formatCurrency(discountAmount)}</span>
                        </div>
                      )}

                      {totalNotesAmount !== 0 && (
                        <div className="text-right border-r border-slate-700 print:border-slate-300 pr-4">
                          <span className="text-[10px] text-sky-300 print:text-sky-700 font-bold block">إضافات الملاحظات</span>
                          <span className="text-sm font-bold font-mono text-sky-200 print:text-sky-800">
                            {totalNotesAmount > 0 ? '+' : ''}{formatCurrency(totalNotesAmount)}
                          </span>
                        </div>
                      )}

                      <div className="text-right border-r border-slate-700 print:border-slate-300 pr-4">
                        <span className="text-[10px] text-[#FACC15] print:text-slate-600 font-extrabold block">صافي القيمة النهائية</span>
                        <span className="text-2xl font-black text-[#FACC15] print:text-[#0F172A] leading-none">
                          {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] text-[#FACC15] print:text-slate-600 font-extrabold block mb-0.5">صافي القيمة النهائية</span>
                      <span className="text-2xl font-black text-[#FACC15] print:text-[#0F172A] leading-none">
                        {formatCurrency(calculations.totalPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Customer & Technical Notes */}
              {(notes || additionalNotes.some(n => n.text)) && (
                <div className="mt-3.5 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-right space-y-2 print:break-inside-avoid">
                  <h3 className="text-[11px] font-extrabold text-[#0F172A]">
                    ملاحظات خاصة وتفاصيل إضافية:
                  </h3>

                  {notes && (
                    <div className="text-xs text-slate-700 font-semibold whitespace-pre-wrap leading-relaxed">
                      {notes}
                      {notesAmount !== 0 && (
                        <span className="mr-2 font-extrabold text-[#0F172A] tabular-nums">
                          ({notesAmount > 0 ? 'إضافة: ' : 'خصم: '}{formatCurrency(Math.abs(notesAmount))})
                        </span>
                      )}
                    </div>
                  )}

                  {additionalNotes.map((note, idx) =>
                    note.text ? (
                      <div key={note.id || idx} className="pt-1.5 border-t border-dashed border-slate-200 text-xs text-slate-700 font-semibold whitespace-pre-wrap leading-relaxed">
                        {note.text}
                        {note.amount !== 0 && (
                          <span className="mr-2 font-extrabold text-[#0F172A] tabular-nums">
                            ({note.amount > 0 ? 'إضافة: ' : 'خصم: '}{formatCurrency(Math.abs(note.amount))})
                          </span>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Terms & Specifications */}
              <div className="mt-4 border-t border-slate-200 pt-3.5 text-right terms-block print:break-inside-avoid">
                <h3 className="text-[11px] font-extrabold text-slate-500 mb-2">
                  الشروط والمواصفات الفنية وضمان المكاوي هوم
                </h3>
                <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                  <p><strong className="text-[#0F172A]">· الضمان المعتمد:</strong> ضمان 10 سنوات على قطاعات الـ UPVC ضد تغير اللون وعيوب التصنيع وثبات المقطع.</p>
                  <p><strong className="text-[#0F172A]">· الإكسسوارات:</strong> إكسسوارات تركية أصلية مقاومة للصدأ <span className="font-mono text-[10px] text-[#0F172A]">[VORNE · FORNAX · GIVESS · ROTEX]</span>.</p>
                  <p><strong className="text-[#0F172A]">· إحكام العزل:</strong> جوانات كاوتشوك مزدوجة تمنع تسريب الأتربة ومياه الأمطار وتعزل الضوضاء الخارجية.</p>
                  <p><strong className="text-[#0F172A]">· رفع المقاسات:</strong> هذا العرض مبدئي وفق مقاساتكم الأولية، ويتم رفع المقاسات النهائية هندسياً بالموقع مجاناً.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Signatures (Final Page) & Official Footer Citation (Every Page) */}
        <div className="w-full pt-3 mt-3">
          {isLastPage && (
            <div className="grid grid-cols-2 gap-8 text-center text-xs font-bold border-t border-slate-200 pt-4 mb-3 signatures-block print:break-inside-avoid">
              <div>
                <p className="text-slate-500 mb-6 font-extrabold text-[11px]">توقيع واعتماد العميل</p>
                <div className="border-b border-dashed border-slate-400 w-44 mx-auto" />
                <p className="text-[#0F172A] text-xs font-extrabold mt-1.5">
                  {customer.name?.trim() || 'العميل المحترم'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-6 font-extrabold text-[11px]">اعتماد المكاوي هوم</p>
                <div className="border-b border-dashed border-slate-400 w-44 mx-auto" />
                <p className="text-[#0F172A] font-extrabold text-xs mt-1.5">مهندس / حامد مكاوي</p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-bold tabular-nums">
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
          className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none print:hidden"
        >
          <div ref={exportContainerRef} style={{ width: `${BASE_PAGE_WIDTH}px` }}>
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
                      <div className="flex items-center justify-center gap-2 py-3 text-xs font-extrabold text-emerald-800">
                        <span className="w-4 h-4 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>جاري تجهيز ملف الـ PDF للمشاركة...</span>
                      </div>
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
