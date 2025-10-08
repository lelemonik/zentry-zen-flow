import { Card } from './ui/card';

interface StatisticsCardProps {
  label: string;
  count: number;
  percentage: number;
  icon?: React.ReactNode;
}

export function StatisticsCard({ label, count, percentage, icon }: StatisticsCardProps) {
  return (
    <Card className="glass p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-1 sm:gap-2">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{label}</h3>
        <div className="flex items-baseline gap-1 sm:gap-2">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{count}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">{percentage}%</span>
        </div>
      </div>
    </Card>
  );
}
