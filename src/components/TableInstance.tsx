"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, SortDescriptor, Pagination, Select, SelectItem } from "@nextui-org/react";

import SubmitTime from "./SubmitTime";
import { supabase } from "@/lib/utils";
import toast from 'react-hot-toast';

interface TimeEntryProps {
  key: string;
  date: string;
  task: string;
  time_tracked: string;
  entry_id: string;
  owner: string;
}

type SortDirection = 'ascending' | 'descending' | undefined;

const TableInstance = ({ client }: { client: string }) => {

  /* Time Converison
  ========================================================= */

  const [calculatedTime, setCalculatedTime] = useState(0);

  const convertTime = (time: string) => {
    const hours = Math.floor(parseInt(time, 10) / 60);
    const minutes = parseInt(time, 10) % 60;
    return `${hours}h ${minutes}m`;
  }

  const calculateTotalHours = (entries: TimeEntryProps[]) => {
    let totalHours = 0;
    entries.forEach((entry) => {
      totalHours += parseInt(entry.time_tracked, 10);
    });
    setCalculatedTime(totalHours);
  };

  function formatDate(date: string) {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    return [month, day, year].join('/');
  }

  /* Time Entries
  ========================================================= */
  const [timeEntries, setTimeEntries] = useState([] as any);
  const [tableKey, setTableKey] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  const getTodayRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const end = new Date(today);
    end.setHours(23, 59, 59, 999); // End of today
    console.log(today, end);
    return [today, end];
  };
  
  const getThisWeekRange = () => {
    const today = new Date();
    const first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
    const last = first + 6; // last day is the first day + 6
  
    const start = new Date(today.setDate(first));
    start.setHours(0, 0, 0, 0); // Start of first day
  
    const end = new Date(today.setDate(last));
    end.setHours(23, 59, 59, 999); // End of last day
  
    return [start, end];
  };
  
  const getThisMonthRange = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
    return [firstDay, lastDay];
  };
  
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
            console.log('today');
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
  const [selectedKeys, setSelectedKeys] = React.useState([] as any);
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
    setTableKey((prevKey) => prevKey + 1);
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
      <div className="flex justify-end gap-5">
        <div className="flex-[0_0_200px]">
          <Select
            value={viewableRows}
            onChange={handleViewableRows}
            variant="bordered"
            label="Viewable Rows"
            labelPlacement="outside"
            placeholder="Select"
            popoverProps={{
              classNames: {
                content: "bg-[#27272A]",
              },
            }}
          >
            <SelectItem key="-1">All</SelectItem>
            <SelectItem key="25">25</SelectItem>
            <SelectItem key="50">50</SelectItem>
            <SelectItem key="75">75</SelectItem>
            <SelectItem key="100">100</SelectItem>
          </Select>
        </div>
        <div className="flex-[0_0_200px]">
        <Select
            value={selectedDateRange}
            onChange={handleDateRange}
            variant="bordered"
            label="Date Range"
            labelPlacement="outside"
            placeholder="Select"
            popoverProps={{
              classNames: {
                content: "bg-[#27272A]",
              },
            }}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="today">Today</SelectItem>
            <SelectItem key="this_week">This Week</SelectItem>
            <SelectItem key="this_month">This Month</SelectItem>
          </Select>
        </div>
      </div>
      <Table
        selectionMode="multiple"
        onSelectionChange={handleSelectedKeys}
        sortDescriptor={sortDescriptor}
        onSortChange={sort}
        key={tableKey}
      >
        <TableHeader>
          <TableColumn key="date" allowsSorting>Date</TableColumn>
          <TableColumn key="task" allowsSorting>Task</TableColumn>
          <TableColumn key="time_tracked" allowsSorting>Time</TableColumn>
          <TableColumn key="owner" allowsSorting>Owner</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((row: TimeEntryProps) => (
            <TableRow key={row.entry_id}>
              <TableCell>{formatDate(row.date)}</TableCell>
              <TableCell>{row.task}</TableCell>
              <TableCell>{convertTime(row.time_tracked)}</TableCell>
              <TableCell>{row.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between">
        {selectedKeys && selectedKeys.length > 0 &&
          <div>
            <Button variant="flat" color="warning" onPress={() => deleteTimeEntry()}>Remove Selected</Button>
          </div>
        }
        <div className="ml-auto">
          <h2 className="text-2xl">
            <strong>{selectedKeys && selectedKeys.length > 0 ? 'Selected: ' : 'Total: '}</strong>
            {convertTime(calculatedTime.toString())}
          </h2>
        </div>
      </div>
      <SubmitTime client={client} />
      {viewableRows != -1 &&
      <Pagination
        className="flex justify-center"
        color="primary"
        variant="light"
        page={page}
        total={pages}
        onChange={(page) => setPage(page)}
        showControls={true}
        key={paginationKey}
        dotsJump={10}
        boundaries={5}
      />
    }
    </div>
  );
};

export default TableInstance;