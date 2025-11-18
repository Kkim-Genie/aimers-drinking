import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json();

    // Verify participant password
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('name', name)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: '참가자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (participant.password !== password) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // Get the latest mission
    const { data: latestMission, error: missionError } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (missionError || !latestMission) {
      return NextResponse.json({
        success: true,
        hasMission: false,
        message: '현재 진행 중인 미션이 없습니다.',
      });
    }

    // Check if this person has a mission
    if (latestMission.person1 === name) {
      return NextResponse.json({
        success: true,
        hasMission: true,
        mission: latestMission.mission1,
      });
    } else if (latestMission.person2 === name) {
      return NextResponse.json({
        success: true,
        hasMission: true,
        mission: latestMission.mission2,
      });
    } else {
      return NextResponse.json({
        success: true,
        hasMission: false,
        message: '당신에게는 미션이 없습니다.',
      });
    }
  } catch (error) {
    console.error('Error checking personal mission:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
