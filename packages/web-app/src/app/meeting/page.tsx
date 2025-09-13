import React from 'react';
import LiveAgentMeeting from '@/components/realtime/LiveAgentMeeting';

export default function MeetingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <LiveAgentMeeting />
      </div>
    </div>
  );
}