import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 현재 게임 상태 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching game state:', error);
      return NextResponse.json({
        stage: 'start',
        currentMissionId: null,
      });
    }

    return NextResponse.json({
      stage: data.stage,
      currentMissionId: data.current_mission_id,
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json({
      stage: 'start',
      currentMissionId: null,
    });
  }
}
