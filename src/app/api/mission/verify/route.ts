import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { password, missionId } = await request.json();

    const correctPassword = process.env.MISSION_PASSWORD;

    if (password !== correctPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Get mission from Supabase
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Mark as viewed
    await supabase
      .from('missions')
      .update({ is_viewed: true })
      .eq('id', missionId);

    // Update game state to viewing
    await supabase
      .from('game_state')
      .upsert({
        id: 1,
        stage: 'viewing',
        current_mission_id: missionId,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      mission: data,
    });
  } catch (error) {
    console.error('Error verifying mission:', error);
    return NextResponse.json({ error: 'Failed to verify mission' }, { status: 500 });
  }
}
