import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ links = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(0);

  const getIcon = (link) => {
    const icons = {
      'Dashboard': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      'Inventory': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      'Packing': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      'Custody': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'Manifests': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    };
    return icons[link] || (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    );
  };

  const getRoute = (link) => {
    const routes = {
      'Dashboard': '/dashboard',
      'Inventory': '/inventory',
      'Packing': '/packing',
      'Manifests': '/manifests',
      'Custody': '/custody'
    };
    return routes[link] || '/';
  };

  const handleNavigation = (link, idx) => {
    setActiveLink(idx);
    const route = getRoute(link);
    navigate(route);
  };

  // Check if current route matches link
  React.useEffect(() => {
    const currentPath = location.pathname;
    links.forEach((link, idx) => {
      if (getRoute(link) === currentPath) {
        setActiveLink(idx);
      }
    });
  }, [location, links]);

  return (
    <aside className="w-52 clean-sidebar min-h-screen p-3 fade-in">
      {/* Logo/Brand */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-gray-900">AVID</h1>
        </div>
        <p className="text-xs text-gray-500 ml-8">Logistics</p>
      </div>

      {/* Navigation */}
      <nav>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Navigation
        </h2>
        <ul className="space-y-1">
          {links.map((link, idx) => (
            <li key={idx}>
              <button
                onClick={() => handleNavigation(link, idx)}
                className={`clean-nav-item w-full text-left ${
                  activeLink === idx ? 'active' : ''
                }`}
              >
                {getIcon(link)}
                <span>{link}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 p-2 rounded bg-gray-50">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">DU</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">Demo User</p>
            <p className="text-xs text-gray-500 truncate">Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
