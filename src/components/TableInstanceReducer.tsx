"use client";

import SubmitTime from "./SubmitTime";
import toast from 'react-hot-toast';
import PaginateTable from './PaginateTable';
import TableDisplay from './TableDisplay';
import TableRowControls from './TableRowControls';
import BarChart from "./BarChart";
import ToggleElement from './ToggleElement';
import useVisibility from '@/hooks/useVisibility';
import TableInfo from './TableInfo';
import { TableRowControlsProps, TimeEntryProps, SortDirection } from '@/types/types';
import { useState, useEffect, useMemo, useCallback } from "react";
import { SortDescriptor } from "@nextui-org/react";
import { debounceWithValue } from "@/lib/utils";
import { DateRange } from 'react-day-picker';
import { useSelectedRows } from '@/hooks/useSelectedRows';
import { useTimeEntriesContext } from '@/context/TimeEntriesContext';

const TableInstanceReduce = ({ client }: { client: string }) => {

  
  /* Table State
  ========================================================= */
  const { isVisible: barVisibility, toggleVisibility: toggleBarVisibility } = useVisibility(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("today");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tableKey, setTableKey] = useState(0);
  const [calculatedTime, setCalculatedTime] = useState<number>(0);
  const { state, dispatch, removeEntry, fetchEntries } = useTimeEntriesContext();

  /* Fetch Entries
========================================================= */
  useEffect(() => {
    fetchEntries(client, selectedUser, customDateRange, selectedDateRange, searchQuery);
  }, [fetchEntries, client, selectedUser, customDateRange, selectedDateRange, searchQuery]);


  /* Calculate Total Hours
========================================================= */

  const calculateTotalHours = useCallback((entries: TimeEntryProps[] = state.timeEntries) => {
    if (entries.length === 0) return;
    const totalHours = entries.reduce((acc, entry) => acc + entry.time_tracked, 0);
    setCalculatedTime(totalHours);
  }, [state.timeEntries]);

  const { selectedKeys, handleSelectedKeys } = useSelectedRows({
    entries: state.timeEntries,
    onSelectionChange: (selectedEntries) => {
      if (selectedEntries.length === 0) {
        calculateTotalHours(state.timeEntries);
      } else {
        calculateTotalHours(selectedEntries);
      }
    }
  });

  useEffect(() => {
    calculateTotalHours(state.timeEntries);
  }, [state.timeEntries, calculateTotalHours]);

  /* Table Row Controls
  ========================================================= */
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

  /* Delete Rows
  ========================================================= */
  const deleteTimeEntry = async () => {
    const keyArray = Array.from(selectedKeys);
    const entryIds = keyArray.map((key) => (key as TimeEntryProps)?.entry_id);
    await removeEntry(entryIds);
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
    const sortedEntries = [...state.timeEntries].sort((a, b) => {
      let valueA = (a as any)[colSort.column];
      let valueB = (b as any)[colSort.column];

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
    dispatch({ type: 'FETCH_ENTRIES', payload: sortedEntries });
  }

  /* Pagination
  ========================================================= */
  const [viewableRows, setViewableRows] = useState(100);
  const [page, setPage] = useState(1);
  const [paginationKey, setPaginationKey] = useState(0);
  const rowsPerPage = viewableRows;
  const pages = Math.ceil(state.timeEntries.length / rowsPerPage);
  const items: TimeEntryProps[] = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return state.timeEntries.slice(start, end);
  }, [page, state.timeEntries, rowsPerPage]);

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
        timeEntries={state.timeEntries}
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
        timeEntries={state.timeEntries}
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

export default TableInstanceReduce;
