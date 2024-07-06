import { TimeEntryProps } from "../../types/types";

export const initialState = {
  timeEntries: [] as TimeEntryProps[] | [],
};

type State = typeof initialState;

export type Action =
  | { type: 'FETCH_ENTRIES', payload: TimeEntryProps[] }
  | { type: 'ADD_ENTRY', payload: TimeEntryProps }
  | { type: 'REMOVE_ENTRY', payload: string[] }
  | { type: 'UPDATE_ENTRY', payload: TimeEntryProps }
  ;

export const timeEntriesReducer = (state: State, action: Action): State => {
  switch (action.type) {

    case 'FETCH_ENTRIES':
      return { ...state, timeEntries: action.payload }

    case 'ADD_ENTRY': {
      const newEntries = [...state.timeEntries];
      const indexToAdd = newEntries.findIndex(entry => new Date(entry.date) > new Date(action.payload.date));
      if (indexToAdd === -1) {
        newEntries.push(action.payload);
      } else {
        newEntries.splice(indexToAdd, 0, action.payload);
      }
      return {
        timeEntries: newEntries
      }
    }

    case 'REMOVE_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter((entry) => !action.payload.includes(entry.entry_id))
      }

    case 'UPDATE_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.map((entry) =>
          entry.entry_id === action.payload.entry_id ? { ...entry, ...action.payload } : entry
        )
      }

    default:
      return state;
  }
}
