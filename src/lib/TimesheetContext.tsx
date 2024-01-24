import { useState, createContext, useContext } from "react";
import { useSearchParams } from 'next/navigation';
import { TimesheetContextType } from "./types";

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
  const [currentClient, setCurrentClient] = useState(client);
  
  const value = {
    currentClient,
    setCurrentClient
  }

  return (
    <TimesheetContext.Provider value={value}>
      {children}
    </TimesheetContext.Provider>
  )

}