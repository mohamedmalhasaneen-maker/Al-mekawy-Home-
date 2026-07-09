import React from 'react';
import { CustomerInfo, CalculatedItem, CalculationResult, Profile, Addon } from '../types';
import { Shield, Medal, Award, Globe, Phone, FileText, CheckCircle, ExternalLink, ThumbsUp, Instagram, Facebook, Download, MessageCircle } from 'lucide-react';
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
    
    // Give react time to render with isExporting class updates
    setTimeout(async () => {
      try {
        const element = document.getElementById('quotation-print-sheet');
        if (!element) return;

        const width = element.offsetWidth || 1120;
        const height = element.offsetHeight || 1600;

        const imgData = await htmlToImage.toPng(element, {
          quality: 0.98,
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top right'
          }
        });

        const pdf = new jspdf('p', 'mm', 'a4');
        const imgWidth = 210; // A4 standard width in mm
        const pageHeight = 297; // A4 standard height in mm
        const imgHeight = (height * imgWidth) / width;

        let heightLeft = imgHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        // Subsequent page slicing
        let pageNum = 1;
        while (heightLeft > 0) {
          position = - (pageNum * pageHeight);
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
          pageNum++;
        }

        const clientNameClean = (customer.name || 'عميل').trim().replace(/\s+/g, '_');
        pdf.save(`عرض_سعر_المكاوي_${clientNameClean}.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsExporting(false);
      }
    }, 150);
  };

  return (
    <div id="detailed-quote-view" className="mt-16 bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm hover:border-[#FACC15] transition-all duration-300 print:border-none print:shadow-none print:rounded-none print:mt-0 print:p-0">
      
      {/* Visual Indicator of Quotation Form */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-4 border-[#FACC15] print:hidden">
        <div>
          <span className="bg-[#FACC15] text-[#0F172A] px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider mb-2 inline-block">
            معاينة حية للمستند الرسمي
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white flex items-center gap-3">
            <FileText size={26} className="text-[#FACC15]" />
            عرض السعر التفصيلي للعميل
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            هذا هو الشكل النهائي لعرض السعر الذي سيتم طباعته أو حفظه كـ PDF ليُقدّم للعميل المحترم بصورة رسمية.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 self-start lg:self-center w-full sm:w-auto">
          <button
            onClick={exportToPdf}
            disabled={isExporting}
            className="bg-[#FACC15] hover:bg-yellow-400 text-[#0F172A] px-6 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition duration-200 active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin"></span>
                <span>جاري حفظ الـ PDF...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>تحميل ملف PDF منظم</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable container to maintain desktop-grade layout stability and gorgeous rendering scale on mobile devices */}
      <div className="overflow-x-auto w-full print:overflow-visible">
        {/* Actual Statement Sheet Area */}
        <div 
          className="p-4 sm:p-8 md:p-10 bg-white text-slate-900 print:p-0 w-full max-w-5xl mx-auto" 
          id="quotation-print-sheet"
        >
          
          {/* Document Header (For print as well) */}
          <div className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-stretch gap-6 pb-8 border-b-4 border-slate-900">
          <div className="flex items-center gap-4 text-right">
            <img 
              src={logoUrl} 
              alt="Al-mekawy Home Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#0F172A] object-cover shadow-sm print:border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-[#0F172A] tracking-tighter">المكاوي هوم</h1>
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
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 w-full md:w-[350px] space-y-3.5 text-right flex-none print:w-[320px] print:flex-shrink-0 print:bg-slate-50 print:border-slate-300">
            <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">بيانات العميل المحترم</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0 font-bold">اسم العميل:</span>
                <span className="font-black text-slate-900 text-sm sm:text-base">{customer.name || "عميل مكاوي هوم الموقر"}</span>
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
        <div className="my-6 text-right">
          <p className="text-slate-600 leading-relaxed text-sm">
            بناًء على طلبكم الكريم، يسعدنا في <strong className="text-slate-900 font-black">المكاوي هوم لأعمال الـ UPVC</strong> تقديم عرض الأسعار والمواصفات الفنية التالية للشبابيك والفتحات المطلوبة. جميع قطاعاتنا تركية/أوروبية تتميز بأعلى معايير الجودة ومقاومة العوامل الجوية المختلفة وعوازل تام للأتربة والصوت.
          </p>
        </div>

        {/* Detailed Sheet Table */}
        <div className="overflow-x-auto my-8 border-2 border-slate-900 rounded-2xl overflow-hidden print:border-slate-800">
          <table className="w-full border-collapse text-right text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#0F172A] text-white font-display border-b-2 border-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-wider print:bg-[#0F172A] print:text-white">
                <th className="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center w-8 sm:w-12 border-l border-slate-800">م</th>
                <th className="py-2.5 sm:py-4 px-2 sm:px-4 border-l border-slate-800">بيان البند والموقع التوضيحي</th>
                <th className="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center border-l border-slate-800">المقاسات (سم)</th>
                <th className="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center border-l border-slate-800">المساحة م²</th>
                <th className="py-2.5 sm:py-4 px-1 sm:px-2 text-center border-l border-slate-800">العدد</th>
                <th className="py-2.5 sm:py-4 px-2 sm:px-4 border-l border-slate-800">تفاصيل القطاع والزجاج</th>
                <th className="py-2.5 sm:py-4 px-1.5 sm:px-4 border-l border-slate-800">الإضافات الاختيارية</th>
                <th className="py-2.5 sm:py-4 px-2 sm:px-4 text-left">إجمالي البند</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {calculations.itemsCalculated.map((item, idx) => {
                const threshold = 1.0;
                const isMinArea = (item.width * item.height) / 10000 < threshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                    {/* Item Serial */}
                    <td className="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center font-mono font-bold text-slate-400 border-l border-slate-100">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    
                    {/* Title & Preview Drawing */}
                    <td className="py-2.5 sm:py-4 px-2 sm:px-4 border-l border-slate-100">
                      <div className="flex items-center justify-between gap-3 min-w-[160px] sm:min-w-[200px]">
                        <div className="text-right">
                          <div className="font-bold text-slate-900 text-xs sm:text-base flex flex-wrap items-center gap-1 sm:gap-2">
                            <span>{item.title}</span>
                            <span className="text-[9px] sm:text-[10px] font-black bg-slate-100 text-slate-700 px-1 sm:px-1.5 py-0.5 rounded print:bg-slate-200 shrink-0">
                              {item.itemType === 'door' ? 'باب' : item.itemType === 'balcony' ? 'بلكونة' : 'شباك'}
                            </span>
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-400 mt-1">نظام الفتح: {item.opening}</div>
                        </div>
                        <div className="shrink-0 w-10 h-10 sm:w-[54px] sm:h-[54px] bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-0.5 shadow-sm print:bg-white print:border-slate-300">
                          <MiniItemPreview item={item} />
                        </div>
                      </div>
                    </td>

                    {/* Width x Height */}
                    <td className="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-xs sm:text-sm" dir="ltr">
                      {item.width} × {item.height}
                    </td>

                    {/* Area Calculations */}
                    <td className="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center border-l border-slate-100 text-xs sm:text-sm">
                      <div className="font-bold text-[#0F172A]">{item.area.toFixed(2)} م²</div>
                      {isMinArea && (
                        <div className="text-[9px] sm:text-[10px] text-amber-600 font-extrabold mt-0.5 whitespace-nowrap print:text-amber-700">
                          (الحد الأدنى {threshold.toFixed(1)} م²)
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 sm:py-4 px-1 sm:px-2 text-center font-mono font-bold text-[#0F172A] border-l border-slate-100 text-xs sm:text-sm">
                      {item.quantity || 1}
                    </td>

                     {/* Specs & glass */}
                    <td className="py-2.5 sm:py-4 px-2 sm:px-4 border-l border-slate-100 text-xs">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">
                        {profiles[item.profile]?.name || item.profile}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-normal">
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
                    <td className="py-2.5 sm:py-4 px-1.5 sm:px-4 border-l border-slate-100 text-[10px] sm:text-xs text-slate-600">
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
                    <td className="py-2.5 sm:py-4 px-2 sm:px-4 text-left whitespace-nowrap">
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
              })}
            </tbody>
          </table>
        </div>

        {/* Grand Total Area and Calculations */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-row justify-between items-center gap-6 print:bg-slate-100 print:text-[#0F172A] print:border-2 print:border-slate-800 print:break-inside-avoid">
          <div className="text-right">
            <h4 className="font-display font-black text-xl mb-1 text-white print:text-[#0F172A]">مجموع مسطحات الأعمال</h4>
            <p className="text-slate-400 text-sm print:text-slate-500">
              إجمالي المساحة الفعلية للفتحات المحسوبة تبلغ بالامتار المسطحة:
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
          <div className="mt-8 bg-slate-50 border-r-4 border-[#0F172A] p-5 rounded-2xl text-right space-y-4 print:break-inside-avoid">
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
        <div className="mt-10 border-t-2 border-slate-200 pt-8 text-right print:break-inside-avoid">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">الشروط والمواصفات وجودة المكاوي هوم</h3>
          
          <div className="grid grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed font-medium">
            <ul className="space-y-3">
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

            <ul className="space-y-3">
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
        <div className={`mt-10 p-5 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden ${isExporting ? '!hidden' : ''}`}>
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
        <div className="mt-12 grid grid-cols-2 print:grid-cols-2 gap-8 text-center text-sm font-bold border-t border-slate-200 pt-8 print:break-inside-avoid">
          <div>
            <p className="text-slate-400 mb-8 font-black uppercase text-xs tracking-wider">توقيع واعتماد العميل</p>
            <div className="border-b-2 border-slate-350 border-dashed w-40 mx-auto" />
            <p className="text-slate-900 text-xs font-black mt-2">{customer.name || "العميل المحترم"}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-8 font-black uppercase text-xs tracking-wider">الاعتماد الرسمي للمركز المعني</p>
            <div className="border-b-2 border-slate-350 border-dashed w-40 mx-auto" />
            <p className="text-[#0F172A] font-black text-xs mt-2">مهندس/ حامد مكاوي</p>
          </div>
        </div>

        {/* Small footer citation */}
        <div className="mt-10 border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">
          <p>© {new Date().getFullYear()} AL-MAKKAWI HOME • OFFICIAL QUOTATION</p>
          <p className={`hidden print:block flex items-center gap-1 ${isExporting ? '!flex' : ''}`}>
            <span>فيسبوك: </span>
            <span className="font-mono text-slate-800 lowercase">https://www.facebook.com/share/1Bfwi9XFow/</span>
          </p>
        </div>

      </div>
     </div>
    </div>
  );
}
