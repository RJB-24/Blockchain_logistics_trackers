
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-light/50 px-4">
      <div className="eco-card p-8 max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Leaf className="h-12 w-12 text-eco-purple" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! We couldn't find the page you're looking for.
        </p>
        
        <p className="text-muted-foreground mb-8">
          The page at <span className="font-medium">{location.pathname}</span> doesn't exist or may have been moved.
        </p>
        
        <Button asChild className="bg-eco-purple hover:bg-eco-purple/90">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
