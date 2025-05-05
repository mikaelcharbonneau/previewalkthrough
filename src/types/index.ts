export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastInspectionDate?: string;
  avatarUrl?: string;
};

export type InspectionStatus = 'in-progress' | 'completed';

export type IssueStatus = 'open' | 'in-progress' | 'resolved';

export type Issue = {
  id: string;
  description: string;
  status: IssueStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
};

export type Inspection = {
  id: string;
  status: InspectionStatus;
  location: string;
  date: string;
  issueCount: number;
  completedBy?: string;
};

export type Report = {
  id: string;
  title: string;
  location: string;
  date: string;
  thumbnail?: string;
  issues: Issue[];
  summary?: string;
  recommendations?: string;
};

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'barcode' | 'file' | 'location';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}