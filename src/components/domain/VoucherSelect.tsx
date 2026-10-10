import React, { useState, useRef, useEffect } from 'react';
import { VoucherCategory, VOUCHER_GROUPS } from '@/types';
import { cn } from '@/utils/cn';
import { ChevronDown, Search, Check } from 'lucide-react';

interface VoucherSelectProps {
  value?: VoucherCategory | string;
  onChange: (value: VoucherCategory) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const VoucherSelect: React.FC<VoucherSelectProps> = ({
  value,
  onChange,
  placeholder = 'Select voucher category...',
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  // Filter grouped categories
  const filteredGroups = Object.entries(VOUCHER_GROUPS).reduce((acc, [groupName, categories]) => {
    const matches = categories.filter((cat) =>
      cat.toLowerCase().includes(search.toLowerCase())
    );
    if (matches.length > 0) {
      acc[groupName] = matches;
    }
    return acc;
  }, {} as Record<string, VoucherCategory[]>);

  const handleSelect = (category: VoucherCategory) => {
    onChange(category);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={cn('relative w-full text-left', className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full h-10 px-3 bg-card border border-border rounded flex items-center justify-between text-body-md text-text-primary transition-colors cursor-pointer',
          'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle',
          disabled && 'opacity-50 cursor-not-allowed bg-surface-secondary'
        )}
      >
        <span className={cn('truncate', !value && 'text-text-secondary')}>
          {value || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-text-secondary shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded shadow-dropdown max-h-72 flex flex-col overflow-hidden animate-in fade-in-50">
          {/* Search Input */}
          <div className="p-2 border-b border-border bg-surface-secondary/50">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-text-secondary absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search 27 voucher categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-body-sm bg-card rounded border border-border text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Grouped Options list */}
          <div className="flex-1 overflow-y-auto p-1 divide-y divide-border/40">
            {Object.keys(filteredGroups).length === 0 ? (
              <div className="p-4 text-center text-body-sm text-text-secondary">
                No matching voucher categories
              </div>
            ) : (
              Object.entries(filteredGroups).map(([groupName, categories]) => (
                <div key={groupName} className="py-1">
                  <div className="px-2.5 py-1 text-label-sm font-semibold text-text-secondary tracking-wider uppercase">
                    {groupName}
                  </div>
                  {categories.map((cat) => {
                    const isSelected = value === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelect(cat)}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 text-body-sm rounded text-left transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-accent-subtle text-accent font-semibold'
                            : 'text-text-primary hover:bg-surface-secondary'
                        )}
                      >
                        <span className="truncate">{cat}</span>
                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
