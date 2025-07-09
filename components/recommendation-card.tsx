
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ExternalLink, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface RecommendationCardProps {
  title: string
  description: string
  image?: string
  brand?: string
  url: string
  onLinkClick?: () => void
}

export function RecommendationCard({
  title,
  description,
  image,
  brand,
  url,
  onLinkClick
}: RecommendationCardProps) {
  const [qrCode, setQrCode] = useState<string>('')

  useEffect(() => {
    generateQrCode()
  }, [url])

  const generateQrCode = async () => {
    try {
      const response = await fetch('/api/qr-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, size: 200 })
      })
      
      if (response.ok) {
        const { qrCode } = await response.json()
        setQrCode(qrCode)
      }
    } catch (error) {
      console.error('QR generation failed:', error)
    }
  }

  const handleLinkClick = () => {
    onLinkClick?.()
    window.open(url, '_blank')
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-white overflow-hidden">
      <CardContent className="p-0">
        {/* Image Section */}
        {image && (
          <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Brand badge */}
            {brand && (
              <div className="absolute top-3 left-3">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    {brand}
                  </span>
                </div>
              </div>
            )}

            {/* QR Code overlay */}
            {qrCode && (
              <div className="absolute top-3 right-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white border-0"
                    >
                      <QrCode className="w-4 h-4 text-gray-700" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Scan QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-4">
                      <Image
                        src={qrCode}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Scan with your phone to open this link
                    </p>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <Button
              onClick={handleLinkClick}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-9"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Product
            </Button>
            
            <div className="text-xs text-gray-500">
              Tap for details
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
