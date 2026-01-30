export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface ComplianceItem {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string | null;
  last_reviewed_date: string | null;
  assigned_to: string;
  owner_email: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceItemWithCategory extends ComplianceItem {
  compliance_categories: ComplianceCategory | null;
}
