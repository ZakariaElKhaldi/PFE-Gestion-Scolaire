import { ChevronLeft, MoreVertical, PhoneCall, VideoIcon, Bot } from "lucide-react"
import { useState } from "react"
import { Avatar } from "../../ui/avatar"
import { Button } from "../../ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "../../ui/dropdown-menu"

interface ChatHeaderProps {
  name: string
  avatar?: string | null
  isAI?: boolean
  onBackClick?: () => void
}

export function ChatHeader({ 
  name, 
  avatar, 
  isAI = false,
  onBackClick 
}: ChatHeaderProps) {
  const [isOnline] = useState(true)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="border-b border-gray-200 bg-white p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Mobile back button */}
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="lg:hidden mr-1 p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        
        {/* Avatar */}
        <div className="relative">
          {avatar ? (
            <Avatar src={avatar} className="h-10 w-10 flex-shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {isAI ? (
                <Bot className="h-5 w-5" />
              ) : (
                getInitials(name)
              )}
            </div>
          )}
          <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
        </div>

        {/* Contact info */}
        <div className="ml-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {name}
              {isAI && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Bot className="h-3 w-3 mr-1" />
                  AI
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isAI && (
          <>
            <button 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Call"
            >
              <PhoneCall className="h-5 w-5" />
            </button>
            
            <button 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Video call"
            >
              <VideoIcon className="h-5 w-5" />
            </button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View contact info</DropdownMenuItem>
            <DropdownMenuItem>Search in conversation</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Block {isAI ? 'AI Assistant' : 'contact'}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 