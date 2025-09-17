"use client";

import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  useParticipants,
} from '@livekit/components-react';


interface RoomComponentProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onDisconnected?: () => void;
  onTranscript?: (text: string) => void;
}

export function RoomComponent({ 
  token, 
  serverUrl, 
  roomName, 
  onDisconnected, 
  onTranscript 
}: RoomComponentProps) {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string>('');

  // Debug logging and request permissions
  useEffect(() => {
    console.log('🔧 RoomComponent mounted with:', { token: token?.substring(0, 20) + '...', serverUrl, roomName });
    
    // Request media permissions explicitly
    const requestPermissions = async () => {
      try {
        console.log('🎥 Requesting camera and microphone permissions...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        console.log('✅ Media permissions granted:', stream.getTracks().map(t => ({ kind: t.kind, label: t.label })));
        setPermissionsGranted(true);
        setPermissionError('');
        // Close the stream since LiveKit will create its own
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('❌ Media permissions denied:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setPermissionError(`Camera/microphone access denied: ${errorMessage}`);
        setPermissionsGranted(false);
      }
    };
    
    requestPermissions();
  }, [token, serverUrl, roomName]);

  if (permissionError) {
    return (
      <div className="h-96 w-full bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <div className="text-red-600 dark:text-red-400 font-semibold">Camera/Microphone Access Required</div>
          <div className="text-sm text-red-500 dark:text-red-300 max-w-md">
            {permissionError}
          </div>
          <div className="text-xs text-red-400 dark:text-red-500">
            Click the camera/microphone icon in your browser address bar and select &quot;Allow&quot;
          </div>
        </div>
      </div>
    );
  }

  if (!permissionsGranted) {
    return (
      <div className="h-96 w-full bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🎥</div>
          <div className="text-blue-600 dark:text-blue-400 font-semibold">Requesting Camera & Microphone Access</div>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm text-blue-500 dark:text-blue-300">
            Please allow camera and microphone access when prompted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-border">
      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={onDisconnected}
        onConnected={() => {
          console.log('✅ LiveKit connected successfully!');
        }}
        onError={(error) => {
          console.error('❌ LiveKit error:', error);
        }}
        connectOptions={{
          autoSubscribe: true,
        }}
      >
        {/* Real Audio Renderer */}
        <RoomAudioRenderer />
        
        {/* Audio-Only Participants */}
        <ParticipantComponent onTranscript={onTranscript} />
        
        {/* Real Audio Controls */}
        <ControlBar />
      </LiveKitRoom>
    </div>
  );
}

function ParticipantComponent({ onTranscript }: { onTranscript?: (text: string) => void }) {
  const participants = useParticipants();

  // Simple mock transcript generation for demonstration
  useEffect(() => {
    if (!onTranscript) {
      console.log('🎤 No transcript callback available');
      return;
    }

    if (participants.length > 0) {
      console.log('🎤 Setting up mock transcript generation for', participants.length, 'participants');
      
      // Generate mock conversation transcript
      const mockTranscripts = [
        "Customer: Hi, I'm having trouble with my account login",
        "Agent A: I'd be happy to help you with that login issue",
        "Customer: I keep getting an error message when I try to sign in",
        "Agent A: Let me check your account status for you",
        "Customer: The error says my password is incorrect but I'm sure it's right",
        "Agent A: I can see the issue here. This looks like it needs our security specialist",
        "Customer: Okay, whatever you think is best",
        "Agent A: I'm going to transfer you to Agent B who specializes in account security"
      ];

      let transcriptIndex = 0;
      
      const addMockTranscript = () => {
        if (transcriptIndex < mockTranscripts.length) {
          const transcript = mockTranscripts[transcriptIndex];
          console.log('🗣️ Adding mock transcript:', transcript);
          onTranscript(transcript + '. ');
          transcriptIndex++;
        }
      };

      // Add a new transcript every 5 seconds
      const interval = setInterval(addMockTranscript, 5000);
      
      // Add first transcript immediately
      setTimeout(addMockTranscript, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [participants, onTranscript]);

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Participants</h3>
      
      {participants.map((participant) => (
        <div 
          key={participant.identity} 
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            participant.isSpeaking 
              ? 'bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500' 
              : 'bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${
            participant.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {participant.name || participant.identity}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {participant.isLocal ? 'You' : 'Remote'} • 
              {participant.isSpeaking ? ' Speaking' : ' Silent'}
            </div>
          </div>
          
          {/* Microphone status */}
          <div className="text-lg">
            🎤
          </div>
        </div>
      ))}
      
      {participants.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Waiting for participants to join...
        </div>
      )}
      
      {participants.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            📝 Mock Transcript Active
          </div>
          <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
            Generating sample conversation for demo
          </div>
        </div>
      )}
    </div>
  );
}