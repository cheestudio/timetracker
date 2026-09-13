"use client";
import React, { Suspense, ReactNode } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TimesheetProvider } from "./TimesheetContext";
import { TimeEntriesProvider } from "./TimeEntriesContext";
import { UserProvider } from "./UserContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <NextUIProvider>
        <NextThemesProvider>
          <Suspense fallback={null}>
            <TimesheetProvider>
              <TimeEntriesProvider>{children}</TimeEntriesProvider>
            </TimesheetProvider>
          </Suspense>
        </NextThemesProvider>
      </NextUIProvider>
    </UserProvider>
  );
}
