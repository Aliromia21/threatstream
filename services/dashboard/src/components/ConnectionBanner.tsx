interface ConnectionBannerProps {
  isConnected: boolean;
}

export function ConnectionBanner({ isConnected }: ConnectionBannerProps) {
  if (isConnected) return null;

  return (
    <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-2 flex items-center justify-center gap-2">
      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
      <span className="text-sm text-red-400">
        Connection lost — reconnecting...
      </span>
    </div>
  );
}