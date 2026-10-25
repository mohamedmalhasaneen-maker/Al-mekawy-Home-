import React from 'react';
import { CustomerInfo, CalculatedItem, CalculationResult, Profile, Addon } from '../types';
import { Shield, Medal, Award, Globe, Phone, FileText, CheckCircle, ExternalLink, ThumbsUp, Instagram, Facebook, Download, MessageCircle, ChevronRight, ChevronLeft, Layers } from 'lucide-react';
import jspdf from 'jspdf';
import * as htmlToImage from 'html-to-image';
import logoUrl from '../assets/images/almekawy_logo_1780823019540.png';

interface Props {
  customer: CustomerInfo;
  calculations: CalculationResult;
  formatCurrency: (value: number) => string;
  profiles: Record<string, Profile>;
  addons: Record<string, Addon>;
}

function MiniItemPreview({ item }: { item: CalculatedItem }) {
  const width = item.width || 100;
  const height = item.height || 100;
  const aspect = width / height;
  const clampedAspect = Math.max(0.5, Math.min(2.0, aspect));

  let svgWidth = 46;
  let svgHeight = 46;
  if (clampedAspect > 1) {
    svgHeight = Math.round(46 / clampedAspect);
    svgWidth = 46;
  } else {
    svgWidth = Math.round(46 * clampedAspect);
    svgHeight = 46;
  }

  const isDoor = item.itemType === 'door';
  const opening = item.opening;
  const innerType = item.innerType || 'glass';
  const hasSpecialColor = item.addons.includes('specialColor');

  // Colors
  const frameOuterColor = hasSpecialColor ? '#334155' : '#E2E8F0';
  const frameInnerColor = hasSpecialColor ? '#1E293B' : '#F1F5F9';
  const frameStrokeColor = hasSpecialColor ? '#0F172A' : '#94A3B8';

  // Glass Type Visualizations matching DynamicPreview
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

  const pSize = 3; 
  const margin = 2;
  const drawW = svgWidth - margin * 2;
  const drawH = svgHeight - margin * 2;

  const renderContent = () => {
    const paneX = margin + pSize;
    const paneY = margin + pSize;
    const paneW = drawW - pSize * 2;
    const paneH = drawH - pSize * 2;

    const isDoubleSash = (opening === 'جرار') || (opening === 'مفصلي' && (item.hingePanes === 'ضلفتين' || item.addons.includes('skewWindow2') || item.addons.includes('skewBalcony2')));

    if (isDoor) {
      if (innerType === 'panel') {
        if (isDoubleSash) {
          const midX = paneX + paneW / 2;
          return (
            <g>
              {/* Left pane */}
              <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 6 }).map((_, i) => {
                const ly = paneY + (paneH / 7) * (i + 1);
                return <line key={i} x1={paneX + 1} y1={ly} x2={midX - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}
              {/* Right pane */}
              <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 6 }).map((_, i) => {
                const ly = paneY + (paneH / 7) * (i + 1);
                return <line key={i} x1={midX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}
            </g>
          );
        } else {
          return (
            <g>
              <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 6 }).map((_, i) => {
                const ly = paneY + (paneH / 7) * (i + 1);
                return <line key={i} x1={paneX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}
            </g>
          );
        }
      } else if (innerType === 'panel_glass') {
        const splitY = paneY + paneH * 0.45;
        if (isDoubleSash) {
          const midX = paneX + paneW / 2;
          return (
            <g>
              {/* Left side */}
              <rect x={paneX} y={paneY} width={paneW / 2} height={splitY - paneY} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <path d={`M ${paneX + 1} ${paneY + 1} L ${midX - 1} ${paneY + 1} L ${paneX + 1} ${splitY - 1} Z`} fill="rgba(255,255,255,0.15)" />
              <rect x={paneX - 0.5} y={splitY} width={paneW / 2 + 0.5} height="2.5" fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <rect x={paneX} y={splitY + 2.5} width={paneW / 2} height={paneH - (splitY - paneY) - 2.5} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 3 }).map((_, i) => {
                const ly = (splitY + 2.5) + ((paneH - (splitY - paneY) - 2.5) / 4) * (i + 1);
                return <line key={i} x1={paneX + 1} y1={ly} x2={midX - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}

              {/* Right side */}
              <rect x={midX} y={paneY} width={paneW / 2} height={splitY - paneY} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <path d={`M ${midX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${midX + 1} ${splitY - 1} Z`} fill="rgba(255,255,255,0.15)" />
              <rect x={midX} y={splitY} width={paneW / 2 + 0.5} height="2.5" fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <rect x={midX} y={splitY + 2.5} width={paneW / 2} height={paneH - (splitY - paneY) - 2.5} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 3 }).map((_, i) => {
                const ly = (splitY + 2.5) + ((paneH - (splitY - paneY) - 2.5) / 4) * (i + 1);
                return <line key={i} x1={midX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}
            </g>
          );
        } else {
          return (
            <g>
              <rect x={paneX} y={paneY} width={paneW} height={splitY - paneY} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <path d={`M ${paneX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${paneX + 1} ${splitY - 1} Z`} fill="rgba(255,255,255,0.15)" />
              <rect x={paneX - 0.5} y={splitY} width={paneW + 1} height="2.5" fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <rect x={paneX} y={splitY + 2.5} width={paneW} height={paneH - (splitY - paneY) - 2.5} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
              {Array.from({ length: 3 }).map((_, i) => {
                const ly = (splitY + 2.5) + ((paneH - (splitY - paneY) - 2.5) / 4) * (i + 1);
                return <line key={i} x1={paneX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
              })}
            </g>
          );
        }
      } else {
        if (isDoubleSash) {
          const midX = paneX + paneW / 2;
          return (
            <g>
              <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <path d={`M ${paneX + 1} ${paneY + 1} L ${midX - 1} ${paneY + 1} L ${paneX + 1} ${paneY + paneH - 1} Z`} fill="rgba(255,255,255,0.15)" />
              <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <path d={`M ${midX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${midX + 1} ${paneY + paneH - 1} Z`} fill="rgba(255,255,255,0.15)" />
            </g>
          );
        } else {
          return (
            <g>
              <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.75" />
              <path d={`M ${paneX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${paneX + 1} ${paneY + paneH - 1} Z`} fill="rgba(255,255,255,0.15)" />
            </g>
          );
        }
      }
    }

    if (innerType === 'panel') {
      if (isDoubleSash) {
        const midX = paneX + paneW / 2;
        return (
          <g>
            {/* Left panel sash */}
            <rect x={paneX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
            {Array.from({ length: 4 }).map((_, i) => {
              const ly = paneY + (paneH / 5) * (i + 1);
              return <line key={i} x1={paneX + 1} y1={ly} x2={midX - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
            })}
            
            {/* Right panel sash */}
            <rect x={midX} y={paneY} width={paneW / 2} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
            {Array.from({ length: 4 }).map((_, i) => {
              const ly = paneY + (paneH / 5) * (i + 1);
              return <line key={i} x1={midX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
            })}

            {opening === 'مفصلي' && (
              <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
                <polyline points={`${midX - 1},${paneY + 1} ${paneX + 1},${paneY + paneH / 2} ${midX - 1},${paneY + paneH - 1}`} />
                <polyline points={`${midX + 1},${paneY + 1} ${paneX + paneW - 1},${paneY + paneH / 2} ${midX + 1},${paneY + paneH - 1}`} />
              </g>
            )}
          </g>
        );
      } else {
        return (
          <g>
            <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.75" />
            {Array.from({ length: 4 }).map((_, i) => {
              const ly = paneY + (paneH / 5) * (i + 1);
              return <line key={i} x1={paneX + 1} y1={ly} x2={paneX + paneW - 1} y2={ly} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />;
            })}
            {opening === 'مفصلي' && (
              <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
                <polyline points={`${paneX + paneW - 1},${paneY + 1} ${paneX + 1},${paneY + paneH / 2} ${paneX + paneW - 1},${paneY + paneH - 1}`} />
              </g>
            )}
            {opening === 'قلاب' && (
              <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
                <polyline points={`${paneX + 1},${paneY + paneH - 1} ${paneX + paneW / 2},${paneY + 1} ${paneX + paneW - 1},${paneY + paneH - 1}`} />
              </g>
            )}
          </g>
        );
      }
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
              <rect x={paneX + 0.5} y={paneY + (paneH * 0.6)} width={(paneW / 2) - 1} height={paneH * 0.4} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <rect x={midX + 0.5} y={paneY + (paneH * 0.6)} width={(paneW / 2) - 1} height={paneH * 0.4} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <line x1={paneX + 1.5} y1={paneY + (paneH * 0.8)} x2={midX - 1.5} y2={paneY + (paneH * 0.8)} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />
              <line x1={midX + 1.5} y1={paneY + (paneH * 0.8)} x2={paneX + paneW - 1.5} y2={paneY + (paneH * 0.8)} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />
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
            <rect x={paneX + 1} y={paneY + 1} width={paneW / 2 - 2} height={paneH - 2} fill="none" stroke={frameInnerColor} strokeWidth="1" />
            <rect x={midX + 1} y={paneY + 1} width={paneW / 2 - 2} height={paneH - 2} fill="none" stroke={frameInnerColor} strokeWidth="1" />
            <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
              <polyline points={`${midX - 1},${paneY + 1} ${paneX + 1},${paneY + paneH / 2} ${midX - 1},${paneY + paneH - 1}`} />
              <polyline points={`${midX + 1},${paneY + 1} ${paneX + paneW - 1},${paneY + paneH / 2} ${midX + 1},${paneY + paneH - 1}`} />
            </g>
            {innerType === 'panel_glass' && (
              <g>
                <rect x={paneX + 0.5} y={paneY + (paneH * 0.65)} width={(paneW / 2) - 1} height={paneH * 0.35} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
                <rect x={midX + 0.5} y={paneY + (paneH * 0.65)} width={(paneW / 2) - 1} height={paneH * 0.35} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
                <line x1={paneX + 1.5} y1={paneY + (paneH * 0.8)} x2={midX - 1.5} y2={paneY + (paneH * 0.8)} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />
                <line x1={midX + 1.5} y1={paneY + (paneH * 0.8)} x2={paneX + paneW - 1.5} y2={paneY + (paneH * 0.8)} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />
              </g>
            )}
          </g>
        );
      } else {
        return (
          <g>
            <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
            <rect x={paneX + 1} y={paneY + 1} width={paneW - 2} height={paneH - 2} fill="none" stroke={frameInnerColor} strokeWidth="1.2" />
            <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
              <polyline points={`${paneX + paneW - 1},${paneY + 1} ${paneX + 1},${paneY + paneH / 2} ${paneX + paneW - 1},${paneY + paneH - 1}`} />
            </g>
            {innerType === 'panel_glass' && (
              <g>
                <rect x={paneX + 0.5} y={paneY + (paneH * 0.65)} width={paneW - 1} height={paneH * 0.35} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
                <line x1={paneX + 1.5} y1={paneY + (paneH * 0.82)} x2={paneX + paneW - 1.5} y2={paneY + (paneH * 0.82)} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />
              </g>
            )}
          </g>
        );
      }
    } else if (opening === 'قلاب') {
      return (
        <g>
          <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
          <rect x={paneX + 1} y={paneY + 1} width={paneW - 2} height={paneH - 2} fill="none" stroke={frameInnerColor} strokeWidth="1.2" />
          <g stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="1,1" fill="none">
            <polyline points={`${paneX + 1},${paneY + paneH - 1} ${paneX + paneW / 2},${paneY + 1} ${paneX + paneW - 1},${paneY + paneH - 1}`} />
          </g>
          {innerType === 'panel_glass' && (
            <g>
              <rect x={paneX + 0.5} y={paneY + (paneH * 0.65)} width={paneW - 1} height={paneH * 0.35} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <line x1={paneX + 1.5} y1={paneY + (paneH * 0.82)} x2={paneX + paneW - 1.5} y2={paneY + (paneH * 0.82)} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />
            </g>
          )}
        </g>
      );
    } else {
      return (
        <g>
          <rect x={paneX} y={paneY} width={paneW} height={paneH} fill={glassFill} stroke={frameStrokeColor} strokeWidth="0.5" />
          <path d={`M ${paneX + 1} ${paneY + 1} L ${paneX + paneW - 1} ${paneY + 1} L ${paneX + 1} ${paneY + paneH - 1} Z`} fill="rgba(255,255,255,0.15)" />
          {innerType === 'panel_glass' && (
            <g>
              <rect x={paneX + 0.5} y={paneY + (paneH * 0.65)} width={paneW - 1} height={paneH * 0.35} fill={frameInnerColor} stroke={frameStrokeColor} strokeWidth="0.5" />
              <line x1={paneX + 1.5} y1={paneY + (paneH * 0.82)} x2={paneX + paneW - 1.5} y2={paneY + (paneH * 0.82)} stroke={hasSpecialColor ? '#1E293B' : '#CBD5E1'} strokeWidth="0.5" />
            </g>
          )}
        </g>
      );
    }
  };

  return (
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto block" xmlns="http://www.w3.org/2000/svg">
      <rect x={margin} y={margin} width={drawW} height={drawH} fill={frameOuterColor} stroke={frameStrokeColor} strokeWidth="1" rx="1.5" />
      {renderContent()}
    </svg>
  );
}

export default function DetailedQuoteView({ customer, calculations, formatCurrency, profiles, addons }: Props) {
  const [isExporting, setIsExporting] = React.useState(false);
  const previewWrapperRef = React.useRef<HTMLDivElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [scaleRatio, setScaleRatio] = React.useState<number>(1);
  const [rawHeight, setRawHeight] = React.useState<number>(0);

  const TARGET_SHEET_WIDTH = 768;
  const ITEMS_PER_PAGE = 12;

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
  const [selectedPage, setSelectedPage] = React.useState<'all' | number>('all');

  React.useEffect(() => {
    if (typeof selectedPage === 'number' && selectedPage >= totalPages) {
      setSelectedPage('all');
    }
  }, [totalPages, selectedPage]);

  React.useEffect(() => {
    const handleResize = () => {
      if (previewWrapperRef.current && sheetRef.current) {
        const availableW = previewWrapperRef.current.clientWidth;
        const currentRawH = sheetRef.current.offsetHeight;
        setRawHeight(currentRawH);

        if (availableW > 0 && availableW < TARGET_SHEET_WIDTH) {
          const ratio = availableW / TARGET_SHEET_WIDTH;
          setScaleRatio(ratio);
        } else {
          setScaleRatio(1);
        }
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (previewWrapperRef.current) {
      resizeObserver.observe(previewWrapperRef.current);
    }
    if (sheetRef.current) {
      resizeObserver.observe(sheetRef.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [calculations, customer, selectedPage, isExporting]);

  const quoteNumber = React.useMemo(() => {
    const today = new Date();
    const random = Math.floor(100 + Math.random() * 900);
    return `MH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-${random}`;
  }, []);

  const { discountType = 'cash', discountValue = 0, notesAmount = 0, notes = '', additionalNotes = [] } = customer;

  const discountAmount = React.useMemo(() => {
    let amount = 0;
    if (discountType === 'percentage') {
      amount = (calculations.totalPrice * discountValue) / 100;
    } else {
      amount = discountValue;
    }
    return amount > calculations.totalPrice ? calculations.totalPrice : amount;
  }, [calculations.totalPrice, discountType, discountValue]);

  const totalNotesAmount = React.useMemo(() => {
    return notesAmount + additionalNotes.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [notesAmount, additionalNotes]);

  const finalPrice = React.useMemo(() => {
    return Math.max(0, calculations.totalPrice - discountAmount + totalNotesAmount);
  }, [calculations.totalPrice, discountAmount, totalNotesAmount]);

  const whatsappUrl = React.useMemo(() => {
    const todayStr = customer.date || new Date().toISOString().split('T')[0];
    const clientName = (customer.name || 'عميل مكاوي هوم الموقر').trim();
    const clientPhone = (customer.phone || 'غير محدد بشكل تفصيلي').trim();
    const clientAddress = (customer.address || 'بناءً على مقاسات العميل').trim();
    const deliveryStr = customer.deliveryDate ? `⏱️ *تاريخ التوريد المتوقع:* ${customer.deliveryDate}\n` : '';

    const itemsText = calculations.itemsCalculated.map((item, idx) => {
      const typeLabel = item.itemType === 'door' ? 'باب' : item.itemType === 'balcony' ? 'بلكونة' : 'شباك';
      const qty = item.quantity || 1;
      const addonsList = item.addons.map(addonId => addons[addonId]?.name || addonId).join('، ');
      const addonsStr = addonsList ? ` (إضافات: ${addonsList})` : '';
      return `🔹 *[${idx + 1}] ${item.title} (${typeLabel})*\n   📐 المقاس: ${item.width} × ${item.height} سم | المساحة: ${item.area.toFixed(2)} م²\n   📦 القطاع: ${profiles[item.profile]?.name || item.profile} | ${item.glassType}${addonsStr}\n   👥 العدد: ${qty} | الإجمالي: ${formatCurrency(item.itemTotal)}`;
    }).join('\n\n');

    const discountStr = discountValue > 0 ? `🧧 *الخصم:* - ${formatCurrency(discountAmount)}\n` : '';
    const notesStr = totalNotesAmount !== 0 ? `➕ *تسويات وملاحظات إضافية:* ${totalNotesAmount > 0 ? '+' : ''}${formatCurrency(totalNotesAmount)}\n` : '';

    const messageText = `السلام عليكم ورحمة الله وبركاته،
*عرض سعر تفصيلي من المكاوي هوم (Al-mekawy Home)* 🏠✨
لأعمال وتوريدات الـ UPVC الفاخرة للشبابيك والأبواب.

*بيانات العميل الموقر:*
👤 *الاسم:* ${clientName}
📞 *رقم الهاتف:* ${clientPhone}
📍 *موقع التركيب:* ${clientAddress}
🗓️ *تاريخ العرض:* ${todayStr}
${deliveryStr}
*تفاصيل البنود:*
${itemsText}

*الملخص المالي:*
📐 *إجمالي المساحة:* ${calculations.totalArea.toFixed(2)} م²
💵 *القيمة الكلية:* ${formatCurrency(calculations.totalPrice)}
${discountStr}${notesStr}💰 *صافي القيمة النهائية:* *${formatCurrency(finalPrice)}*

شكراً لثقتكم بالمكاوي هوم! لمزيد من التفاصيل، نسعد بتواصلكم معنا.`;

    const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, '') : '';
    const whatsappPhone = cleanPhone.startsWith('01') && cleanPhone.length === 11 ? `2${cleanPhone}` : cleanPhone;
    
    return `https://api.whatsapp.com/send?${whatsappPhone ? `phone=${whatsappPhone}&` : ''}text=${encodeURIComponent(messageText)}`;
  }, [customer, calculations, profiles, addons, discountValue, discountAmount, totalNotesAmount, finalPrice, formatCurrency]);

  const exportToPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    // Give react time to render all pages with isExporting class updates
    setTimeout(async () => {
      try {
        const element = document.getElementById('quotation-print-sheet');
        if (!element) return;

        const pageElements = Array.from(
          element.querySelectorAll<HTMLElement>('.quotation-page-sheet')
        );
        const targets = pageElements.length > 0 ? pageElements : [element];

        const pdf = new jspdf('p', 'mm', 'a4');
        const pdfPageW = 210; // A4 standard width in mm
        const pdfPageH = 297; // A4 standard height in mm
        const margin = 4; // 4mm clean margin
        const maxW = pdfPageW - margin * 2;
        const maxH = pdfPageH - margin * 2;

        for (let i = 0; i < targets.length; i++) {
          const pageEl = targets[i];
          const elW = pageEl.offsetWidth || 768;
          const elH = pageEl.offsetHeight || 1080;

          const imgData = await htmlToImage.toPng(pageEl, {
            width: elW,
            height: elH,
            quality: 0.98,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            style: {
              transform: 'none',
              transformOrigin: 'top right',
              borderRadius: '0px',
              boxShadow: 'none',
              margin: '0px',
            }
          });

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
            pdf.addImage(imgData, 'PNG', offsetX, margin, renderW, renderH, undefined, 'FAST');
          } else {
            // Fallback multi-slice only if custom notes make the final page extraordinarily long
            let heightLeft = renderH;
            let sliceIdx = 0;
            pdf.addImage(imgData, 'PNG', margin, margin, renderW, renderH, undefined, 'FAST');
            heightLeft -= maxH;
            while (heightLeft > 0) {
              sliceIdx++;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', margin, margin - (sliceIdx * maxH), renderW, renderH, undefined, 'FAST');
              heightLeft -= maxH;
            }
          }
        }

        const clientNameClean = (customer.name || 'عميل').trim().replace(/\s+/g, '_');
        pdf.save(`عرض_سعر_المكاوي_${clientNameClean}.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsExporting(false);
      }
    }, 180);
  };

  return (
    <div id="detailed-quote-view" className="-mx-3 -mt-3 sm:mx-0 sm:mt-8 bg-white border-0 sm:border-2 border-slate-300 rounded-none sm:rounded-3xl overflow-hidden shadow-sm hover:border-[#FACC15] transition-all duration-300 print:border-none print:shadow-none print:rounded-none print:mt-0 print:p-0">
      
      {/* Visual Indicator of Quotation Form */}
      <div className="bg-[#0F172A] text-white p-3.5 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-4 border-[#FACC15] print:hidden">
        <div>
          <span className="bg-[#FACC15] text-[#0F172A] px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider mb-1.5 inline-block">
            معاينة حية للمستند الرسمي
          </span>
          <h2 className="text-lg sm:text-3xl font-display font-black text-white flex items-center gap-2.5">
            <FileText size={20} className="text-[#FACC15]" />
            عرض السعر التفصيلي للعميل
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            مقسم تلقائياً إلى صفحات منظمة بحد أقصى ١٢ بند في كل صفحة لسهولة القراءة والطباعة.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 self-start lg:self-center w-full sm:w-auto">
          <button
            onClick={exportToPdf}
            disabled={isExporting}
            className="bg-[#FACC15] hover:bg-yellow-400 text-[#0F172A] px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition duration-200 active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin"></span>
                <span>جاري حفظ الـ PDF...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>تحميل ملف PDF منظم ({totalPages} {totalPages === 1 ? 'صفحة' : 'صفحات'})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pagination Bar (12 items per page indicator & page switcher) */}
      <div className="bg-slate-800 text-white px-3.5 py-2.5 sm:px-6 sm:py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        <div className="flex items-center gap-2 text-xs font-black">
          <Layers size={15} className="text-[#FACC15] shrink-0" />
          <span>نظام الصفحات (١٢ بند / صفحة):</span>
          <span className="bg-[#FACC15] text-[#0F172A] px-2 py-0.5 rounded-md font-extrabold text-[11px]">
            {calculations.itemsCalculated.length} بند • {totalPages} {totalPages === 1 ? 'صفحة' : 'صفحات'}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedPage('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                selectedPage === 'all'
                  ? 'bg-[#FACC15] text-[#0F172A] shadow-sm'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              كل الصفحات ({totalPages})
            </button>

            {itemPages.map((pItems, idx) => {
              const startNum = idx * ITEMS_PER_PAGE + 1;
              const endNum = idx * ITEMS_PER_PAGE + pItems.length;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPage(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    selectedPage === idx
                      ? 'bg-[#FACC15] text-[#0F172A] shadow-sm'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  صفحة {idx + 1} ({startNum}-{endNum})
                </button>
              );
            })}

            {typeof selectedPage === 'number' && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  disabled={selectedPage === 0}
                  onClick={() => setSelectedPage(Math.max(0, selectedPage - 1))}
                  className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 cursor-pointer"
                  title="الصفحة السابقة"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  disabled={selectedPage >= totalPages - 1}
                  onClick={() => setSelectedPage(Math.min(totalPages - 1, selectedPage + 1))}
                  className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 cursor-pointer"
                  title="الصفحة التالية"
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auto-fitting Container for Mobile & Desktop (Natural vertical scrolling with zero horizontal overflow) */}
      <div 
        ref={previewWrapperRef}
        className="w-full overflow-x-hidden bg-slate-200/80 py-2 px-0 sm:p-5 sm:rounded-b-3xl flex justify-center print:bg-white print:p-0"
      >
        {/* Paginated Statement Sheets Wrapper */}
        <div 
          ref={sheetRef}
          className="space-y-5 sm:space-y-8 print:space-y-0 transition-transform duration-200 ease-out" 
          id="quotation-print-sheet"
          style={{
            width: scaleRatio < 1 ? `${TARGET_SHEET_WIDTH}px` : '100%',
            maxWidth: `${TARGET_SHEET_WIDTH}px`,
            transform: scaleRatio < 1 ? `scale(${scaleRatio})` : 'none',
            transformOrigin: 'top center',
            marginBottom: scaleRatio < 1 && rawHeight > 0 ? `${-1 * (rawHeight * (1 - scaleRatio))}px` : '0px',
            flexShrink: 0
          }}
        >
          {itemPages.map((pageItems, pageIdx) => {
            const isFirstPage = pageIdx === 0;
            const isLastPage = pageIdx === totalPages - 1;
            const pageStartNum = pageIdx * ITEMS_PER_PAGE + 1;
            const pageEndNum = pageIdx * ITEMS_PER_PAGE + pageItems.length;
            const pageArea = pageItems.reduce((sum, it) => sum + it.area * (it.quantity || 1), 0);
            const pageSubtotal = pageItems.reduce((sum, it) => sum + it.itemTotal, 0);
            const isHiddenOnScreen = selectedPage !== 'all' && selectedPage !== pageIdx && !isExporting;

            return (
              <div
                key={pageIdx}
                data-quote-page={pageIdx + 1}
                className={`quotation-page-sheet p-4 sm:p-8 md:p-9 bg-white text-slate-900 print:p-0 shadow-lg sm:rounded-2xl border-y-2 sm:border-2 border-slate-300 print:shadow-none print:border-none print:rounded-none ${
                  !isLastPage ? 'quotation-page-break' : ''
                } ${isHiddenOnScreen ? 'hidden print:block' : 'block'}`}
              >
                {/* Page Header: Full header on Page 1, Compact Official Header on Page 2+ */}
                {isFirstPage ? (
                  <>
                    <div className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-stretch gap-5 pb-6 border-b-4 border-slate-900">
                      <div className="flex items-center gap-4 text-right">
                        <img 
                          src={logoUrl} 
                          alt="Al-mekawy Home Logo" 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#0F172A] object-cover shadow-sm print:border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-[#0F172A] tracking-tighter">المكاوي هوم</h1>
                            <span className="bg-[#0F172A] text-[#FACC15] text-[11px] font-black px-2.5 py-0.5 rounded-lg">
                              صفحة {pageIdx + 1} من {totalPages}
                            </span>
                          </div>
                          <p className="text-slate-500 font-bold uppercase text-[10px] sm:text-xs tracking-wider mt-1">
                            Al-mekawy Home • أعمال وتوريدات الـ UPVC الفاخرة للشبابيك والأبواب
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-end text-right md:text-left">
                        <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-600 font-bold">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">تاريخ العرض:</span>
                            <span className="font-mono text-slate-900">{customer.date || new Date().toISOString().split('T')[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">رقم العرض:</span>
                            <span className="font-mono text-slate-900">{quoteNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Metadata Card */}
                      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 w-full md:w-[330px] space-y-2.5 text-right flex-none print:w-[310px] print:flex-shrink-0 print:bg-slate-50 print:border-slate-300">
                        <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">بيانات العميل المحترم</h3>
                        <div className="space-y-1.5 text-xs sm:text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-slate-500 shrink-0 font-bold">اسم العميل:</span>
                            <span className="font-black text-slate-900 text-sm">{customer.name || "عميل مكاوي هوم الموقر"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-slate-500 shrink-0 font-bold">رقم الهاتف:</span>
                            <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm" dir="ltr">{customer.phone || "لم يحدد بشكل تفصيلي"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-slate-500 shrink-0 font-bold">موقع التركيب:</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{customer.address || "بناءً على مقاسات العميل"}</span>
                          </div>
                          {customer.deliveryDate && (
                            <div className="flex items-start justify-between gap-4 border-t border-dashed border-slate-200 pt-1.5 mt-1.5">
                              <span className="text-slate-500 shrink-0 font-bold">أقصى تاريخ للتسليم:</span>
                              <span className="font-black text-[#0F172A] font-mono text-xs sm:text-sm" dir="ltr">{customer.deliveryDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Introduction */}
                    <div className="my-4 text-right">
                      <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                        بناًء على طلبكم الكريم، يسعدنا في <strong className="text-slate-900 font-black">المكاوي هوم لأعمال الـ UPVC</strong> تقديم عرض الأسعار والمواصفات الفنية التالية للشبابيك والفتحات المطلوبة. جميع قطاعاتنا تركية/أوروبية تتميز بأعلى معايير الجودة ومقاومة العوامل الجوية المختلفة وعوازل تام للأتربة والصوت.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-row justify-between items-center gap-4 pb-4 mb-5 border-b-4 border-slate-900">
                    <div className="flex items-center gap-3 text-right">
                      <img 
                        src={logoUrl} 
                        alt="Al-mekawy Home Logo" 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-[#0F172A] object-cover shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-black font-display text-[#0F172A]">المكاوي هوم</h2>
                          <span className="text-xs font-extrabold text-slate-500">• تابع عرض السعر التفصيلي</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          العميل: <strong className="font-black text-[#0F172A]">{customer.name || "عميل مكاوي هوم الموقر"}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-left shrink-0">
                      <div className="text-xs font-bold text-slate-600 space-y-0.5 text-right">
                        <div>رقم العرض: <span className="font-mono text-slate-900">{quoteNumber}</span></div>
                        <div>التاريخ: <span className="font-mono text-slate-900">{customer.date || new Date().toISOString().split('T')[0]}</span></div>
                      </div>
                      <div className="bg-[#0F172A] text-[#FACC15] px-3 py-2 rounded-xl text-center">
                        <div className="text-xs font-black">صفحة {pageIdx + 1} من {totalPages}</div>
                        <div className="text-[10px] text-slate-300 font-bold">البنود {pageStartNum} - {pageEndNum}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Sheet Table (Up to 12 items per page) */}
                <div className="overflow-x-auto my-5 border-2 border-slate-900 rounded-2xl overflow-hidden print:border-slate-800">
                  <table className="w-full border-collapse text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#0F172A] text-white font-display border-b-2 border-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-wider print:bg-[#0F172A] print:text-white">
                        <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center w-8 sm:w-12 border-l border-slate-800">م</th>
                        <th className="py-2.5 sm:py-3 px-2 sm:px-4 border-l border-slate-800">بيان البند والموقع التوضيحي</th>
                        <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center border-l border-slate-800">المقاسات (سم)</th>
                        <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center border-l border-slate-800">المساحة م²</th>
                        <th className="py-2.5 sm:py-3 px-1 sm:px-2 text-center border-l border-slate-800">العدد</th>
                        <th className="py-2.5 sm:py-3 px-2 sm:px-4 border-l border-slate-800">تفاصيل القطاع والزجاج</th>
                        <th className="py-2.5 sm:py-3 px-1.5 sm:px-4 border-l border-slate-800">الإضافات الاختيارية</th>
                        <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-left">إجمالي البند</th>
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
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                              {/* Item Serial */}
                              <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-center font-mono font-bold text-slate-400 border-l border-slate-100">
                                {String(globalIdx + 1).padStart(2, '0')}
                              </td>
                              
                              {/* Title & Preview Drawing */}
                              <td className="py-2 sm:py-3 px-2 sm:px-4 border-l border-slate-100">
                                <div className="flex items-center justify-between gap-3 min-w-[160px] sm:min-w-[200px]">
                                  <div className="text-right">
                                    <div className="font-bold text-slate-900 text-xs sm:text-base flex flex-wrap items-center gap-1 sm:gap-2">
                                      <span>{item.title}</span>
                                      <span className="text-[9px] sm:text-[10px] font-black bg-slate-100 text-slate-700 px-1 sm:px-1.5 py-0.5 rounded print:bg-slate-200 shrink-0">
                                        {item.itemType === 'armored_door' ? 'باب مصفح' : item.itemType === 'door' ? 'باب' : item.itemType === 'balcony' ? 'بلكونة' : 'شباك'}
                                      </span>
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">نظام الفتح: {item.opening}</div>
                                  </div>
                                  <div className="shrink-0 w-10 h-10 sm:w-[50px] sm:h-[50px] bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-0.5 shadow-sm print:bg-white print:border-slate-300">
                                    <MiniItemPreview item={item} />
                                  </div>
                                </div>
                              </td>

                              {/* Width x Height */}
                              <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-xs sm:text-sm" dir="ltr">
                                {item.width} × {item.height}
                              </td>

                              {/* Area Calculations */}
                              <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-center border-l border-slate-100 text-xs sm:text-sm">
                                <div className="font-bold text-[#0F172A]">{item.area.toFixed(2)} م²</div>
                                {isMinArea && (
                                  <div className="text-[9px] sm:text-[10px] text-amber-600 font-extrabold mt-0.5 whitespace-nowrap print:text-amber-700">
                                    (الحد الأدنى {threshold.toFixed(1)} م²)
                                  </div>
                                )}
                              </td>

                              {/* Quantity */}
                              <td className="py-2 sm:py-3 px-1 sm:px-2 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-xs sm:text-sm">
                                {item.quantity || 1}
                              </td>

                              {/* Specs & glass */}
                              <td className="py-2 sm:py-3 px-2 sm:px-4 border-l border-slate-100 text-xs">
                                <div className="font-bold text-slate-800 text-xs sm:text-sm">
                                  {profiles[item.profile]?.name || item.profile}
                                </div>
                                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
                                  جزء داخلي: {item.innerType === 'panel' ? 'بنل بالكامل' : item.innerType === 'panel_glass' ? 'بنل مع زجاج' : 'زجاج بالكامل'}
                                </div>
                                {item.innerType !== 'panel' && (
                                  <div className="text-[10px] sm:text-xs text-slate-400">زجاج: {item.glassType}</div>
                                )}
                                {item.opening === 'مفصلي' && (
                                  <div className="text-[10px] sm:text-xs text-slate-500 font-bold mt-0.5">ضلف: {item.hingePanes || 'ضلفة'}</div>
                                )}
                              </td>

                              {/* Addons list */}
                              <td className="py-2 sm:py-3 px-1.5 sm:px-4 border-l border-slate-100 text-[10px] sm:text-xs text-slate-600">
                                {item.addons.length > 0 ? (
                                  <div className="flex flex-col gap-0.5">
                                    {item.addons.map(addonId => (
                                      <span key={addonId} className="inline-flex items-center gap-1 font-bold text-slate-700">
                                        • {addons[addonId]?.name || addonId}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 italic">لا توجد إضافات</span>
                                )}
                              </td>

                              {/* Total Rate & cost */}
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-left whitespace-nowrap">
                                <div className="font-black text-[#0F172A] font-display text-xs sm:text-base">
                                  {formatCurrency(item.itemTotal)}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                                  بمعدل {formatCurrency(item.profilePrice + item.addonsPrice)} / م²
                                </div>
                                {item.quantity && item.quantity > 1 ? (
                                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-extrabold mt-0.5 print:text-slate-600">
                                    ({formatCurrency(item.itemTotal / item.quantity)} × {item.quantity})
                                  </div>
                                ) : null}
                                {item.flatAddonsPrice && item.flatAddonsPrice > 0 ? (
                                  <div className="text-[9px] sm:text-[10px] text-emerald-700 font-extrabold mt-0.5 print:text-emerald-800">
                                    + {formatCurrency(item.flatAddonsPrice)} (مقطوع)
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

                {/* Intermediate Page Continuation Footer vs Final Page Grand Total & Terms */}
                {!isLastPage ? (
                  <div className="mt-4 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>
                        بنود هذه الصفحة: <strong className="text-[#0F172A] font-black">{pageItems.length} بنود</strong> (من {pageStartNum} إلى {pageEndNum})
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        مساحة الصفحة: <strong className="text-[#0F172A] font-mono font-black">{pageArea.toFixed(2)} م²</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        إجمالي الصفحة: <strong className="text-[#0F172A] font-black">{formatCurrency(pageSubtotal)}</strong>
                      </span>
                    </div>
                    <div className="bg-[#0F172A] text-[#FACC15] px-3 py-1 rounded-lg font-black text-[11px]">
                      يتبع في صفحة {pageIdx + 2} من {totalPages} ←
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Grand Total Area and Calculations */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 flex flex-row justify-between items-center gap-6 print:bg-slate-100 print:text-[#0F172A] print:border-2 print:border-slate-800 print:break-inside-avoid">
                      <div className="text-right">
                        <h4 className="font-display font-black text-xl mb-1 text-white print:text-[#0F172A]">مجموع مسطحات الأعمال</h4>
                        <p className="text-slate-400 text-xs sm:text-sm print:text-slate-500">
                          إجمالي المساحة الفعلية لجميع الفتحات ({calculations.itemsCalculated.length} بند):
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-x-8 gap-y-4 shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 print:text-slate-500 uppercase font-black tracking-wider block mb-1">إجمالي الأمتار</span>
                          <span className="text-2xl font-black font-mono leading-none" dir="ltr">{calculations.totalArea.toFixed(2)} m²</span>
                        </div>
                        
                        {(discountValue > 0 || totalNotesAmount !== 0) ? (
                          <>
                            <div className="bg-[#334155]/50 h-10 w-[2px] print:bg-slate-300" />
                            <div className="text-right">
                              <span className="text-xs text-slate-400 print:text-slate-500 uppercase font-black tracking-wider block mb-1">الإجمالي قبل الخصم</span>
                              <span className="text-lg font-bold font-mono leading-none text-slate-300 print:text-slate-700" dir="ltr">{formatCurrency(calculations.totalPrice)}</span>
                            </div>
                            
                            {discountValue > 0 && (
                              <>
                                <div className="bg-[#334155]/50 h-10 w-[2px] print:bg-slate-300" />
                                <div className="text-right">
                                  <span className="text-xs text-emerald-400 print:text-emerald-700 uppercase font-black tracking-wider block mb-1">خصم خاصة</span>
                                  <span className="text-lg font-bold font-mono leading-none text-emerald-300 print:text-emerald-800">- {formatCurrency(discountAmount)}</span>
                                </div>
                              </>
                            )}

                            {totalNotesAmount !== 0 && (
                              <>
                                <div className="bg-[#334155]/50 h-10 w-[2px] print:bg-slate-300" />
                                <div className="text-right">
                                  <span className="text-xs text-blue-400 print:text-blue-700 uppercase font-black tracking-wider block mb-1">إضافات الملاحظات</span>
                                  <span className="text-lg font-bold font-mono leading-none text-blue-300 print:text-blue-700" dir="ltr">
                                    {totalNotesAmount > 0 ? '+' : ''}{formatCurrency(totalNotesAmount)}
                                  </span>
                                </div>
                              </>
                            )}

                            <div className="bg-[#334155]/50 h-10 w-[2px] print:bg-slate-300" />
                            <div className="text-right">
                              <span className="text-xs text-amber-400 print:text-slate-600 uppercase font-black tracking-wider block mb-1">صافي القيمة النهائية</span>
                              <span className="text-3xl sm:text-4xl font-black font-display text-yellow-400 print:text-slate-900 leading-none">
                                {formatCurrency(finalPrice)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-[#334155]/50 h-10 w-[2px] print:bg-slate-300" />
                            <div className="text-right">
                              <span className="text-xs text-amber-400 print:text-slate-500 uppercase font-black tracking-wider block mb-1">صافي القيمة الكلية</span>
                              <span className="text-3xl sm:text-4xl font-black font-display text-yellow-400 print:text-slate-900 leading-none">
                                {formatCurrency(calculations.totalPrice)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Custom notes for print */}
                    {(notes || additionalNotes.some(n => n.text)) && (
                      <div className="mt-6 bg-slate-50 border-r-4 border-[#0F172A] p-4 rounded-2xl text-right space-y-3 print:break-inside-avoid">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#0F172A] flex items-center gap-2">
                          📝 ملاحظات خاصة وتفاصيل إضافية مضافة:
                        </h3>
                        
                        {notes && (
                          <div className="border-b border-slate-100 pb-3 last:border-none last:pb-0">
                            <p className="text-slate-700 text-sm font-bold whitespace-pre-wrap leading-relaxed">
                              {notes}
                            </p>
                            {notesAmount !== 0 && (
                              <p className="text-xs font-black text-[#0F172A] mt-2 bg-yellow-50/40 p-1.5 px-3 rounded-lg inline-block border border-yellow-200">
                                القيمة المقترنة: {notesAmount > 0 ? 'إضافة قدرها ' : 'خصم قدره '} {formatCurrency(Math.abs(notesAmount))}
                              </p>
                            )}
                          </div>
                        )}

                        {additionalNotes.map((note, idx) => note.text && (
                          <div key={note.id || idx} className="border-b border-slate-150 pb-3 last:border-none last:pb-0 pt-2 border-t border-dashed border-slate-200">
                            <p className="text-slate-700 text-sm font-bold whitespace-pre-wrap leading-relaxed">
                              {note.text}
                            </p>
                            {note.amount !== 0 && (
                              <p className="text-xs font-black text-[#0F172A] mt-2 bg-yellow-50/40 p-1.5 px-3 rounded-lg inline-block border border-yellow-200">
                                القيمة المقترنة: {note.amount > 0 ? 'إضافة قدرها ' : 'خصم قدره '} {formatCurrency(Math.abs(note.amount))}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Terms and conditions */}
                    <div className="mt-7 border-t-2 border-slate-200 pt-6 text-right print:break-inside-avoid">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">الشروط والمواصفات وجودة المكاوي هوم</h3>
                      
                      <div className="grid grid-cols-2 gap-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                            <p>
                              <strong className="text-slate-900 font-bold">المنتجات والضمان:</strong> جميع قطاعات الـ UPVC المستخدمة تشمل ضمانًا معتمدًا لمدة 10 سنوات ضد تغير الألوان، عيوب التصنيع وثبات المقطع.
                            </p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                            <p>
                              <strong className="text-slate-900 font-bold">إحكام العزل:</strong> الشبابيك مزودة بجوانات كاوتشوك مزدوجة تمنع تمامًا تسريب الغبار أو مياة الأمطار وعازلة ممتازة للأصوات الخارجية.
                            </p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                            <p>
                              <strong className="text-slate-900 font-bold">الرفع الفعلي للمقاسات:</strong> يعتبر هذا العرض مبدئي بناءً على مقاساتكم الأولية. يتوجه مهندسو المكاوي هوم لرفع مقاسات دقيقة بالموقع لتجنب أي تفاوت.
                            </p>
                          </li>
                        </ul>

                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                            <p>
                              <strong className="text-slate-900 font-bold">الإكسسوارات والمقابض:</strong> نلتزم باستخدام الإكسسوارات التركية الأصلية عالية الجودة <span className="font-mono text-xs font-black text-slate-800">[VORNE , FORNAX , GIVESS , ROTEX]</span> المقاومة للتآكل والصدأ لضمان سلاسة التشغيل.
                            </p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                            <p>
                              <strong className="text-slate-900 font-bold">الزجاج ونوعيته:</strong> زجاج دبل (مع جورجيا أو سادة حسب اختياركم) عازل أو عاكس.
                            </p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                            <p>
                              <strong className="text-slate-900 font-bold">تواصل مباشرة معنا:</strong> اضغط على روابط تواصلنا لحجز موعد المعاينة وتأكيد الطلب.
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Interactive Clickable Links (Requested by User) */}
                    <div className={`mt-7 p-4 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden ${isExporting ? '!hidden' : ''}`}>
                      <div className="text-right">
                        <h4 className="font-bold text-[#0F172A]">روابط التواصل السريع والتفاعل</h4>
                        <p className="text-xs text-slate-500">انقر على أي مما يلي للتواصل الفوري أو الانتقال لموقعنا الرسمي</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <a 
                          href="tel:+201141761261" 
                          className="py-2.5 px-4 bg-[#0F172A] text-white hover:bg-black text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone size={14} />
                          اتصال: 01141761261
                        </a>
                        <a 
                          href="tel:+201060524985" 
                          className="py-2.5 px-4 bg-[#0F172A] text-white hover:bg-black text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone size={14} />
                          اتصال: 01060524985
                        </a>
                        <a 
                          href="https://wa.me/201141761261" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="py-2.5 px-4 bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-green-950/10 hover:shadow-lg active:scale-95 ring-2 ring-emerald-400/20"
                        >
                          <MessageCircle size={14} className="text-white" />
                          <span>واتساب: 01141761261</span>
                        </a>
                        <a 
                          href="https://www.facebook.com/share/1Bfwi9XFow/" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="py-2.5 px-5 bg-[#1877F2] text-white hover:bg-[#155fc0] text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Facebook size={14} />
                          فيسبوك
                          <ExternalLink size={12} />
                        </a>
                        <a 
                          href="https://www.instagram.com/almekawy.home?igsh=bXBqZmw3NGt4bzVs" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="py-2.5 px-5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-95 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Instagram size={14} />
                          إنستغرام
                          <ExternalLink size={12} />
                        </a>
                        <a 
                          href="https://www.tiktok.com/@almekawy.home?_r=1&_t=ZS-971BmNPuWbk" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="py-2.5 px-5 bg-black hover:bg-slate-900 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer border border-slate-800"
                        >
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" className="inline">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.14.99 1.13 2.37 1.83 3.84 2.01v3.98c-1.42-.02-2.83-.37-4.11-1.02-.78-.4-1.48-.95-2.05-1.63V15.5c-.01 2.22-.9 4.34-2.48 5.86-1.58 1.52-3.76 2.32-5.98 2.21-2.41-.12-4.66-1.4-5.88-3.5-1.22-2.09-1.29-4.71-.16-6.86 1.12-2.14 3.32-3.53 5.75-3.64v3.95c-1.12.06-2.17.69-2.73 1.67-.56.97-.56 2.18-.01 3.16.55.98 1.58 1.63 2.7 1.7 1.16.07 2.29-.41 2.97-1.35.53-.73.74-1.64.74-2.54V.02h.64z" />
                          </svg>
                          تيك توك
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Space for Signatures */}
                    <div className="mt-8 grid grid-cols-2 print:grid-cols-2 gap-8 text-center text-sm font-bold border-t border-slate-200 pt-6 print:break-inside-avoid">
                      <div>
                        <p className="text-slate-400 mb-7 font-black uppercase text-xs tracking-wider">توقيع واعتماد العميل</p>
                        <div className="border-b-2 border-slate-350 border-dashed w-40 mx-auto" />
                        <p className="text-slate-900 text-xs font-black mt-2">{customer.name || "العميل المحترم"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-7 font-black uppercase text-xs tracking-wider">الاعتماد الرسمي للمركز المعني</p>
                        <div className="border-b-2 border-slate-350 border-dashed w-40 mx-auto" />
                        <p className="text-[#0F172A] font-black text-xs mt-2">مهندس/ حامد مكاوي</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Small footer citation on every page */}
                <div className="mt-6 border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">
                  <p>© {new Date().getFullYear()} AL-MAKKAWI HOME • OFFICIAL QUOTATION</p>
                  <div className="flex items-center gap-3">
                    <p className={`hidden print:flex items-center gap-1 ${isExporting ? '!flex' : ''}`}>
                      <span>فيسبوك: </span>
                      <span className="font-mono text-slate-800 lowercase">https://www.facebook.com/share/1Bfwi9XFow/</span>
                    </p>
                    <span className="bg-slate-100 text-[#0F172A] px-2.5 py-0.5 rounded font-black tracking-normal">
                      صفحة {pageIdx + 1} من {totalPages}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
