import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Reset game state to start
    await supabase
      .from('game_state')
      .upsert({
        id: 1,
        stage: 'start',
        current_mission_id: null,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting:', error);
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}
