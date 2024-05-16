import { useState } from "react";
import { TimeEntryProps } from "./types";

export function useSelectedRows({entries}: {entries: TimeEntryProps[]}) {

  const [selectedKeys, setSelectedKeys] = useState([] as any);

  const handleSelectedKeys = (keys: any) => {
    if (keys === 'all') {
      if (selectedKeys.length === entries.length) {
        setSelectedKeys([]);
      }
      else {
        setSelectedKeys(entries);
      }
    }
    else {
      const keyArray = Array.from(keys);
      const mappedRows = keyArray.map((key) => entries.find((row: TimeEntryProps) => row.entry_id === key));
      setSelectedKeys(mappedRows);
    }
  }

  return { selectedKeys, setSelectedKeys, handleSelectedKeys };
}
