
import { Link } from 'react-router-dom';
import { Leaf, TruckIcon, Server, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Define colors based on your provided color palette
const colors = {
  primary: '#f2f4d5',   // Light cream
  secondary: '#2e2c31', // Dark gray
  tertiary: '#3b431e',  // Olive green
  accent: '#6f61ef'     // Purple
};

const Index = () => {
  const { user, userRole } = useAuth();

  return (
    <div style={{ backgroundColor: colors.primary }} className="min-h-screen">
      {/* Header */}
      <header className="py-4 px-4 lg:px-8" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-8 w-8" style={{ color: colors.tertiary }} />
            <span className="text-xl font-bold ml-2" style={{ color: colors.secondary }}>EcoFreight</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium" style={{ color: colors.secondary }}>Features</a>
            <a href="#how-it-works" className="text-sm font-medium" style={{ color: colors.secondary }}>How It Works</a>
            <a href="#about" className="text-sm font-medium" style={{ color: colors.secondary }}>About</a>
            <Link to="/login">
              <Button variant="outline" style={{ borderColor: colors.accent, color: colors.accent }}>
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button style={{ backgroundColor: colors.accent, color: 'white' }}>
                Sign Up
              </Button>
            </Link>
          </nav>
          <div className="md:hidden">
            {/* Mobile menu button would go here */}
            <Button variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: colors.secondary }}>
            Transforming Logistics for a Sustainable Future
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: colors.secondary }}>
            Track shipments in real-time, reduce carbon emissions, and optimize logistics operations with our blockchain-based solution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" style={{ backgroundColor: colors.accent, color: 'white' }}>
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" style={{ borderColor: colors.tertiary, color: colors.tertiary }}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 lg:px-8" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.secondary }}>
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
                <TruckIcon className="h-6 w-6" style={{ color: colors.tertiary }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Real-Time Tracking</h3>
              <p style={{ color: colors.secondary }}>
                Track your shipments in real-time with GPS and IoT sensors. Get precise location updates and estimated delivery times.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
                <Server className="h-6 w-6" style={{ color: colors.tertiary }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Blockchain Transparency</h3>
              <p style={{ color: colors.secondary }}>
                Verify the entire history of your shipments with immutable blockchain records, ensuring transparency and trust.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
                <BarChart3 className="h-6 w-6" style={{ color: colors.tertiary }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Sustainability Insights</h3>
              <p style={{ color: colors.secondary }}>
                Get AI-powered recommendations to reduce carbon emissions and optimize your logistics operations.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
                <Shield className="h-6 w-6" style={{ color: colors.tertiary }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Smart Contract Automation</h3>
              <p style={{ color: colors.secondary }}>
                Automate payments, customs clearance, and delivery confirmations with secure smart contracts.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cpu" style={{ color: colors.tertiary }}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>IoT Integration</h3>
              <p style={{ color: colors.secondary }}>
                Monitor temperature, humidity, and shock detection for sensitive goods to ensure optimal conditions.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-route" style={{ color: colors.tertiary }}><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Route Optimization</h3>
              <p style={{ color: colors.secondary }}>
                Find the most efficient routes for delivery based on real-time traffic, weather, and historical data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.secondary }}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.accent, color: 'white' }}>
                1
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Register & Connect</h3>
              <p style={{ color: colors.secondary }}>
                Create an account and connect your logistics operations to our platform.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.accent, color: 'white' }}>
                2
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Track & Monitor</h3>
              <p style={{ color: colors.secondary }}>
                Track your shipments in real-time and monitor their status throughout the journey.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.accent, color: 'white' }}>
                3
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.secondary }}>Optimize & Save</h3>
              <p style={{ color: colors.secondary }}>
                Receive AI-powered recommendations to optimize routes, reduce emissions, and save costs.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link to="/signup">
              <Button size="lg" className="gap-2" style={{ backgroundColor: colors.accent, color: 'white' }}>
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 lg:px-8" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.secondary }}>
            About EcoFreight
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg mb-6" style={{ color: colors.secondary }}>
              EcoFreight is a revolutionary blockchain-based logistics platform designed to make supply chains more sustainable, efficient, and transparent.
            </p>
            <p className="text-lg mb-6" style={{ color: colors.secondary }}>
              Our mission is to transform the logistics industry by leveraging cutting-edge technologies like blockchain, IoT, and AI to reduce carbon emissions, optimize operations, and create trust among all stakeholders.
            </p>
            <p className="text-lg" style={{ color: colors.secondary }}>
              Founded by a team of logistics experts and technology innovators, EcoFreight aims to address the pressing challenges of environmental sustainability while improving operational efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 lg:px-8" style={{ backgroundColor: colors.secondary, color: 'white' }}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Leaf className="h-6 w-6" style={{ color: colors.primary }} />
                <span className="text-xl font-bold ml-2" style={{ color: colors.primary }}>EcoFreight</span>
              </div>
              <p className="text-sm" style={{ color: colors.primary }}>
                Transforming logistics for a sustainable future.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.primary }}>Features</h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.primary }}>
                <li>Real-Time Tracking</li>
                <li>Blockchain Transparency</li>
                <li>Sustainability Insights</li>
                <li>Smart Contract Automation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.primary }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.primary }}>
                <li>About Us</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.primary }}>Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.primary }}>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-6 text-center">
            <p className="text-sm" style={{ color: colors.primary }}>
              © 2025 EcoFreight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
