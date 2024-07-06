import { useState, useCallback } from "react";
import { TimeEntryProps } from "../types/types";

export function useSelectedRows({ entries, onSelectionChange }: { entries: TimeEntryProps[], onSelectionChange?:(selectedEntries: TimeEntryProps[]) => void }) {

  const [selectedKeys, setSelectedKeys] = useState([] as any);

  const handleSelectedKeys = useCallback((keys: any) => {
    let newSelectedKeys: TimeEntryProps[] = [];
    if (keys === 'all') {
        newSelectedKeys = selectedKeys.length === entries.length ? [] : [...entries];
    }
    else {
      const keyArray = Array.from(keys);
      newSelectedKeys = keyArray.map((key) =>
        entries.find((row: TimeEntryProps) =>
          row.entry_id === key)).filter(Boolean) as TimeEntryProps[];
    }
    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  },[entries, selectedKeys, onSelectionChange]);


  return { selectedKeys, setSelectedKeys, handleSelectedKeys };
}
