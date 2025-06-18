import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_id, voice_name, text } = body;

    if (!file_id || !voice_name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 调用第三方 API 进行音频复刻
    const response = await fetch(`${process.env.CLONE_API_ENDPOINT}?Group_id=${process.env.GROUP_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'authority': 'api.minimaxi.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id,
        voice_id: voice_name,
        text,
        model: "speech-02-hd"
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Clone failed');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Clone error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Clone failed' },
      { status: 500 }
    );
  }
} 