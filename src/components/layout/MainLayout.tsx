
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn(
        "min-h-screen pt-16 pb-10 px-4 transition-all duration-300",
        "lg:pl-64" // Adjust based on sidebar width
      )}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
