'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  RefreshCw, 
  Filter,
  Calendar,
  Printer,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Order, PaymentMethod } from '../../types';
import { OrderSearch } from './OrderSearch';
import { PaymentForm } from './PaymentForm';
import { RecentOrders } from './RecentOrders';
import { Receipt } from './Receipt';
import { Card, CardContent, CardHeader, Button, LoadingOverlay, Input, Select } from '../ui';
import { formatCurrency, formatDate } from '../../lib/utils';

export const CashierSystem: React.FC = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: '',
    dateTo: '',
    paymentMethod: 'all' as 'all' | PaymentMethod,
    minAmount: '',
    maxAmount: ''
  });
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    loadRecentOrders();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Keyboard shortcuts
      switch (e.key) {
        case 'n':
        case 'N':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleNewOrder();
          }
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            loadRecentOrders();
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Focus on search input if exists
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            if (searchInput) {
              (searchInput as HTMLInputElement).focus();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadRecentOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = 'payment_status=paid&limit=20&sort=created_at&order=desc';
      
      if (searchFilters.dateFrom) {
        queryParams += `&date_from=${searchFilters.dateFrom}`;
      }
      
      if (searchFilters.dateTo) {
        queryParams += `&date_to=${searchFilters.dateTo}`;
      }
      
      if (searchFilters.paymentMethod !== 'all') {
        queryParams += `&payment_method=${searchFilters.paymentMethod}`;
      }
      
      if (searchFilters.minAmount) {
        queryParams += `&min_amount=${searchFilters.minAmount}`;
      }
      
      if (searchFilters.maxAmount) {
        queryParams += `&max_amount=${searchFilters.maxAmount}`;
      }
      
      if (quickSearch) {
        queryParams += `&search=${encodeURIComponent(quickSearch)}`;
      }

      const response = await fetch(`/api/orders?${queryParams}`);
      if (response.ok) {
        const result = await response.json();
        setRecentOrders(result.data || []);
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
      toast.error('Failed to load recent orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSearch = async (orderCode: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/orders/${orderCode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Order not found');
        } else {
          toast.error('Failed to load order');
        }
        return;
      }

      const result = await response.json();
      const order = result.data;

      // Check if order is already paid
      if (order.payment_status === 'paid') {
        toast.error('This order has already been paid');
        setCurrentOrder(order);
        setPaymentComplete(true);
        return;
      }

      setCurrentOrder(order);
      setPaymentComplete(false);
      toast.success('Order found');
    } catch (error) {
      console.error('Error searching order:', error);
      toast.error('Failed to search order');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentMethod: PaymentMethod, amountPaid: number) => {
    if (!currentOrder) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/orders/${currentOrder.code}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_status: 'paid',
          payment_method: paymentMethod,
          status: 'confirmed' // Move to confirmed so it appears in KDS
        }),
      });

      if (!response.ok) throw new Error('Failed to process payment');

      const result = await response.json();
      setCurrentOrder(result.data);
      setPaymentComplete(true);
      setShowReceipt(true);
      
      // Refresh recent orders
      loadRecentOrders();
      
      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    setCurrentOrder(null);
    setPaymentComplete(false);
    setShowReceipt(false);
  };

  const handlePrintReceipt = () => {
    if (currentOrder) {
      // In a real implementation, this would trigger a print command
      toast.success('Receipt sent to printer');
    }
  };

  const handleViewReceipt = (order: Order) => {
    setCurrentOrder(order);
    setShowReceipt(true);
  };

  const handleFilterChange = (field: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    loadRecentOrders();
  };

  const handleClearFilters = () => {
    setSearchFilters({
      dateFrom: '',
      dateTo: '',
      paymentMethod: 'all',
      minAmount: '',
      maxAmount: ''
    });
    setQuickSearch('');
    loadRecentOrders();
  };

  return (
    <LoadingOverlay isLoading={loading} message="Processing...">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">Cashier System</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-xs text-gray-500">
                  <kbd className="bg-gray-100 px-1.5 py-0.5 rounded">Ctrl+N</kbd> New Order | 
                  <kbd className="bg-gray-100 px-1.5 py-0.5 rounded ml-1">Ctrl+R</kbd> Refresh | 
                  <kbd className="bg-gray-100 px-1.5 py-0.5 rounded ml-1">Ctrl+F</kbd> Focus Search
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadRecentOrders}
                  icon={RefreshCw}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNewOrder}
                >
                  New Order
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Search */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Search Order
                  </h2>
                </CardHeader>
                <CardContent>
                  <OrderSearch onOrderFound={handleOrderSearch} />
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Orders
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <Input
                        label="Quick Search"
                        placeholder="Order code, table..."
                        value={quickSearch}
                        onChange={(e) => setQuickSearch(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="From Date"
                        type="date"
                        value={searchFilters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="To Date"
                        type="date"
                        value={searchFilters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Select
                        label="Payment Method"
                        value={searchFilters.paymentMethod}
                        onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                        className="text-sm"
                      >
                        <option value="all">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="debit">Debit Card</option>
                        <option value="qris">QRIS</option>
                      </Select>
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <Button onClick={handleApplyFilters} size="sm" className="flex-1">
                        Apply
                      </Button>
                      <Button onClick={handleClearFilters} variant="outline" size="sm" className="flex-1">
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Order Details */}
              {currentOrder && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Order Details</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Order Code</p>
                          <p className="font-mono font-bold text-lg">{currentOrder.code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Table</p>
                          <p className="font-semibold">{currentOrder.table?.name || currentOrder.table_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold capitalize">{currentOrder.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-bold text-xl text-primary-600">
                            {formatCurrency(currentOrder.total)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-2">
                          {currentOrder.order_items?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                              <div className="flex-1">
                                <p className="font-medium">{item.item?.name || 'Unknown Item'}</p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity} × {formatCurrency(item.price)}
                                </p>
                                {item.notes && (
                                  <p className="text-sm text-orange-600 italic">Note: {item.notes}</p>
                                )}
                              </div>
                              <div className="font-semibold">
                                {formatCurrency(item.quantity * item.price)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {currentOrder.customer_notes && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-1">Customer Notes:</h4>
                          <p className="text-blue-800">{currentOrder.customer_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Form */}
              {currentOrder && !paymentComplete && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Process Payment
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <PaymentForm
                      order={currentOrder}
                      onPayment={handlePayment}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Payment Complete */}
              {paymentComplete && currentOrder && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-semibold text-green-900 mb-2">
                      Payment Complete!
                    </h2>
                    <p className="text-green-800 mb-4">
                      Order {currentOrder.code} has been paid and sent to the kitchen.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={() => setShowReceipt(true)}
                        variant="primary"
                        icon={Eye}
                      >
                        View Receipt
                      </Button>
                      <Button
                        onClick={handlePrintReceipt}
                        variant="outline"
                        icon={Printer}
                      >
                        Print Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <RecentOrders
                orders={recentOrders}
                onOrderSelect={handleOrderSearch}
                onViewReceipt={handleViewReceipt}
              />
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && currentOrder && (
          <Receipt
            order={currentOrder}
            onClose={() => setShowReceipt(false)}
            onPrint={handlePrintReceipt}
          />
        )}
      </div>
    </LoadingOverlay>
  );
};