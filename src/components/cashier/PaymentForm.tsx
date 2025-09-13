'use client';

import React, { useState } from 'react';
import { DollarSign, CreditCard, Smartphone } from 'lucide-react';
import { Order, PaymentMethod } from '../../types';
import { Button, Input, Select } from '../ui';
import { formatCurrency } from '../../lib/utils';

interface PaymentFormProps {
  order: Order;
  onPayment: (paymentMethod: PaymentMethod, amountPaid: number) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ order, onPayment }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountPaid, setAmountPaid] = useState<string>(order.total.toString());
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paid = parseFloat(amountPaid);
    
    if (isNaN(paid) || paid < order.total) {
      alert('Amount paid must be at least the order total');
      return;
    }

    setProcessing(true);
    try {
      await onPayment(paymentMethod, paid);
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setAmountPaid(amount.toString());
  };

  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = amountPaidNum - order.total;
  const isValidAmount = amountPaidNum >= order.total;

  const paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Cash', icon: DollarSign },
    { value: PaymentMethod.DEBIT, label: 'Debit Card', icon: CreditCard },
    { value: PaymentMethod.QRIS, label: 'QRIS', icon: Smartphone }
  ];

  const quickAmounts = [
    order.total,
    Math.ceil(order.total / 50000) * 50000,
    Math.ceil(order.total / 100000) * 100000,
    Math.ceil(order.total / 100000) * 100000 + 50000
  ].filter((amount, index, arr) => arr.indexOf(amount) === index);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Total */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`
                  flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors
                  ${paymentMethod === method.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Paid (for cash) */}
      {paymentMethod === PaymentMethod.CASH && (
        <div className="space-y-4">
          <div>
            <Input
              label="Amount Paid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              min={order.total}
              step="1000"
              placeholder="Enter amount paid"
              className="text-lg font-semibold"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Amounts:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className="text-sm"
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
          </div>

          {/* Change Calculation */}
          {isValidAmount && change > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-green-700">Change</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(change)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Non-cash payment note */}
      {paymentMethod !== PaymentMethod.CASH && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-blue-800 text-sm">
            {paymentMethod === PaymentMethod.DEBIT 
              ? 'Please insert or tap the debit card on the payment terminal.'
              : 'Please scan the QR code with your mobile payment app.'
            }
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={processing}
        disabled={paymentMethod === PaymentMethod.CASH && !isValidAmount}
      >
        Process Payment - {formatCurrency(order.total)}
      </Button>

      {/* Payment Summary */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-medium">
            {paymentMethods.find(m => m.value === paymentMethod)?.label}
          </span>
        </div>
        
        {paymentMethod === PaymentMethod.CASH && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium">{formatCurrency(amountPaidNum)}</span>
            </div>
            
            {change > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Change:</span>
                <span className="font-medium text-green-600">{formatCurrency(change)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </form>
  );
};