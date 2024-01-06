import { SortDescriptor } from "@nextui-org/react";

export interface TimeEntryProps {
  key: string;
  date: string;
  task: string;
  time_tracked: string;
  entry_id: string;
  owner: string;
}

export interface TableRowControlsProps {
  viewableRows: number;
  selectedDateRange: string;
  handleViewableRows: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDateRange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  sortDescriptor: SortDescriptor;
  setSortDescriptor: React.Dispatch<React.SetStateAction<SortDescriptor>>;
  setTimeEntries: React.Dispatch<React.SetStateAction<any[]>>;
  timeEntries: any[];
}

export type SortDirection = 'ascending' | 'descending' | undefined;