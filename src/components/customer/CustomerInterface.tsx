'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MenuItem, Category, CartItem, Order } from '../../types';
import { MenuDisplay } from './MenuDisplay';
import { Cart } from './Cart';
import { OrderTracking } from './OrderTracking';
import { LoadingSpinner } from '../ui';
import { validateTableCode } from '../../lib/utils';

interface CustomerInterfaceProps {
  tableCode: string;
}

export const CustomerInterface: React.FC<CustomerInterfaceProps> = ({ tableCode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [view, setView] = useState<'menu' | 'cart' | 'tracking'>('menu');

  useEffect(() => {
    // Validate table code
    if (!validateTableCode(tableCode)) {
      toast.error('Invalid table code');
      router.push('/');
      return;
    }

    loadMenuData();
  }, [tableCode, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Keyboard shortcuts
      switch (e.key) {
        case 'm':
        case 'M':
          e.preventDefault();
          setView('menu');
          break;
        case 'c':
        case 'C':
          if (cartItems.length > 0) {
            e.preventDefault();
            setView('cart');
          }
          break;
        case 't':
        case 'T':
          if (currentOrder) {
            e.preventDefault();
            setView('tracking');
          }
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            window.location.reload();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems.length, currentOrder]);

  const loadMenuData = async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) throw new Error('Failed to load categories');
      const categoriesData = await categoriesResponse.json();

      // Load menu items
      const itemsResponse = await fetch('/api/menu-items');
      if (!itemsResponse.ok) throw new Error('Failed to load menu items');
      const itemsData = await itemsResponse.json();

      setCategories(categoriesData.data || []);
      setMenuItems(itemsData.data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
      toast.error('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem, quantity: number, notes?: string) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(cartItem => cartItem.item.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const newItems = [...prev];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          notes: notes || newItems[existingItemIndex].notes
        };
        return newItems;
      } else {
        // Add new item
        return [...prev, { item, quantity, notes }];
      }
    });

    toast.success(`${item.name} added to cart`);
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    setCartItems(prev =>
      prev.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      )
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const handleUpdateCartNotes = (itemId: string, notes: string) => {
    setCartItems(prev =>
      prev.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, notes }
          : cartItem
      )
    );
  };

  const handleCheckout = async (customerNotes?: string) => {
    try {
      setLoading(true);

      const orderData = {
        table_code: tableCode,
        items: cartItems,
        customer_notes: customerNotes
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      setCurrentOrder(result.data);
      setCartItems([]); // Clear cart
      setView('tracking');
      
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMenu = () => {
    setView('menu');
    setCurrentOrder(null);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">Processing...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-primary-900">InfinityResto</h1>
              <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-md">
                {tableCode}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {view !== 'menu' && (
                <button
                  onClick={handleBackToMenu}
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                  aria-label="Back to menu"
                >
                  ← Menu
                </button>
              )}
              
              {view === 'menu' && cartItems.length > 0 && (
                <button
                  onClick={() => setView('cart')}
                  className="relative px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                  aria-label={`View cart with ${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items`}
                >
                  <span>Cart</span>
                  <span className="bg-primary-500 text-xs px-1.5 py-0.5 rounded-full">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Help */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="text-xs text-gray-500 text-center hidden sm:block">
          Keyboard shortcuts: <kbd className="bg-gray-100 px-1.5 py-0.5 rounded">M</kbd> Menu | 
          {cartItems.length > 0 && (
            <>
              {' '}<kbd className="bg-gray-100 px-1.5 py-0.5 rounded">C</kbd> Cart | 
            </>
          )}
          {currentOrder && (
            <>
              {' '}<kbd className="bg-gray-100 px-1.5 py-0.5 rounded">T</kbd> Tracking | 
            </>
          )}
          {' '}<kbd className="bg-gray-100 px-1.5 py-0.5 rounded">Ctrl+R</kbd> Refresh
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {view === 'menu' && (
          <MenuDisplay
            categories={categories}
            items={menuItems}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === 'cart' && (
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onUpdateNotes={handleUpdateCartNotes}
            onCheckout={handleCheckout}
            onBackToMenu={() => setView('menu')}
          />
        )}

        {view === 'tracking' && currentOrder && (
          <OrderTracking
            order={currentOrder}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </main>
    </div>
  );
};