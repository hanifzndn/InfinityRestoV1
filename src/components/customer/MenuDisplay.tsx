'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Minus, Monitor, Search } from 'lucide-react';
import { MenuItem, Category } from '../../types';
import { Card, CardContent, Button, Modal, ModalContent, ModalFooter, Input } from '../ui';
import { formatCurrency, debounce } from '../../lib/utils';
import Image from 'next/image';

interface MenuDisplayProps {
  categories: Category[];
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number, notes?: string) => void;
}

export const MenuDisplay: React.FC<MenuDisplayProps> = ({
  categories,
  items,
  onAddToCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Debounced search to improve performance
  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const categoryId = item.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    let result = selectedCategory === 'all'
      ? items.filter(item => item.in_stock)
      : (itemsByCategory[selectedCategory] || []).filter(item => item.in_stock);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [items, itemsByCategory, selectedCategory, searchQuery]);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setNotes('');
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      onAddToCart(selectedItem, quantity, notes || undefined);
      setSelectedItem(null);
      setQuantity(1);
      setNotes('');
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setQuantity(1);
    setNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Items
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md group"
            onClick={() => handleItemClick(item)}
            hoverable
          >
            {/* Item Image */}
            <div className="relative h-40 bg-gray-200 overflow-hidden">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-sm font-medium">No Image</span>
                </div>
              )}
              
              {!item.in_stock && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm px-3 py-1 bg-red-600 rounded-full">Out of Stock</span>
                </div>
              )}
              
              {/* Quick Add Button */}
              {item.in_stock && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    className="shadow-lg bg-white text-primary-600 hover:bg-primary-600 hover:text-white border border-primary-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item, 1);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-base mb-1 line-clamp-1">{item.name}</h3>
              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(item.price)}
                </span>
                
                {item.in_stock && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white text-xs px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item, 1);
                    }}
                  >
                    Add
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <Monitor className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No items available</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery ? 'Try a different search term' : 'Please check other categories'}
            </p>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        title={selectedItem?.name}
        size="md"
      >
        {selectedItem && (
          <>
            <ModalContent>
              {/* Item Image */}
              {selectedItem.image_url && (
                <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              {/* Item Details */}
              <div className="space-y-4">
                {selectedItem.description && (
                  <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                )}

                <div className="text-2xl font-bold text-primary-600">
                  {formatCurrency(selectedItem.price)}
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-lg p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      icon={Minus}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full"
                    >
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    
                    <span className="text-xl font-semibold w-12 text-center bg-white px-3 py-2 rounded-lg">
                      {quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      icon={Plus}
                      className="w-10 h-10 rounded-full"
                    >
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                </div>

                {/* Special Notes */}
                <Input
                  label="Special Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests..."
                  className="bg-gray-50"
                />

                {/* Total Price */}
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary-600">
                      {formatCurrency(selectedItem.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </ModalContent>

            <ModalFooter className="gap-3">
              <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddToCart} className="flex-2 bg-gradient-to-r from-primary-600 to-primary-700">
                Add to Cart - {formatCurrency(selectedItem.price * quantity)}
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
};