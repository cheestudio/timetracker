"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils';
import TableInstance from '@/components/TableInstance';
import { useTimesheet } from '@/lib/TimesheetContext';
import PaginateTables from '@/components/Pagination';
import { useRouter } from 'next/navigation';
import { Button, Divider } from '@nextui-org/react';
import toast from 'react-hot-toast';

const TimeSheet = () => {

  const router = useRouter();
  const [weekCount, setWeekCount] = useState(0);
  const { currentClient, currentWeek, setCurrentWeek } = useTimesheet();

  /*  Current Client Tables
  ========================================================= */

  useEffect(() => {
    (async () => {
      const { count, error } = await supabase
        .from('TableInstances')
        .select('*', { count: 'exact' })
        .eq('client_id', currentClient);

        if (error) {
          console.error('Error fetching data: ', error);
          return [];
        }

      setWeekCount(count || 0);
    })();
  }, [currentWeek, currentClient]);

  /* Add Client Table
  ========================================================= */

  const addTableInstance = async () => {
    const nextWeek = weekCount + 1;
    const { error: instanceError } = await supabase
      .from('TableInstances')
      .insert([
        {
          created_at: new Date(),
          client_id: parseInt(currentClient),
          week_id: nextWeek
        }
      ]);
    if (instanceError) {
      console.error('Error fetching data: ', instanceError);
      return [];
    }
    // router.push(`/timesheets/?client=${currentClient}&week=${nextWeek}`);
    toast.success('New timesheet created');
    window.location.href = `/timesheets/?client=${currentClient}&week=${nextWeek}`;
    setCurrentWeek(nextWeek.toString());
  }

  return (
    <>
      <div className="flex flex-col gap-10">
        <TableInstance client={currentClient} week={currentWeek} />
        <PaginateTables count={weekCount} week={currentWeek} />

        <Divider className="my-2" />

        <div className="text-center add-table">
          <Button variant="flat" onPress={addTableInstance}>Add New Week</Button>
        </div>

      </div>

    </>

  );
};

export default TimeSheet;
