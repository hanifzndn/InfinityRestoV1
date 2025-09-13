'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, Clock, AlertTriangle, SortAsc, SortDesc } from 'lucide-react';
import toast from 'react-hot-toast';
import { Order, OrderStatus } from '../../types';
import { OrderCard } from './OrderCard';
import { StatusFilter } from './StatusFilter';
import { Button, LoadingSpinner } from '../ui';

export const KitchenDisplay: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus[]>([
    OrderStatus.CONFIRMED,
    OrderStatus.MAKING,
    OrderStatus.READY
  ]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [sortBy, setSortBy] = useState<'time' | 'table'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [urgentOrders, setUrgentOrders] = useState<number>(0);

  useEffect(() => {
    loadOrders();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(autoRefresh, 30000);
    
    return () => clearInterval(interval);
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Only load orders that are paid (payment_status = 'paid')
      const statusParams = filterStatus.map(status => `status=${status}`).join('&');
      const response = await fetch(`/api/orders?payment_status=paid&${statusParams}`);
      
      if (!response.ok) throw new Error('Failed to load orders');
      
      const result = await response.json();
      setOrders(result.data || []);
      setLastRefresh(new Date());
      
      // Count urgent orders (over 30 minutes)
      const urgentCount = (result.data || []).filter((order: Order) => {
        const now = new Date().getTime();
        const created = new Date(order.created_at).getTime();
        return (now - created) > 30 * 60 * 1000; // 30 minutes
      }).length;
      
      setUrgentOrders(urgentCount);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const autoRefresh = async () => {
    try {
      setRefreshing(true);
      
      const statusParams = filterStatus.map(status => `status=${status}`).join('&');
      const response = await fetch(`/api/orders?payment_status=paid&${statusParams}`);
      
      if (response.ok) {
        const result = await response.json();
        setOrders(result.data || []);
        setLastRefresh(new Date());
        
        // Count urgent orders (over 30 minutes)
        const urgentCount = (result.data || []).filter((order: Order) => {
          const now = new Date().getTime();
          const created = new Date(order.created_at).getTime();
          return (now - created) > 30 * 60 * 1000; // 30 minutes
        }).length;
        
        setUrgentOrders(urgentCount);
      }
    } catch (error) {
      console.error('Error auto-refreshing orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    loadOrders();
  };

  const handleStatusUpdate = async (orderCode: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderCode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      const result = await response.json();
      
      // Update the order in the list
      setOrders(prev => prev.map(order => 
        order.code === orderCode ? result.data : order
      ));

      toast.success(`Order ${orderCode} updated to ${newStatus}`);
      
      // If the new status is not in current filter, remove from display
      if (!filterStatus.includes(newStatus)) {
        setOrders(prev => prev.filter(order => order.code !== orderCode));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleSort = (newSortBy: 'time' | 'table') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // Sort orders based on current sort settings
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'time') {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    } else {
      const tableA = a.table?.name || a.table_id || '';
      const tableB = b.table?.name || b.table_id || '';
      return sortOrder === 'asc' 
        ? tableA.localeCompare(tableB) 
        : tableB.localeCompare(tableA);
    }
  });

  const filteredOrders = sortedOrders.filter(order => 
    filterStatus.includes(order.status as OrderStatus)
  );

  // Group orders by status for better organization
  const ordersByStatus = filterStatus.reduce((acc, status) => {
    acc[status] = filteredOrders.filter(order => order.status === status);
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  const getStatusDisplayName = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return 'New Orders';
      case OrderStatus.MAKING:
        return 'In Progress';
      case OrderStatus.READY:
        return 'Ready for Delivery';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" className="text-white mb-4" />
          <p>Loading Kitchen Display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Kitchen Display System</h1>
              
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                {refreshing && <LoadingSpinner size="sm" />}
              </div>
              
              {urgentOrders > 0 && (
                <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold">{urgentOrders} Urgent</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('time')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {sortBy === 'time' ? (
                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span className="ml-1 hidden sm:inline">Time</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('table')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {sortBy === 'table' ? (
                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                  ) : (
                    <span className="text-xs">Tbl</span>
                  )}
                  <span className="ml-1 hidden sm:inline">Table</span>
                </Button>
              </div>
              
              <StatusFilter
                selectedStatuses={filterStatus}
                onChange={setFilterStatus}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                icon={RefreshCw}
                loading={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍳</div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Orders</h2>
            <p className="text-gray-500">No orders matching the current filter criteria</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filterStatus.map(status => {
              const statusOrders = ordersByStatus[status] || [];
              
              if (statusOrders.length === 0) return null;
              
              return (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-100">
                      {getStatusDisplayName(status)}
                    </h2>
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {statusOrders.length} order{statusOrders.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {statusOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};