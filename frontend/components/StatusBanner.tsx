import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, Clock, Users, Zap, Brain } from 'lucide-react';

interface StatusBannerProps {
  transferStatus: 'none' | 'initiated' | 'summary-ready' | 'agent-a-joining' | 'verbal-handoff' | 'inviting-agent' | 'agent-joining' | 'moving-caller' | 'complete';
  userRole: 'caller' | 'agentA' | 'agentB';
}

export function StatusBanner({ transferStatus, userRole }: StatusBannerProps) {
  if (transferStatus === 'none') return null;

  const getStatusInfo = () => {
    switch (transferStatus) {
      case 'initiated':
        return {
          icon: <Brain className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'AI is analyzing your conversation for optimal transfer...' 
            : 'AI analyzing conversation context for transfer...',
          variant: 'default' as const
        };
      
      case 'summary-ready':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'Transfer summary ready. Connecting with specialist...' 
            : 'AI transfer summary ready for review',
          variant: 'default' as const
        };
      
      case 'agent-a-joining':
        return {
          icon: <Users className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'Agent is joining transfer room to brief the specialist...' 
            : userRole === 'agentA'
              ? 'Joining transfer room to brief Agent B...'
              : 'Agent A is joining to provide context...',
          variant: 'default' as const
        };
      
      case 'verbal-handoff':
        return {
          icon: <Zap className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'Agent is explaining your case to the specialist...' 
            : userRole === 'agentA'
              ? 'Explain the case context to Agent B via voice...'
              : 'Agent A is explaining the case context...',
          variant: 'default' as const
        };
      
      case 'moving-caller':
        return {
          icon: <Users className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'Connecting you directly with the specialist...' 
            : userRole === 'agentA'
              ? 'Moving caller to specialist room...'
              : 'Caller is being connected to your room...',
          variant: 'default' as const
        };
      
      case 'inviting-agent':
        return {
          icon: <Users className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'Inviting specialist agent to join the call...' 
            : userRole === 'agentA' 
              ? 'Inviting Agent B to join the call...'
              : 'You have a pending transfer request',
          variant: 'default' as const
        };
      
      case 'agent-joining':
        return {
          icon: <Clock className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'Specialist agent is joining the call...' 
            : userRole === 'agentA'
              ? 'Agent B is joining the call...'
              : 'Joining call in progress...',
          variant: 'default' as const
        };
      
      case 'complete':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          message: userRole === 'caller' 
            ? 'Successfully connected with specialist agent' 
            : userRole === 'agentA'
              ? 'Transfer complete. Customer connected with Agent B'
              : 'Transfer complete. You are now connected with the customer',
          variant: 'default' as const
        };
      
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <Alert className="rounded-none border-x-0 border-t-0 bg-muted/80 backdrop-blur-sm">
        {statusInfo.icon}
        <AlertDescription className="text-foreground font-medium">
          <div className="flex items-center justify-center gap-2">
            {statusInfo.message}
            {(transferStatus === 'initiated' || transferStatus === 'agent-joining') && (
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
            {transferStatus === 'complete' && (
              <Zap className="w-4 h-4 text-current" />
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}