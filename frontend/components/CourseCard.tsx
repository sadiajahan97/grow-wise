import React, { useState } from 'react';

interface CourseCardProps {
  thumbnail_url?: string | null;
  title: string;
  url: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ thumbnail_url, title, url }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="w-full h-48 overflow-hidden bg-slate-100 relative">
        {thumbnail_url && !imageError ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="truncate">
            {(() => {
              try {
                return new URL(url).hostname.replace('www.', '');
              } catch {
                return 'Unknown Source';
              }
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

