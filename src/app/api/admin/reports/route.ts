import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase';
import { mockDatabase } from '../../../../lib/mock-database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let salesReport, error;

    if (isSupabaseConfigured()) {
      // Build query for orders
      let ordersQuery = supabase
        .from('orders')
        .select(`
          *,
          table:tables(*),
          order_items(
            *,
            item:menu_items(*)
          )
        `)
        .eq('payment_status', 'paid');

      // Apply date filters if provided
      if (dateFrom) {
        ordersQuery = ordersQuery.gte('created_at', dateFrom);
      }
      if (dateTo) {
        ordersQuery = ordersQuery.lte('created_at', dateTo);
      }

      const { data: orders, error: ordersError } = await ordersQuery.order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate basic statistics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

      // Orders by status
      const ordersByStatus = orders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Popular items calculation
      const itemStats = new Map<string, { item: any; quantity: number; revenue: number }>();
      
      orders?.forEach(order => {
        order.order_items?.forEach(orderItem => {
          const itemId = orderItem.item_id;
          const existing = itemStats.get(itemId);
          
          if (existing) {
            existing.quantity += orderItem.quantity;
            existing.revenue += orderItem.quantity * orderItem.price;
          } else {
            itemStats.set(itemId, {
              item: orderItem.item,
              quantity: orderItem.quantity,
              revenue: orderItem.quantity * orderItem.price
            });
          }
        });
      });

      const popularItems = Array.from(itemStats.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Daily sales for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailySales = last7Days.map(date => {
        const dayOrders = orders?.filter(order => 
          order.created_at.startsWith(date)
        ) || [];
        
        return {
          date,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + order.total, 0)
        };
      });

      salesReport = {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        orders_by_status: ordersByStatus,
        popular_items: popularItems,
        daily_sales: dailySales
      };
    } else {
      // Use mock database
      const result = await mockDatabase.getSalesReport();
      salesReport = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: salesReport
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate sales report'
      },
      { status: 500 }
    );
  }
}