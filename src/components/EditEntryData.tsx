import React, { useState } from 'react';
import { supabase, timeToSeconds, timeToUTC, formatTimeInput, calculateElapsedTime, timerInputFormat, userTimeZone, today, UTCtoLocal, convertTime } from '@/lib/utils';
import { TimeEntryProps } from "@/lib/types";
import { Button, Input, Checkbox, Select, SelectItem, Table, TableHeader, TableBody, TableRow, TableCell, TableColumn, cn } from "@nextui-org/react";
import ClientSubmit from './ClientSubmit';
import toast from 'react-hot-toast';

const EditEntryData = ({ entryData, closeToggle }: { entryData: TimeEntryProps, closeToggle: () => void }) => {
  const [formData, setFormData] = useState({ ...entryData });

  // const entryValues = {
  //   task: formData.task,
  //   date: formData.date,
  //   time_tracked: formData.time_tracked,
  //   billable: formData.billable,
  //   clientInfo: {
  //     client_name: formData.client_name,
  //     id: formData.client_id
  //   },
  //   start_time: formData.start_time,
  //   end_time: formData.end_time,
  //   owner: formData.owner
  // }


  const [startTime, setStartTime] = useState(UTCtoLocal(entryData.start_time));
  const [endTime, setEndTime] = useState(UTCtoLocal(entryData.end_time));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };
  
  const elapsedTime = calculateElapsedTime(startTime, endTime);
  const seconds = timeToSeconds(elapsedTime);

  const updateEntry = async () => {
    const updatedEntryData = {
      task: formData.task,
      date: formData.date,
      time_tracked: seconds,
      client_id: parseInt(formData.client_id),
      billable: formData.billable,
      start_time: timeToUTC(startTime),
      end_time: timeToUTC(endTime),
    }
    const { data, error } = await supabase
      .from('TimeEntries')
      .update(updatedEntryData)
      .eq('entry_id', formData.entry_id);

    if (error) {
      console.error('Error updating entry:', error);
      return;
    }
    window.dispatchEvent(new CustomEvent('timeEntryAdded'));
    toast.success('Entry Updated!');
    closeToggle();
  };

  return (
    <>
      <div className="flex gap-5">
        <Input
          label="Task"
          radius="sm"
          labelPlacement="outside"
          variant="underlined"
          name="task"
          value={formData.task}
          onChange={handleInputChange} />
        <Input
          label="Date"
          radius="sm"
          labelPlacement="outside"
          variant="underlined"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange} />
        <Input
          label="Start Time"
          radius="sm"
          labelPlacement="outside"
          variant="underlined"
          name="start_time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          label="End Time"
          radius="sm"
          labelPlacement="outside"
          variant="underlined"
          name="end_time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <Input
          label="Duration"
          radius="sm"
          labelPlacement="outside"
          variant="underlined"
          name="time_tracked"
          isDisabled
          value={convertTime(seconds)}
        />
        <Checkbox
          isSelected={formData.billable}
          onChange={handleCheckboxChange}
          name="billable"
          classNames={
            {
              base: cn(
                "flex-col-reverse",
              ),
              label: "w-full",
            }
          }
        >
          Billable
        </Checkbox>
        <ClientSubmit client={formData.client_id.toString()} handleClient={handleInputChange} />
      </div>
      <div className="flex justify-end mt-3 mb-5">
        <Button variant="flat" color="primary" onClick={updateEntry}>Update Entry</Button>
      </div>
    </>
  );
};

export default EditEntryData;
