import SelectEntry from "./SelectEntry";
import TimeTotal from "./TimeTotal";

const TableInfo = ({ selectedKeys, timeEntries, calculatedTime, deleteTimeEntry }: { selectedKeys: [], timeEntries: [], calculatedTime: number, deleteTimeEntry: () => void}) => {
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

export default TableInfo;