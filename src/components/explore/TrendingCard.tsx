import { cn } from "@/lib/utils";

interface TrendingCardProps {
  rank: number;
  title: string;
  image?: string;
  color: "pink" | "purple" | "green" | "orange";
}

const colorClasses = {
  pink: "bg-gradient-to-br from-trending-1 to-pink-700",
  purple: "bg-gradient-to-br from-trending-2 to-purple-700",
  green: "bg-gradient-to-br from-trending-3 to-green-700",
  orange: "bg-gradient-to-br from-trending-4 to-orange-700",
};

const TrendingCard = ({ rank, title, image, color }: TrendingCardProps) => {
  return (
    <div className={cn(
      "trending-card h-24 flex items-end",
      colorClasses[color]
    )}>
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
        {rank}
      </div>
      
      <div className="flex items-center justify-between w-full">
        <h3 className="font-bold text-foreground text-sm leading-tight">{title}</h3>
        {image && (
          <img 
            src={image} 
            alt={title}
            className="w-12 h-12 object-cover rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

export default TrendingCard;
