interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export default function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[80%] sm:max-w-[70%]">
        <div className="bg-linear-to-r from-primary to-secondary text-primary-content rounded-2xl rounded-tr-sm p-4 shadow-lg">
          <p className="text-sm sm:text-base whitespace-pre-wrap">
            {content}
          </p>
        </div>
        {timestamp && (
          <p className="text-xs text-base-content/60 mt-1 text-right mr-2">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

