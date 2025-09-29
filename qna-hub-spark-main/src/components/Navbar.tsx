import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { authApi } from '../lib/api';
import { useEffect, useState, useRef } from 'react';
import { User, LogOut, Settings, ChevronDown, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    // Listen for a custom event dispatched after login
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    };
    window.addEventListener('user-logged-in', handler);
    return () => window.removeEventListener('user-logged-in', handler);
  }, [queryClient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  return (
    <nav className="w-full bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          QnA Hub
        </Link>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-8 w-8"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-20"></div>
            </div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              {/* User Dropdown Trigger */}
              <Button
                variant="ghost"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.data?.username?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium max-w-[120px] truncate">
                    {user?.data?.username}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-500 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              </Button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg py-2 z-50 animate-in fade-in-80 slide-in-from-top-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.data?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.data?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-150"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-150"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              id="open-auth-dialog"
              className="rounded-xl border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 hover:scale-105"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}