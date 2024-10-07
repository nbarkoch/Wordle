import {useEffect} from 'react';

const GC_INTERVAL = 10000; // 10 seconds, adjust as needed

export const useGCTrigger = () => {
  useEffect(() => {
    if (global.gc) {
      const intervalId = setInterval(() => {
        global.gc?.();
      }, GC_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, []);
};
