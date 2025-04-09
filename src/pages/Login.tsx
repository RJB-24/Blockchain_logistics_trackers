
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Define colors based on your provided color palette
const colors = {
  primary: '#f2f4d5',   // Light cream
  secondary: '#2e2c31', // Dark gray
  tertiary: '#3b431e',  // Olive green
  accent: '#6f61ef'     // Purple
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login function with various roles
  const handleDemoLogin = async (role: 'manager' | 'driver' | 'customer') => {
    setIsLoading(true);
    try {
      // In a real app, you would create actual demo accounts for each role
      // For now, we'll use the same demo account and pretend it has different roles
      const demoEmails = {
        manager: 'demo.manager@ecofreight.example.com',
        driver: 'demo.driver@ecofreight.example.com',
        customer: 'demo.customer@ecofreight.example.com'
      };
      
      await signIn(demoEmails[role], 'password');
      toast({
        title: 'Demo Mode',
        description: `You are now logged in as a demo ${role}`,
        variant: 'default',
      });
      navigate('/');
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: 'Demo login failed',
        description: 'Could not log in with demo credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.primary }}>
      <div className="w-full max-w-md">
        <div className="p-8 rounded-lg shadow-lg" style={{ backgroundColor: 'white' }}>
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-10 w-10" style={{ color: colors.tertiary }} />
            <h1 className="text-2xl font-bold ml-2" style={{ color: colors.secondary }}>EcoFreight</h1>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: colors.secondary }}>Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.secondary }}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                style={{ borderColor: colors.secondary }}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: colors.secondary }}>
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: colors.accent }}>
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                style={{ borderColor: colors.secondary }}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              style={{ backgroundColor: colors.accent, color: 'white' }}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <p className="text-sm text-center mb-3" style={{ color: colors.secondary }}>Try a demo account:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="text-xs"
                onClick={() => handleDemoLogin('manager')}
                disabled={isLoading}
                style={{ borderColor: colors.tertiary, color: colors.tertiary }}
              >
                Manager
              </Button>
              
              <Button 
                variant="outline" 
                className="text-xs"
                onClick={() => handleDemoLogin('driver')}
                disabled={isLoading}
                style={{ borderColor: colors.tertiary, color: colors.tertiary }}
              >
                Driver
              </Button>
              
              <Button 
                variant="outline" 
                className="text-xs"
                onClick={() => handleDemoLogin('customer')}
                disabled={isLoading}
                style={{ borderColor: colors.tertiary, color: colors.tertiary }}
              >
                Customer
              </Button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: colors.secondary }}>
              Don't have an account?{' '}
              <Link to="/signup" className="hover:underline" style={{ color: colors.accent }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
