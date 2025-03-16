import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, Search, ChevronLeft, ChevronRight, UserPlus, UserCheck, Users as UsersIcon, Download, Filter, RefreshCw, MoreHorizontal } from 'lucide-react'
import { UserResponse, UserRole } from '../../../types/auth'
import { UserFormModal, UserFormData } from '../../../components/dashboard/users/user-form-modal'
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout'
import toast, { Toaster } from 'react-hot-toast'
import { userService } from '../../../services/user.service'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Label } from '../../../components/ui/label'

interface UsersPageProps {
  user: UserResponse
}

export const UsersPage = ({ user }: UsersPageProps) => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)

  // User statistics
  const [userStats, setUserStats] = useState({
    total: 0,
    administrators: 0,
    teachers: 0,
    students: 0,
    parents: 0,
    recentlyAdded: 0
  })

  // Fetch users on component mount and when search/filters/pagination change
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const selectedRole = activeTab !== 'all' ? activeTab : selectedRoles.length > 0 ? selectedRoles.join(',') : undefined;
        
        const fetchedUsers = await userService.getUsers({
          role: selectedRole,
          search: searchQuery || undefined,
          page: currentPage,
          limit: itemsPerPage
        });
        
        setUsers(fetchedUsers);
        
        // In a real app with a proper API, we would get total count from the API
        // For now, we'll estimate based on the returned users
        setTotalUsers(fetchedUsers.length < itemsPerPage ? 
          (currentPage - 1) * itemsPerPage + fetchedUsers.length : 
          currentPage * itemsPerPage + 1);
        
        setTotalPages(Math.max(1, Math.ceil(totalUsers / itemsPerPage)));
        
        // Calculate user statistics
        if (currentPage === 1 && !searchQuery && !selectedRole) {
          const allUsers = await userService.getUsers({ limit: 100 });
          setUserStats({
            total: allUsers.length,
            administrators: allUsers.filter(u => u.role === 'administrator').length,
            teachers: allUsers.filter(u => u.role === 'teacher').length,
            students: allUsers.filter(u => u.role === 'student').length,
            parents: allUsers.filter(u => u.role === 'parent').length,
            recentlyAdded: allUsers.filter(u => {
              const createdDate = new Date(u.createdAt);
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return createdDate > oneWeekAgo;
            }).length
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, selectedRoles, currentPage, itemsPerPage, activeTab]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when search changes
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedRoles(value !== 'all' ? [value] : []);
    setCurrentPage(1);
  };

  const handleRefreshUsers = () => {
    // Reset all filters and search
    setSearchQuery('');
    setSelectedRoles([]);
    setActiveTab('all');
    setCurrentPage(1);
    // Fetch data will be triggered by the useEffect
    toast.success('User list refreshed');
  };

  const handleExportUsers = () => {
    // In a real app, this would generate a CSV or Excel file
    toast.success('Users exported to CSV');
  };

  const handleAddUser = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      const newUser = await userService.createUser({
        ...data,
        password: data.password || 'defaultPassword123' // In a real app, you'd handle this differently
      });
      
      if (newUser) {
        // Refresh the user list
        const updatedUsers = await userService.getUsers({
          role: selectedRoles.length > 0 ? selectedRoles.join(',') : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: itemsPerPage
        });
        setUsers(updatedUsers);
        
        setIsAddUserModalOpen(false);
        toast.success('User added successfully');
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser(selectedUser.id, {
        ...data,
        // Only include password if it was provided
        ...(data.password ? { password: data.password } : {})
      });
      
      if (updatedUser) {
        // Update the user in the current list
        setUsers(prev => 
          prev.map(user => 
            user.id === selectedUser.id 
              ? updatedUser 
              : user
          )
        );
        
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
        toast.success('User updated successfully');
      }
    } catch (error: any) {
      console.error('Error editing user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const success = await userService.deleteUser(selectedUser.id);
      
      if (success) {
        // Remove the user from the current list
        setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        
        // If this was the last user on the page and not the first page, go to previous page
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        toast.success('User deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user: UserResponse) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const openDeleteModal = (user: UserResponse) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Calculate pagination info
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalUsers);

  // Select all users on current page
  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      const currentPageUserIds = users.map(user => user.id);
      setSelectedUsers(currentPageUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  // Select/deselect individual user
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle bulk delete action
  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      // Process bulk deletion sequentially
      let failedCount = 0;
      let successCount = 0;
      
      for (const userId of selectedUsers) {
        try {
          await userService.deleteUser(userId);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete user ${userId}:`, error);
          failedCount++;
        }
      }
      
      // Update the UI by removing the deleted users
      if (successCount > 0) {
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        
        if (failedCount > 0) {
          toast.success(`Deleted ${successCount} users. ${failedCount} users could not be deleted.`);
        } else {
          toast.success(`Successfully deleted ${successCount} users`);
        }
      }
      
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error("Bulk delete failed: An error occurred during the deletion process.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <Toaster />
      <div className="container mx-auto px-4 py-6">
        {/* Page Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 mt-1">
                Manage users, assign roles, and track user activity
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshUsers}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportUsers}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <UsersIcon className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{userStats.total}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="bg-purple-100 p-2 rounded-full mb-2">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-500">Administrators</p>
                <h3 className="text-2xl font-bold">{userStats.administrators}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="bg-blue-100 p-2 rounded-full mb-2">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Teachers</p>
                <h3 className="text-2xl font-bold">{userStats.teachers}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="bg-green-100 p-2 rounded-full mb-2">
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-500">Students</p>
                <h3 className="text-2xl font-bold">{userStats.students}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="bg-yellow-100 p-2 rounded-full mb-2">
                  <UsersIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-500">Parents</p>
                <h3 className="text-2xl font-bold">{userStats.parents}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="bg-teal-100 p-2 rounded-full mb-2">
                  <UserPlus className="h-6 w-6 text-teal-600" />
                </div>
                <p className="text-sm text-gray-500">New (7 days)</p>
                <h3 className="text-2xl font-bold">{userStats.recentlyAdded}</h3>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="administrator">Administrators</TabsTrigger>
              <TabsTrigger value="teacher">Teachers</TabsTrigger>
              <TabsTrigger value="student">Students</TabsTrigger>
              <TabsTrigger value="parent">Parents</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2 self-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2">Filter by role:</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {['administrator', 'teacher', 'student', 'parent'].map((role) => (
                        <Badge 
                          key={role}
                          variant={selectedRoles.includes(role) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleRoleToggle(role)}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <MoreHorizontal className="h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportUsers}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRefreshUsers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* User List */}
        <Card className="mb-8">
          <CardContent className="p-0">
            {isLoading && users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleRefreshUsers}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Bulk actions toolbar */}
                {selectedUsers.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="select-all"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={(e) => handleSelectAllUsers(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="select-all" className="text-sm font-medium">
                        {selectedUsers.length} users selected
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUsers([])}
                      >
                        Deselect All
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setIsBulkDeleteModalOpen(true)}
                        className="flex items-center gap-1"
                      >
                        <Trash className="h-4 w-4" />
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                )}

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 w-10">
                        <input 
                          type="checkbox"
                          id="select-all-header"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={(e) => handleSelectAllUsers(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                                {user.profilePicture ? (
                                  <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-primary font-medium">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.studentId && (
                                    <Badge variant="outline" className="text-xs text-gray-500">ID: {user.studentId}</Badge>
                                  )}
                                  {user.teacherId && (
                                    <Badge variant="outline" className="text-xs text-gray-500">ID: {user.teacherId}</Badge>
                                  )}
                                  {user.parentId && (
                                    <Badge variant="outline" className="text-xs text-gray-500">ID: {user.parentId}</Badge>
                                  )}
                                </div>
                                {user.updatedAt && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Updated: {new Date(user.updatedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Account created: {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`
                              ${user.role === 'administrator' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : ''}
                              ${user.role === 'teacher' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                              ${user.role === 'student' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                              ${user.role === 'parent' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                            `}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                            {user.role === 'teacher' && user.bio && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {user.bio}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phoneNumber || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="w-2 h-2 mr-1 rounded-full bg-green-400"></span>
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More options</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditModal(user)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    <span>Edit User</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(user)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    <span>Delete User</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                          {searchQuery || selectedRoles.length > 0 ? (
                            <div>
                              <p className="font-medium text-gray-600 mb-2">No users found matching your search criteria.</p>
                              <Button variant="outline" size="sm" onClick={handleRefreshUsers}>Clear Filters</Button>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-gray-600 mb-2">No users found in the system.</p>
                              <Button 
                                size="sm" 
                                onClick={() => setIsAddUserModalOpen(true)}
                                className="flex items-center gap-1 mx-auto"
                              >
                                <UserPlus className="h-4 w-4" />
                                Add Your First User
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{totalUsers}</span> users
              </p>
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === pageNum
                        ? 'z-10 bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>

        {/* Add User Modal */}
        <UserFormModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSubmit={handleAddUser}
          title="Add New User"
        />

        {/* Edit User Modal */}
        {selectedUser && (
          <UserFormModal
            isOpen={isEditUserModalOpen}
            onClose={() => {
              setIsEditUserModalOpen(false);
              setSelectedUser(null);
            }}
            onSubmit={handleEditUser}
            user={selectedUser}
            title="Edit User"
          />
        )}

        {/* Delete Confirmation Modal - Enhanced */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete User</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The user will be permanently removed from the system.
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="py-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium">
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <Badge className="mt-1">{selectedUser.role}</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this user? This will:
                </p>
                
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mb-4">
                  <li>Remove the user's account and access to the system</li>
                  <li>Delete all associated user data</li>
                  <li>Cannot be reversed</li>
                </ul>
                
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a permanent action and cannot be undone.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Bulk Delete Confirmation Modal */}
        <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Multiple Users</DialogTitle>
              <DialogDescription>
                You are about to delete {selectedUsers.length} users from the system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="h-[200px] overflow-auto rounded-md border p-4 mb-4">
                <div className="space-y-3">
                  {users
                    .filter(user => selectedUsers.includes(user.id))
                    .map(user => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded border">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-medium">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action will permanently delete {selectedUsers.length} users and cannot be undone.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsBulkDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : `Delete ${selectedUsers.length} Users`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
