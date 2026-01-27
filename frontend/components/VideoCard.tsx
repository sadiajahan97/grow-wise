import React from 'react';

interface VideoCardProps {
  title: string;
  url: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, url }) => {
  // Extract video ID from YouTube URL for embedding
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
      
      // If not a YouTube URL, try to use the URL directly
      return videoUrl;
    } catch {
      // If URL parsing fails, return original URL
      return url;
    }
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all overflow-hidden group">
      {/* Video iframe */}
      <div className="w-full aspect-video bg-slate-100 relative">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

export default VideoCard;

