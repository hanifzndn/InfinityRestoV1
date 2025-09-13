'use client';

import React, { useState } from 'react';
import { Eye, Receipt as ReceiptIcon } from 'lucide-react';
import { Order } from '../../types';
import { Card, CardContent, CardHeader, Button } from '../ui';
import { formatCurrency, formatDate } from '../../lib/utils';

interface RecentOrdersProps {
  orders: Order[];
  onOrderSelect: (orderCode: string) => void;
  onViewReceipt?: (order: Order) => void;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ 
  orders, 
  onOrderSelect,
  onViewReceipt
}) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleExpand = (orderCode: string) => {
    setExpandedOrder(expandedOrder === orderCode ? null : orderCode);
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <h2 className="text-lg font-semibold">Recent Orders</h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No recent orders found
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-3 hover:bg-gray-50">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(order.code)}
                >
                  <div>
                    <p className="font-medium text-sm">{order.code}</p>
                    <p className="text-xs text-gray-500">
                      {order.table?.name || order.table_id} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-600">
                      {formatCurrency(order.total)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderSelect(order.code);
                      }}
                      className="p-1 h-6 w-6"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {expandedOrder === order.code && (
                  <div className="mt-2 pl-2 border-l-2 border-gray-200 space-y-2">
                    <div className="text-xs">
                      <p className="font-medium">Items:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {order.order_items?.slice(0, 3).map((item, index) => (
                          <li key={index} className="text-gray-600">
                            {item.quantity}x {item.item?.name || 'Unknown Item'}
                          </li>
                        ))}
                        {order.order_items && order.order_items.length > 3 && (
                          <li className="text-gray-500">+{order.order_items.length - 3} more items</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderSelect(order.code);
                        }}
                        className="text-xs px-2 py-1"
                      >
                        View Details
                      </Button>
                      
                      {onViewReceipt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewReceipt(order);
                          }}
                          icon={ReceiptIcon}
                          className="text-xs px-2 py-1"
                        >
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};