'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Menu, 
  BarChart3, 
  LogOut, 
  Settings,
  RefreshCw,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminUser, SalesReport } from '../../types';
import { MenuManagement } from './MenuManagement';
import { SalesReports } from './SalesReports';
import { Card, CardContent, Button, Input, Select } from '../ui';
import { LoadingSpinner } from '../ui/Loading';
import { formatCurrency } from '../../lib/utils';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'reports'>('overview');
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [reportPeriod, setReportPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'reports') {
      loadSalesData();
    }
  }, [activeTab, dateRange, reportPeriod]);

  useEffect(() => {
    // Set default date range based on period
    const today = new Date();
    let fromDate = new Date();
    
    switch (reportPeriod) {
      case '7d':
        fromDate.setDate(today.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(today.getDate() - 30);
        break;
      case '90d':
        fromDate.setDate(today.getDate() - 90);
        break;
      default:
        return; // Custom range, don't auto-set
    }
    
    const toDate = new Date();
    setDateRange({
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0]
    });
  }, [reportPeriod]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = '';
      if (dateRange.from) queryParams += `&from=${dateRange.from}`;
      if (dateRange.to) queryParams += `&to=${dateRange.to}`;
      
      const response = await fetch(`/api/admin/reports?${queryParams}`);
      if (!response.ok) throw new Error('Failed to load sales data');
      
      const result = await response.json();
      setSalesData(result.data);
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    onLogout();
  };

  const handlePeriodChange = (period: '7d' | '30d' | '90d' | 'custom') => {
    setReportPeriod(period);
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Management', icon: Menu },
    { id: 'reports', label: 'Sales Reports', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Welcome, {user.username}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSalesData}
                icon={RefreshCw}
                disabled={loading}
                className="text-xs px-2 py-1"
              >
                Refresh
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={LogOut}
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-2">
          <div className="flex bg-white rounded-lg shadow-sm p-1 border">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Compact Sidebar Navigation - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="border-0 shadow-md">
              <CardContent className="p-2">
                <nav className="space-y-0.5">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                          activeTab === item.id
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Date Range Selector */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2 items-end">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePeriodChange('7d')}
                          variant={reportPeriod === '7d' ? 'primary' : 'outline'}
                          size="sm"
                          className="text-xs"
                        >
                          7 Days
                        </Button>
                        <Button
                          onClick={() => handlePeriodChange('30d')}
                          variant={reportPeriod === '30d' ? 'primary' : 'outline'}
                          size="sm"
                          className="text-xs"
                        >
                          30 Days
                        </Button>
                        <Button
                          onClick={() => handlePeriodChange('90d')}
                          variant={reportPeriod === '90d' ? 'primary' : 'outline'}
                          size="sm"
                          className="text-xs"
                        >
                          90 Days
                        </Button>
                      </div>
                      
                      {reportPeriod === 'custom' && (
                        <>
                          <div className="flex-1">
                            <Input
                              label="From"
                              type="date"
                              value={dateRange.from}
                              onChange={(e) => handleDateChange('from', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Input
                              label="To"
                              type="date"
                              value={dateRange.to}
                              onChange={(e) => handleDateChange('to', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </>
                      )}
                      
                      <Button
                        onClick={() => setReportPeriod('custom')}
                        variant={reportPeriod === 'custom' ? 'primary' : 'outline'}
                        size="sm"
                        icon={Calendar}
                        className="text-xs"
                      >
                        Custom
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {salesData && (
                  <>
                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-0.5">Total Orders</p>
                            <p className="text-xl font-bold text-primary-600">
                              {salesData.total_orders}
                            </p>
                            <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              <span>+{Math.round((salesData.total_orders / 30) * 100) / 100}/day</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-0.5">Revenue</p>
                            <p className="text-base font-bold text-green-600">
                              {formatCurrency(salesData.total_revenue)}
                            </p>
                            <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              <span>+{formatCurrency(salesData.total_revenue / 30)}/day</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-0.5">Delivered</p>
                            <p className="text-xl font-bold text-blue-600">
                              {salesData.orders_by_status.delivered || 0}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              {salesData.total_orders > 0 
                                ? `${Math.round(((salesData.orders_by_status.delivered || 0) / salesData.total_orders) * 100)}% completion`
                                : '0% completion'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-0.5">In Progress</p>
                            <p className="text-xl font-bold text-orange-600">
                              {(salesData.orders_by_status.confirmed || 0) +
                               (salesData.orders_by_status.making || 0) +
                               (salesData.orders_by_status.ready || 0)}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              Currently being prepared
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Popular Items Section */}
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Popular Items</h3>
                        <div className="space-y-2">
                          {salesData.popular_items.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.item?.name || 'Unknown Item'}</p>
                                <p className="text-xs text-gray-600">
                                  {item.quantity_sold} orders sold
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-600">
                                  {formatCurrency(item.revenue)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(item.revenue / item.quantity_sold)}/order
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}

            {activeTab === 'menu' && <MenuManagement />}
            
            {activeTab === 'reports' && <SalesReports salesData={salesData} onRefresh={loadSalesData} />}
          </div>
        </div>
      </div>
    </div>
  );
};