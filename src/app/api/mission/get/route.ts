import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Mission ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mission: data,
    });
  } catch (error) {
    console.error('Error getting mission:', error);
    return NextResponse.json({ error: 'Failed to get mission' }, { status: 500 });
  }
}
