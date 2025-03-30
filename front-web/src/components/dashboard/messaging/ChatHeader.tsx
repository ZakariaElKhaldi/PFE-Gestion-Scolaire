import { User as UserIcon, MoreVertical, PhoneCall, Video } from "lucide-react"

interface ChatHeaderProps {
  name: string
  avatar?: string | null
  status?: string
  onBackClick?: () => void
  onVideoCall?: () => void
  onVoiceCall?: () => void
  onMenuOpen?: () => void
}

export function ChatHeader({
  name,
  avatar,
  status,
  onBackClick,
  onVideoCall,
  onVoiceCall,
  onMenuOpen,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
      {/* User info */}
      <div className="flex items-center">
        <button
          onClick={onBackClick}
          className="lg:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
          aria-label="Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        {/* Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-500" />
          </div>
        )}
        
        {/* Name and status */}
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{name}</h3>
          {status && (
            <p className="text-xs text-gray-500">{status}</p>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        {/* Voice call button */}
        <button
          onClick={onVoiceCall}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Voice call"
        >
          <PhoneCall className="h-5 w-5 text-gray-500" />
        </button>
        
        {/* Video call button */}
        <button
          onClick={onVideoCall}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Video call"
        >
          <Video className="h-5 w-5 text-gray-500" />
        </button>
        
        {/* More options button */}
        <button
          onClick={onMenuOpen}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  )
} 