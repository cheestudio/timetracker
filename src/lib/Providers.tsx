'use client';
import React, { ReactNode } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { TimesheetProvider } from './TimesheetContext';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextUIProvider>
      <TimesheetProvider>
        {children}
      </TimesheetProvider>
    </NextUIProvider>
  )
}