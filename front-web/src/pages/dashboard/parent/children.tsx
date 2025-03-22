import { useState } from "react";
import { User } from "../../../types/auth"
import { DashboardLayout } from "../../../components/dashboard/layout/dashboard-layout"
import { Search, GraduationCap, BookOpen, Calendar, Clock, UserPlus2, X } from "lucide-react"
import { api } from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ParentChildrenProps {
  user: User
}

export default function ParentChildren({ user }: ParentChildrenProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Function to send invitation to a student
  const sendInvitation = async () => {
    if (!studentEmail) return;

    setIsLoading(true);
    try {
      await api.post('/parent-verification/request', {
        parentEmail: user.email,
        studentEmail: studentEmail
      });

      toast({
        title: "Invitation Sent",
        description: `A verification request has been sent to ${studentEmail}.`,
      });

      // Close dialog and reset state
      setIsDialogOpen(false);
      setStudentEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send invitation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your children's profiles
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <UserPlus2 className="h-4 w-4" />
            Add Child
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search children..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Children Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Children</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">2</p>
            <p className="mt-1 text-sm text-gray-500">Enrolled students</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Classes</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">12</p>
            <p className="mt-1 text-sm text-gray-500">Total enrolled</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Assignments</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-600">8</p>
            <p className="mt-1 text-sm text-gray-500">Due this week</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Events</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">3</p>
            <p className="mt-1 text-sm text-gray-500">Upcoming</p>
          </div>
        </div>

        {/* Children List */}
        <div className="rounded-lg border bg-white">
          <div className="divide-y">
            <div className="p-6">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Sarah Johnson</h3>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                      Grade 10
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      <span>6 Active Classes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>4 Upcoming Tests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>95% Attendance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <GraduationCap className="h-4 w-4" />
                      <span>3.8 GPA</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                      View Profile
                    </button>
                    <button className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                      Academic Progress
                    </button>
                    <button className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Michael Johnson</h3>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                      Grade 8
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      <span>6 Active Classes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>2 Upcoming Tests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>92% Attendance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <GraduationCap className="h-4 w-4" />
                      <span>3.5 GPA</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                      View Profile
                    </button>
                    <button className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                      Academic Progress
                    </button>
                    <button className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Child Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Child</DialogTitle>
            <DialogDescription>
              Enter your child's email address to send them a verification request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="studentEmail">Student Email</Label>
              <Input
                id="studentEmail"
                placeholder="student@school.edu"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={sendInvitation} disabled={isLoading || !studentEmail}>
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 