import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase';
import { mockDatabase } from '../../../../lib/mock-database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body'
        },
        { status: 400 }
      );
    }
    
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username and password are required'
        },
        { status: 400 }
      );
    }

    let adminInfo, error;

    if (isSupabaseConfigured()) {
      // Get admin user from database
      const { data: admin, error: dbError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('active', true)
        .single();

      if (dbError || !admin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid credentials'
          },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);

      if (!isValidPassword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid credentials'
          },
          { status: 401 }
        );
      }

      // Return admin info (without password hash)
      const { password_hash, ...adminData } = admin;
      adminInfo = adminData;
    } else {
      // Use mock database
      const result = await mockDatabase.loginAdmin(username, password);
      if (result.error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid credentials'
          },
          { status: 401 }
        );
      }
      adminInfo = result.data;
    }

    return NextResponse.json({
      success: true,
      data: adminInfo
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}