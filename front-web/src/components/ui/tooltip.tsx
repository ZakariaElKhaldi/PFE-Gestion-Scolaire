import React from 'react';

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

export const TooltipTrigger: React.FC<{ asChild: boolean; children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
}; 