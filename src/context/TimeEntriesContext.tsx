import useTimeEntries from "../hooks/useTimeEntries";
import { createContext, useContext } from "react";

const TimeEntriesContext = createContext<ReturnType<typeof useTimeEntries> | null>(null);

export const useTimeEntriesContext = () => {
  const context = useContext(TimeEntriesContext);
  if (!context) {
    throw new Error('no');
  }
  return context;
}

export const TimeEntriesProvider = ({children}: {children: React.ReactNode}) => {
  const timeEntriesState = useTimeEntries();
  // console.log('timeEntriesContext',timeEntriesState)
  return (
    <TimeEntriesContext.Provider value={timeEntriesState}>
      {children}
    </TimeEntriesContext.Provider>
  )
}