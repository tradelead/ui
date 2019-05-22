import { useState, useEffect } from 'react';

function useTraderInfo(trader, args) {
  const [info, setInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (trader && trader.id) {
      return trader.observe(args, (newInfo, newLoading, err) => {
        setLoading(newLoading);

        if (err) {
          console.log('set error', err);
          setError(err);
          return;
        }

        if (newInfo) {
          setInfo(newInfo);
        }
      });
    }

    return () => {};
  }, [trader.id, JSON.stringify(args)]);

  return [info, loading, error];
}

export default useTraderInfo;
