import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  online?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  online = false, 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn(
        "rounded-full overflow-hidden border-2 border-white shadow-sm",
        sizeClasses[size]
      )}>
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=1D4ED8&color=fff`;
          }}
        />
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white" />
      )}
    </div>
  );
};

export default Avatar;
