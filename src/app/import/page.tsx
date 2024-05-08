"use client";

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { Button } from '@nextui-org/react';
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/DatePicker";
import { v4 as uuidv4 } from 'uuid';
import { supabase, userTimeZone } from '@/lib/utils';
import TogglEntries from './TogglEntries';
import moment from 'moment-timezone';
import toast from 'react-hot-toast';

export default function Import() {

  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [togglData, setTogglData] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasEntries = customDateRange?.from && customDateRange?.to;

  const handleCustomDateRange = (dateRange: DateRange | undefined) => {
    setCustomDateRange(dateRange || undefined);
  }

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
        return 'Chee';
    }
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
      const data = await resp.json();
      setTogglData(data);
      setLoading(false);
    }
    catch (err) {
      console.error(err);
    }
  };
  const formattedData = togglData.map((entry: any) => {
    return {
      date: moment(entry.at).tz(userTimeZone).utc().format(),
      task: entry.description,
      time_tracked: entry.duration,
      entry_id: uuidv4(),
      client_id: setClientId(entry.project_id),
      billable: entry.tags && entry.tags.includes("billable") ? true : false,
      owner: "Matt",
      user_id: '24c55db5-608d-4ab2-9326-f79f55abb168',
      start_time: entry.start,
      end_time: entry.stop,
    };
  });

  /* Supabase
  ========================================================= */

  const handleSubmit = async () => {
    const { data: user, error: userError } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('TimeEntries')
      .insert(formattedData);
    if (error) {
      console.log('Error:', error);
      return;
    } else {
      toast.success(`${formattedData.length} entries imported successfully`);
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
