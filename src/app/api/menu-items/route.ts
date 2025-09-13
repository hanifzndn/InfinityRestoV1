import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mockDatabase } from '../../../lib/mock-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const inStock = searchParams.get('in_stock');

    let data, error;

    if (isSupabaseConfigured()) {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(*)
        `);

      // Apply filters
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (inStock === 'true') {
        query = query.eq('in_stock', true);
      }

      const result = await query.order('name', { ascending: true });
      data = result.data;
      error = result.error;
    } else {
      // Use mock database
      const filters: any = {};
      if (categoryId) filters.category_id = categoryId;
      if (inStock === 'true') filters.in_stock = true;
      
      const result = await mockDatabase.getMenuItems(filters);
      data = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu items'
      },
      { status: 500 }
    );
  }
}