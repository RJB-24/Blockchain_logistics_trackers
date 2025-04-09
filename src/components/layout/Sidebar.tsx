
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  TruckIcon, 
  PackageIcon, 
  BarChart3Icon, 
  Leaf, 
  Settings, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Shipments', icon: TruckIcon, path: '/shipments' },
  { name: 'Inventory', icon: PackageIcon, path: '/inventory' },
  { name: 'Analytics', icon: BarChart3Icon, path: '/analytics' },
  { name: 'Sustainability', icon: Leaf, path: '/sustainability' },
  { name: 'Team', icon: Users, path: '/team' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-eco-purple text-white"
        onClick={toggleMobileSidebar}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar for desktop */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-eco-dark text-eco-light z-40 transition-all duration-300 hidden lg:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-eco-light/20">
          {!collapsed && (
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-eco-purple" />
              <span className="ml-2 text-xl font-bold">EcoFreight</span>
            </div>
          )}
          {collapsed && <Leaf className="h-8 w-8 mx-auto text-eco-purple" />}
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md hover:bg-eco-light/10"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive ? "bg-eco-purple text-white" : "hover:bg-eco-light/10",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon size={20} />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-eco-light/20">
          <button className={cn(
            "flex items-center p-2 rounded-md text-eco-light hover:bg-eco-light/10 w-full",
            collapsed && "justify-center"
          )}>
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileSidebar}
      />

      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-eco-dark text-eco-light z-40 w-64 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-eco-light/20">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-eco-purple" />
            <span className="ml-2 text-xl font-bold">EcoFreight</span>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive ? "bg-eco-purple text-white" : "hover:bg-eco-light/10"
                  )}
                  onClick={toggleMobileSidebar}
                >
                  <item.icon size={20} />
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-eco-light/20">
          <button className="flex items-center p-2 rounded-md text-eco-light hover:bg-eco-light/10 w-full">
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
