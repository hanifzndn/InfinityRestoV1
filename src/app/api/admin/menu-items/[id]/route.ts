import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../../lib/supabase';
import { mockDatabase } from '../../../../../lib/mock-database';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { in_stock, price, name, description } = body;

    let data, error;

    if (isSupabaseConfigured()) {
      // Build update object
      const updateData: any = {};
      if (typeof in_stock === 'boolean') updateData.in_stock = in_stock;
      if (price !== undefined) updateData.price = price;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const result = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Use mock database
      const updateData: any = {};
      if (typeof in_stock === 'boolean') updateData.in_stock = in_stock;
      if (price !== undefined) updateData.price = price;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const result = await mockDatabase.updateMenuItem(id, updateData);
      data = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update menu item'
      },
      { status: 500 }
    );
  }
}