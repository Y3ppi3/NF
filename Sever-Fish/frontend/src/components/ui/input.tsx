import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  error,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseClasses = "px-3 py-2 border rounded focus:outline-none focus:ring-2";
  const errorClasses = error ? 
    "border-red-300 focus:border-red-500 focus:ring-red-500" : 
    "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
  const widthClass = fullWidth ? "w-full" : "";
  
  const classes = `
    ${baseClasses} 
    ${errorClasses} 
    ${widthClass}
    ${className}
  `;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      <input
        className={classes}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};