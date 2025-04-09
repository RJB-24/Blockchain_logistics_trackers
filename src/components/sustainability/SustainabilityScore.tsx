
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SustainabilityScoreProps {
  score: number;
  previousScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SustainabilityScore = ({ 
  score, 
  previousScore, 
  size = 'md',
  showLabel = true
}: SustainabilityScoreProps) => {
  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Determine size classes
  const sizeClasses = {
    sm: { container: 'w-16 h-16', text: 'text-xl', icon: 16 },
    md: { container: 'w-24 h-24', text: 'text-3xl', icon: 20 },
    lg: { container: 'w-32 h-32', text: 'text-4xl', icon: 24 },
  };

  // Calculate score change
  const scoreChange = previousScore !== undefined ? score - previousScore : undefined;
  const isPositiveChange = scoreChange !== undefined && scoreChange > 0;

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "relative rounded-full flex items-center justify-center border-4",
        sizeClasses[size].container,
        getColor(score)
      )}>
        <span className={cn("font-bold", sizeClasses[size].text)}>{score}</span>
        <Leaf className="absolute top-1 right-1" size={sizeClasses[size].icon} />
      </div>
      
      {showLabel && (
        <div className="mt-2 text-center">
          <p className="font-medium">Sustainability Score</p>
          
          {scoreChange !== undefined && (
            <p className={cn(
              "text-xs font-medium mt-1",
              isPositiveChange ? "text-green-500" : "text-red-500"
            )}>
              {isPositiveChange ? '+' : ''}{scoreChange} pts from last month
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SustainabilityScore;
