import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Phone, Users, Headphones, ArrowRight } from 'lucide-react';

type UserRole = 'caller' | 'agentA' | 'agentB';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl text-foreground">CallConnect Pro</h1>
              <p className="text-muted-foreground text-sm">Warm Transfer System</p>
            </div>
          </div>
          <p className="text-muted-foreground">Experience seamless call transfers with AI-powered context sharing</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Caller */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20" 
            onClick={() => onLogin('caller')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200 dark:border-green-500/20">
                <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Customer</CardTitle>
              <CardDescription>Experience the call from customer perspective</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Join as Customer
              </Button>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Call controls and status</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Agent information display</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Transfer notifications</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent A */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20" 
            onClick={() => onLogin('agentA')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-500/20">
                <Headphones className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Agent A</CardTitle>
              <CardDescription>Primary agent with transfer capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Join as Agent A
              </Button>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Live transcript monitoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>AI-powered transfer tools</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Smart summary generation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent B */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20" 
            onClick={() => onLogin('agentB')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200 dark:border-purple-500/20">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Agent B</CardTitle>
              <CardDescription>Specialist agent receiving transfers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Join as Agent B
              </Button>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Transfer notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Context preview</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Seamless call joining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flow Instructions */}
        <div className="mt-12 text-center">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6">
              <h3 className="mb-6">Demo Flow</h3>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary">1</span>
                  </div>
                  <span className="text-muted-foreground">Customer or Agent A starts call</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary">2</span>
                  </div>
                  <span className="text-muted-foreground">Agent A initiates warm transfer</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary">3</span>
                  </div>
                  <span className="text-muted-foreground">Agent B receives and joins call</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}