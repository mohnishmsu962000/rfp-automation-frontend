import Card from '@/components/ui/Card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

export default function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card padding="lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <h3 className="text-4xl font-bold text-brand-primary mb-1">{value}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div className="text-brand-primary opacity-20">
          {icon}
        </div>
      </div>
    </Card>
  );
}