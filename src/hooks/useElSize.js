import { useState, useEffect } from 'react';
import throttle from 'lodash.throttle';

function useElSize(el) {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (el && el.current) {
      const setSizeToEl = throttle(
        () => { console.log(el.current); setWidth(el.current.clientWidth); setHeight(el.current.clientHeight); },
        100,
      );
      setSizeToEl();
      window.addEventListener('resize', setSizeToEl);
      return () => window.removeEventListener('resize', setSizeToEl);
    }

    return () => {};
  }, [el]);

  return [width, height];
}

export default useElSize;
