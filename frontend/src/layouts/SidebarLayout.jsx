import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ListChecks, TrendingUp, Settings, LogOut } from 'lucide-react';

const SidebarLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // This array makes it super easy to add or remove pages later!
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Creators', href: '/creators', icon: Users },
    { name: 'Performance Logs', href: '/logs', icon: ListChecks },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* 🚀 THE FIXED SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 tracking-tighter">
            Creator<span className="text-blue-600">Tracker</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            // Checks if the current URL matches the link to highlight it in blue
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM USER PROFILE & LOGOUT */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="px-4 py-3 mb-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Administrator</p>
            <p className="font-bold text-gray-900 truncate">{user?.username || 'Admin'}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 🖼️ THE DYNAMIC CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative">
        {/* The <Outlet /> is the magic portal where your page content gets injected */}
        <Outlet />
      </main>

    </div>
  );
};

export default SidebarLayout;