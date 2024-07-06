import { useCallback, useEffect, useReducer } from "react";
import { supabase, userTimeZone } from "@/lib/utils";
import { timeEntriesReducer, initialState } from "../lib/reducers/timeEntriesReducer";
import { TimeEntryProps } from "../types/types";
import { DateRange } from "react-day-picker";

const useTimeEntries = () => {

  const [state, dispatch] = useReducer(timeEntriesReducer, initialState);

  const fetchEntries = useCallback(async (
    client: string = '1', selectedUser: string = '', customDateRange: DateRange | undefined, selectedDateRange: string = '', searchQuery: string = ''
  ) => {

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          selectedUser,
          customDateRange,
          selectedDateRange,
          searchQuery,
          userTimeZone
        })
      });
      const data = await response.json();
      if (response.status !== 200) {
        console.error('Error fetching data: ', response.statusText);
      }

      if (Array.isArray(data)) {
        const entries = data?.map((entry: TimeEntryProps) => ({
          ...entry,
          client_name: entry.Clients?.client_name
        }));
        dispatch({ type: 'FETCH_ENTRIES', payload: entries });
      }
    }
    catch (error) {
      console.error('Error fetching data: ', error);
      throw new Error('failed to fetch');
    }
  }, []);

  const addEntry = useCallback(async (entry: TimeEntryProps) => {
    try {
      await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('TimeEntries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_ENTRY', payload: data });
    } catch (error) {
      console.error('Error adding entry: ', error);
      throw new Error('failed to add');
    }
  }, []);

  const updateEntry = async (entry: TimeEntryProps, entryId: string) => {
    const { error } = await supabase
      .from('TimeEntries')
      .update(entry)
      .eq('entry_id', entryId);
    dispatch({ type: 'UPDATE_ENTRY', payload: entry });
    if (error) {
      console.error('Error updating entry:', error);
      return;
    }
  }

  const removeEntry = async (entryIds: string[]) => {
    const { error } = await supabase
      .from('TimeEntries')
      .delete()
      .in('entry_id', entryIds);
    dispatch({ type: 'REMOVE_ENTRY', payload: entryIds });
    if (error) {
      console.error('Error deleting data: ', error);
    }
  }


  return {
    state,
    dispatch,
    fetchEntries,
    addEntry,
    updateEntry,
    removeEntry
  }

}

export default useTimeEntries;