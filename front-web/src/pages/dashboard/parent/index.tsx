import { useState, useEffect } from "react";
import { User } from "../../../types/auth"
import { DashboardLayout } from "../../../components/dashboard/layout/dashboard-layout"
import { useNavigate } from "react-router-dom"
import {
  GraduationCap,
  Bell,
  BookOpen,
  Clock,
  Receipt,
  MessageSquare,
  FileText,
  UserPlus,
  AlertCircle
} from "lucide-react"
import { api } from "@/lib/axios"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ParentDashboardProps {
  user: User
}

interface ChildData {
  relationshipId: string;
  relationshipType: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    grade?: string;
    profilePicture?: string;
  };
  stats?: {
    attendance: number;
    gpa: number;
    activeClasses: number;
    upcomingTests: number;
  };
}

interface PendingRelationship {
  id: string;
  studentName: string;
  studentEmail: string;
  createdAt: string;
  status: 'pending' | 'pending_parent_registration';
}

export default function ParentDashboard({ user }: ParentDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [pendingRelationships, setPendingRelationships] = useState<PendingRelationship[]>([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    duePayments: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch verified children
        const childrenResponse = await api.get('/parent-verification/children');
        setChildren(childrenResponse.data.data || []);
        
        // Fetch any pending relationships
        const pendingResponse = await api.get('/parent-verification/pending');
        setPendingRelationships(pendingResponse.data.data || []);
        
        // Update stats
        setStats({
          totalChildren: childrenResponse.data.data?.length || 0,
          upcomingEvents: 5, // Static for now
          unreadMessages: 3, // Static for now
          duePayments: 2 // Static for now
        });
      } catch (error) {
        console.error("Error fetching parent dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const resendVerification = async (relationshipId: string) => {
    try {
      await api.post(`/parent-verification/resend-verification/${relationshipId}`);
      // Show success toast if needed
    } catch (error) {
      console.error("Error resending verification:", error);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.firstName}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Children</h3>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalChildren}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">Enrolled students</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Upcoming Events</h3>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.upcomingEvents}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">This week</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Messages</h3>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="mt-2 text-3xl font-semibold text-purple-600">{stats.unreadMessages}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">Unread</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Due Payments</h3>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="mt-2 text-3xl font-semibold text-red-600">{stats.duePayments}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">Pending</p>
          </div>
        </div>

        {/* Pending Verifications Section */}
        {pendingRelationships.length > 0 && (
          <div className="rounded-lg border bg-white">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Pending Verifications</h2>
            </div>
            <div className="p-6 space-y-4">
              {pendingRelationships.map((relationship) => (
                <div key={relationship.id} className="flex items-start justify-between bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Verification request for {relationship.studentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {relationship.studentEmail}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sent on {new Date(relationship.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => resendVerification(relationship.id)}
                  >
                    Resend Email
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children Overview */}
        <div className="border-b px-6 py-4 bg-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">My Children</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/parent/children')}
              className="text-xs"
            >
              View All
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {loading ? (
            // Loading skeletons
            <>
              <div className="rounded-lg border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </div>
              <div className="rounded-lg border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </>
          ) : children.length > 0 ? (
            // Real data
            children.map((child) => (
              <div key={child.relationshipId} className="rounded-lg border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{child.student.firstName} {child.student.lastName}</h3>
                      <p className="text-sm text-gray-500">{child.student.grade || 'Grade not set'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {child.stats?.attendance || 95}% Attendance
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{child.stats?.activeClasses || 6} Active Classes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>GPA: {child.stats?.gpa || 3.8}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate(`/dashboard/parent/children/${child.student.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            // No children
            <div className="col-span-2 rounded-lg border bg-white p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Children Connected</h3>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  You don't have any children connected to your account yet. Add a child to view their academic information.
                </p>
                <Button onClick={() => navigate('/dashboard/parent/children')}>
                  Add a Child
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    Sarah has an upcoming Math test on Friday
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    March tuition payment is due in 5 days
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    New message from Michael's Science teacher
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    Report cards are now available for download
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}