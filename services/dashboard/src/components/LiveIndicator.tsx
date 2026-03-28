import { useState, useEffect } from 'react';

interface LiveIndicatorProps {
  isConnected: boolean;
}

export function LiveIndicator({ isConnected }: LiveIndicatorProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {isConnected && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full bg-green-400 ${pulse ? 'animate-ping opacity-75' : 'opacity-0'}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
        />
      </span>
      <span className="text-xs text-slate-500">
        {isConnected ? 'Live' : 'Disconnected'}
      </span>
    </div>
  );
}