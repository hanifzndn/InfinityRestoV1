'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit2, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuItem, Category } from '../../types';
import { Card, CardContent, CardHeader, Button, Input, Select, Modal, ModalContent, ModalFooter } from '../ui';
import { formatCurrency } from '../../lib/utils';

export const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    in_stock: true
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Keyboard shortcuts
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        loadData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        setCategories(categoriesResult.data || []);
      }

      // Load menu items (including out of stock)
      const itemsResponse = await fetch('/api/menu-items');
      if (itemsResponse.ok) {
        const itemsResult = await itemsResponse.json();
        setMenuItems(itemsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStock = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/admin/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ in_stock: !item.in_stock }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const result = await response.json();
      
      // Update the item in the list
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id ? result.data : menuItem
      ));

      toast.success(`${item.name} ${item.in_stock ? 'marked as out of stock' : 'marked as available'}`);
    } catch (error) {
      console.error('Error updating item stock:', error);
      toast.error('Failed to update item stock');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      in_stock: item.in_stock
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/admin/menu-items/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          in_stock: editForm.in_stock
        }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const result = await response.json();
      
      // Update the item in the list
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === editingItem.id ? result.data : menuItem
      ));

      setEditingItem(null);
      toast.success('Menu item updated successfully');
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-xl font-bold text-gray-900">Menu Management</h2>
        <div className="text-xs text-gray-500">
          <kbd className="bg-gray-100 px-1.5 py-0.5 rounded">Ctrl+R</kbd> Refresh
        </div>
      </div>

      {/* Compact Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
                aria-label="Search menu items"
              />
            </div>
            
            <div className="sm:w-48">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filteredItems.map(item => (
          <Card 
            key={item.id} 
            className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 ${!item.in_stock ? 'opacity-75 bg-gray-50' : ''}`}
            role="region"
            aria-label={`${item.name}, ${item.in_stock ? 'Available' : 'Out of stock'}, Price: ${formatCurrency(item.price)}`}
          >
            <CardContent className="p-3">
              <div className="space-y-2">
                {/* Compact Item Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-600 truncate">
                      {categories.find(c => c.id === item.category_id)?.name}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleToggleStock(item)}
                    className={`p-1 rounded transition-colors ml-2 ${
                      item.in_stock ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                    }`}
                    title={item.in_stock ? 'Mark as out of stock' : 'Mark as available'}
                    aria-label={item.in_stock ? `Mark ${item.name} as out of stock` : `Mark ${item.name} as available`}
                  >
                    {item.in_stock ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>

                {/* Compact Description */}
                {item.description && (
                  <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{item.description}</p>
                )}

                {/* Price */}
                <div className="text-base font-bold text-primary-600">
                  {formatCurrency(item.price)}
                </div>

                {/* Compact Status & Actions */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.in_stock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.in_stock ? 'Available' : 'Out of Stock'}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    icon={Edit2}
                    className="text-xs px-2 py-1"
                    aria-label={`Edit ${item.name}`}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No menu items found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Compact Edit Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={handleCancelEdit}
        title={`Edit ${editingItem?.name}`}
        size="md"
        aria-label={`Edit menu item ${editingItem?.name}`}
      >
        {editingItem && (
          <>
            <ModalContent>
              <div className="space-y-3">
                <Input
                  label="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Item name"
                  className="text-sm"
                  aria-required="true"
                />

                <Input
                  label="Description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Item description"
                  className="text-sm"
                />

                <Input
                  label="Price (IDR)"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="text-sm"
                  aria-required="true"
                />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.in_stock}
                      onChange={(e) => setEditForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                      className="rounded border-gray-300"
                      aria-label="Item availability"
                    />
                    <span className="text-sm font-medium">Available (In Stock)</span>
                  </label>
                </div>
              </div>
            </ModalContent>

            <ModalFooter className="gap-3">
              <Button variant="outline" onClick={handleCancelEdit} icon={X} className="flex-1">
                Cancel
              </Button>
              
              <Button onClick={handleSaveEdit} icon={Save} className="flex-1">
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
};