import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SmsIcon from '@mui/icons-material/Sms';

export const DRAWER_WIDTH = 240;

export const NAV_ITEMS = {
  admin: [
    { text: 'Calendar', icon: <HomeIcon />, path: '/' },
    { text: 'Clinics', icon: <BusinessIcon />, path: '/clinics' },
    { text: 'Procedures', icon: <MedicalServicesIcon />, path: '/procedures' },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
    { text: 'WA Templates', icon: <SmsIcon />, path: '/wa-templates' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ],
  clinic_staff: [
    { text: 'Calendar', icon: <HomeIcon />, path: '/' },
  ],
  guest: [],
};
