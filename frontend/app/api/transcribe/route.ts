import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 Transcription API route called');
  
  try {
    const body = await request.json();
    console.log('🔥 Request body received:', {
      audio_data_length: body.audio_data?.length || 0,
      speaker_id: body.speaker_id,
      room_id: body.room_id,
      audio_format: body.audio_format
    });
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('🔥 Forwarding to backend:', `${backendUrl}/transcribe`);
    
    // Forward to backend transcription service
    const response = await fetch(`${backendUrl}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    console.log('🔥 Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend transcription error:', errorText);
      return NextResponse.json(
        { error: 'Transcription failed', details: errorText },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('🔥 Backend response:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Transcription API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal transcription error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}