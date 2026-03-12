import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    iconPath: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z',
  },
  {
    path: '/beneficiaries',
    label: 'Beneficiaries',
    iconPath: 'M16,4C16,2.89 15.11,2 14,2H10C8.89,2 8,2.89 8,4H6A2,2 0 0,0 4,6V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V6A2,2 0 0,0 18,4H16M10,4H14V6H10V4M8,8H16V10H8V8M8,12H16V14H8V12M8,16H13V18H8V16Z',
  },
  {
    path: '/investments',
    label: 'Investments',
    iconPath: 'M2,10.96C1.5,10.68 1.35,10.07 1.63,9.59L3.13,7C3.24,6.8 3.41,6.66 3.6,6.58L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.66,6.72 20.82,6.88 20.91,7.08L22.36,9.6C22.64,10.08 22.47,10.69 22,10.96L21,11.54V16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V11.54L2,10.96Z',
  },
  {
    path: '/savings',
    label: 'Savings',
    iconPath: 'M11.8,10.9C9.53,10.31 8.8,9.7 8.8,8.75C8.8,7.66 9.81,6.9 11.5,6.9C13.28,6.9 13.94,7.75 14,9H16.21C16.14,7.28 15.09,5.7 13,5.19V3H10V5.16C8.06,5.58 6.5,6.84 6.5,8.77C6.5,11.08 8.41,12.23 11.2,12.9C13.7,13.5 14.2,14.38 14.2,15.31C14.2,16 13.71,17.1 11.5,17.1C9.44,17.1 8.63,16.18 8.5,15H6.21C6.36,16.93 7.64,18.75 10,19.25V21H13V19.2C15.13,18.78 16.5,17.35 16.5,15.3C16.5,12.46 14.07,11.5 11.8,10.9Z',
  },
  {
    path: '/ledger',
    label: 'Ledger',
    iconPath: 'M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4M8,12H16V14H8V12M8,16H13V18H8V16',
  },
];

const ADMIN_ITEM = {
  path: '/admin',
  label: 'Reports',
  iconPath: 'M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4Z',
};

const PROFILE_ITEM = {
  path: '/profile',
  label: 'Profile',
  iconPath: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z',
};

const renderNavItem = ({ item, pathname, sidebarCollapsed, onNavClick }) => (
  <li key={item.path} className={`nav-item ${pathname === item.path ? 'active' : ''}`}>
    <Link to={item.path} className="nav-link" onClick={onNavClick}>
      <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d={item.iconPath} />
      </svg>
      {!sidebarCollapsed && <span>{item.label}</span>}
    </Link>
  </li>
);

export const renderSidebarNavLinks = ({ pathname, sidebarCollapsed, onNavClick, isAdmin }) => (
  <>
    {NAV_ITEMS.map((item) => renderNavItem({ item, pathname, sidebarCollapsed, onNavClick }))}
    {isAdmin && renderNavItem({ item: ADMIN_ITEM, pathname, sidebarCollapsed, onNavClick })}
    {renderNavItem({ item: PROFILE_ITEM, pathname, sidebarCollapsed, onNavClick })}
  </>
);

export default renderSidebarNavLinks;
