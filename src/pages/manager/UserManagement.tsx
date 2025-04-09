
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserRole } from '@/contexts/AuthContext';
import { Loader2, UserPlus, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    company: string | null;
  };
  role?: UserRole;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, company');
      
      if (authError) throw authError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Get users with their profiles and roles
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;

      const mergedUsers = userData.users.map(user => {
        const profile = authUsers?.find(p => p.id === user.id);
        const roleData = userRoles?.find(r => r.user_id === user.id);
        
        return {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          profile: profile || undefined,
          role: roleData?.role as UserRole || 'customer'
        };
      });

      setUsers(mergedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'manager':
        return 'bg-eco-purple text-white';
      case 'driver':
        return 'bg-eco-green text-white';
      case 'customer':
      default:
        return 'bg-eco-light text-eco-dark';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles</p>
          </div>
          <Button className="bg-eco-purple hover:bg-eco-purple/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-eco-purple" />
              Users
            </CardTitle>
            <CardDescription>
              {loading ? 'Loading users...' : `${users.length} users registered`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-eco-purple" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={user.profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-eco-purple text-white">
                                {user.profile?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.profile?.full_name || 'No Name'}</p>
                              {user.profile?.company && (
                                <p className="text-xs text-muted-foreground">{user.profile.company}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge className={getRoleBadgeColor(user.role || 'customer')}>
                            {user.role || 'customer'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => changeUserRole(user.id, 'manager')}
                              disabled={user.role === 'manager'}
                            >
                              Manager
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => changeUserRole(user.id, 'driver')}
                              disabled={user.role === 'driver'}
                            >
                              Driver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => changeUserRole(user.id, 'customer')}
                              disabled={user.role === 'customer'}
                            >
                              Customer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
