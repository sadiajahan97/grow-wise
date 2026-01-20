import React from 'react';
import ReactMarkdown from 'react-markdown';

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
              <div className="text-sm sm:text-base text-base-content prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    // Headings
                    h1: ({ ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-base-content" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 text-base-content" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-base font-semibold mt-3 mb-1 text-base-content" {...props} />,
                    // Paragraphs
                    p: ({ ...props }) => <p className="mb-3 text-base-content leading-relaxed" {...props} />,
                    // Lists
                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-3 space-y-1 text-base-content" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-base-content" {...props} />,
                    li: ({ ...props }) => <li className="ml-4 text-base-content" {...props} />,
                    // Bold and italic
                    strong: ({ ...props }) => <strong className="font-semibold text-base-content" {...props} />,
                    em: ({ ...props }) => <em className="italic text-base-content" {...props} />,
                    // Code blocks
                    code: ({ className, ...props }: { className?: string; children?: React.ReactNode }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-base-300 px-1 py-0.5 rounded text-sm font-mono text-base-content" {...props} />
                      ) : (
                        <code className="block bg-base-300 p-3 rounded text-sm font-mono text-base-content overflow-x-auto" {...props} />
                      );
                    },
                    pre: ({ ...props }) => <pre className="bg-base-300 p-3 rounded mb-3 overflow-x-auto" {...props} />,
                    // Links
                    a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
                    // Blockquotes
                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic my-3 text-base-content/80" {...props} />,
                    // Horizontal rule
                    hr: ({ ...props }) => <hr className="my-4 border-base-300" {...props} />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
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

