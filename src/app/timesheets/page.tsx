"use client"

import { useEffect } from 'react';
import { supabase } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import TableInstance from '@/components/TableInstance';
import { useTimesheet } from '@/lib/TimesheetContext';

const TimeSheet = () => {

  const params = useSearchParams();
  const { currentClient, setCurrentClient } = useTimesheet();

  useEffect(() => {
    setCurrentClient(params.get('client') || '1');
  }, [params, setCurrentClient]);

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
    })();
  }, [currentClient, setCurrentClient]);

  return (
    <>
      <div className="flex flex-col gap-10">
        
        <TableInstance client={currentClient} />

      </div>

    </>

  );
};

export default TimeSheet;
