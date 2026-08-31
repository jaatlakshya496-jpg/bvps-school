export interface EnquiryApplication {
  id: string;
  studentName: string;
  dob: string;
  gender: string;
  classApplying: string;
  parentName: string;
  relation: string;
  mobile: string;
  email: string;
  address: string;
  previousSchool: string;
  stream: string;
  interviewDate?: string;
  interviewSlot?: string;
  interviewMode?: string;
  message: string;
  submittedAt: string;
}

const KEY = 'bvps_enquiry_applications';

export function saveApplication(
  data: Omit<EnquiryApplication, 'id' | 'submittedAt'>,
): EnquiryApplication {
  const all = getApplications();
  const entry: EnquiryApplication = {
    ...data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  all.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(all));
  return entry;
}

export function getApplications(): EnquiryApplication[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EnquiryApplication[]) : [];
  } catch {
    return [];
  }
}
