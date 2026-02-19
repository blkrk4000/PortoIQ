import React from 'react';
import { CarrierId } from '../types';
import { CARRIERS } from '../constants';

interface Props {
  carrier: CarrierId;
  className?: string;
}

export const CarrierLogo: React.FC<Props> = ({ carrier, className = "" }) => {
  const config = CARRIERS[carrier];

  // Specific styling tweaks for text-based logos
  const isItalic = carrier === 'DHL' || carrier === 'GLS';
  const isPost = carrier === 'DEUTSCHEPOST';

  return (
    <div className={`
      flex items-center justify-center
      font-black tracking-tight select-none
      shadow-sm rounded
      ${config.color} 
      ${config.textColor}
      ${className}
    `}>
      <span className={`
        ${isItalic ? 'italic' : ''}
        ${isPost ? 'text-[90%]' : 'text-full'}
      `}>
        {config.logoText}
      </span>
    </div>
  );
};