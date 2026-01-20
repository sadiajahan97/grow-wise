'use client';

interface VideoCardProps {
  title: string;
  url: string;
}

export default function VideoCard({
  title,
  url,
}: VideoCardProps) {
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

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Video iframe */}
      <figure className="relative w-full aspect-video bg-linear-to-br from-primary/20 to-secondary/20">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
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

