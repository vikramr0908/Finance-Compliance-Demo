import { ComplianceItemWithCategory } from '../types/database';
import { Edit2, Trash2, Calendar, User, AlertCircle, Mail } from 'lucide-react';
import { getEmailNotificationStatus } from '../lib/emailNotifications';

interface ComplianceTableProps {
  items: ComplianceItemWithCategory[];
  loading: boolean;
  onEdit: (item: ComplianceItemWithCategory) => void;
  onDelete: (id: string) => void;
}

export function ComplianceTable({ items, loading, onEdit, onDelete }: ComplianceTableProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      compliant: 'bg-slate-100 text-black border-slate-200',
      non_compliant: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const labels = {
      compliant: 'Compliant',
      non_compliant: 'Non-Compliant',
      in_progress: 'In Progress',
      pending: 'Pending',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'compliant') return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-red-600"></div>
        <p className="mt-4 text-slate-600">Loading compliance items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No compliance items found</h3>
        <p className="text-slate-600">Get started by adding your first compliance requirement.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Compliance ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map((item, index) => {
            const overdue = isOverdue(item.due_date, item.status);
            const complianceId = `COMP-${String(index + 1).padStart(3, '0')}`;
            const notificationStatus = getEmailNotificationStatus(item);
            return (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-semibold text-slate-700">
                    {complianceId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2">
                    {overdue && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                    {notificationStatus.needsNotification && (
                      <div
                        title={
                          notificationStatus.type === 'overdue'
                            ? 'Overdue - Email notification sent'
                            : `Due in ${notificationStatus.daysRemaining} day(s) - Email notification sent`
                        }
                      >
                        <Mail 
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            notificationStatus.type === 'overdue' ? 'text-red-600' : 'text-orange-500'
                          }`}
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.owner_email && (
                        <p className="text-xs text-slate-500 mt-1">
                          Owner: {item.owner_email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.compliance_categories && (
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: `${item.compliance_categories.color}15`,
                        color: item.compliance_categories.color,
                        borderColor: `${item.compliance_categories.color}40`,
                      }}
                    >
                      {item.compliance_categories.name}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4">
                  {getPriorityBadge(item.priority)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className={overdue ? 'text-red-600 font-medium' : ''}>
                      {formatDate(item.due_date)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.assigned_to && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      {item.assigned_to}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
