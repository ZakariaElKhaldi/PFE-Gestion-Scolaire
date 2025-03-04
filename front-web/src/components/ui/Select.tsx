import React, { ReactNode } from 'react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, children }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="border-2 focus:border-primary">
      {children}
    </select>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

interface SelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children }) => {
  return (
    <div className={`select-trigger ${className}`}>
      {children}
    </div>
  );
};

export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => {
  return <option value="">{placeholder}</option>;
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
}; 