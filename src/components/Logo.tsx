
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className,
  size = 'md',
  animated = true
}) => {
  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36'
  };

  return (
    <div className={cn(
      sizes[size],
      animated && 'animate-float',
      className
    )}>
      <img 
        src="/lovable-uploads/8697baef-6826-467f-8608-0054aefa260c.png" 
        alt="Pet Paradise Logo" 
        className="w-full h-full object-contain" 
      />
    </div>
  );
};

export default Logo;
