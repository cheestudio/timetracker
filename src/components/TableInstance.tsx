"use client";

import React, { useState, useEffect, useCallback } from "react";

import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button } from "@nextui-org/react";

import SubmitTime from "./SubmitTime";
import { supabase } from "@/lib/utils";
import toast from 'react-hot-toast';

interface TimeEntryProps {
  key: string;
  date: string;
  task: string;
  time_tracked: string;
  entry_id: string;
}

const TableInstance = ({ client, week }: { client: string, week: string }) => {

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

  useEffect(() => {
    const fetchTimeEntries = async () => {
      const { data, error } = await supabase
        .from('TimeEntries')
        .select('*')
        .eq('week_id', week)
        .eq('client_id', client)
        .order('date', { ascending: true })
        ;
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

  }, [week, client]);

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


  return (
    <div className="flex flex-col gap-8 table-instance">
      <Table
        selectionMode="multiple"
        onSelectionChange={handleSelectedKeys}
        key={tableKey}
      >
        <TableHeader>
          <TableColumn>Date</TableColumn>
          <TableColumn>Task</TableColumn>
          <TableColumn>Time</TableColumn>
        </TableHeader>
        <TableBody>
          {timeEntries.map((row: TimeEntryProps) => (
            <TableRow key={row.entry_id}>
              <TableCell>{formatDate(row.date)}</TableCell>
              <TableCell>{row.task}</TableCell>
              <TableCell>{convertTime(row.time_tracked)}</TableCell>
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
      <SubmitTime week={week} client={client} />
    </div>
  );
};

export default TableInstance;