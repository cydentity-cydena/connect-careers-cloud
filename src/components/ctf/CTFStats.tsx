import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CTFStatsProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}

export function CTFStats({ icon, label, value, color }: CTFStatsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={cn('p-3 rounded-full bg-secondary', color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
