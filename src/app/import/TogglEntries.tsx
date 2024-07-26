import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, SortDescriptor, Button } from "@nextui-org/react";
import { convertTime, formatDate, UTCtoLocal, setTimezone } from "@/lib/utils";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { TimeEntryProps } from "@/types/types";

export function TogglEntries ({ data, handleSelectedKeys }: { data: TimeEntryProps[], handleSelectedKeys: (keys: any) => void }) {

  const getClientName = (clientId: number) => {
    switch (clientId) {
      case 3:
        return 'MAC';
      case 1:
        return 'Chee';
      case 2:
        return 'Waltz';
      case 7:
        return 'Pivot';
      default:
        return 'Chee';
    }
  }

  return (
    <>
      {data.length > 0 &&
        <Table
          selectionMode="multiple"
          onSelectionChange={handleSelectedKeys}
        >
          <TableHeader>
            <TableColumn key="task" width="25%">Task</TableColumn>
            <TableColumn key="date">Date</TableColumn>
            <TableColumn key="start_time">Time</TableColumn>
            <TableColumn key="time_tracked">Duration</TableColumn>
            <TableColumn key="client_name" width="10%">Client</TableColumn>
            <TableColumn key="billable" width="5%">Billable</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((row: any) => (
              <TableRow key={row.entry_id}>
                <TableCell>
                  {row.task}
                </TableCell>
                <TableCell>{formatDate(row.date)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {row.start_time && row.end_time &&
                      <div>
                        <span className="start-time">
                          {UTCtoLocal(row.start_time, setTimezone("Matt"))}
                        </span> - <span className="end-time">
                          {UTCtoLocal(row.end_time, setTimezone("Matt"))}
                        </span>
                      </div>
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div>{convertTime(parseInt(row.time_tracked))}</div>
                </TableCell>
                <TableCell>{getClientName(row.client_id)}</TableCell>
                <TableCell>{row.billable ? <CheckCircleIcon className="w-5 h-5 mx-auto text-primary" /> : null}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    </>
  )
}

export default TogglEntries;