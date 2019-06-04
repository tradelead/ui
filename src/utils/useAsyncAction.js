import { useState } from 'react';

export default function useAsyncAction(fn, throwError) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const action = async (...args) => {
    setLoading(true);
    try {
      const res = await fn(...args);
      setData(res);
      return res;
    } catch (e) {
      setError(e);
      if (throwError) { throw e; }
    } finally {
      setLoading(false);
    }

    return null;
  };

  return [action, data, loading, error];
}
