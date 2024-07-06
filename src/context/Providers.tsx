'use client';
import React, { ReactNode } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TimesheetProvider } from './TimesheetContext';
import { TimeEntriesProvider } from './TimeEntriesContext';
import { UserProvider } from './UserContext';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <TimesheetProvider>
            <TimeEntriesProvider>
              {children}
            </TimeEntriesProvider>
          </TimesheetProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </UserProvider>
  )
}