'use client';

import messageHour from '@/lib/message-hour';
import { useState } from 'react';

interface GreetingProps {
    firstName: string;
    contestName?: string;
}

export default function GreetingUser({
  firstName,
  contestName
}: GreetingProps) {
  const [greeting] = useState<string>(messageHour(new Date().getHours()));
  return (
    <div>
        <h1 className='font-medium text-3xl'>{greeting}, {firstName}!</h1>
        <h3 className='text-xl text-muted-foreground'>{contestName}</h3>
    </div>
  );
}
