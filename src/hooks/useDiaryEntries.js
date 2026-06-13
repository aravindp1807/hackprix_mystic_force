import { useState, useEffect, useCallback } from 'react';
import { getEntries, addEntry, updateEntry, deleteEntry } from '../utils/storage';

export function useDiaryEntries(section) {
  const [entries, setEntries] = useState([]);

  const refresh = useCallback(() => {
    setEntries(getEntries(section));
  }, [section]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback((entry) => {
    const newEntry = addEntry(section, entry);
    refresh();
    return newEntry;
  }, [section, refresh]);

  const update = useCallback((id, updates) => {
    updateEntry(section, id, updates);
    refresh();
  }, [section, refresh]);

  const remove = useCallback((id) => {
    deleteEntry(section, id);
    refresh();
  }, [section, refresh]);

  return { entries, add, update, remove, refresh };
}
