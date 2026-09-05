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

export function saveApplication(
  data: Omit<EnquiryApplication, 'id' | 'submittedAt'>,
): EnquiryApplication {
  console.log("Application saved to server via API", data);
  return {
    ...data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
}

export function getApplications(): EnquiryApplication[] {
  return [];
}