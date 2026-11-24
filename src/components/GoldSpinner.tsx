import React from 'react';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  texto?: string;
  className?: string;
}

export const GoldSpinner: React.FC<Props> = ({
  size = 'md',
  texto,
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[2.5px]',
    lg: 'w-10 h-10 border-[3px]'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full border-t-[#D4AF37] border-r-[#D4AF37] border-b-transparent border-l-transparent animate-spin shrink-0`}
        style={{
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.25)'
        }}
      />
      {texto && (
        <span className="text-xs font-semibold text-slate-600 tracking-wide">
          {texto}
        </span>
      )}
    </div>
  );
};
