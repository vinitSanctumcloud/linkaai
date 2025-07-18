import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Sun, Moon, Home, Bot, Code, BarChart3, Settings, Store } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from './auth/ProtectedRoute';
import { Logout } from '@/services/authService';
import logo from '@/public/Linklogo.png';
import logoDark from '@/public/logo2.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false); // New state for hover
  const router = useRouter();

  const MOBILE_BREAKPOINT = 1024; // lg

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Agent', href: '/agent', icon: Bot },
    { name: 'Embed Code', href: '/embed', icon: Code },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'The Creator Marketplace', href: '/affiliatemarketplace', icon: Store },
  ];

  const handleLogout = async () => {
    try {
      await Logout();
      localStorage.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const validRoutes = navigation.map((item) => item.href);
    if (!validRoutes.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [pathname, router]);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      const isDark = savedMode === 'true';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    if (!mobile) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <ProtectedRoute>
      <div className={cn(
        'min-h-screen transition-colors duration-300',
        'bg-gray-50 text-gray-900',
        'dark:bg-gray-900 dark:text-gray-100'
      )}>
        <style jsx>{`
          .sidebar-nav-item-text {
            transition: opacity 0.3s ease-in-out;
          }
          .sidebar:hover .sidebar-nav-item-text {
            opacity: 1;
          }
        `}</style>

        {/* Mobile header */}
        {!isOpen && isMobile && (
          <header
            className={cn(
              'lg:hidden fixed top-0 left-0 right-0 z-50 shadow-lg h-20 flex items-center justify-between px-4 transition-all duration-300',
              'bg-white border-b border-gray-200',
              'dark:bg-gray-800 dark:border-gray-700'
            )}
          >
            <Link
              href="/"
              className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-lg transition-transform hover:scale-105"
              aria-label="Go to homepage"
            >
              <Image
                src={darkMode ? logoDark : logo}
                alt="Linka logo"
                width={darkMode ? 100 : 120}
                height={darkMode ? 100 : 120}
                className="rounded-full"
              />
            </Link>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'p-2 my-auto rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2 transition-all',
                'text-gray-600 hover:text-gray-800 hover:bg-gray-200',
                'dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              )}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="sidebar-navigation"
            >
              <Menu className="h-6 w-6 transition-opacity duration-200" aria-hidden="true" />
            </Button>
          </header>
        )}

        {/* Sidebar */}
        <aside
          id="sidebar-navigation"
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-16 lg:hover:w-64 sidebar group transition-all duration-300 ease-in-out border-r',
            'bg-white border-gray-200',
            'dark:bg-gray-800 dark:border-gray-700',
            isMobile ? (isOpen ? 'w-64 translate-x-0' : '-translate-x-full') : 'translate-x-0'
          )}
          onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
          onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
          aria-label="Main navigation"
        >
          <div className="flex flex-col h-full overflow-y-auto">
            <div
              className={cn(
                'flex items-center h-16 px-4 border-b',
                'border-gray-200',
                'dark:border-gray-700'
              )}
            >
              <Link
                href="/"
                className="flex items-center space-x-2 mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-md transition-transform hover:scale-105"
              >
                <Image
                  src={darkMode ? logoDark : logo}
                  alt="Linka logo"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </Link>
              {isMobile && isOpen && (
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'ml-auto p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2',
                    'text-gray-600 hover:text-gray-800 hover:bg-gray-200',
                    'dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  )}
                  aria-label="Close navigation menu"
                >
                  <X className="h-6 w-6 transition-opacity duration-200" aria-hidden="true" />
                </Button>
              )}
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 z-10">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const isComingSoon = item.name === 'The Creator Marketplace';

                return (
                  <div className="relative" key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 w-full',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2',
                        isActive
                          ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-600 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-400'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <div className="flex flex-col w-full overflow-hidden">
                        <span className={cn(
                          'sidebar-nav-item-text truncate',
                          'lg:opacity-0 group-hover:opacity-100 text-gray-600 dark:text-gray-300'
                        )}>
                          {item.name}
                        </span>
                      </div>
                    </Link>

                    {isComingSoon && (
                      <span className={cn(
                        'absolute -top-1 right-0 inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-[#f9943b] via-[#ff6b35] to-[#ff4757] text-white rounded-full shadow-lg',
                        'lg:opacity-0 group-hover:opacity-100 sidebar-nav-item-text'
                      )}>
                        <span className="relative z-10">Coming Soon</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>

            <div
              className={cn(
                'border-t p-4',
                'border-gray-200',
                'dark:border-gray-700'
              )}
            >
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleLogout()}
                  variant="ghost"
                  className={cn(
                    'justify-start rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2',
                    'text-gray-600 hover:text-gray-800 hover:bg-gray-200',
                    'dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <LogOut className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className={cn(
                    'sidebar-nav-item-text truncate',
                    'lg:opacity-0 group-hover:opacity-100 text-gray-600 dark:text-gray-300'
                  )}>
                    Sign out
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className={cn(
                    'rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2',
                    'text-gray-600 hover:text-gray-800 hover:bg-gray-200',
                    'dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for sidebar */}
        {(isOpen || (!isMobile && isSidebarHovered)) && (
          <div
            className={cn(
              'fixed inset-0 z-40 bg-black/40 dark:bg-black/60 transition-opacity duration-300',
              isMobile ? 'lg:hidden' : 'lg:block opacity-0 group-hover:opacity-100'
            )}
            onClick={() => isMobile && setIsOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <div
          className={cn(
            'min-h-screen transition-all duration-300',
            'bg-gray-50',
            'dark:bg-gray-900',
            isMobile
              ? isOpen
                ? 'ml-64'
                : 'ml-0'
              : 'lg:ml-16 lg:group-hover:ml-64'
          )}
        >
          <main
            className={cn(
              'relative z-10 p-4 sm:p-6 md:p-8 lg:p-10 transition-all duration-300',
              'text-gray-900',
              'dark:text-gray-100',
              !isOpen && isMobile ? 'mt-16' : ''
            )}
          >
            {children}
          </main>
        </div>

        {/* Chat iframe */}
        <div
          className={cn(
            'fixed bottom-2 right-2 z-50 w-[380px] max-w-[90vw] h-[800px] flex flex-col'
          )}
        >
          <iframe
            src="https://demo-liard-omega.vercel.app"
            title="Chat Widget"
            style={{
              width: '100%',
              height: '800px',
              border: 'none',
            }}
            allow="clipboard-write"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}