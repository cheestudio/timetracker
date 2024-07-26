import { TimeEntryProps } from "@/types/types";
import { SelectEntry } from "./SelectEntry";
import { TimeTotal } from "./TimeTotal";

export function TableInfo({ selectedKeys, timeEntries, calculatedTime, deleteTimeEntry }: { selectedKeys: [], timeEntries: TimeEntryProps[], calculatedTime: number, deleteTimeEntry: () => void}) {

  return (
    <div className="sticky bottom-0 flex justify-between py-3 bg-[#070707]/95 backdrop-blur-md">
      <SelectEntry
        selectedKeys={selectedKeys}
        deleteTimeEntry={deleteTimeEntry}
      />
      <TimeTotal
        timeEntries={timeEntries}
        selectedKeys={selectedKeys}
        calculatedTime={calculatedTime}
      />
    </div>
  );
}