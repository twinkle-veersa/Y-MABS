import { Nav } from '@shared/models';

export const NAVIGATION: Nav[] = [
  {
    label: 'Dashboard',
    icon: 'icons/sidebar/dashboard.png',
    link: ['home', 'dashboard']
  },
  {
    label: 'My Patients',
    icon: 'icons/sidebar/my-patient.png',
    link: ['home', 'my-patients']
  },
  {
    label: 'Tools and Forms',
    icon: 'icons/sidebar/tools.png',
    link: ['home', 'tools']
  },
  {
    label: 'Account Settings',
    icon: 'icons/sidebar/settings.png',
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
