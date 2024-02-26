import { SortDescriptor } from "@nextui-org/react";
import { DateRange } from "react-day-picker";

export interface TimeEntryProps {
  key: string;
  date: string;
  task: string;
  duration: string;
  time_tracked: string;
  entry_id: string;
  owner: string;
  billable: boolean;
  start_time: string;
  end_time: string;
  Clients: {
    client_name: string;
    client_id: string;
  };
  client_name: any;
  client_id: string;
}

export interface TableRowControlsProps {
  loading: boolean;
  selectedClient: number;
  selectedUser: string;
  viewableRows: number;
  selectedDateRange: string;
  handleUser: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClient: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleViewableRows: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDateRange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCustomDateRange: (e: DateRange | undefined) => void;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sortDescriptor: SortDescriptor;
  setSortDescriptor: React.Dispatch<React.SetStateAction<SortDescriptor>>;
  setTimeEntries: React.Dispatch<React.SetStateAction<any[]>>;
  timeEntries: any[];
  barVisibility: boolean;
  toggleBarVisibility: () => void;
  resetSearch: () => void;
}

export interface UserContextType {
  loggedIn: boolean;
  user: any;
}

export interface TimesheetContextType {
  currentClient: string;
  setCurrentClient: (client: string) => void;
}

export type CustomDateRangeProps = Pick<TableRowControlsProps, 'handleCustomDateRange'>

export type SortDirection = 'ascending' | 'descending' | undefined;
