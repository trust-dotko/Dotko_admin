import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      {/* Brand Blue 'D' shape */}
      <path
        d="M25 15H50C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85H25V15ZM45 31V69H50C60.493 69 69 60.493 69 50C69 39.507 60.493 31 50 31H45Z"
        fill="#1e40af"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      {/* White background cutout for the checkmark to pop */}
      <path
        d="M26 46L41 61L70 30"
        stroke="#ffffff"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brand Golden/Yellow Checkmark */}
      <path
        d="M26 46L41 61L70 30"
        stroke="#f59e0b"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
