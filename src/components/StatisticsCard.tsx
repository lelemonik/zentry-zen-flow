import { Card } from './ui/card';

interface StatisticsCardProps {
  label: string;
  count: number;
  percentage: number;
  icon?: React.ReactNode;
}

export function StatisticsCard({ label, count, percentage, icon }: StatisticsCardProps) {
  return (
    <Card className="glass p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-bold">{count}</span>
          <span className="text-sm text-muted-foreground">{percentage}%</span>
        </div>
      </div>
    </Card>
  );
}
