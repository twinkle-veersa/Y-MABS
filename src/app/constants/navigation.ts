import { Nav } from '@shared/models';

export const NAVIGATION: Nav[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard.png',
    link: ['home', 'dashboard']
  },
  {
    label: 'My Patients',
    icon: 'patient.png',
    link: ['home', 'my-patients']
  },
  {
    label: 'Tools and Forms',
    icon: 'tool.png',
    link: ['home', 'tools']
  },
  {
    label: 'Account Settings',
    icon: 'setting.png',
    link: ['home', 'settings']
  }
];

export const HAM_NAVIGATION: Nav[] = [
  NAVIGATION[0],
  {
    label: 'My Profile',
    icon: 'svgs/user.svg',
    link: ['home', 'profile']
  },
  ...NAVIGATION.slice(1)
];
