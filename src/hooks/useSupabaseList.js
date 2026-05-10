import { useCallback, useEffect, useMemo, useState } from 'react';
import { listRows } from '../services/crudService';

export function useSupabaseList(table, options = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const optionsKey = useMemo(() => JSON.stringify(options), [options]);
  const parsedOptions = useMemo(() => JSON.parse(optionsKey), [optionsKey]);

  const load = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await listRows(table, { ...parsedOptions, ...overrides });
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, parsedOptions]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, setRows, loading, error, reload: load };
}
