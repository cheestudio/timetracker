'use client';
import React, { ReactNode } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { TimesheetProvider } from './TimesheetContext';
import { UserProvider } from './UserContext';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <NextUIProvider>
        <TimesheetProvider>
          {children}
        </TimesheetProvider>
      </NextUIProvider>
    </UserProvider>
  )
}