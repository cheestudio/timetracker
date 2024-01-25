"use client";

import { TableRowControlsProps } from '@/lib/types';
import { useState, useEffect, useMemo } from "react";
import { TimeEntryProps, SortDirection } from "@/lib/types";
import { Button, SortDescriptor } from "@nextui-org/react";
import { convertTime, convertToDecimalHours, getTodayRange, getWeekRange, getLastTwoWeeks, getThisMonthRange, getYesterdayRange, debounceWithValue } from "@/lib/utils";
import SubmitTime from "./SubmitTime";
import { supabase } from "@/lib/utils";
import toast from 'react-hot-toast';
import PaginateTable from './PaginateTable';
import TableDisplay from './TableDisplay';
import TableRowControls from './TableRowControls';
import { DateRange } from 'react-day-picker';

const TableInstance = ({ client }: { client: string }) => {

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

  useEffect(() => {
    const fetchTimeEntries = async () => {
      let query = supabase
        .from('TimeEntries')
        .select('*')
        .order('date', { ascending: true });

      if (parseInt(client) !== 0) {
        query = query
          .eq('client_id', client);
      }

      if (selectedUser !== 'all') {
        query = query
          .textSearch('owner', selectedUser);
      }

      if (searchQuery !== '') {
        query = query
          .ilike('task', `%${searchQuery}%`);
      }
      
      if (selectedDateRange !== 'all') {
        let range;
        if (selectedDateRange === 'today') {
          range = getTodayRange();
        } 
        else if (selectedDateRange === 'yesterday') {
          range = getYesterdayRange();
        } 
        else if (selectedDateRange === 'this_week') {
          range = getWeekRange();
        } 
        else if (selectedDateRange === 'last_week') {
          range = getWeekRange(true);
        } 
        else if (selectedDateRange === 'two_weeks') {
          range = getLastTwoWeeks();
        }
        else if (selectedDateRange === 'this_month') {
          range = getThisMonthRange();
        } 
        else if (selectedDateRange === 'custom') {
          const start = customDateRange?.from;
          const end = customDateRange?.to;
          if (!start || !end) {
            return;
          }
          range = [start, end];
        }
        if (range) {
          console.log(range);
          query = query
            .gte('date', range[0].toISOString())
            .lte('date', range[1].toISOString());
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching data: ', error);
        return [];
      }
      if (data) {
        setTimeEntries(data);
        calculateTotalHours(data);
        setLoading(false);
      }
    };
    fetchTimeEntries();
    const handleNewEntry = () => {
      fetchTimeEntries();
    };

    window.addEventListener('timeEntryAdded', handleNewEntry);

    return () => {
      window.removeEventListener('timeEntryAdded', handleNewEntry);
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
    const entryIds = keyArray.map((key) => (key as TimeEntryProps).entry_id);
    const { error } = await supabase
      .from('TimeEntries')
      .delete()
      .in('entry_id', entryIds);
    if (error) {
      console.error('Error deleting data: ', error);
    }
    window.dispatchEvent(new CustomEvent('timeEntryAdded'));
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

  const [viewableRows, setViewableRows] = useState(50);
  const [page, setPage] = useState(1);
  const [paginationKey, setPaginationKey] = useState(0);
  const rowsPerPage = viewableRows;
  const pages = Math.ceil(timeEntries.length / rowsPerPage);
  const items = useMemo(() => {
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
    <div className="flex flex-col gap-4 table-instance">

      <SubmitTime client={client} />

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
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        setTimeEntries={setTimeEntries}
        timeEntries={timeEntries}
        loading={loading}
      />

      <TableDisplay handleSelectedKeys={handleSelectedKeys} items={items} sortDescriptor={sortDescriptor} onSort={sort} />

      <div className="flex justify-between">
        {selectedKeys && selectedKeys.length > 0 &&
          <div>
            <Button
              variant="flat"
              color="warning"
              onPress={() => deleteTimeEntry()}>
              Remove Selected
            </Button>
          </div>
        }

        <div className="ml-auto">
          <h2 className="text-2xl">
            <strong>
              {selectedKeys && selectedKeys.length > 0 ? 'Selected: ' : 'Total: '}
            </strong> 
            {convertTime(calculatedTime).toString()} <span className="mx-2">|</span> {convertToDecimalHours(calculatedTime).toString()}
          </h2>
        </div>

      </div>

      {viewableRows != -1 &&
        <PaginateTable page={page} pages={pages} setPage={setPage} paginationKey={paginationKey} />
      }

    </div>
  );
};

export default TableInstance;