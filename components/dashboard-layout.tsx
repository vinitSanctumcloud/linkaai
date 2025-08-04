'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Home,
  Bot,
  Code,
  BarChart3,
  Settings,
  Store,
  User,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from './auth/ProtectedRoute';
import logo from '@/public/Linklogo.png';
import logoDark from '@/public/logo2.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { initializeAuthState, logout } from '@/store/slices/authSlice';
import { fetchAgentDetails } from '@/store/slices/agentSlice'
import './style.css';

// Define interfaces for type safety
interface UserProfile {
  name: string;
  picture: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
  target?: '_blank' | '_self';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { agent: agentDetails } = useSelector((state: RootState) => state.agents);
  const { aiAgentData } = useSelector((state: RootState) => state.auth);
  const { agent } = useSelector((state: RootState) => state.agents)

  const firstInitial = aiAgentData?.user?.first_name?.charAt(0) || '';
  const lastInitial = aiAgentData?.user?.last_name?.charAt(0) || '';
  // Initialize auth state on mount
  useEffect(() => {
    dispatch(initializeAuthState());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAgentDetails());
  }, [dispatch]);

  // Fetch random user profile
  useEffect(() => {
    console.log("fetchAgentDetails ::", aiAgentData);
    fetch('https://randomuser.me/api/')
      .then((response) => response.json())
      .then((data) => {
        const user = data.results[0];
        setUserProfile({
          name: `${user.name.first} ${user.name.last}`,
          picture: './userlogo1.png', // Replace with your robot image URL
        });
      })
      .catch((error: unknown) => {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load user profile');
      });
  }, []);

  const MOBILE_BREAKPOINT = 1024; // lg breakpoint

  // Navigation items
  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Agent', href: '/agent', icon: Bot },
    { name: 'Share My Agent', href: '/embed', icon: Code },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
    {
      name: 'The Creators Marketplace',
      href: '/affiliatemarketplace',
      icon: Store,
      comingSoon: true,
    },
  ];

  // Live Agent item for the footer
  const agentSlug = agentDetails?.ai_agent_slug;
  // const liveAgentItem: NavItem = {
  //   name: 'Live Agent',
  //   href: agentSlug ? `/liveagent/${agentSlug}` : '#',
  //   icon: User,
  //   target: '_blank',
  // };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully', {
        position: "top-right",
        duration: 2000,
      });
      router.push('/login');
    } catch (error: unknown) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out', {
        position: "top-right",
        duration: 2000,
      });
    }
  };

  // Handle share Live Agent URL
  // const handleShareLiveAgent = () => {
  //   if (!agentSlug) {
  //     toast.error('Live Agent URL is not available');
  //     return;
  //   }
  //   const url = `${window.location.origin}/liveagent/${agentSlug}`;
  //   navigator.clipboard.writeText(url).then(() => {
  //     toast.success('Live Agent URL copied to clipboard!');
  //   }).catch(() => {
  //     toast.error('Failed to copy URL');
  //   });
  // };

  // Handle share Live Agent URL
  const handleShareLiveAgent = () => {
    if (!agentSlug) {
      toast.error('Live Agent URL is not available');
      return;
    }
    const url = `${window.location.origin}/liveagent/${agentSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Live Agent URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
  };

  // Check authentication (only for protected routes)
  useEffect(() => {
    if (!pathname.startsWith('/liveagent')) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
      }
    }
  }, [router, pathname]);

  // Validate current route (only for protected routes)
  useEffect(() => {
    if (!pathname.startsWith('/liveagent')) {
      const validRoutes = navigation.map((item) => item.href);
      if (!validRoutes.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [pathname, router]);

  // Initialize dark mode
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

  // Handle window resize
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    if (!mobile) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [pathname, isMobile]);

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Render navigation item
  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const commonProps = {
      className: cn(
        'relative flex items-center justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 w-full',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
        isActive
          ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
        item.comingSoon && 'cursor-not-allowed opacity-70',
        item.className
      ),
      'aria-current': isActive ? 'page' : undefined,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (item.comingSoon) {
          e.preventDefault();
          toast.info('This feature is coming soon!');
        }
        item.onClick?.(e);
      },
    } as const;

    const defaultIconClass = 'w-5 h-5 flex-shrink-0';
    const defaultTextClass = cn(
      'truncate',
      isMobile ? 'opacity-100' : 'lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200'
    );

    const iconClass = cn(
      defaultIconClass,
      'mr-3' // Consistent margin-right for left-aligned icons
    );

    if (item.target === '_blank') {
      return (
        <a
          key={item.name}
          href={item.comingSoon ? '#' : item.href}
          target="_blank"
          rel="noopener noreferrer"
          {...commonProps}
        >
          <item.icon className={iconClass} />
          <span className={defaultTextClass}>{item.name}</span>
          {item.comingSoon && (
            <span
              className={cn(
                'absolute -top-2 right-3 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white',
                isMobile ? 'opacity-100' : 'lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200'
              )}
            >
              Soon
            </span>
          )}
        </a>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.comingSoon ? '#' : item.href}
        {...commonProps}
      >
        <item.icon className={iconClass} />
        <span className={defaultTextClass}>{item.name}</span>
        {item.comingSoon && (
          <span
            className={cn(
              'absolute -top-2 right-3 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white',
              isMobile ? 'opacity-100' : 'lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200'
            )}
          >
            Soon
          </span>
        )}
      </Link>
    );
  };

  // Conditionally wrap content with ProtectedRoute
  const renderContent = () => (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 px-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm">
          <Link
            href="/"
            className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
          >
            <Image
              src={darkMode ? logoDark : logo}
              alt="Linka logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </header>
      )}

      {/* Sidebar Overlay */}
      {(isSidebarOpen || (!isMobile && isSidebarHovered)) && (
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/40 dark:bg-black/60 transition-opacity duration-300',
            isMobile ? 'lg:hidden' : 'lg:block opacity-0 group-hover:opacity-100'
          )}
          onClick={() => isMobile && setIsSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'group fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
          'transform transition-all duration-300 ease-in-out w-64',
          isMobile
            ? isSidebarOpen
              ? 'translate-x-0 shadow-xl'
              : '-translate-x-full'
            : 'lg:w-16 lg:hover:w-64'
        )}
        onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
        onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg w-full min-w-0"
            >
              <Image
                src={darkMode ? logoDark : logo}
                alt="Linka logo"
                width={darkMode ? 100 : 120}
                height={darkMode ? 100 : 120}
                className="rounded-full flex-shrink-0"
                priority
              />
            </Link>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
            {navigation.map((item) => (
              <div key={item.name} className="flex justify-start w-full">
                {renderNavItem({
                  ...item,
                  className: cn(
                    'w-full',
                    'flex items-center justify-start',
                    'px-3 py-2.5 rounded-lg',
                    'text-gray-700 dark:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    pathname === item.href
                      ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                      : '',
                    'transition-colors duration-200'
                  ),
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 mt-auto space-y-1">
            {userProfile && (
              <div
                className={cn(
                  'flex items-center px-1 py-2.5 rounded-lg',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'transition-colors duration-200'
                )}
              >
                <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                  <Image
                    src={agent?.avatar_image_url ?? '/userlogo1.png'}
                    alt="User profile"
                    fill
                    className="rounded-full object-cover"
                    sizes="40px"
                    priority
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/userlogo1.png';
                    }}
                  />
                </div>
                <div
                  className={cn(
                    'min-w-0',
                    isMobile ? 'opacity-100' : 'hidden lg:block lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200'
                  )}
                >
                  <span className="text-sm font-medium truncate block">
                    {aiAgentData?.user?.first_name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                    Logged in
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className={cn(
                'w-full flex px-3 py-2.5 text-sm font-medium rounded-lg',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors duration-200'
              )}
            >
              {darkMode ? (
                <>
                  <Sun className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span
                    className={cn(
                      'truncate',
                      isMobile ? 'opacity-100' : 'hidden lg:inline lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200'
                    )}
                  >
                    Light Mode
                  </span>
                </>
              ) : (
                <>
                  <Moon className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span
                    className={cn(
                      'truncate',
                      isMobile ? 'opacity-100' : 'hidden lg:inline lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200'
                    )}
                  >
                    Dark Mode
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors duration-200'
              )}
            >
              <LogOut className="flex-shrink-0 w-5 h-5 mr-3" />
              <span
                className={cn(
                  'truncate',
                  isMobile ? 'opacity-100' : 'hidden lg:inline lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200'
                )}
              >
                Sign out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'flex-grow transition-all duration-300',
          isMobile ? 'pt-16' : 'lg:ml-16 lg:group-hover:ml-64'
        )}
      >
        <main className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">{children}</main>
      </div>
    </div>
  );

  return pathname.includes('/liveagent') ? (
    renderContent()
  ) : (
    <ProtectedRoute>{renderContent()}</ProtectedRoute>
  );
}