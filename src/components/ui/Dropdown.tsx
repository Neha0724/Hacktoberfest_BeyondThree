import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items?: DropdownItem[];
  children?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  width?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  children,
  align = 'right',
  className,
  width = 'w-48',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer inline-flex items-center">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 rounded bg-card border border-border shadow-dropdown p-1 focus:outline-none animate-in fade-in-50 zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0',
            width,
            className
          )}
        >
          {items
            ? items.map((item, idx) => {
                if (item.divider) {
                  return <div key={`div-${idx}`} className="my-1 border-t border-border" />;
                }
                return (
                  <button
                    key={item.id}
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled && item.onClick) {
                        item.onClick();
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-1.5 text-body-sm rounded text-left transition-colors cursor-pointer',
                      item.danger
                        ? 'text-error hover:bg-error/10'
                        : 'text-text-primary hover:bg-accent-subtle',
                      item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                    )}
                  >
                    {item.icon && <span className="w-4 h-4 shrink-0 text-text-secondary">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })
            : children}
        </div>
      )}
    </div>
  );
};
