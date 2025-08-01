'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings, BarChart3 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userImage, setUserImage] = useState('/default-profile.png')
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsLoggedIn(!!token)
      setUserImage(localStorage.getItem('userImage') || '/default-profile.png')
      setUserName(`${user.first_name}` || 'User')
      // console.log(token, 'token')
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0" />
          <span className="text-xl font-bold text-gray-900">Linka.ai</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors duration-200">
            Features
          </Link>
          <Link href="#demo" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors duration-200">
            Demo
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors duration-200">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-orange-50 flex items-center justify-center">
                  <span className="text-lg font-medium text-orange-600">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white rounded-lg shadow-xl border border-gray-100" align="end">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
                    <BarChart3 className="mr-2 h-4 w-4 text-orange-600" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
                    <Settings className="mr-2 h-4 w-4 text-orange-600" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 text-sm font-medium px-4 py-2"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}