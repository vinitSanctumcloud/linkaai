'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Save, Bot, Palette, Globe, User, Upload, Camera, Download, Badge, CreditCard, Key, EyeOff, Eye, CheckCircle2, Circle, AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { jsPDF } from 'jspdf'
import { Progress } from '@radix-ui/react-progress'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger, AlertDialogAction, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog'

interface Settings {
  id: string
  agentName: string
  brandColor: string
  voiceEnabled: boolean
  customUrl?: string
  welcomeMessage?: string
  instructions?: string
  avatarUrl?: string
}

interface BillingItem {
  date: string
  invoice: string
  period: string
  amount: string
  status: string
  download: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false) // Added for account deletion loading state
  const [formData, setFormData] = useState({
    agentName: '',
    brandColor: '#FF6B35',
    voiceEnabled: true,
    customUrl: '',
    welcomeMessage: '',
    instructions: '',
    avatarUrl: '',
    newPassword: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [email, setEmail] = useState('user@example.com')
  const [phone, setPhone] = useState('+1 234-567-8900')
  const [isEmailVerified, setIsEmailVerified] = useState(true)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [currentPasswordError, setCurrentPasswordError] = useState('') // Added for error handling
  const [confirmPasswordError, setConfirmPasswordError] = useState('') // Added for error handling

  useEffect(() => {
    fetchSettings()
  }, [])

  // Calculate password strength whenever newPassword changes
  useEffect(() => {
    const calculatePasswordStrength = () => {
      let strength = 0
      if (formData.newPassword.length >= 8) strength += 1
      if (/[A-Z]/.test(formData.newPassword)) strength += 1
      if (/[0-9]/.test(formData.newPassword)) strength += 1
      if (/[^A-Za-z0-9]/.test(formData.newPassword)) strength += 1
      setPasswordStrength(strength)
    }
    calculatePasswordStrength()
  }, [formData.newPassword])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setFormData({
          agentName: data.agentName || '',
          brandColor: data.brandColor || '#FF6B35',
          voiceEnabled: data.voiceEnabled ?? true,
          customUrl: data.customUrl || '',
          welcomeMessage: data.welcomeMessage || '',
          instructions: data.instructions || '',
          avatarUrl: data.avatarUrl || '',
          newPassword: ''
        })
        setAvatarPreview(data.avatarUrl || '')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings. Please try again.')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setFormData({ ...formData, avatarUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Settings updated successfully!')
        fetchSettings()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update settings')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Please enter a valid email address.')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      })
      if (response.ok) {
        setEmail(newEmail)
        setIsEmailVerified(false)
        setIsEmailModalOpen(false)
        setNewEmail('')
        toast.success('Email updated successfully! Please verify your new email.')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update email')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneChange = async () => {
    if (!newPhone || !/^\+?[1-9]\d{1,14}$/.test(newPhone)) {
      toast.error('Please enter a valid phone number.')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/change-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone })
      })
      if (response.ok) {
        setPhone(newPhone)
        setIsPhoneVerified(false)
        setIsPhoneModalOpen(false)
        setNewPhone('')
        toast.success('Phone number updated successfully! Please verify your new phone number.')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update phone number')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyEmail = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (response.ok) {
        setIsEmailVerified(true)
        toast.success('Verification email sent! Please check your inbox.')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send verification email')
      }
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPhone = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      if (response.ok) {
        setIsPhoneVerified(true)
        toast.success('Verification code sent to your phone!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send verification code')
      }
    } catch (error) {
      toast.error('Failed to send verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPasswordError('')
    setConfirmPasswordError('')

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required')
      return
    }
    if (formData.newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }
    if (passwordStrength < 3) {
      setConfirmPasswordError('Password must be at least 8 characters and include an uppercase letter and a number')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword: formData.newPassword
        })
      })

      if (response.ok) {
        toast.success('Password updated successfully!')
        setCurrentPassword('')
        setFormData({ ...formData, newPassword: '' })
        setConfirmPassword('')
        setPasswordStrength(0)
      } else {
        const error = await response.json()
        if (error.error.includes('current password')) {
          setCurrentPasswordError(error.error)
        } else {
          setConfirmPasswordError(error.error || 'Failed to update password')
        }
      }
    } catch (error) {
      setConfirmPasswordError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      if (response.ok) {
        toast.success('Session revoked successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to revoke session')
      }
    } catch (error) {
      toast.error('An error occurred while revoking the session.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataExport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        toast.success('Data export request sent! You will receive an email with your data.')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to request data export')
      }
    } catch (error) {
      toast.error('An error occurred while requesting data export.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetTraining = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reset-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        toast.success('Agent training reset successfully!')
        fetchSettings()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reset agent training')
      }
    } catch (error) {
      toast.error('An error occurred while resetting agent training.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clear-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        toast.success('Chat history cleared successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to clear chat history')
      }
    } catch (error) {
      toast.error('An error occurred while clearing chat history.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountDeletion = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        toast.success('Account deletion request sent. You will be logged out.')
        // Redirect to logout or home page
        window.location.href = '/logout'
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete account')
      }
    } catch (error) {
      toast.error('An error occurred while deleting account.')
    } finally {
      setIsDeleting(false)
    }
  }

  const generatePDF = (item: BillingItem) => {
    const doc = new jsPDF();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`California Hispanic Invoice - ${formData.agentName || 'AI Assistant'}`, 105, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Invoice Details
    const currentDate = new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text('Item: Tokens', 20, 50);
    doc.text('Purchase Amount: 25 Tokens', 20, 60);
    doc.text('Number of Tokens: 25', 20, 70);
    doc.text(`Purchase Date: ${currentDate}`, 20, 80);
    doc.text(`Transaction ID: ${item.invoice}`, 20, 90);
    doc.text('Customer ID: [Stripe Customer ID]', 20, 100);

    // Billing Details
    doc.setFont('helvetica', 'bold');
    doc.text('Billing Information', 20, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Billing Period: ${item.period}`, 20, 130);
    doc.text('Card: xxx-xxxx-xxxx-4242', 20, 140);
    doc.text('Expires: 4/2024', 20, 150);
    doc.text('Card Holder: Card Holder Name', 20, 160);

    // Billing History Table
    doc.setFont('helvetica', 'bold');
    doc.text('Billing History', 20, 180);
    doc.setFont('helvetica', 'normal');

    // Table configuration
    const startY = 190;
    const rowHeight = 10;
    const colWidths = [25, 50, 60, 30];
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const headers = ['Date', 'Invoice Number', 'Billing Period', 'Amount'];
    const data = [[item.date, item.invoice, item.period, item.amount]];

    // Draw table header
    doc.setFillColor(200, 200, 200);
    doc.rect(20, startY, totalWidth, rowHeight, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let x = 20;
    headers.forEach((header, i) => {
      doc.text(header, x + 2, startY + 7);
      x += colWidths[i];
    });

    // Draw table borders (header)
    x = 20;
    doc.setLineWidth(0.5);
    for (let i = 0; i <= headers.length; i++) {
      doc.line(x, startY, x, startY + rowHeight);
      x += colWidths[i] || 0;
    }
    doc.line(20, startY, 20 + totalWidth, startY);
    doc.line(20, startY + rowHeight, 20 + totalWidth, startY + rowHeight);

    // Draw table rows
    doc.setFont('helvetica', 'normal');
    data.forEach((row, rowIndex) => {
      x = 20;
      const y = startY + (rowIndex + 1) * rowHeight;
      row.forEach((cell, colIndex) => {
        doc.text(cell, x + 2, y + 7);
        x += colWidths[colIndex];
      });
      x = 20;
      for (let i = 0; i <= headers.length; i++) {
        doc.line(x, y, x, y + rowHeight);
        x += colWidths[i] || 0;
      }
      doc.line(20, y, 20 + totalWidth, y);
    });

    // Draw bottom line of the last row
    const finalY = startY + (data.length + 1) * rowHeight;
    doc.line(20, finalY, 20 + totalWidth, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('California Hispanic LLC', 20, 280);
    doc.text('Contact: support@californiahispanic.com | Phone: (555) 123-4567', 20, 285);

    doc.save(`invoice_${item.invoice}.pdf`);
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://earnlinks.ai'
  const chatUrl = formData.customUrl ? `${baseUrl}/chat/${formData.customUrl}` : ''

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Customize your AI agent and account preferences</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="agent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="agent">
              <Palette className="w-4 h-4 mr-2" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <User className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="verification">
              <User className="w-4 h-4 mr-2" />
              Phone & Email Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Email Verification</CardTitle>
                  <CardDescription>Manage and verify your email address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{email}</p>
                    <span className={`text-sm font-medium ${isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    {!isEmailVerified && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleVerifyEmail}
                        disabled={isLoading}
                      >
                        Verify Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setIsEmailModalOpen(true)}
                    >
                      Change Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Phone Verification</CardTitle>
                  <CardDescription>Manage and verify your phone number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{phone}</p>
                    <span className={`text-sm font-medium ${isPhoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {isPhoneVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    {!isPhoneVerified && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleVerifyPhone}
                        disabled={isLoading}
                      >
                        Verify Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setIsPhoneModalOpen(true)}
                    >
                      Change Phone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Change Modal */}
            {isEmailModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="border-0 shadow-lg w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Change Email</CardTitle>
                    <CardDescription>Enter your new email address</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newEmail">New Email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsEmailModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={handleEmailChange}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Phone Change Modal */}
            {isPhoneModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="border-0 shadow-lg w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Change Phone</CardTitle>
                    <CardDescription>Enter your new phone number</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newPhone">New Phone Number</Label>
                      <Input
                        id="newPhone"
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Enter new phone number"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsPhoneModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={handlePhoneChange}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscription" className="space-y-8">
            {/* Three Boxes in Single Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subscription Status Box */}
              <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    Subscription
                    <Badge fontVariant="outline" className="border-green-200 bg-green-50 text-green-600 text-xs">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <p className="text-base font-medium text-gray-800">Premium Monthly</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Billing</p>
                    <p className="text-base font-medium text-gray-800">Dec 10, 2023</p>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      Manage Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Token Balance Box */}
              <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">Token Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Available Tokens</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-600">20</span>
                      <span className="text-sm text-gray-500">/ 150</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <Progress value={(20 / 150) * 100} className="h-2 bg-gray-100" />
                  </div>
                  <div className="pt-8">
                    <Button variant="outline" size="sm" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      View Usage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Details Box */}
              <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Card Ending</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <p className="text-base font-medium text-gray-800">•••• 4242</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="text-base font-medium text-gray-800">04/2024</p>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      Update Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Token Purchase Section */}
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-800">Purchase More Tokens</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">25 Tokens</h3>
                      <p className="text-sm text-gray-500">Perfect for light users</p>
                      <p className="text-xl font-bold text-gray-900">$20.00</p>
                      <p className="text-xs text-gray-500">$0.80 per token</p>
                      <Button className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-white">
                        Select
                      </Button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors relative">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                      POPULAR
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">50 Tokens</h3>
                      <p className="text-sm text-gray-500">Best value for most users</p>
                      <p className="text-xl font-bold text-gray-900">$35.00</p>
                      <p className="text-xs text-gray-500">$0.70 per token</p>
                      <Button className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-white">
                        Select
                      </Button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">100 Tokens</h3>
                      <p className="text-sm text-gray-500">For power users</p>
                      <p className="text-xl font-bold text-gray-900">$60.00</p>
                      <p className="text-xs text-gray-500">$0.60 per token</p>
                      <Button className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-white">
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing History Section */}
            <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-800">Billing History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        {
                          date: 'Nov 10, 2023',
                          invoice: 'INV-2023-11-001',
                          period: 'Oct 10 - Nov 10, 2023',
                          amount: '$5.00 USD',
                          status: 'Paid',
                          download: true
                        },
                        {
                          date: 'Oct 10, 2023',
                          invoice: 'INV-2023-10-001',
                          period: 'Sep 10 - Oct 10, 2023',
                          amount: '$5.00 USD',
                          status: 'Paid',
                          download: true
                        },
                        {
                          date: 'Sep 10, 2023',
                          invoice: 'INV-2023-09-001',
                          period: 'Aug 10 - Sep 10, 2023',
                          amount: '$5.00 USD',
                          status: 'Paid',
                          download: true
                        }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.invoice}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.period}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge fontVariant="outline" className="border-green-200 bg-green-50 text-green-600">
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => generatePDF(item)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">24</span> entries
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="border-gray-300">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 bg-gray-100">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      3
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agent" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Branding & Appearance</CardTitle>
                <CardDescription>
                  Customize the visual appearance of your AI agent interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brandColor">Brand Color</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="brandColor"
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.brandColor}
                        onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                        placeholder="#FF6B35"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Primary color used for buttons, accents, and interactive elements.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Preview</Label>
                    <div
                      className="w-full h-20 rounded-lg border flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: formData.brandColor }}
                    >
                      {formData.agentName || 'AI Assistant'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customUrl">Custom URL</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{baseUrl}/chat/</span>
                    <Input
                      id="customUrl"
                      value={formData.customUrl}
                      onChange={(e) => setFormData({ ...formData, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                      placeholder="yourname"
                      className="flex-1"
                    />
                  </div>
                  {chatUrl && (
                    <p className="text-sm text-gray-600">
                      Your chat will be available at: <span className="font-mono text-orange-600">{chatUrl}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Account Features */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">Account Features</h3>
                  <div className="space-y-2 text-sm text-orange-700">
                    <div className="flex items-center justify-between">
                      <span>Unlimited affiliate links</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI-powered recommendations</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Custom branding</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Advanced analytics dashboard</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Priority support</span>
                      <span className="text-blue-600 font-medium">Upgrade available</span>
                    </div>
                  </div>
                </div>

                {/* Side by side sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Password Change Section */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-full bg-blue-50">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">Password & Security</h3>
                        <p className="text-sm text-gray-500">Protect your account with a strong password</p>
                      </div>
                    </div>

                    <form className="space-y-5" onSubmit={handlePasswordChange}>
                      <div className="space-y-3">
                        <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center justify-between">
                          Current Password
                          {currentPasswordError && (
                            <span className="text-red-500 text-xs">{currentPasswordError}</span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrent ? "text" : "password"}
                            placeholder="Enter your current password"
                            className="pr-10"
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setCurrentPasswordError('');
                            }}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowCurrent(!showCurrent)}
                            aria-label={showCurrent ? "Hide password" : "Show password"}
                          >
                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNew ? "text" : "password"}
                            placeholder="Create a new password (min 8 characters)"
                            className="pr-10"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowNew(!showNew)}
                            aria-label={showNew ? "Hide password" : "Show password"}
                          >
                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 rounded-full ${passwordStrength >= i ? "bg-green-500" : "bg-gray-200"}`}
                            ></div>
                          ))}
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1 mt-2">
                          <li className="flex items-center">
                            {formData.newPassword.length >= 8 ? (
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1 text-gray-300" />
                            )}
                            At least 8 characters
                          </li>
                          <li className="flex items-center">
                            {/[A-Z]/.test(formData.newPassword) ? (
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1 text-gray-300" />
                            )}
                            Contains uppercase letter
                          </li>
                          <li className="flex items-center">
                            {/[0-9]/.test(formData.newPassword) ? (
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1 text-gray-300" />
                            )}
                            Contains number
                          </li>
                          <li className="flex items-center">
                            {/[^A-Za-z0-9]/.test(formData.newPassword) ? (
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1 text-gray-300" />
                            )}
                            Contains special character
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center justify-between">
                          Confirm New Password
                          {confirmPasswordError && (
                            <span className="text-red-500 text-xs">{confirmPasswordError}</span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Re-enter your new password"
                            className="pr-10"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setConfirmPasswordError('');
                            }}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirm(!showConfirm)}
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isLoading || passwordStrength < 3 || !currentPassword || !confirmPassword}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </div>
                        ) : 'Update Password'}
                      </Button>
                    </form>
                  </div>

                  {/* Comprehensive Danger Zone Section */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-full bg-red-50">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">Account Actions</h3>
                        <p className="text-sm text-gray-500">Critical actions with permanent consequences</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Reset Options */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Reset Options</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Reset Agent Training</p>
                            <p className="text-sm text-gray-600 mb-2">
                              Clear all custom instructions and reset your AI agent to factory settings.
                            </p>
                            <Button
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={handleResetTraining}
                              disabled={isLoading}
                            >
                              Reset Training Data
                            </Button>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Clear All History</p>
                            <p className="text-sm text-gray-600 mb-2">
                              Permanently delete your chat history and interaction logs.
                            </p>
                            <Button
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={handleClearHistory}
                              disabled={isLoading}
                            >
                              Clear History
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Account Deletion */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Delete Account</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Permanently remove your account and all associated data from our systems. This action is irreversible.
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              disabled={isLoading || isDeleting}
                            >
                              Delete My Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleAccountDeletion}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <div className="flex items-center">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </div>
                                ) : 'Delete Account'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}