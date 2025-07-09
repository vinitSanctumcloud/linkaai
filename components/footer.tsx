
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
            <span className="text-lg font-bold text-gray-900">EarnLinks.AI</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-orange-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-orange-600 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          © 2025 EarnLinks.AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
