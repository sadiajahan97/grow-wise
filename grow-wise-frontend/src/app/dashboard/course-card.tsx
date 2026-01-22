'use client';

import { useRef } from 'react';

interface CourseCardProps {
  title: string;
  url: string;
  thumbnail_url: string;
  onClick: () => void;
}

export default function CourseCard({
  title,
  url,
  thumbnail_url,
  onClick,
}: CourseCardProps) {
  const hasClickedRef = useRef(false);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent multiple clicks
    if (hasClickedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    hasClickedRef.current = true;
    onClick();

    // Reset after a short delay to allow for navigation
    setTimeout(() => {
      hasClickedRef.current = false;
    }, 1000);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if not clicking on an anchor (anchors handle their own clicks)
    if (!(e.target instanceof HTMLAnchorElement)) {
      handleClick(e);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to card click handler
    handleClick(e);
  };

  return (
    <div 
      className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Thumbnail Image */}
      <figure className="relative w-full aspect-video bg-linear-to-br from-primary/20 to-secondary/20">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
          onClick={handleAnchorClick}
        >
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-primary-content opacity-50">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </a>
      </figure>

      {/* Card Body with Title */}
      <div className="card-body p-4 sm:p-6">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
          onClick={handleAnchorClick}
        >
          <h3 className="text-sm sm:text-base font-semibold text-base-content line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </a>
      </div>
    </div>
  );
}

