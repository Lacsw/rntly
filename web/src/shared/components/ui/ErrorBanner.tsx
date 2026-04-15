type TErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export const ErrorBanner = ({ message, onRetry }: TErrorBannerProps) => {
  return (
    <div
      role="alert"
      className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center justify-between"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};
