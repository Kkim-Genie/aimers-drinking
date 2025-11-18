import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { selectRandomTwo, PARTICIPANTS } from "@/lib/participants";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST() {
  try {
    const [person1, person2] = selectRandomTwo();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      temperature: 0.9,
      messages: [
        {
          role: "user",
          content: `술자리 게임에서 사용할 재미있는 미션 2개를 만들어줘.

참가자 명단: ${PARTICIPANTS.join(", ")}

첫 번째 미션은 "${person1}"님을 위한 것이고,
두 번째 미션은 "${person2}"님을 위한 것이야.

미션은 다음 조건을 반드시 만족해야 해:
- 술자리를 재밌게 이끌 수 있는 미션이어야 함
- 다른 참가자들과 상호작용하는 미션 (특정 참가자를 타겟으로 할 수 있음)
- 1시간 동안 지속될 수 있는 미션이어야 함 (일회성 미션 금지)
- 미션 수행 횟수는 반드시 7회 이상 15회 이하로 명시해야 함
- 너무 과하거나 부끄러운 미션은 금지
- 다른 사람들이 너무 쉽게 눈치채면 안됨 (은밀하게 수행 가능해야 함)
- 재미있지만 적당히 어려운 난이도
- 각 미션은 구체적이고 명확하게 작성

미션 예시 스타일:
- "김민철님이 술을 마시고 잔에 술이 남아있으면 '아~ 잔에 술이 남아있네요'라고 말해야 함 (7회)"
- "노다비님이 말할 때마다 고개를 끄덕여야 함 (10회)"
- "정진철님에게 자연스럽게 칭찬을 해야 함 (8회)"

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트는 포함하지 마:
{
  "mission1": "${person1}님의 미션 내용",
  "mission2": "${person2}님의 미션 내용"
}`,
        },
        {
          role: "assistant",
          content: "{",
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response (prefill로 "{"가 이미 있으므로 합쳐서 파싱)
    let mission1 = "술 한 잔 마시기";
    let mission2 = "옆 사람에게 칭찬하기";

    try {
      const jsonResponse = JSON.parse("{" + responseText);
      mission1 = jsonResponse.mission1 || mission1;
      mission2 = jsonResponse.mission2 || mission2;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response text:", responseText);
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("missions")
      .insert({
        person1,
        person2,
        mission1,
        mission2,
        is_viewed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save mission" },
        { status: 500 }
      );
    }

    // Update game state
    await supabase
      .from("game_state")
      .upsert({
        id: 1,
        stage: "assigned",
        current_mission_id: data.id,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      missionId: data.id,
      person1,
      person2,
    });
  } catch (error) {
    console.error("Error generating mission:", error);
    return NextResponse.json(
      { error: "Failed to generate mission" },
      { status: 500 }
    );
  }
}
