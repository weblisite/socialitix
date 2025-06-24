import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-white">Socialitix</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/pricing" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
              <Link to="/about" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
                Contact
              </Link>
            </nav>

            {/* Empty space where user info was - now handled by sidebar */}
            <div className="flex items-center space-x-4">
              {/* User info removed - now in sidebar */}
            </div>
          </div>
        </div>
      </header>

      {/* Main content - flex-1 to take remaining height */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}; 