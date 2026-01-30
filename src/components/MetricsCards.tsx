import { ComplianceItem } from '../types/database';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface MetricsCardsProps {
  items: ComplianceItem[];
}

export function MetricsCards({ items }: MetricsCardsProps) {
  const metrics = {
    compliant: items.filter(i => i.status === 'compliant').length,
    nonCompliant: items.filter(i => i.status === 'non_compliant').length,
    inProgress: items.filter(i => i.status === 'in_progress').length,
    pending: items.filter(i => i.status === 'pending').length,
  };

  const total = items.length || 1;
  const complianceRate = Math.round((metrics.compliant / total) * 100);

  const overdue = items.filter(item => {
    if (!item.due_date) return false;
    return new Date(item.due_date) < new Date() && item.status !== 'compliant';
  }).length;

  const cards = [
    {
      title: 'Compliant',
      value: metrics.compliant,
      icon: CheckCircle,
      color: 'text-black',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
    {
      title: 'In Progress',
      value: metrics.inProgress,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Non-Compliant',
      value: metrics.nonCompliant,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white rounded-xl border ${card.borderColor} p-5 shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.bgColor} p-2.5 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">
                {card.value}
              </p>
              <p className="text-sm text-slate-600">{card.title}</p>
            </div>
          );
        })}

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-5 shadow-sm text-white">
          <p className="text-sm opacity-90 mb-2">Compliance Rate</p>
          <p className="text-3xl font-bold mb-1">{complianceRate}%</p>
          <p className="text-sm opacity-90">
            {metrics.compliant} of {total} items
          </p>
        </div>
      </div>
    </div>
  );
}
