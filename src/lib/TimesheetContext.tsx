import { useState, createContext, useContext } from "react";
import { useSearchParams } from 'next/navigation';

interface TimesheetContextType {
  currentWeek: string;
  currentClient: string;
  setCurrentWeek: (week: string) => void;
  setCurrentClient: (client: string) => void;
}

export const TimesheetContext = createContext<TimesheetContextType>({} as TimesheetContextType);

export const useTimesheet = () => {
  const context = useContext(TimesheetContext);
  if (!context) {
    throw new Error("useTimesheet must be used within a TimesheetProvider");
  }
  return context;
};

export const TimesheetProvider = ({children}: {children: React.ReactNode}) => {

  const searchParams = useSearchParams();
  const client = searchParams.get('client') || '1';
  const week = searchParams.get('week') || '1';
  const [currentWeek, setCurrentWeek] = useState(week);
  const [currentClient, setCurrentClient] = useState(client);

  const value = {
    currentWeek,
    currentClient,
    setCurrentWeek,
    setCurrentClient
  }

  return (
    <TimesheetContext.Provider value={value}>
      {children}
    </TimesheetContext.Provider>
  )

}