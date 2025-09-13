'use client';

import React from 'react';
import { Clock, ChefHat, CheckCircle, Truck, ArrowRight, AlertTriangle } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { Card, CardContent, Button, OrderStatusBadge } from '../ui';
import { formatCurrency, formatDate } from '../../lib/utils';

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderCode: string, newStatus: OrderStatus) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const getTimeElapsed = () => {
    const now = new Date();
    const created = new Date(order.created_at);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins}m ago`;
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.CONFIRMED:
        return OrderStatus.MAKING;
      case OrderStatus.MAKING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return <Clock className="w-4 h-4" />;
      case OrderStatus.MAKING:
        return <ChefHat className="w-4 h-4" />;
      case OrderStatus.READY:
        return <CheckCircle className="w-4 h-4" />;
      case OrderStatus.DELIVERED:
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionButtonText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return 'Start Cooking';
      case OrderStatus.MAKING:
        return 'Mark Ready';
      case OrderStatus.READY:
        return 'Mark Delivered';
      default:
        return 'Update Status';
    }
  };

  const nextStatus = getNextStatus(order.status as OrderStatus);
  const timeElapsed = getTimeElapsed();
  const timeElapsedMs = new Date().getTime() - new Date(order.created_at).getTime();
  const isUrgent = timeElapsedMs > 30 * 60 * 1000; // 30 minutes
  const isVeryUrgent = timeElapsedMs > 45 * 60 * 1000; // 45 minutes

  return (
    <Card className={`bg-gray-800 border-gray-700 ${isVeryUrgent ? 'ring-2 ring-red-500' : isUrgent ? 'ring-1 ring-orange-500' : ''}`}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white font-mono">
              {order.code}
            </h3>
            <p className="text-gray-400 text-sm">
              {order.table?.name || `Table ${order.table_id}`}
            </p>
          </div>
          
          <div className="text-right">
            <OrderStatusBadge status={order.status} />
            <p className={`text-xs mt-1 flex items-center gap-1 ${
              isVeryUrgent ? 'text-red-400' : 
              isUrgent ? 'text-orange-400' : 'text-gray-400'
            }`}>
              {isUrgent && <AlertTriangle className="w-3 h-3" />}
              {timeElapsed}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-200">Items:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {order.order_items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <span className="text-gray-300">
                    {item.quantity}x {item.item?.name || 'Unknown Item'}
                  </span>
                  {item.notes && (
                    <p className="text-xs text-yellow-400 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Notes */}
        {order.customer_notes && (
          <div className="bg-gray-700 p-2 rounded">
            <h4 className="text-xs font-semibold text-gray-300 mb-1">Customer Notes:</h4>
            <p className="text-xs text-yellow-300">{order.customer_notes}</p>
          </div>
        )}

        {/* Order Info */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Total</span>
          <span className="text-white font-semibold">
            {formatCurrency(order.total)}
          </span>
        </div>

        <div className="text-xs text-gray-400">
          Placed: {formatDate(order.created_at)}
        </div>

        {/* Action Button */}
        {nextStatus && (
          <Button
            onClick={() => onStatusUpdate(order.code, nextStatus)}
            className="w-full"
            variant={order.status === OrderStatus.CONFIRMED ? 'primary' : 'secondary'}
            icon={getStatusIcon(nextStatus)}
            iconPosition="left"
          >
            <span className="flex items-center gap-2">
              {getActionButtonText(order.status as OrderStatus)}
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        )}

        {/* Urgent Indicator */}
        {isUrgent && (
          <div className={`${
            isVeryUrgent ? 'bg-red-600' : 'bg-orange-600'
          } text-white text-xs px-2 py-1 rounded text-center font-semibold flex items-center justify-center gap-1`}>
            <AlertTriangle className="w-3 h-3" />
            {isVeryUrgent ? 'VERY URGENT' : 'URGENT'} - Over {Math.floor(timeElapsedMs / (60 * 1000))} minutes
          </div>
        )}
      </CardContent>
    </Card>
  );
};