import React from 'react';
import { QrCode, Monitor, CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, Button } from './ui';

export const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white" role="banner">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              InfinityResto
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
              Experience seamless dining with our QR code-based ordering system
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/?table=T01">
                <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                  Try Demo Table T01
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Admin Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-16 bg-white" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">Complete Restaurant Solution</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From customer ordering to kitchen management and analytics
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Access */}
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                  <QrCode className="w-8 h-8 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Customer Ordering</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Scan QR code at your table for instant menu access and seamless ordering
                </p>
                <div className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full inline-block">
                  ?table=T01
                </div>
              </CardContent>
            </Card>

            {/* Kitchen Display */}
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                  <Monitor className="w-8 h-8 text-orange-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Kitchen Display</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Real-time order tracking with auto-refresh for kitchen efficiency
                </p>
                <Link href="/kds">
                  <Button variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
                    Open KDS
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Cashier System */}
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <CreditCard className="w-8 h-8 text-green-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Cashier System</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Multi-payment processing with receipt generation
                </p>
                <Link href="/cashier">
                  <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    Open Cashier
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Panel */}
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <Settings className="w-8 h-8 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Admin Panel</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Complete management with analytics and reporting
                </p>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    Admin Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-gray-50" aria-labelledby="quick-access-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 id="quick-access-heading" className="text-2xl font-bold text-gray-900 mb-3">Quick Table Access</h2>
                  <p className="text-gray-600">Click any table to simulate QR code scanning</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['T01', 'T02', 'T03', 'T04', 'T05'].map((table) => (
                    <Link key={table} href={`/?table=${table}`}>
                      <Button 
                        variant="primary" 
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300"
                        aria-label={`Access table ${table}`}
                      >
                        {table}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-16 bg-white" aria-labelledby="powerful-features-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="powerful-features-heading" className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-lg text-gray-600">Everything you need for modern restaurant operations</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary-100 rounded-lg p-3 mr-4">
                      <QrCode className="w-6 h-6 text-primary-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary-800">Customer Experience</h3>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2" aria-hidden="true">•</span>
                      <span>QR code scanning for instant menu access</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2" aria-hidden="true">•</span>
                      <span>Responsive menu with high-quality images</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2" aria-hidden="true">•</span>
                      <span>Smart cart with quantity controls</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2" aria-hidden="true">•</span>
                      <span>Real-time order status tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2" aria-hidden="true">•</span>
                      <span>Unique order codes for easy reference</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-100 rounded-lg p-3 mr-4">
                      <Monitor className="w-6 h-6 text-orange-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-orange-800">Staff Operations</h3>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2" aria-hidden="true">•</span>
                      <span>Kitchen Display System with auto-refresh</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2" aria-hidden="true">•</span>
                      <span>Order workflow: Making → Ready → Delivered</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2" aria-hidden="true">•</span>
                      <span>Multi-payment processing (Cash, Debit, QRIS)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2" aria-hidden="true">•</span>
                      <span>Admin panel with menu management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2" aria-hidden="true">•</span>
                      <span>Comprehensive sales reports & analytics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8" role="contentinfo">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold mb-2">InfinityResto</h3>
          <p className="text-gray-400">Modernizing restaurant operations with technology</p>
        </div>
      </footer>
    </div>
  );
};