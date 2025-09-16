'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, LoadingSpinner } from '@/components/ui';
import { RoomComponent } from '@/components/room-component';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api';

export default function CallerPage() {
  const router = useRouter();
  const { 
    setParticipantInfo, 
    
    currentRoom, 
    setCurrentRoom,
    connectionState,
    participantName 
  } = useAppStore();
  
  const [roomToken, setRoomToken] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string>('');
  const [name, setName] = useState('');

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const roomName = `caller-room-${Date.now()}`;
      
      const response = await apiClient.createRoom({
        room_name: roomName,
        participant_name: name,
        role: 'caller'
      });

      setRoomToken(response.token);
      setServerUrl(response.ws_url);
      setCurrentRoom(response.room_id);
      setParticipantInfo(name, 'caller');
      
    } catch (err) {
      setError('Failed to join room. Please check your connection and try again.');
      console.error('Failed to join room:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setRoomToken('');
    setServerUrl('');
  };

  const handleBackHome = () => {
    router.push('/');
  };

  if (currentRoom && roomToken) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Caller Interface</h1>
              <p className="text-gray-600">Connected as: {participantName}</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleLeaveRoom}>
                Leave Room
              </Button>
              <Button variant="secondary" onClick={handleBackHome}>
                Back to Home
              </Button>
            </div>
          </div>

          {/* Room Component */}
          <div className="h-[600px]">
            <RoomComponent
              token={roomToken}
              serverUrl={serverUrl}
              roomName={currentRoom}
              onDisconnected={handleLeaveRoom}
            />
          </div>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="font-semibold">Instructions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• You are now connected to the call room</p>
                <p>• Agent A will join automatically to assist you</p>
                <p>• During the call, Agent A may transfer you to Agent B for specialized help</p>
                <p>• The transfer will be seamless with no interruption to your call</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">📞</div>
            <h1 className="text-2xl font-bold text-gray-900">Join as Caller</h1>
            <p className="text-gray-600">Enter your name to start a call</p>
          </CardHeader>
          
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isJoining}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <Button
                onClick={handleJoinRoom}
                disabled={isJoining || !name.trim()}
                className="w-full"
              >
                {isJoining ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Joining Room...</span>
                  </div>
                ) : (
                  'Join Call Room'
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={handleBackHome}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}