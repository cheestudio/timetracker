"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Pagination } from '@nextui-org/react';
import { supabase } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useTimesheet } from '@/lib/TimesheetContext';
import { delay } from '@/lib/utils';


const PaginateEntries = ({ page, total, currentPage }: { page: Number, total: Number, currentPage: Number }) => {

  return (
    <nav aria-label="nav" aria-labelledby="nav" className="pagination">
      <Pagination
        className="flex justify-center"
        color="primary"
        variant="light"
        page={page}
        total={pages}
        onChange={currentPage}
        showControls={true}
        dotsJump={10}
        boundaries={5}
      />

    </nav>
  );
};

export default PaginateEntries;