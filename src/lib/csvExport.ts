import { ComplianceItemWithCategory } from '../types/database';

export function exportToCSV(items: ComplianceItemWithCategory[]) {
  // Format date for CSV
  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // CSV headers
  const headers = [
    'Compliance ID',
    'Title',
    'Category',
    'Status',
    'Priority',
    'Due Date',
    'Last Reviewed Date',
    'Assigned To',
    'Owner Email',
    'Description',
    'Notes',
    'Created At',
    'Updated At',
  ];

  // Convert items to CSV rows
  const rows = items.map((item, index) => {
    // Generate formatted ID (COMP-001, COMP-002, etc.)
    const complianceId = `COMP-${String(index + 1).padStart(3, '0')}`;
    
    // Format status and priority for better readability
    const formatStatus = (status: string) => {
      return status.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };
    
    return [
      complianceId,
      escapeCSV(item.title),
      item.compliance_categories?.name || 'Uncategorized',
      formatStatus(item.status),
      item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
      formatDate(item.due_date),
      formatDate(item.last_reviewed_date),
      escapeCSV(item.assigned_to) || 'Unassigned',
      escapeCSV(item.owner_email) || '',
      escapeCSV(item.description),
      escapeCSV(item.notes),
      formatDate(item.created_at),
      formatDate(item.updated_at),
    ];
  });

  // Escape CSV values (handle commas, quotes, newlines)
  function escapeCSV(value: string | null | undefined): string {
    if (!value) return '';
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `compliance-registry-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
