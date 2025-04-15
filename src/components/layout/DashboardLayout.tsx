
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Leaf, 
  Home, 
  Users, 
  TruckIcon, 
  BarChart3, 
  Cloud, 
  MessageSquare,
  Package,
  Route,
  Navigation,
  FileText,
  ClipboardCheck, 
  LogOut,
  Menu,
  X,
  User,
  Settings2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Define colors based on your provided color palette
const colors = {
  primary: '#f2f4d5',   // Light cream
  secondary: '#2e2c31', // Dark gray
  tertiary: '#3b431e',  // Olive green
  accent: '#6f61ef'     // Purple
};

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, profile, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role-based navigation items
  let navItems: NavItem[] = [];

  if (userRole === 'manager') {
    navItems = [
      { label: 'Dashboard', icon: <Home size={20} />, href: '/manager' },
      { label: 'User Management', icon: <Users size={20} />, href: '/manager/users' },
      { label: 'Create Shipment', icon: <TruckIcon size={20} />, href: '/manager/create-shipment' },
      { label: 'Analytics', icon: <BarChart3 size={20} />, href: '/manager/analytics' },
      { label: 'AI Suggestions', icon: <MessageSquare size={20} />, href: '/manager/ai-suggestions' },
      { label: 'Weather Analytics', icon: <Cloud size={20} />, href: '/manager/weather' },
      { label: 'Reviews', icon: <Star size={20} />, href: '/manager/reviews' },
    ];
  } else if (userRole === 'driver') {
    navItems = [
      { label: 'Dashboard', icon: <Home size={20} />, href: '/driver' },
      { label: 'Route Optimization', icon: <Route size={20} />, href: '/driver/route' },
      { label: 'Smart Navigation', icon: <Navigation size={20} />, href: '/driver/smart-navigation' },
      { label: 'AI Assistant', icon: <MessageSquare size={20} />, href: '/driver/ai-chat' },
      { label: 'Delivery Updates', icon: <ClipboardCheck size={20} />, href: '/driver/delivery' },
    ];
  } else if (userRole === 'customer') {
    navItems = [
      { label: 'Dashboard', icon: <Home size={20} />, href: '/customer' },
      { label: 'Track Shipment', icon: <Package size={20} />, href: '/customer/track' },
      { label: 'Carbon Report', icon: <FileText size={20} />, href: '/customer/carbon' },
    ];
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.primary }}>
      {/* Header */}
      <header className="py-3 px-4" style={{ backgroundColor: colors.secondary, color: 'white' }}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-6 w-6" style={{ color: colors.primary }} />
            <span className="text-lg font-bold ml-2" style={{ color: colors.primary }}>EcoFreight</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User info (desktop) */}
            <div className="hidden md:flex items-center">
              <span className="mr-2 text-sm" style={{ color: colors.primary }}>
                {profile?.full_name || user?.email}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback style={{ backgroundColor: colors.accent, color: 'white' }}>
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" 
                  style={{ color: colors.primary }}>
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0" style={{ backgroundColor: colors.secondary }}>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <Leaf className="h-6 w-6" style={{ color: colors.primary }} />
                      <span className="text-lg font-bold ml-2" style={{ color: colors.primary }}>EcoFreight</span>
                    </div>
                  </div>
                  
                  {/* User info in mobile menu */}
                  <div className="p-4 flex items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback style={{ backgroundColor: colors.accent, color: 'white' }}>
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium text-sm" style={{ color: colors.primary }}>
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs" style={{ color: colors.primary }}>
                        {userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Mobile navigation */}
                  <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className={`flex items-center px-3 py-2 rounded-md text-sm ${
                              location.pathname === item.href
                                ? 'bg-opacity-20 font-medium'
                                : 'hover:bg-opacity-10'
                            }`}
                            style={{ 
                              backgroundColor: location.pathname === item.href ? colors.accent + '40' : 'transparent',
                              color: colors.primary
                            }}
                          >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  <div className="p-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                      style={{ color: colors.primary }}
                    >
                      <LogOut size={20} className="mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <aside
          className="hidden md:block w-64 p-4"
          style={{ backgroundColor: colors.secondary, color: colors.primary }}
        >
          <div className="mb-6">
            <div className="px-3 py-2">
              <div className="flex items-center">
                <User size={20} />
                <div className="ml-3">
                  <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                  <p className="text-xs opacity-70">
                    {userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${
                      location.pathname === item.href
                        ? 'bg-opacity-20 font-medium'
                        : 'hover:bg-opacity-10'
                    }`}
                    style={{ 
                      backgroundColor: location.pathname === item.href ? colors.accent + '40' : 'transparent',
                      color: colors.primary
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            <Separator className="my-4 bg-gray-700" />
            
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 h-auto"
              onClick={handleSignOut}
              style={{ color: colors.primary }}
            >
              <LogOut size={20} className="mr-3" />
              <span>Sign Out</span>
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
