"use client"

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TableInstance } from '@/components/TableInstance';
import { useTimesheet } from '@/context/TimesheetContext';

export default function TimeSheet() {

  const params = useSearchParams();
  const { currentClient, setCurrentClient } = useTimesheet();

  useEffect(() => {
    setCurrentClient(params.get('client') || '1');
  }, [params, setCurrentClient]);

  useEffect(() => {
    document.body.classList.add('dark');
  }, []);
  
  return (
    <>
      <div className="flex flex-col gap-10">
        
        <TableInstance client={currentClient} />

      </div>

    </>

  );
};