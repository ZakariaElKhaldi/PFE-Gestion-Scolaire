import { ChangeEvent } from 'react'
import { Search, Filter, RefreshCw, Download } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'

interface ClassesFiltersProps {
  searchQuery: string
  selectedGrade: string
  selectedSubject: string
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
  onGradeChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onRefresh: () => void
  onExport: () => void
}

// Mock data for grades and subjects - in a real app, these would come from an API
const grades = ['9th Grade', '10th Grade', '11th Grade', '12th Grade']
const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science']

export function ClassesFilters({
  searchQuery,
  selectedGrade,
  selectedSubject,
  onSearchChange,
  onGradeChange,
  onSubjectChange,
  onRefresh,
  onExport
}: ClassesFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 items-center">
      <div className="w-full sm:w-auto relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search classes..."
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-10"
        />
      </div>
      
      <div className="w-full sm:w-48">
        <Select value={selectedGrade} onValueChange={onGradeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grades</SelectItem>
            {grades.map(grade => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-48">
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="icon" onClick={onExport} title="Export">
          <Download className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onGradeChange("all")}>
              All Grades
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSubjectChange("all")}>
              All Subjects
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              onGradeChange("all");
              onSubjectChange("all");
            }}>
              Reset Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 