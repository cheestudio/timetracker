"use client";

import { useState, useEffect, useMemo } from "react";
import { TimeEntryProps, SortDirection } from "@/lib/types";
import { Button, SortDescriptor } from "@nextui-org/react";
import { convertTime, getTodayRange, getThisWeekRange, getThisMonthRange } from "@/lib/utils";
import SubmitTime from "./SubmitTime";
import { supabase } from "@/lib/utils";
import toast from 'react-hot-toast';
import PaginateTable from './PaginateTable';
import TableDisplay from './TableDisplay';
import TableRowControls from './TableRowControls';

const TableInstance = ({ client }: { client: string }) => {

  /* Time Converison
  ========================================================= */
  const [calculatedTime, setCalculatedTime] = useState(0);

  const calculateTotalHours = (entries: TimeEntryProps[]) => {
    let totalHours = 0;
    if(entries.length === 0) {
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
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  const handleDateRange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDateRange(e.target.value);
  };

  useEffect(() => {
    const fetchTimeEntries = async () => {
      let query = supabase
        .from('TimeEntries')
        .select('*')
        .eq('client_id', client)
        .order('date', { ascending: true });

      if (selectedDateRange !== 'all') {
        let range;
        if (selectedDateRange === 'today') {
          range = getTodayRange();
        } else if (selectedDateRange === 'this_week') {
          range = getThisWeekRange();
        } else if (selectedDateRange === 'this_month') {
          range = getThisMonthRange();
        }
        if (range) {
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

  }, [client, selectedDateRange]);

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
    <div className="flex flex-col gap-8 table-instance">

      <TableRowControls
        viewableRows={viewableRows}
        selectedDateRange={selectedDateRange}
        handleViewableRows={handleViewableRows}
        handleDateRange={handleDateRange}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        setTimeEntries={setTimeEntries}
        timeEntries={timeEntries}
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
            {convertTime(calculatedTime.toString())}
          </h2>
        </div>

      </div>

      <SubmitTime client={client} />

      {viewableRows != -1 &&
        <PaginateTable page={page} pages={pages} setPage={setPage} paginationKey={paginationKey} />
      }

    </div>
  );
};

export default TableInstance;