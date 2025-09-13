'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { CartItem } from '../../types';
import { Card, CardContent, CardHeader, Button, Input, Textarea } from '../ui';
import { formatCurrency, calculateCartTotal } from '../../lib/utils';
import Image from 'next/image';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onCheckout: (customerNotes?: string) => void;
  onBackToMenu: () => void;
}

export const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onCheckout,
  onBackToMenu
}) => {
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const total = calculateCartTotal(items.map(item => ({
    price: item.item.price,
    quantity: item.quantity
  })));

  // Validate cart items
  useEffect(() => {
    const errors: string[] = [];
    
    // Check for items with special notes but no content
    items.forEach(item => {
      if (item.notes && item.notes.trim().length < 3) {
        errors.push(`"${item.item.name}" has very short special notes. Please provide more details or remove them.`);
      }
    });
    
    setValidationErrors(errors);
  }, [items]);

  const handleCheckout = async () => {
    setShowValidation(true);
    
    // Check if there are any validation errors
    if (validationErrors.length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onCheckout(customerNotes || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle quantity changes with validation
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
      return;
    }
    
    if (newQuantity > 50) {
      // Limit quantity to prevent abuse
      newQuantity = 50;
    }
    
    onUpdateQuantity(itemId, newQuantity);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6 text-sm">Add some delicious items from our menu</p>
            <Button onClick={onBackToMenu} className="bg-gradient-to-r from-primary-600 to-primary-700">
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Order</h1>
        <Button variant="outline" onClick={onBackToMenu} size="sm">
          ← Continue Shopping
        </Button>
      </div>

      {/* Validation Messages */}
      {showValidation && validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Please review your order</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((cartItem) => (
            <Card key={cartItem.item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                      {cartItem.item.image_url ? (
                        <Image
                          src={cartItem.item.image_url}
                          alt={cartItem.item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{cartItem.item.name}</h3>
                        <p className="text-primary-600 font-medium text-sm">
                          {formatCurrency(cartItem.item.price)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(cartItem.item.id)}
                        icon={Trash2}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity - 1)}
                          icon={Minus}
                          disabled={cartItem.quantity <= 1}
                          className="w-8 h-8 rounded-full p-0"
                        >
                          <span className="sr-only">Decrease</span>
                        </Button>
                        
                        <span className="w-8 text-center font-semibold text-sm">
                          {cartItem.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity + 1)}
                          icon={Plus}
                          className="w-8 h-8 rounded-full p-0"
                        >
                          <span className="sr-only">Increase</span>
                        </Button>
                      </div>

                      <span className="font-semibold text-primary-600">
                        {formatCurrency(cartItem.item.price * cartItem.quantity)}
                      </span>
                    </div>

                    {/* Item Notes */}
                    <div className="mt-3">
                      <Input
                        value={cartItem.notes || ''}
                        onChange={(e) => onUpdateNotes(cartItem.item.id, e.target.value)}
                        placeholder="Special requests..."
                        className="text-xs bg-gray-50 border-gray-200"
                      />
                      {showValidation && cartItem.notes && cartItem.notes.trim().length < 3 && (
                        <p className="text-xs text-red-500 mt-1">Please provide more details for special requests</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg sticky top-20">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                {items.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">
                      {cartItem.item.name} × {cartItem.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(cartItem.item.price * cartItem.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="mb-6">
                <Textarea
                  label="Order Notes (Optional)"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Any special requests..."
                  rows={3}
                  className="text-sm bg-gray-50"
                />
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3"
                size="lg"
              >
                Place Order - {formatCurrency(total)}
              </Button>
              
              <p className="text-center text-xs text-gray-500 mt-3 leading-relaxed">
                You will receive an order code to present at the cashier for payment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};