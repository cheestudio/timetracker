"use client";

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { Button } from '@nextui-org/react';
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/DatePicker";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/utils';
import { TogglEntries } from './TogglEntries';
import { useSelectedRows } from '@/hooks/useSelectedRows';
import moment from 'moment-timezone';
import toast from 'react-hot-toast';

const mapTogglData = (data: any[]) => {
  return data.map((entry) => ({
    date: moment(entry.at).utc().format(),
    task: entry.description,
    time_tracked: entry.duration,
    entry_id: uuidv4(),
    client_id: setClientId(entry.project_id),
    billable: entry.tags?.includes("billable") || false,
    owner: "Matt",
    user_id: '24c55db5-608d-4ab2-9326-f79f55abb168',
    start_time: entry.start,
    end_time: entry.stop,
  }));
};

const setClientId = (projectId: number) => {
  switch (projectId) {
    case 198030777:
      return 3;
    case 198290047:
      return 1;
    case 198289972:
      return 2;
    case 202509688:
      return 7;
    default:
      return 1;
  }
}

export function Import() {


  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [togglData, setTogglData] = useState([]);
  const [formattedData, setFormattedData] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const hasEntries = customDateRange?.from || customDateRange?.to;
  const { selectedKeys, handleSelectedKeys, setSelectedKeys } = useSelectedRows({ entries: formattedData });
  

  const handleCustomDateRange = (dateRange: DateRange | undefined) => {
    setCustomDateRange(dateRange || undefined);
  }

  const fetchToggle = async () => {
    setLoading(true);
    const fromDate = customDateRange?.from?.toISOString();
    const toDate = customDateRange?.to?.toISOString();
    try {
      const resp = await fetch("/api/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "start_date": fromDate,
          "end_date": toDate,
        }),
      });
      if (resp.status === 500) {
        toast.error('No entries found, adjust the dates and try again', {
          duration: 5000,
        });
        setLoading(false);
        setTogglData([]);
        return;
      }
      const data = await resp.json();
      setTogglData(data);
      const mappedData = mapTogglData(data);
      setFormattedData(mappedData);
      setSelectedKeys([]);
      setLoading(false);
    }
    catch (err) {
      console.error('Error mapping data:', err);
    }
  };

  console.log(selectedKeys);

  /* Supabase
  ========================================================= */
  const handleSubmit = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getSession();
      if (userError) throw userError;
      const { data, error } = await supabase.from('TimeEntries').insert(selectedKeys);
      if (error) throw error;
      toast.success(`${selectedKeys.length} entries imported successfully`);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <div className="px-12">

      <>
        <div className="grid gap-5 mb-5">
          <div className="grid justify-center w-full max-w-3xl col-span-1 gap-5 mx-auto my-10 import-toggl-controls">
            <DatePickerWithRange
              handleCustomDateRange={handleCustomDateRange}
            />
            {hasEntries &&
              <Button isLoading={loading} onClick={fetchToggle}>
                List Entries
              </Button>
            }
          </div>

          <TogglEntries
            handleSelectedKeys={handleSelectedKeys}
            //@ts-ignore
            data={formattedData}
          />

          {togglData.length > 0 &&
            <div className="text-center">
              <Button
                onPress={handleSubmit}
              >
                Import
              </Button>
            </div>
          }

        </div>
      </>

    </div>
  )
}
