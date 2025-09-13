import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase';
import { mockDatabase } from '../../../../lib/mock-database';

interface RouteParams {
  params: {
    code: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = params;
    let data, error;

    if (isSupabaseConfigured()) {
      const result = await supabase
        .from('orders')
        .select(`
          *,
          table:tables(*),
          order_items(
            *,
            item:menu_items(*)
          )
        `)
        .eq('code', code)
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Use mock database
      const result = await mockDatabase.getOrderByCode(code);
      data = result.data;
      error = result.error;
    }

    if (error) {
      if (error.code === 'PGRST116' || error.message === 'Order not found') {
        return NextResponse.json(
          {
            success: false,
            error: 'Order not found'
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order'
      },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = params;
    const body = await request.json();
    const { status, payment_status, payment_method } = body;

    let data, error;

    if (isSupabaseConfigured()) {
      // Build update object
      const updateData: any = {};
      if (status) updateData.status = status;
      if (payment_status) updateData.payment_status = payment_status;
      if (payment_method) updateData.payment_method = payment_method;

      const result = await supabase
        .from('orders')
        .update(updateData)
        .eq('code', code)
        .select(`
          *,
          table:tables(*),
          order_items(
            *,
            item:menu_items(*)
          )
        `)
        .single();

      data = result.data;
      error = result.error;

      // Create KDS event if status changed
      if (status && !error) {
        await supabase
          .from('kds_events')
          .insert({
            order_id: data.id,
            status,
            notes: `Status updated to ${status}`
          });
      }
    } else {
      // Use mock database
      const updateData: any = {};
      if (status) updateData.status = status;
      if (payment_status) updateData.payment_status = payment_status;
      if (payment_method) updateData.payment_method = payment_method;

      const result = await mockDatabase.updateOrder(code, updateData);
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
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order'
      },
      { status: 500 }
    );
  }
}
