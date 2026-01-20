interface AIMessageProps {
  content: string;
  timestamp?: string;
}

export default function AIMessage({ content, timestamp }: AIMessageProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] sm:max-w-[70%]">
        <div className="bg-base-200 border border-base-300 rounded-2xl rounded-tl-sm p-4 shadow-md">
          <div className="flex items-start gap-3">
            {/* AI Avatar/Badge */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base text-base-content whitespace-pre-wrap">
                {content}
              </p>
            </div>
          </div>
        </div>
        {timestamp && (
          <p className="text-xs text-base-content/60 mt-1 text-left ml-2">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

