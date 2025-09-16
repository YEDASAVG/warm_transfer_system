'use client';

import React, { useEffect, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { LiveKitRoom, useLocalParticipant, useParticipants, AudioTrack } from '@livekit/components-react';
import { useAppStore } from '@/lib/store';
import { Button, Card, CardBody, CardHeader, Badge, LoadingSpinner } from './ui';
import type { ConnectionState } from '@/lib/types';

interface RoomComponentProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onDisconnected?: () => void;
}

export const RoomComponent: React.FC<RoomComponentProps> = ({
  token,
  serverUrl,
  roomName,
  onDisconnected
}) => {
  const { setConnectionState, setParticipants, connectionState } = useAppStore();
  
  const handleConnected = () => {
    setConnectionState('connected');
    console.log('Connected to room:', roomName);
  };
  
  const handleDisconnected = () => {
    setConnectionState('disconnected');
    onDisconnected?.();
    console.log('Disconnected from room:', roomName);
  };
  
  const handleReconnecting = () => {
    setConnectionState('reconnecting');
    console.log('Reconnecting to room:', roomName);
  };
  
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connectOptions={{
        autoSubscribe: true,
      }}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
      className="h-full"
    >
      <RoomContent roomName={roomName} />
    </LiveKitRoom>
  );
};

const RoomContent: React.FC<{ roomName: string }> = ({ roomName }) => {
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const { setParticipants: setStoreParticipants, participantName, role } = useAppStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Update store with current participants
    const participantInfos = participants.map(p => ({
      identity: p.identity,
      role: p.metadata || 'participant',
      connected: true
    }));
    setStoreParticipants(participantInfos);
  }, [participants, setStoreParticipants]);
  
  const toggleMute = async () => {
    if (localParticipant) {
      setIsLoading(true);
      try {
        await localParticipant.setMicrophoneEnabled(!isMuted);
        setIsMuted(!isMuted);
      } catch (error) {
        console.error('Failed to toggle microphone:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Room Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Room: {roomName}</h2>
              <p className="text-sm text-gray-600">
                Connected as: {participantName} ({role})
              </p>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
        </CardHeader>
      </Card>
      
      {/* Audio Controls */}
      <Card className="mb-4">
        <CardBody>
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleMute}
              variant={isMuted ? 'danger' : 'secondary'}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>{isMuted ? '🔇' : '🎤'}</span>
              )}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
            
            <div className="text-sm text-gray-600">
              Microphone: {isMuted ? 'Muted' : 'Active'}
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Participants List */}
      <Card className="flex-1">
        <CardHeader>
          <h3 className="font-semibold">Participants ({participants.length})</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {participants.map((participant) => (
              <ParticipantItem 
                key={participant.sid} 
                participant={participant}
                isLocal={participant === localParticipant}
              />
            ))}
          </div>
          
          {participants.length === 1 && (
            <div className="text-center text-gray-500 py-4">
              Waiting for other participants to join...
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Audio will be handled automatically by LiveKitRoom */}
    </div>
  );
};

interface ParticipantItemProps {
  participant: RemoteParticipant | LocalParticipant;
  isLocal: boolean;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({ participant, isLocal }) => {
  const isSpeaking = participant.isSpeaking;
  const isMuted = participant.isMicrophoneEnabled === false;
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isSpeaking ? 'border-green-300 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
          isLocal ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {participant.identity.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium">
            {participant.identity} {isLocal && '(You)'}
          </div>
          <div className="text-sm text-gray-500">
            {participant.metadata || 'Participant'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isSpeaking && (
          <Badge variant="success">Speaking</Badge>
        )}
        {isMuted && (
          <Badge variant="warning">Muted</Badge>
        )}
        <span className={`text-lg ${isMuted ? 'text-red-500' : 'text-green-500'}`}>
          {isMuted ? '🔇' : '🎤'}
        </span>
      </div>
    </div>
  );
};