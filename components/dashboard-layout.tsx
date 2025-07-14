import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import {
  BarChart3,
  Bot,
  Code,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  Store
} from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { logout } from '@/services/authService'
import { toast } from 'sonner'
import logo from '@/public/Linklogo.png'
import logoDark from '@/public/logo2.png' // Optional: Add a dark version of your logo

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Agent', href: '/agent', icon: Bot },
  { name: 'Embed Code', href: '/embed', icon: Code },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Affiliate Marketplace', href: '/affiliatemarketplace', icon: Store },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

const MOBILE_BREAKPOINT = 1024

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
    document.documentElement.classList.toggle('dark', newMode)
  }

  const handlelogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to log out')
    }
  }

  useEffect(() => {
    // Check for saved theme preference
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      const isDark = savedMode === 'true'
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    } else {
      // Use system preference if no saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT
    setIsMobile(mobile)
    if (!mobile) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      "bg-gray-50 text-gray-900",
      "dark:bg-gray-900 dark:text-gray-100"
    )}>
      {/* Mobile header */}
      {!isOpen && isMobile && (
        <header
          className={cn(
            "lg:hidden fixed top-0 left-0 right-0 z-40 shadow-lg h-20 flex items-center justify-between px-4 transition-all duration-300",
            "bg-white border-b border-gray-200",
            "dark:bg-gray-800 dark:border-gray-700"
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
              "p-2 my-auto rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2 transition-all",
              "text-gray-600 hover:text-gray-800 hover:bg-gray-200",
              "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
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
          "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transition-transform duration-300 ease-in-out border-r",
          "lg:translate-x-0 lg:z-0",
          "bg-white border-gray-200",
          "dark:bg-gray-800 dark:border-gray-700",
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className={cn(
            "flex items-center h-16 px-4 border-b",
            "border-gray-200",
            "dark:border-gray-700"
          )}>
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
                  "ml-auto p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2",
                  "text-gray-600 hover:text-gray-800 hover:bg-gray-200",
                  "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                )}
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6 transition-opacity duration-200" aria-hidden="true" />
              </Button>
            )}
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const isComingSoon = item.name === 'Affiliate Marketplace' // Add this condition based on your item name

              return (
                <div className="relative">
                  <Link
                    key={item.name}
                    href={item.href} // Disable link for coming soon items
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2",
                      isActive
                        ? "bg-orange-50 text-orange-700 border-r-4 border-orange-600 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-400"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700",
                     
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.name}</span>
                  </Link>

                  {isComingSoon && (
                    <span className="absolute -top-1 right-4 inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-[#f9943b] via-[#ff6b35] to-[#ff4757] text-white rounded-full shadow-lg animate-bounce hover:animate-none transition-all duration-500 hover:scale-110 hover:shadow-xl hover:from-[#e8832a] hover:via-[#e85a24] hover:to-[#e83646] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-[#faa94c] before:via-[#ff7c46] before:to-[#ff5868] before:animate-ping before:opacity-30">
                      <span className="relative z-10">Soon</span>
                    </span>
                  )}
                </div>
              )
            })}
          </nav>

          <div className={cn(
            "border-t p-4",
            "border-gray-200",
            "dark:border-gray-700"
          )}>
            <div className="flex items-center justify-between">
              <Button
                onClick={() => handlelogout()}
                variant="ghost"
                className={cn(
                  "justify-start rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2",
                  "text-gray-600 hover:text-gray-800 hover:bg-gray-200",
                  "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                )}
              >
                <LogOut className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">Sign out</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className={cn(
                  "rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400 focus-visible:ring-offset-2",
                  "text-gray-600 hover:text-gray-800 hover:bg-gray-200",
                  "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
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

      {/* Main content */}
      <div
        className={cn(
          "min-h-screen transition-colors duration-300",
          "bg-gray-50",
          "dark:bg-gray-900",
          !isMobile ? 'lg:ml-64' : ''
        )}
      >
        <main
          className={cn(
            "p-6 sm:p-8 lg:p-10 transition-all duration-300",
            "text-gray-900",
            "dark:text-gray-100",
            !isOpen && isMobile ? 'mt-16' : ''
          )}
        >
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 lg:hidden"
          onClick={() => setIsOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
    </div>
  )
}