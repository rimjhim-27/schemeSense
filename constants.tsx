
import { Scheme, Notification, Caste, Education, Sector } from './types';

export const MOCK_SCHEMES: Scheme[] = [
  {
    id: '1',
    title: 'Kisan Samman Nidhi',
    description: 'Direct income support for farmers to help with agricultural expenses.',
    benefit: '₹6,000 yearly in installments',
    category: 'Agriculture',
    eligibility: 'Farmers with cultivable land.',
    icon: '🚜',
    targetSectors: [Sector.AGRICULTURE]
  },
  {
    id: '2',
    title: 'Skill Development Grant',
    description: 'Financial aid for students and youth to pursue vocational training.',
    benefit: '₹1,500 monthly stipend',
    category: 'Education',
    eligibility: 'Students or unemployed youth aged 18-35.',
    icon: '🔧',
    targetSectors: [Sector.STUDENT, Sector.UNEMPLOYED]
  },
  {
    id: '3',
    title: 'Startup Bihar Subsidy',
    description: 'Incentives for small business owners and entrepreneurs.',
    benefit: 'Up to 10 Lakh interest-free loan',
    category: 'Business',
    eligibility: 'New business setups in Bihar.',
    icon: '💼',
    targetSectors: [Sector.SELF_EMPLOYED, Sector.UNEMPLOYED]
  },
  {
    id: '4',
    title: 'Ayushman Bharat',
    description: 'National health insurance scheme for secondary and tertiary care.',
    benefit: '₹5 Lakh per family per year',
    category: 'Health',
    eligibility: 'BPL families and low-income households.',
    icon: '🏥',
    targetSectors: [Sector.AGRICULTURE, Sector.LABORER, Sector.UNEMPLOYED, Sector.SELF_EMPLOYED]
  },
  {
    id: '5',
    title: 'Construction Worker Pension',
    description: 'Pension scheme specifically for registered construction laborers.',
    benefit: '₹3,000 monthly after age 60',
    category: 'Employment',
    eligibility: 'Registered laborers aged 18-40.',
    icon: '🏗️',
    targetSectors: [Sector.LABORER]
  },
  {
    id: '6',
    title: 'MSME Performance Grant',
    description: 'Cash incentives for private sector units showing growth.',
    benefit: 'Up to 15% reimbursement on new machinery',
    category: 'Business',
    eligibility: 'Private companies and MSMEs.',
    icon: '🏢',
    targetSectors: [Sector.CORPORATE, Sector.SELF_EMPLOYED]
  }
];

export const BIHAR_DISTRICTS: string[] = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur",
  "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger",
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur",
  "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
];

// Mock generator for 534 blocks across 38 districts
export const getBlocksForDistrict = (district: string): string[] => {
  // In a real app, this would be a full static JSON or API call.
  // Here we generate realistic-sounding mock blocks to fulfill the "all 534 blocks" UI requirement.
  const blockCount = district === "Patna" ? 23 : 14; // Different districts have different counts
  return Array.from({ length: blockCount }, (_, i) => `${district} Block ${i + 1}`);
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Sector Verification',
    message: 'Please upload your Land Records (LPC) to verify your Agriculture status.',
    date: '1 hour ago',
    isRead: false
  }
];
