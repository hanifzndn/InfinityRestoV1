import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mockDatabase, getTableByCode } from '../../../lib/mock-database';
import { generateOrderCode } from '../../../lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const tableId = searchParams.get('table_id');

    let data, error;

    if (isSupabaseConfigured()) {
      let query = supabase
        .from('orders')
        .select(`
          *,
          table:tables(*),
          order_items(
            *,
            item:menu_items(*)
          )
        `);

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (paymentStatus) {
        query = query.eq('payment_status', paymentStatus);
      }

      if (tableId) {
        query = query.eq('table_id', tableId);
      }

      const result = await query.order('created_at', { ascending: false });
      data = result.data;
      error = result.error;
    } else {
      // Use mock database
      const filters: any = {};
      if (status) filters.status = status;
      if (paymentStatus) filters.payment_status = paymentStatus;
      
      const result = await mockDatabase.getOrders(filters);
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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { table_code, items, customer_notes } = body;

    // Validate input
    if (!table_code || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Table code and items are required'
        },
        { status: 400 }
      );
    }

    let data, error;

    if (isSupabaseConfigured()) {
      // Get table by code
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('code', table_code)
        .eq('active', true)
        .single();

      if (tableError || !table) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid table code'
          },
          { status: 400 }
        );
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => {
        return sum + (item.item.price * item.quantity);
      }, 0);

      // Generate order code
      const orderCode = generateOrderCode();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          code: orderCode,
          table_id: table.id,
          total,
          customer_notes,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        item_id: item.item.id,
        quantity: item.quantity,
        price: item.item.price,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      // Create initial KDS event
      await supabase
        .from('kds_events')
        .insert({
          order_id: order.id,
          status: 'pending',
          notes: 'Order placed by customer'
        });

      // Fetch complete order with relations
      const { data: completeOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          table:tables(*),
          order_items(
            *,
            item:menu_items(*)
          )
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      data = completeOrder;
    } else {
      // Use mock database
      const table = getTableByCode(table_code);
      
      if (!table) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid table code'
          },
          { status: 400 }
        );
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => {
        return sum + (item.item.price * item.quantity);
      }, 0);

      const orderData = {
        table_id: table.id,
        total,
        customer_notes,
        items
      };

      const result = await mockDatabase.createOrder(orderData);
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
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order'
      },
      { status: 500 }
    );
  }
}