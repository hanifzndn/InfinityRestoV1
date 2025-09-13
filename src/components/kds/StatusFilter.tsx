'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { OrderStatus } from '../../types';

interface StatusFilterProps {
  selectedStatuses: OrderStatus[];
  onChange: (statuses: OrderStatus[]) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  onChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  const availableStatuses = [
    { value: OrderStatus.CONFIRMED, label: 'New Orders', color: 'bg-blue-600' },
    { value: OrderStatus.MAKING, label: 'In Progress', color: 'bg-orange-600' },
    { value: OrderStatus.READY, label: 'Ready', color: 'bg-green-600' },
    { value: OrderStatus.DELIVERED, label: 'Delivered', color: 'bg-gray-600' }
  ];

  const toggleStatus = (status: OrderStatus) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter(s => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const selectedCount = selectedStatuses.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        filterButtonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={filterContainerRef}>
      <button
        ref={filterButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Status filter, ${selectedCount} selected`}
      >
        <span className="text-sm">
          Status Filter ({selectedCount})
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20">
          <div className="p-2 space-y-1" role="menu">
            {availableStatuses.map(status => (
              <label
                key={status.value}
                className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => toggleStatus(status.value)}
                  className="rounded border-gray-400 focus:ring-primary-500"
                  aria-label={`Filter by ${status.label}`}
                />
                
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} aria-hidden="true" />
                  <span className="text-sm text-gray-200">{status.label}</span>
                </div>
              </label>
            ))}
          </div>
          
          <div className="border-t border-gray-600 p-2">
            <button
              onClick={() => {
                onChange(availableStatuses.map(s => s.value));
                setIsOpen(false);
                filterButtonRef.current?.focus();
              }}
              className="w-full text-left px-2 py-1 text-sm text-blue-400 hover:text-blue-300"
            >
              Select All
            </button>
            
            <button
              onClick={() => {
                onChange([]);
                setIsOpen(false);
                filterButtonRef.current?.focus();
              }}
              className="w-full text-left px-2 py-1 text-sm text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};