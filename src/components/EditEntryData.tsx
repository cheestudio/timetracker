import React, { useState } from 'react';
import { supabase, timeToSeconds, timeToUTC, calculateElapsedTime, UTCtoLocal, convertTime, setTimezone, selectedClient } from '@/lib/utils';
import { TimeEntryProps } from "@/types/types";
import { Button, Input, Checkbox, cn } from "@nextui-org/react";

import ClientDropdown from './ClientDropdown';
import toast from 'react-hot-toast';
import { useTimeEntriesContext } from '@/context/TimeEntriesContext';

const EditEntryData = ({ entryData, closeToggle }: { entryData: TimeEntryProps, closeToggle: () => void }) => {

  const [formData, setFormData] = useState({ ...entryData });
  const [startTime, setStartTime] = useState(UTCtoLocal(entryData.start_time, setTimezone(entryData.owner)));
  const [endTime, setEndTime] = useState(UTCtoLocal(entryData.end_time, setTimezone(entryData.owner)));
  const elapsedTime = calculateElapsedTime(startTime, endTime);
  const { updateEntry } = useTimeEntriesContext();
  const seconds = timeToSeconds(elapsedTime);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleEditEntry = async () => {

    const clientName = await selectedClient(formData.client_id);

    const entry = {
      task: formData.task,
      date: formData.date,
      time_tracked: seconds,
      client_id: formData.client_id,
      client_name: clientName,
      billable: formData.billable,
      start_time: timeToUTC(startTime),
      end_time: timeToUTC(endTime),
      entry_id: formData.entry_id
    }
    await updateEntry(entry, entry.entry_id);
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
                "flex-col-reverse p-1 justify-between",
              ),
              label: "w-full text-[14px]",
              wrapper: "mt-3 mb-auto"
            }
          }
        >
          Billable
        </Checkbox>
        <ClientDropdown client={formData.client_id.toString()} handleClient={handleInputChange} />
      </div>
      <div className="flex justify-end mt-3 mb-5">
        <Button variant="flat" color="primary" onClick={handleEditEntry}>Update Entry</Button>
      </div>
    </>
  );
};

export default EditEntryData;
