
'use client'

import Link from 'next/link'
import {  signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings, BarChart3 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
          <span className="text-xl font-bold text-gray-900">Linka.ai</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">
            Features
          </Link>
          <Link href="#demo" className="text-gray-600 hover:text-orange-600 transition-colors">
            Demo
          </Link>
          <Link href="#pricing" className="text-gray-600 hover:text-orange-600 transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {true ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-orange-600 hover:bg-orange-700">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
