import { Building, Download, Plus, RefreshCw } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

export interface DepartmentsHeaderProps {
  onAdd: () => void
  totalDepartments?: number
  activeDepartments?: number
  inactiveDepartments?: number
  onExport?: () => void
  onRefresh?: () => void
}

export function DepartmentsHeader({
  onAdd,
  totalDepartments = 0,
  activeDepartments = 0,
  inactiveDepartments = 0,
  onExport,
  onRefresh,
}: DepartmentsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Create and manage academic departments
          </p>
        </div>
        <div className="flex space-x-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Departments
              </p>
              <p className="text-3xl font-bold">{totalDepartments}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Building className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Departments
              </p>
              <p className="text-3xl font-bold">{activeDepartments}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Inactive Departments
              </p>
              <p className="text-3xl font-bold">{inactiveDepartments}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 