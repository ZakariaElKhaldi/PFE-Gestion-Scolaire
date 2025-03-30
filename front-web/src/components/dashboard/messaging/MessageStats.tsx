import { 
  InboxIcon, 
  SendIcon, 
  MessageCircleIcon, 
  BellIcon 
} from "lucide-react"
import { MessageCounts } from "../../../services/message-service"

interface MessageStatsProps {
  stats: MessageCounts
  isLoading: boolean
}

export function MessageStats({ stats, isLoading }: MessageStatsProps) {
  const statItems = [
    {
      title: "Total Messages",
      value: stats.total,
      icon: <MessageCircleIcon className="h-5 w-5 text-blue-500" />,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Unread",
      value: stats.unread,
      icon: <BellIcon className="h-5 w-5 text-green-500" />,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "Received",
      value: stats.received,
      icon: <InboxIcon className="h-5 w-5 text-purple-500" />,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "Sent",
      value: stats.sent,
      icon: <SendIcon className="h-5 w-5 text-amber-500" />,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-7 w-16 bg-gray-200 rounded mt-2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${item.bg}`}>{item.icon}</div>
            <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
          </div>
          <p className={`text-2xl font-semibold mt-2 ${item.color}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
} 