
export enum Caste {
  GENERAL = 'General',
  OBC = 'OBC',
  SC = 'SC',
  ST = 'ST'
}

export enum Education {
  NONE = 'Primary or Below',
  SECONDARY = 'Secondary (10th)',
  HIGHER_SECONDARY = 'Higher Secondary (12th)',
  GRADUATE = 'Graduate',
  POST_GRADUATE = 'Post Graduate'
}

export enum Sector {
  AGRICULTURE = 'Agriculture / Farmer',
  CORPORATE = 'Corporate / Private Job',
  STUDENT = 'Student',
  LABORER = 'Laborer / Construction',
  SELF_EMPLOYED = 'Self-Employed / Business',
  GOVERNMENT = 'Government Employee',
  UNEMPLOYED = 'Unemployed'
}

export interface SectorDetails {
  landSize?: number;
  cropType?: string;
  irrigationStatus?: string;
  currentCourse?: string;
  institute?: string;
  jobRole?: string;
  companyType?: string;
  skillSet?: string;
  isRegisteredWorker?: boolean;
}

export interface UserProfile {
  _id?: string;
  fullName: string;
  phone: string;
  age: number;
  income: number;
  caste: Caste;
  education: Education;
  district: string;
  block: string;
  sector: Sector;
  sectorDetails: SectorDetails;
  createdAt?: string;
}

export interface SchemeApplication {
  _id?: string;
  userId: string;
  schemeId: string;
  schemeTitle: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  benefit: string;
  category: 'Health' | 'Education' | 'Agriculture' | 'Housing' | 'Employment' | 'Business';
  eligibility: string;
  icon: string;
  targetSectors: Sector[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}
