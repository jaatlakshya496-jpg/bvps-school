export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  status: 'published' | 'draft';
  author: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeClass {
  name: string;
  group: string;
  admission: number;
  monthly: number;
  annualFund: number;
}

export interface FeeStream {
  name: string;
  hindiName: string;
  admission: number;
  monthly: number;
  annualFund: number;
}

export interface FeeConfig {
  classes: FeeClass[];
  streams: FeeStream[];
}

export interface ContactRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface AdmissionRow {
  id: number;
  studentName: string;
  dob: string;
  gender: string;
  classApplying: string;
  stream: string | null;
  parentName: string;
  relation: string | null;
  phone: string;
  email: string | null;
  address: string;
  previousSchool: string | null;
  message: string | null;
  createdAt: string;
}

export interface FeedbackRow {
  id: number;
  name: string;
  email: string;
  role: string;
  category: string;
  message: string;
  rating: number;
  createdAt: string;
}

export const DEFAULT_FEES: FeeConfig = {
  classes: [
    { name: 'Class 1', group: 'Primary', admission: 3000, monthly: 900, annualFund: 1500 },
    { name: 'Class 2', group: 'Primary', admission: 3000, monthly: 950, annualFund: 1500 },
    { name: 'Class 3', group: 'Primary', admission: 3500, monthly: 1000, annualFund: 1800 },
    { name: 'Class 4', group: 'Primary', admission: 3500, monthly: 1050, annualFund: 1800 },
    { name: 'Class 5', group: 'Primary', admission: 3500, monthly: 1100, annualFund: 2000 },
    { name: 'Class 6', group: 'Middle', admission: 4500, monthly: 1300, annualFund: 2000 },
    { name: 'Class 7', group: 'Middle', admission: 4500, monthly: 1400, annualFund: 2000 },
    { name: 'Class 8', group: 'Middle', admission: 4500, monthly: 1500, annualFund: 2500 },
    { name: 'Class 9', group: 'Secondary', admission: 5500, monthly: 2500, annualFund: 5000 },
    { name: 'Class 10', group: 'Secondary', admission: 5500, monthly: 2500, annualFund: 5000 },
  ],
  streams: [
    { name: 'Arts', hindiName: 'कला', admission: 7000, monthly: 2800, annualFund: 6400 },
    { name: 'Commerce', hindiName: 'वाणिज्य', admission: 7000, monthly: 3200, annualFund: 6600 },
    { name: 'Non-Medical', hindiName: 'विज्ञान', admission: 7000, monthly: 3700, annualFund: 5600 },
  ],
};

export function normalizeFees(config: FeeConfig): FeeConfig {
  const classes = Array.isArray(config?.classes) && config.classes.length ? config.classes : DEFAULT_FEES.classes;
  const streams = Array.isArray(config?.streams) && config.streams.length ? config.streams : DEFAULT_FEES.streams;
  return { classes, streams };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}