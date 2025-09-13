'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  PieChart,
  Activity
} from 'lucide-react';
import { SalesReport } from '../../types';
import { Card, CardContent, CardHeader, Button, Input, Select } from '../ui';
import { formatCurrency, formatDate } from '../../lib/utils';

interface SalesReportsProps {
  salesData: SalesReport | null;
  onRefresh: () => void;
}

export const SalesReports: React.FC<SalesReportsProps> = ({ salesData, onRefresh }) => {
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const handleDateFilterChange = (field: 'from' | 'to', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    // In a real implementation, this would trigger a new API call with date filters
    onRefresh();
  };

  const handleExportReport = () => {
    // In a real implementation, this would generate and download a report
    alert('Export functionality would be implemented here');
  };

  if (!salesData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales reports...</p>
        </div>
      </div>
    );
  }

  // Calculate percentages for order status distribution
  const totalOrders = salesData.total_orders;
  const statusPercentages = Object.entries(salesData.orders_by_status).map(([status, count]) => ({
    status,
    count,
    percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
  }));

  // Find top selling item
  const topSellingItem = salesData.popular_items.reduce((top, current) => 
    current.quantity_sold > top.quantity_sold ? current : top, 
    salesData.popular_items[0]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">Sales Reports</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('summary')}
            variant={viewMode === 'summary' ? 'primary' : 'outline'}
            size="sm"
            className="text-xs"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Summary
          </Button>
          <Button
            onClick={() => setViewMode('detailed')}
            variant={viewMode === 'detailed' ? 'primary' : 'outline'}
            size="sm"
            className="text-xs"
          >
            <Activity className="w-3 h-3 mr-1" />
            Detailed
          </Button>
          <Button
            onClick={handleExportReport}
            icon={Download}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Compact Date Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1">
              <Input
                label="From"
                type="date"
                value={dateFilter.from}
                onChange={(e) => handleDateFilterChange('from', e.target.value)}
                className="text-sm"
              />
            </div>
            
            <div className="flex-1">
              <Input
                label="To"
                type="date"
                value={dateFilter.to}
                onChange={(e) => handleDateFilterChange('to', e.target.value)}
                className="text-sm"
              />
            </div>
            
            <Button onClick={handleApplyFilter} icon={Calendar} size="sm">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'summary' ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {salesData.total_orders}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-800">Total Revenue</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(salesData.total_revenue)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-800">Avg Order Value</p>
                    <p className="text-xl font-bold text-purple-900">
                      {formatCurrency(salesData.total_orders > 0 ? salesData.total_revenue / salesData.total_orders : 0)}
                    </p>
                  </div>
                  <PieChart className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-800">Top Item</p>
                    <p className="text-sm font-bold text-orange-900 truncate">
                      {topSellingItem?.item?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-orange-700">
                      {topSellingItem?.quantity_sold || 0} sold
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Orders by Status */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <h3 className="text-base font-semibold">Order Status Distribution</h3>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  {statusPercentages.map(({ status, count, percentage }) => (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{status}</span>
                        <span className="font-bold">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'delivered' ? 'bg-green-500' :
                            status === 'ready' ? 'bg-blue-500' :
                            status === 'making' ? 'bg-orange-500' :
                            status === 'confirmed' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Items */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <h3 className="text-base font-semibold">Top Selling Items</h3>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  {salesData.popular_items.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-400 w-6">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.item?.name || 'Unknown Item'}</p>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{item.quantity_sold} sold</span>
                          <span>{formatCurrency(item.revenue)}</span>
                        </div>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ 
                            width: `${(item.quantity_sold / topSellingItem.quantity_sold) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Detailed View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Compact Orders by Status */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-3">
                <h3 className="text-base font-semibold mb-2">Orders by Status</h3>
                <div className="space-y-1">
                  {Object.entries(salesData.orders_by_status).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'delivered' ? 'bg-green-500' :
                          status === 'ready' ? 'bg-blue-500' :
                          status === 'making' ? 'bg-orange-500' :
                          status === 'confirmed' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="capitalize text-sm font-medium">{status}</span>
                      </div>
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compact Popular Items */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-3">
                <h3 className="text-base font-semibold mb-2">Top Selling Items</h3>
                <div className="space-y-2">
                  {salesData.popular_items.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.item?.name || 'Unknown Item'}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity_sold} orders
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Compact Daily Sales Chart */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-3">
          <h3 className="text-base font-semibold mb-2">Daily Sales (Last 7 Days)</h3>
          <div className="space-y-2">
            {salesData.daily_sales.map((day, index) => {
              const maxRevenue = Math.max(...salesData.daily_sales.map(d => d.revenue));
              const widthPercentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">
                      {new Date(day.date).toLocaleDateString('id-ID', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{formatCurrency(day.revenue)}</p>
                      <p className="text-xs text-gray-600">{day.orders} orders</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};