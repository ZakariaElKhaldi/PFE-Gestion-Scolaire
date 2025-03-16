import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Building, Save } from 'lucide-react'
import { Department } from '../../../types/department'

const departmentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  code: z.string().min(2, { message: 'Code must be at least 2 characters' }),
  description: z.string().optional(),
  headId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  facultyCount: z.number().optional(),
  studentCount: z.number().optional(),
  courseCount: z.number().optional(),
})

export type DepartmentFormValues = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
  department?: Department
  teachers: Array<{ id: string; name: string }>
  onSubmit: (values: DepartmentFormValues) => void
  isLoading: boolean
}

export function DepartmentForm({
  department,
  teachers,
  onSubmit,
  isLoading,
}: DepartmentFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department
      ? {
          name: department.name,
          code: department.code,
          description: department.description || '',
          headId: department.headId || 'none',
          status: department.status || 'active',
          facultyCount: department.facultyCount || 0,
          studentCount: department.studentCount || 0,
          courseCount: department.courseCount || 0,
        }
      : {
          name: '',
          code: '',
          description: '',
          headId: 'none',
          status: 'active',
          facultyCount: 0,
          studentCount: 0,
          courseCount: 0,
        },
  })

  const handleSubmit = async (values: DepartmentFormValues) => {
    try {
      setFormError(null)
      const processedValues = {...values};
      if (processedValues.headId === 'none') {
        processedValues.headId = '';
      }
      await onSubmit(processedValues);
    } catch (error) {
      console.error('Error submitting form:', error)
      setFormError('Failed to save department. Please try again.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Computer Science" {...field} />
                </FormControl>
                <FormDescription>
                  The full name of the department
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Code *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. CS" {...field} />
                </FormControl>
                <FormDescription>
                  A short code or abbreviation for the department
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the department..."
                  rows={4}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="headId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Head</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department head" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The teacher who will lead this department
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Department</span>
          </Button>
        </div>
      </form>
    </Form>
  )
} 