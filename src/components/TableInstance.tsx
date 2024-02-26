"use client";

import { TableRowControlsProps, TimeEntryProps, SortDirection } from '@/lib/types';
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/utils";
import { Button, SortDescriptor } from "@nextui-org/react";
import { convertTime, convertToDecimalHours, getTodayRange, getWeekRange, getLastTwoWeeks, getThisMonthRange, getLastMonthRange, getYesterdayRange, debounceWithValue } from "@/lib/utils";
import { DateRange } from 'react-day-picker';
import moment from 'moment-timezone';
import SubmitTime from "./SubmitTime";
import toast from 'react-hot-toast';
import PaginateTable from './PaginateTable';
import TableDisplay from './TableDisplay';
import TableRowControls from './TableRowControls';
import BarChart from "./BarChart";
import ToggleElement from './ToggleElement';
import useVisibility from '@/lib/useVisibility';
import TimeTotal from './TimeTotal';
import SelectEntry from './SelectEntry';
import TableInfo from './TableInfo';

const TableInstance = ({ client }: { client: string }) => {

  const { isVisible: barVisibility, toggleVisibility: toggleBarVisibility } = useVisibility(false);

  /* Time Converison
  ========================================================= */
  const [calculatedTime, setCalculatedTime] = useState(0);

  const calculateTotalHours = (entries: TimeEntryProps[]) => {
    let totalHours = 0;
    if (entries.length === 0) {
      return;
    }
    entries.forEach((entry) => {
      totalHours += parseInt(entry?.time_tracked, 10);
    });
    setCalculatedTime(totalHours);
  };

  /* Time Entries
  ========================================================= */
  const [timeEntries, setTimeEntries] = useState([] as any);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("this_week");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tableKey, setTableKey] = useState(0);

  const handleDateRange: TableRowControlsProps['handleDateRange'] = (e) => {
    setSelectedDateRange(e.target.value);
  };

  const handleCustomDateRange: TableRowControlsProps['handleCustomDateRange'] = (dateRange) => {
    setCustomDateRange(dateRange || undefined);
  }

  const handleClient: TableRowControlsProps['handleClient'] = (e) => {
    setSelectedClient(parseInt(e.target.value));
  };

  const handleUser: TableRowControlsProps['handleUser'] = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleSearch: TableRowControlsProps['handleSearch'] = (e) => {
    debounceWithValue(() => setSearchQuery(e.target.value), 1000)();
    setLoading(true);
  }

  const resetSearch: TableRowControlsProps['resetSearch'] = () => {
    setSearchQuery('');
    setLoading(false);
  }

  useEffect(() => {
    
    const fetchTimeEntries = async () => {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          selectedUser,
          customDateRange,
          selectedDateRange,
          searchQuery
        })
      });
      const data = await response.json();

      if (response.status !== 200) {
        console.error('Error fetching data: ', response.statusText);
        return [];
      }
      
      if (data) {
        const entries = data.map((entry: TimeEntryProps) => ({
          ...entry,
          client_name: entry.Clients?.client_name
        }));
        setTimeEntries(entries);
        calculateTotalHours(data);
        setLoading(false);
        setSelectedKeys([]);
        setTableKey((prevKey) => prevKey + 1);
      }
    };

    fetchTimeEntries();
    const handleNewEntry = () => {
      fetchTimeEntries();
    };

    window.addEventListener('timeEntriesModified', handleNewEntry);

    return () => {
      window.removeEventListener('timeEntriesModified', handleNewEntry);
    };

  }, [client, selectedUser, customDateRange, selectedDateRange, searchQuery]);

  /* Selected Rows
  ========================================================= */
  const [selectedKeys, setSelectedKeys] = useState([] as any);
  const handleSelectedKeys = (keys: any) => {
    if (keys === 'all') {
      if (selectedKeys.length === timeEntries.length) {
        setSelectedKeys([]);
      }
      else {
        setSelectedKeys(timeEntries);
      }
    }
    else {
      const keyArray = Array.from(keys);
      const mappedRows = keyArray.map((key) => timeEntries.find((row: TimeEntryProps) => row.entry_id === key));
      setSelectedKeys(mappedRows);
      calculateTotalHours(mappedRows);
      if (keyArray.length === 0) {
        calculateTotalHours(timeEntries);
      }
    }
  }

  /* Delete Rows
  ========================================================= */
  const deleteTimeEntry = async () => {
    const keyArray = Array.from(selectedKeys);
    const entryIds = keyArray.map((key) => (key as TimeEntryProps)?.entry_id);
    const { error } = await supabase
      .from('TimeEntries')
      .delete()
      .in('entry_id', entryIds);
      
    if (error) {
      console.error('Error deleting data: ', error);
    }
    window.dispatchEvent(new CustomEvent('timeEntriesModified'));
    setSelectedKeys([]);
    toast.success('Removed');
  }

  /* Table Sort
  ========================================================= */
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "",
    direction: undefined as SortDirection,
  });
  const sort = (column: any) => {
    let newDirection: SortDirection = 'ascending';
    if (column.column === sortDescriptor.column && sortDescriptor.direction === 'ascending') {
      newDirection = 'descending';
    }
    const colSort = {
      column: column.column,
      direction: newDirection,
    };
    setSortDescriptor(colSort);
    const sortedEntries = [...timeEntries].sort((a, b) => {
      let valueA = a[colSort.column];
      let valueB = b[colSort.column];

      if (colSort.column === 'date') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      if (colSort.column === 'time_tracked') {
        valueA = parseInt(valueA, 10);
        valueB = parseInt(valueB, 10);
      }
      if (colSort.direction === 'ascending') {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    });
    setTimeEntries(sortedEntries);
  }

  /* Pagination
  ========================================================= */
  const [viewableRows, setViewableRows] = useState(1000);
  const [page, setPage] = useState(1);
  const [paginationKey, setPaginationKey] = useState(0);
  const rowsPerPage = viewableRows;
  const pages = Math.ceil(timeEntries.length / rowsPerPage);
  const items: TimeEntryProps[] = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return timeEntries.slice(start, end);
  }, [page, timeEntries, rowsPerPage]);

  const handleViewableRows = (e: any) => {
    setViewableRows(parseInt(e.target.value));
    setPage(1);
    setPaginationKey((prevKey) => prevKey + 1);
  }

  return (
    <div className={`flex flex-col gap-4 table-instance pt-[20px] has-[.time-submit-form.translate-y-0]:pt-[180px] transition-all`}>

      <SubmitTime />

      <TableRowControls
        viewableRows={viewableRows}
        handleClient={handleClient}
        handleUser={handleUser}
        selectedUser={selectedUser}
        selectedClient={parseInt(client)}
        selectedDateRange={selectedDateRange}
        handleCustomDateRange={handleCustomDateRange}
        handleViewableRows={handleViewableRows}
        handleDateRange={handleDateRange}
        handleSearch={handleSearch}
        resetSearch={resetSearch}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        setTimeEntries={setTimeEntries}
        timeEntries={timeEntries}
        loading={loading}
        barVisibility={barVisibility}
        toggleBarVisibility={toggleBarVisibility}
      />

      <ToggleElement isVisible={barVisibility}>
        <BarChart items={items} />
      </ToggleElement>

      <TableDisplay
        key={tableKey}
        handleSelectedKeys={handleSelectedKeys}
        items={items}
        sortDescriptor={sortDescriptor}
        onSort={sort}
      />

      <TableInfo
        timeEntries={timeEntries}
        selectedKeys={selectedKeys}
        calculatedTime={calculatedTime}
        deleteTimeEntry={deleteTimeEntry}
      />

      {viewableRows != -1 &&
        <PaginateTable
          page={page}
          pages={pages}
          setPage={setPage}
          paginationKey={paginationKey}
        />
      }

    </div>
  );
};

export default TableInstance;