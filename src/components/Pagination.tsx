"use client";

import { useState, useEffect, useRef } from 'react';
import { Pagination } from '@nextui-org/react';
import { supabase } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useTimesheet } from '@/lib/TimesheetContext';
import { delay } from '@/lib/utils';


const PaginateTables = ({ count = 0, week }: { count: number, week: string }) => {

  const router = useRouter();
  const { currentClient, currentWeek, setCurrentWeek } = useTimesheet();
  const [page, setPage] = useState(currentWeek);
  const [weekCount, setWeekCount] = useState(10);

  const handleChange = (newPage: number) => {
    setPage(newPage.toString());
    setCurrentWeek(newPage.toString());
    // window.history.replaceState(null, null!, `/timesheets/?client=${currentClient}&week=${newPage}`);
    router.push(`/timesheets/?client=${currentClient}&week=${newPage}`);
  }

  /*  Populate Pagination (required due to rendering delay with NextUI from Supabase)
  ========================================================= */
  useEffect(() => {
    (async () => {
      await delay(100);
      setWeekCount(count);
    })();

  }, [count]);

  return (
    <nav aria-label="nav" aria-labelledby="nav" className="pagination">
      <Pagination
        className="flex justify-center"
        color="primary"
        variant="light"
        onChange={handleChange}
        total={weekCount}
        page={parseInt(currentWeek)}
        showControls={true}
        dotsJump={10}
        boundaries={5}
      />

    </nav>
  );
};

export default PaginateTables;