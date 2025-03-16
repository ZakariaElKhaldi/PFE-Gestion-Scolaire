import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { UserResponse, UserRole } from '../../../types/auth'
import { UserFormModal, UserFormData } from '../../../components/dashboard/users/user-form-modal'
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout'
import toast, { Toaster } from 'react-hot-toast'
import { userService } from '../../../services/user.service'

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)

  // Fetch users on component mount and when search/filters/pagination change
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await userService.getUsers({
          role: selectedRoles.length > 0 ? selectedRoles.join(',') : undefined,
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
  }, [searchQuery, selectedRoles, currentPage, itemsPerPage]);

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

  return (
    <DashboardLayout user={user}>
      <Toaster />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-500 mt-1">Manage all users in the system</p>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add User
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative rounded-md w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 self-center mr-2">Filter by role:</span>
              {['administrator', 'teacher', 'student', 'parent'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRoles.includes(role)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.studentId && (
                              <div className="text-xs text-gray-500">ID: {user.studentId}</div>
                            )}
                            {user.teacherId && (
                              <div className="text-xs text-gray-500">ID: {user.teacherId}</div>
                            )}
                            {user.parentId && (
                              <div className="text-xs text-gray-500">ID: {user.parentId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'administrator' ? 'bg-purple-100 text-purple-800' : ''}
                          ${user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : ''}
                          ${user.role === 'student' ? 'bg-green-100 text-green-800' : ''}
                          ${user.role === 'parent' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-primary hover:text-primary/90 mr-4"
                        >
                          <Pencil className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{users.length > 0 ? startItem : 0}</span> to{' '}
                  <span className="font-medium">{users.length > 0 ? startItem + users.length - 1 : 0}</span> of{' '}
                  <span className="font-medium">{totalUsers}</span> results
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-4">
                  <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700">Show:</label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-primary border-primary text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
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

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete {selectedUser.firstName} {selectedUser.lastName}? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleDeleteUser}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSelectedUser(null);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
