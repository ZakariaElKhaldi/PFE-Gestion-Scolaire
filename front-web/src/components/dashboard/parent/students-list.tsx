import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import AddStudentRelationship from './add-student.tsx';

// Type for student relationship
interface StudentRelationship {
  relationshipId: string;
  relationshipType: 'parent' | 'guardian' | 'other';
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

const StudentsList = () => {
  const [students, setStudents] = useState<StudentRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/parent-verification/children');
      setStudents(response.data.data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load students.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRefresh = () => {
    fetchStudents();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Connected Students</CardTitle>
          <CardDescription>
            Students connected to your account
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <AddStudentRelationship onRelationshipAdded={fetchStudents} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && students.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <UserIcon className="mb-2 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No Students Found</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              You don't have any students connected to your account yet.
              Use the "Add Student" button to connect with a student.
            </p>
          </div>
        ) : (
          <Table>
            <TableCaption>
              A list of students connected to your account.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Relationship</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((item) => (
                <TableRow key={item.relationshipId}>
                  <TableCell className="font-medium">
                    {item.student.firstName} {item.student.lastName}
                  </TableCell>
                  <TableCell>{item.student.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.relationshipType.charAt(0).toUpperCase() + item.relationshipType.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsList; 