import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mockDatabase } from '../../../lib/mock-database';

export async function GET() {
  try {
    let data, error;

    if (isSupabaseConfigured()) {
      const result = await supabase
        .from('tables')
        .select('*')
        .eq('active', true)
        .order('code', { ascending: true });
      
      data = result.data;
      error = result.error;
    } else {
      // Use mock database
      const result = await mockDatabase.getTables();
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
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tables'
      },
      { status: 500 }
    );
  }
}