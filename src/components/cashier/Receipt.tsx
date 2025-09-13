'use client';

import React from 'react';
import { X, Printer, Copy, Check } from 'lucide-react';
import { Order, PaymentMethod } from '../../types';
import { Modal, ModalContent, ModalFooter, Button } from '../ui';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
  onPrint: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ order, onClose, onPrint }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyToClipboard = () => {
    // Create a formatted receipt text
    let receiptText = `INFINITYRESTO - QR Code Restaurant
`;
    receiptText += `================================
`;
    receiptText += `Order Code: ${order.code}
`;
    receiptText += `Table: ${order.table?.name || order.table_id}
`;
    receiptText += `Date: ${formatDate(order.created_at)}
`;
    receiptText += `Payment Method: ${getPaymentMethodLabel(order.payment_method)}
`;

    receiptText += `
ITEMS ORDERED
--------------------------------
`;
    
    order.order_items?.forEach(item => {
      receiptText += `${item.item?.name || 'Unknown Item'}
`;
      receiptText += `  Qty: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.quantity * item.price)}
`;
      if (item.notes) {
        receiptText += `  Note: ${item.notes}
`;
      }
    });
    
    receiptText += `
`;
    
    if (order.customer_notes) {
      receiptText += `CUSTOMER NOTES
`;
      receiptText += `${order.customer_notes}

`;
    }
    
    receiptText += `TOTAL: ${formatCurrency(order.total)}
`;
    receiptText += `PAID: ${formatCurrency(order.total)}

`;
    
    receiptText += `Thank you for dining with us!
`;
    receiptText += `Visit us again soon!
`;
    receiptText += `InfinityResto - Modern Dining Experience
`;
    
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  const getPaymentMethodLabel = (method?: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH: return 'Cash';
      case PaymentMethod.DEBIT: return 'Debit Card';
      case PaymentMethod.QRIS: return 'QRIS';
      default: return method || 'Unknown';
    }
  };

  const handlePrintReceipt = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${order.code}</title>
            <style>
              body {
                font-family: 'Courier New', Courier, monospace;
                font-size: 12px;
                margin: 20px;
                padding: 0;
                width: 300px;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .border-b { border-bottom: 1px dashed #000; }
              .border-t { border-top: 1px dashed #000; }
              .border-t-2 { border-top: 2px dashed #000; }
              .mb-2 { margin-bottom: 8px; }
              .mb-3 { margin-bottom: 12px; }
              .mb-4 { margin-bottom: 16px; }
              .mt-1 { margin-top: 4px; }
              .mt-2 { margin-top: 8px; }
              .mt-4 { margin-top: 16px; }
              .pb-2 { padding-bottom: 8px; }
              .pb-4 { padding-bottom: 16px; }
              .pt-2 { padding-top: 8px; }
              .pt-4 { padding-top: 16px; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 14px; }
              .text-sm { font-size: 11px; }
              .text-xs { font-size: 10px; }
              .capitalize { text-transform: capitalize; }
              .green { color: #059669; }
            </style>
          </head>
          <body>
            <div class="text-center border-b pb-4 mb-4">
              <h1 class="font-bold" style="font-size: 16px;">INFINITYRESTO</h1>
              <p>QR Code Restaurant</p>
              <p>Thank you for dining with us!</p>
            </div>

            <div class="mb-4">
              <div style="display: flex; justify-content: space-between;">
                <span>Order Code:</span>
                <span class="font-bold">${order.code}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between;">
                <span>Table:</span>
                <span>${order.table?.name || order.table_id}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between;">
                <span>Date:</span>
                <span>${formatDate(order.created_at)}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between;">
                <span>Payment:</span>
                <span class="capitalize">${getPaymentMethodLabel(order.payment_method)}</span>
              </div>
            </div>

            <div class="border-t pt-4 mb-4">
              <h3 class="font-bold mb-3">ITEMS ORDERED</h3>
              
              <div>
                ${(order.order_items || []).map(item => `
                  <div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>${item.item?.name || 'Unknown Item'}</span>
                      <span>${formatCurrency(item.price)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-left: 8px; font-size: 11px;">
                      <span>Qty: ${item.quantity}</span>
                      <span>${formatCurrency(item.quantity * item.price)}</span>
                    </div>
                    
                    ${item.notes ? `<div style="margin-left: 8px; font-size: 10px; font-style: italic;">Note: ${item.notes}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>

            ${order.customer_notes ? `
              <div class="border-t pt-4 mb-4">
                <h3 class="font-bold mb-2">CUSTOMER NOTES</h3>
                <p>${order.customer_notes}</p>
              </div>
            ` : ''}

            <div class="border-t-2 pt-4">
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
                <span>TOTAL:</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; color: #059669; font-weight: bold; margin-top: 4px;">
                <span>PAID:</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
            </div>

            <div class="text-center border-t-2 pt-4 mt-4 text-xs">
              <p>Visit us again soon!</p>
              <p>InfinityResto - Modern Dining Experience</p>
              <p class="mt-2">Receipt generated at ${new Date().toLocaleString()}</p>
            </div>

            <script>
              window.onload = function() {
                window.print();
                // Close the window after printing
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    
    // Call the parent print handler
    onPrint();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Receipt" size="md">
      <ModalContent>
        <div className="bg-white p-6 font-mono text-sm">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
            <h1 className="text-xl font-bold">INFINITYRESTO</h1>
            <p className="text-gray-600">QR Code Restaurant</p>
            <p className="text-gray-600">Thank you for dining with us!</p>
          </div>

          {/* Order Info */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Order Code:</span>
              <span className="font-bold">{order.code}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Table:</span>
              <span>{order.table?.name || order.table_id}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize">{getPaymentMethodLabel(order.payment_method)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
            <h3 className="font-bold mb-3">ITEMS ORDERED</h3>
            
            <div className="space-y-2">
              {order.order_items?.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span>{item.item?.name || 'Unknown Item'}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 ml-2">
                    <span>Qty: {item.quantity}</span>
                    <span>{formatCurrency(item.quantity * item.price)}</span>
                  </div>
                  
                  {item.notes && (
                    <div className="text-gray-600 ml-2 italic text-xs">
                      Note: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Notes */}
          {order.customer_notes && (
            <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
              <h3 className="font-bold mb-2">CUSTOMER NOTES</h3>
              <p className="text-gray-700">{order.customer_notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="border-t-2 border-dashed border-gray-300 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            
            <div className="flex justify-between text-green-600 font-bold mt-1">
              <span>PAID:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-dashed border-gray-300 pt-4 mt-4 text-xs text-gray-600">
            <p>Visit us again soon!</p>
            <p>InfinityResto - Modern Dining Experience</p>
            <p className="mt-2">Receipt generated at {new Date().toLocaleString()}</p>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} icon={X}>
          Close
        </Button>
        
        <Button onClick={handleCopyToClipboard} icon={copied ? Check : Copy}>
          {copied ? 'Copied!' : 'Copy Receipt'}
        </Button>
        
        <Button onClick={handlePrintReceipt} icon={Printer}>
          Print Receipt
        </Button>
      </ModalFooter>
    </Modal>
  );
};