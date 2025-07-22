'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Logout } from "@/services/authService";
import logo from "@/public/Linklogo.png";
import logoDark from "@/public/logo2.png";
import './tooltip.css'

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const router = useRouter();

  const MOBILE_BREAKPOINT = 1024; // lg breakpoint

  // Navigation items
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "AI Agent", href: "/agent", icon: Bot },
    { name: "Embed Code", href: "/embed", icon: Code },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
    {
      name: "The Creator Marketplace",
      href: "/affiliatemarketplace",
      icon: Store,
      comingSoon: true,
    },
  ];

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await Logout();
      localStorage.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    }
  };

  // Check authentication
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
    }
  }, [router]);

  // Validate current route
  useEffect(() => {
    const validRoutes = navigation.map((item) => item.href);
    if (!validRoutes.includes(pathname)) {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  // Initialize dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      const isDark = savedMode === "true";
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [pathname, isMobile]);

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900  text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
                width={64}
                height={64}
                className="rounded-full"
                priority
              />
              {/* <span className="font-semibold text-lg">Linka</span> */}
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
              "fixed inset-0 z-40 bg-black/40 dark:bg-black/60 transition-opacity duration-300",
              isMobile ? "lg:hidden" : "lg:block opacity-0 group-hover:opacity-100"
            )}
            onClick={() => isMobile && setIsSidebarOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "group fixed lg:sticky top-0 left-0 z-50 h-screen w-64 lg:w-20 lg:hover:w-64 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
            isMobile
              ? isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          )}
          onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
          onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
          aria-label="Main navigation"
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
              >
                <Image
                  src={darkMode ? logoDark : logo}
                  alt="Linka logo"
                  width={64}
                  height={64}
                  className="rounded-full"
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
            <nav className="flex-1 px-2 py-4 space-y-1 hide-scrollbar">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.comingSoon ? "#" : item.href}
                    onClick={(e) => {
                      if (item.comingSoon) {
                        e.preventDefault();
                        toast.info("This feature is coming soon!");
                      }
                    }}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 min-w-0",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                      isActive
                        ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                      item.comingSoon && "cursor-not-allowed opacity-70"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.name}
                    </span>
                    {item.comingSoon && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        Soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 mt-auto space-y-2">
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                className="flex items-center w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 min-w-0"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 mr-3 flex-shrink-0" />
                ) : (
                  <Moon className="w-5 h-5 mr-3 flex-shrink-0" />
                )}
                <span className="truncate lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 min-w-0"
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  Sign out
                </span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={cn(
          "flex-grow transition-all duration-300",
          isMobile ? "pt-16" : "lg:ml-20 lg:group-hover:ml-64"
        )}>
          <main className="p-4 sm:p-6">{children}</main>
        </div>

        {/* Chat Button */}
        {/* <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          )}
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          <MessageCircle className="w-6 h-6" />
        </button> */}

        {/* Chat Panel */}
        {/* {isChatOpen && (
          <div className="fixed bottom-20 right-6 z-50 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Support Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <iframe
                src="https://demo-liard-omega.vercel.app"
                title="Chat"
                className="w-full h-full border-0 rounded-lg"
                allow="clipboard-write"
              />
            </div>
          </div>
        )} */}
      </div>
    </ProtectedRoute>
  );
}