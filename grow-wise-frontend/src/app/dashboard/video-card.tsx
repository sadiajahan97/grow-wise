'use client';

import { useRef, useState } from 'react';

interface VideoCardProps {
  title: string;
  url: string;
  onClick: () => void;
}

export default function VideoCard({
  title,
  url,
  onClick,
}: VideoCardProps) {
  const [overlayVisible, setOverlayVisible] = useState(true);
  const hasClickedRef = useRef(false);

  // Convert YouTube URL to embed format
  const getEmbedUrl = (videoUrl: string): string => {
    try {
      const urlObj = new URL(videoUrl);
      
      // Handle different YouTube URL formats
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.pathname.slice(1);
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // If not a YouTube URL, return original URL
      return videoUrl;
    } catch {
      // If URL parsing fails, return original URL
      return videoUrl;
    }
  };

  const embedUrl = getEmbedUrl(url);

  const handleOverlayClick = () => {
    // Prevent multiple clicks
    if (hasClickedRef.current) {
      return;
    }

    hasClickedRef.current = true;
    // Call the onClick handler to track the click
    onClick();
    
    // Hide the overlay so clicks can pass through to the iframe
    setOverlayVisible(false);

    // Reset after a short delay to allow for navigation
    setTimeout(() => {
      hasClickedRef.current = false;
    }, 1000);
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Video iframe */}
      <figure className="relative w-full aspect-video bg-linear-to-br from-primary/20 to-secondary/20">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
        {/* Transparent overlay that captures the first click */}
        {overlayVisible && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleOverlayClick}
            onMouseDown={handleOverlayClick}
            aria-hidden="true"
          />
        )}
      </figure>

      {/* Card Body with Title */}
      <div className="card-body p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-base-content line-clamp-2">
          {title}
        </h3>
      </div>
    </div>
  );
}

