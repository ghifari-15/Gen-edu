"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Edit, Trash2, Eye, UserCheck, UserX, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  userId: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  isVerified: boolean
  createdAt: string
  lastLogin: string
}

interface NewUserForm {
  name: string
  email: string
  password: string
  role: 'student' | 'teacher' | 'admin'
}

interface EditUserForm {
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  isVerified: boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [createError, setCreateError] = useState("")
  const [editError, setEditError] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    name: "",
    email: "",
    password: "",
    role: "student"
  })
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({
    name: "",
    email: "",
    role: "student",
    isVerified: false
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.users)
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user is still authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      })
      if (!response.ok) {
        setCreateError('Authentication expired. Please login again.')
        // Optionally redirect to login
        // window.location.href = '/login'
        return false
      }
      return true
    } catch (error) {
      setCreateError('Authentication check failed.')
      return false
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)
    setCreateError("")

    // ✅ Check authentication first
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      setIsCreatingUser(false)
      return
    }

    try {
      console.log('Sending request with data:', newUserForm) // Debug log

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Add this for authentication
        body: JSON.stringify(newUserForm),
      })

      console.log('Response status:', response.status) // Debug log
      console.log('Response headers:', response.headers) // Debug log

      // ✅ Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Non-JSON response:', textResponse)
        setCreateError('Server returned invalid response. Please check your login status.')
        return
      }

      const data = await response.json()
      console.log('Response data:', data) // Debug log

      if (data.success) {
        setIsAddUserOpen(false)
        setNewUserForm({ name: '', email: '', password: '', role: 'student' })
        fetchUsers()
        
        toast({
          title: "Success",
          description: "User created successfully. They can now login with their credentials.",
        })
      } else {
        setCreateError(data.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Create user error:', error)
      setCreateError('Network error or invalid response. Please try again.')
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    
    setIsUpdatingUser(true)
    setEditError("")

    // Debug logging
    console.log('Editing user with ID:', selectedUser.userId)
    console.log('Edit form data:', editUserForm)

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editUserForm)
      })

      console.log('Edit response status:', response.status)
      console.log('Edit response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Edit success response data:', data)
        if (data.success) {
          await fetchUsers() // Refresh user list
          setIsEditUserOpen(false)
          setSelectedUser(null)
          toast({
            title: "Success",
            description: "User updated successfully"
          })
        }
      } else {
        const data = await response.json()
        console.log('Edit error response data:', data)
        toast({
          title: "Error",
          description: data.message || "Failed to update user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchUsers() // Refresh user list
        toast({
          title: "Success",
          description: "User deleted successfully"
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to delete user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const fixVerification = async () => {
    try {
      const response = await fetch('/api/admin/fix-verification', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        fetchUsers() // Refresh users
      } else {
        toast({
          title: "Error", 
          description: data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fix verification",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    })
    setIsEditUserOpen(true)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
    verified: users.filter(u => u.isVerified).length,
    active: users.filter(u => u.lastLogin && 
      new Date(u.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'teacher': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="h-8 w-8" />
            <span>User Management</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={fixVerification}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Fix Verification
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4 py-4">
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {createError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUserForm.role} 
                    onValueChange={(value) => 
                      setNewUserForm(prev => ({ ...prev, role: value as 'student' | 'teacher' | 'admin' }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddUserOpen(false)
                    setCreateError("") // Clear error when closing
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingUser}>
                  {isCreatingUser ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Active (30d)</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Students: {stats.students}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Teachers: {stats.teachers}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Admins: {stats.admins}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: View user details */}}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.userId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editUserForm.role} 
                  onValueChange={(value) => 
                    setEditUserForm(prev => ({ ...prev, role: value as 'student' | 'teacher' | 'admin' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="edit-verified"
                  type="checkbox"
                  checked={editUserForm.isVerified}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-verified">Email Verified</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditUserOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingUser}>
                {isUpdatingUser ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
