'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Truck, ChefHat, RefreshCw, Bell, BellOff } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { Card, CardContent, CardHeader, Button, OrderStatusBadge, PaymentStatusBadge } from '../ui';
import { formatCurrency, formatDate } from '../../lib/utils';

interface OrderTrackingProps {
  order: Order;
  onBackToMenu: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  order: initialOrder,
  onBackToMenu
}) => {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Show browser notification
  const showNotification = (title: string, body: string) => {
    if (!notificationsEnabled || !("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  // Set up polling for order status updates
  useEffect(() => {
    const pollOrderStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${order.code}`);
        if (response.ok) {
          const result = await response.json();
          const newOrder = result.data;
          
          // Check if status has changed
          if (newOrder.status !== order.status) {
            const statusMessage = getStatusMessage(newOrder.status);
            showNotification("Order Status Updated", statusMessage);
          }
          
          setOrder(newOrder);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error polling order status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial poll
    pollOrderStatus();

    // Set up interval for polling every 30 seconds
    pollIntervalRef.current = setInterval(pollOrderStatus, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [order.code, order.status]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="w-6 h-6" />;
      case OrderStatus.CONFIRMED:
        return <CheckCircle className="w-6 h-6" />;
      case OrderStatus.MAKING:
        return <ChefHat className="w-6 h-6" />;
      case OrderStatus.READY:
        return <Truck className="w-6 h-6" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Your order has been placed and is waiting for payment confirmation.';
      case OrderStatus.CONFIRMED:
        return 'Your order has been confirmed and sent to the kitchen.';
      case OrderStatus.MAKING:
        return 'Your order is being prepared by our kitchen staff.';
      case OrderStatus.READY:
        return 'Your order is ready! Please wait for delivery to your table.';
      case OrderStatus.DELIVERED:
        return 'Your order has been delivered. Enjoy your meal!';
      default:
        return 'Order status unknown.';
    }
  };

  const statusSteps = [
    { status: OrderStatus.PENDING, label: 'Order Placed', description: 'Waiting for payment' },
    { status: OrderStatus.CONFIRMED, label: 'Payment Confirmed', description: 'Sent to kitchen' },
    { status: OrderStatus.MAKING, label: 'Preparing', description: 'Being cooked' },
    { status: OrderStatus.READY, label: 'Ready', description: 'Ready for delivery' },
    { status: OrderStatus.DELIVERED, label: 'Delivered', description: 'Enjoy your meal!' }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${order.code}`);
      if (response.ok) {
        const result = await response.json();
        setOrder(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error refreshing order status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Order Confirmation</h1>
            <p className="text-lg text-gray-600">
              Order Code: <span className="font-mono font-bold text-primary-600">{order.code}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
            
            {/* Last updated info */}
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {getStatusIcon(order.status)}
            </div>
            
            <div>
              <OrderStatusBadge status={order.status} size="lg" />
            </div>
            
            <p className="text-gray-700">{getStatusMessage(order.status)}</p>
            
            {/* Notification toggle */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleNotifications}
                icon={notificationsEnabled ? Bell : BellOff}
                className="text-xs"
              >
                {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      {order.payment_status === 'pending' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Payment Required</h2>
              <p className="text-gray-700 mb-4">
                Please present your order code <span className="font-mono font-bold text-primary-600">{order.code}</span> to the cashier to complete payment.
              </p>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(order.total)}
              </div>
              <PaymentStatusBadge status={order.payment_status} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Order Progress</h2>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={step.status} className="flex items-center gap-4">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${isCompleted 
                      ? isCurrent 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                    }
                  `}>
                    {isCompleted && !isCurrent ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                    <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {isCurrent && (
                    <div className="flex-shrink-0">
                      <div className="animate-pulse bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
                        Current
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Order Summary</h2>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Table:</span>
              <span className="font-medium">{order.table?.name || order.table_id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg text-primary-600">
                {formatCurrency(order.total)}
              </span>
            </div>
            
            {order.customer_notes && (
              <div>
                <span className="text-gray-600 block mb-1">Special Notes:</span>
                <p className="text-sm bg-gray-50 p-2 rounded">{order.customer_notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onBackToMenu} className="flex-1">
          Order More Items
        </Button>
        
        <Button
          onClick={handleRefresh}
          loading={loading}
          className="flex-1"
        >
          Refresh Status
        </Button>
      </div>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep your order code safe: <span className="font-mono font-bold">{order.code}</span></li>
            <li>• Present this code to the cashier for payment</li>
            <li>• Status updates automatically every 30 seconds</li>
            <li>• If you need assistance, please ask our staff</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};