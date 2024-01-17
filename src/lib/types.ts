import { SortDescriptor } from "@nextui-org/react";

export interface TimeEntryProps {
  key: string;
  date: string;
  task: string;
  time_tracked: string;
  entry_id: string;
  owner: string;
  start_time: string;
  end_time: string;
}

export interface TableRowControlsProps {
  selectedClient: number;
  selectedUser: string;
  viewableRows: number;
  selectedDateRange: string;
  handleUser: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClient: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleViewableRows: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDateRange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  sortDescriptor: SortDescriptor;
  setSortDescriptor: React.Dispatch<React.SetStateAction<SortDescriptor>>;
  setTimeEntries: React.Dispatch<React.SetStateAction<any[]>>;
  timeEntries: any[];
}

export type SortDirection = 'ascending' | 'descending' | undefined;