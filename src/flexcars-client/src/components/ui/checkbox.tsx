import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Checkbox({ 
  checked = false, 
  onCheckedChange, 
  disabled = false, 
  className = '',
  children 
}: CheckboxProps) {
  return (
    <label className={cn("flex items-center space-x-2 cursor-pointer", className)}>
      <div
        className={cn(
          "w-4 h-4 border-2 rounded flex items-center justify-center",
          checked ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      {children}
    </label>
  );
} 