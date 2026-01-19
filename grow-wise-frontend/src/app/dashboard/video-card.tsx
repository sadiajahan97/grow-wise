'use client';

interface VideoCardProps {
  thumbnailUrl?: string;
  channelProfileUrl?: string;
  channelName: string;
  title: string;
  viewCount: number;
  uploadTime: string;
  duration: string;
}

export default function VideoCard({
  thumbnailUrl,
  channelProfileUrl,
  channelName,
  title,
  viewCount,
  uploadTime,
  duration,
}: VideoCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl border border-white overflow-hidden hover:shadow-2xl hover:translate-y-2 transition-all duration-300 cursor-pointer">
      {/* Thumbnail Section with Duration Overlay */}
      <figure className="relative h-48 sm:h-56 bg-linear-to-br from-primary/20 to-secondary/20">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-primary-content opacity-50">
              {title.charAt(0)}
            </span>
          </div>
        )}
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs sm:text-sm font-medium px-2 py-1 rounded flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{duration}</span>
        </div>
      </figure>

      {/* Card Body */}
      <div className="card-body p-4 sm:p-6">
        {/* Channel and Video Info */}
        <div className="flex items-start gap-3">
          {/* Channel Profile Picture */}
          <div className="shrink-0">
            {channelProfileUrl ? (
              <div className="avatar">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full">
                  <img src={channelProfileUrl} alt={channelName} className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">
                  {channelName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="flex-1 min-w-0">
            {/* Video Title */}
            <h3 className="text-sm sm:text-base font-semibold text-base-content line-clamp-2 mb-1">
              {title}
            </h3>

            {/* Channel Name */}
            <p className="text-xs sm:text-sm text-base-content/70 mb-1">
              {channelName}
            </p>

            {/* View Count and Upload Time */}
            <div className="flex items-center gap-1 text-xs sm:text-sm text-base-content/70">
              <span>{viewCount.toLocaleString()} views</span>
              <span>•</span>
              <span>{uploadTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

