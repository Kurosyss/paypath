import React from 'react';

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className = 'w-4 h-4', size = 16 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PayPath Payment Lifecycle Brand Mark"
    >
      {/* Forked payment lifecycle route: authoritative settlement (top) vs intercepted duplicate (bottom) */}
      <path
        d="M 8 28 H 20 L 32 14 H 54 V 24 H 46 V 22 H 33.5 L 24 32 L 33.5 42 H 41 V 50 H 32 L 20 36 H 8 Z"
        fill="currentColor"
      />
      {/* Authoritative Interception Barrier stopping the duplicate/unsafe path */}
      <rect x="46" y="36" width="5" height="18" rx="1.5" fill="currentColor" />
    </svg>
  );
}
