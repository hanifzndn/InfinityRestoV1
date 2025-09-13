'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input, Button } from '../ui';

interface OrderSearchProps {
  onOrderFound: (orderCode: string) => void;
}

export const OrderSearch: React.FC<OrderSearchProps> = ({ onOrderFound }) => {
  const [orderCode, setOrderCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validation
    if (!orderCode.trim()) {
      setError('Please enter an order code');
      return;
    }
    
    // Validate format (6 characters, alphanumeric)
    if (!/^[A-Z0-9]{6}$/.test(orderCode.trim())) {
      setError('Order code must be 6 characters (letters and numbers only)');
      return;
    }

    setSearching(true);
    try {
      await onOrderFound(orderCode.trim().toUpperCase());
    } catch (err) {
      setError('Order not found. Please check the code and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setOrderCode(value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            value={orderCode}
            onChange={handleInputChange}
            placeholder="Enter order code (e.g., ABC123)"
            className="text-lg font-mono"
            maxLength={6}
            error={error}
            aria-describedby={error ? "order-search-error" : undefined}
          />
          {error && (
            <p id="order-search-error" className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          loading={searching}
          icon={Search}
          disabled={!orderCode.trim() || searching}
        >
          Search
        </Button>
      </div>
      
      <p className="text-sm text-gray-600">
        Enter the 6-character order code provided by the customer
      </p>
    </form>
  );
};