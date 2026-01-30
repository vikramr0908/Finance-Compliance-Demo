import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export function DashboardHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img 
              src="/xforia-logo.svg" 
              alt="XFORIA Logo" 
              className="h-10"
            />
            <div>
              <p className="text-xs text-slate-600">Finance Compliance</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {user?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
