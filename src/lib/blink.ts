import { createClient } from '@blinkdotnew/sdk';

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID,
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY,
  auth: { mode: 'managed' }
});

export type Branch = 
  | 'admin' 
  | 'procurement' 
  | 'assets' 
  | 'transport' 
  | 'finance' 
  | 'control' 
  | 'invoice'
  | 'super_admin';

export const BRANCH_NAMES: Record<Branch, string> = {
  admin: 'مدیریت اداری',
  procurement: 'مدیریت تدارکات',
  assets: 'مدیریت محاسبه اجناس',
  transport: 'مدیریت ترانسپورت',
  finance: 'مدیریت مالی',
  control: 'مدیریت کنترول',
  invoice: 'شعبه انوایس',
  super_admin: 'مدیریت کل'
};
