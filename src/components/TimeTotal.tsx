import { TimeEntryProps } from '@/types/types';
import { convertTime, convertToDecimalHours } from '@/lib/utils';
import React from 'react';

const TimeTotal = ({timeEntries, selectedKeys, calculatedTime} : {timeEntries: any, selectedKeys: any, calculatedTime: number}) => {
  
  return (
    <>
      {!!timeEntries?.length &&
        <div className="ml-auto">
          <h2 className="text-2xl">
            <strong>
              {selectedKeys.length > 0 ? 'Selected: ' : 'Total: '}
            </strong>
            {convertTime(calculatedTime).toString()} <span className="mx-2">|</span> {convertToDecimalHours(calculatedTime).toString()}
          </h2>
        </div>
      }
    </>
  );
}

export default TimeTotal;