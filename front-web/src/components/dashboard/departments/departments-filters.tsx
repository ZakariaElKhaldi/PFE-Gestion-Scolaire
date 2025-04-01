import { useState, useEffect, useRef } from 'react'
import { Filter, RefreshCw, Search } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  SafeDropdownMenu,
  SafeDropdownMenuContent,
  SafeDropdownMenuItem,
  SafeDropdownMenuTrigger,
} from '../../../components/ui/safe-dropdown'

export interface DepartmentsFiltersProps {
  searchQuery: string
  statusFilter: string
  onSearchChange: (query: string) => void
  onStatusChange: (status: string) => void
  viewMode: 'list' | 'grid'
  onViewModeChange: (mode: 'list' | 'grid') => void
  onRefresh: () => void
}

export function DepartmentsFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onRefresh,
}: DepartmentsFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const searchTimeoutRef = useRef<number | null>(null)

  // Update local search query when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Handle search input changes with debounce
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Debounce to avoid excessive API calls
    searchTimeoutRef.current = window.setTimeout(() => {
      onSearchChange(value)
    }, 300)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Handle status filter changes
  const handleStatusChange = (status: string) => {
    onStatusChange(status)
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-2">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          className="pl-8"
          value={localSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex space-x-2">
        <SafeDropdownMenu>
          <SafeDropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {statusFilter !== 'all' && (
                <span className="ml-1 rounded-full bg-primary w-2 h-2" />
              )}
            </Button>
          </SafeDropdownMenuTrigger>
          <SafeDropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-semibold">Filter by Status</div>
            <div className="-mx-1 my-1 h-px bg-muted"></div>
            <SafeDropdownMenuItem 
              className={statusFilter === 'all' ? 'bg-accent text-accent-foreground' : ''}
              onClick={() => handleStatusChange('all')}
            >
              All Departments
            </SafeDropdownMenuItem>
            <SafeDropdownMenuItem
              className={statusFilter === 'active' ? 'bg-accent text-accent-foreground' : ''}
              onClick={() => handleStatusChange('active')}
            >
              Active Only
            </SafeDropdownMenuItem>
            <SafeDropdownMenuItem
              className={statusFilter === 'inactive' ? 'bg-accent text-accent-foreground' : ''}
              onClick={() => handleStatusChange('inactive')}
            >
              Inactive Only
            </SafeDropdownMenuItem>
          </SafeDropdownMenuContent>
        </SafeDropdownMenu>
        
        <Button variant="outline" size="sm" className="h-9" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
    </div>
  )
} 