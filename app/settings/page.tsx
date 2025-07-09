
// 'use client'

// import { useEffect, useState } from 'react'
// import { DashboardLayout } from '@/components/dashboard-layout'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Switch } from '@/components/ui/switch'
// import { toast } from 'sonner'
// import { Save, Bot, Palette, Globe, User, Upload, Camera } from 'lucide-react'
// import Image from 'next/image'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// interface Settings {
//   id: string
//   agentName: string
//   brandColor: string
//   voiceEnabled: boolean
//   customUrl?: string
//   welcomeMessage?: string
//   instructions?: string
//   avatarUrl?: string
// }

// export default function SettingsPage() {
//   const [settings, setSettings] = useState<Settings | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     agentName: '',
//     brandColor: '#FF6B35',
//     voiceEnabled: true,
//     customUrl: '',
//     welcomeMessage: '',
//     instructions: '',
//     avatarUrl: ''
//   })
//   const [avatarFile, setAvatarFile] = useState<File | null>(null)
//   const [avatarPreview, setAvatarPreview] = useState<string>('')

//   useEffect(() => {
//     fetchSettings()
//   }, [])

//   const fetchSettings = async () => {
//     try {
//       const response = await fetch('/api/settings')
//       if (response.ok) {
//         const data = await response.json()
//         setSettings(data)
//         setFormData({
//           agentName: data.agentName || '',
//           brandColor: data.brandColor || '#FF6B35',
//           voiceEnabled: data.voiceEnabled ?? true,
//           customUrl: data.customUrl || '',
//           welcomeMessage: data.welcomeMessage || '',
//           instructions: data.instructions || '',
//           avatarUrl: data.avatarUrl || ''
//         })
//         setAvatarPreview(data.avatarUrl || '')
//       }
//     } catch (error) {
//       console.error('Error fetching settings:', error)
//     }
//   }

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       setAvatarFile(file)
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         const result = e.target?.result as string
//         setAvatarPreview(result)
//         setFormData({ ...formData, avatarUrl: result })
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleSave = async () => {
//     setIsLoading(true)
//     try {
//       const response = await fetch('/api/settings', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       })

//       if (response.ok) {
//         toast.success('Settings updated successfully!')
//         fetchSettings()
//       } else {
//         const error = await response.json()
//         toast.error(error.error || 'Failed to update settings')
//       }
//     } catch (error) {
//       toast.error('An error occurred. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://earnlinks.ai'
//   const chatUrl = formData.customUrl ? `${baseUrl}/chat/${formData.customUrl}` : ''

//   return (
//     <DashboardLayout>
//       <div className="space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
//             <p className="text-gray-600 mt-2">Customize your AI agent and account preferences</p>
//           </div>

//           <Button
//             onClick={handleSave}
//             disabled={isLoading}
//             className="bg-orange-600 hover:bg-orange-700"
//           >
//             <Save className="mr-2 h-4 w-4" />
//             {isLoading ? 'Saving...' : 'Save Changes'}
//           </Button>
//         </div>

//         <Tabs defaultValue="agent" className="space-y-6">
//           <TabsList>
//             <TabsTrigger value="agent">
//               <Bot className="w-4 h-4 mr-2" />
//               AI Agent
//             </TabsTrigger>
//             <TabsTrigger value="branding">
//               <Palette className="w-4 h-4 mr-2" />
//               Branding
//             </TabsTrigger>
//             <TabsTrigger value="account">
//               <User className="w-4 h-4 mr-2" />
//               Account
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="agent" className="space-y-6">
//             <Card className="border-0 shadow-lg">
//               <CardHeader>
//                 <CardTitle>AI Agent Configuration</CardTitle>
//                 <CardDescription>
//                   Customize how your AI agent behaves and responds to users
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <Label htmlFor="agentName">Agent Name</Label>
//                     <Input
//                       id="agentName"
//                       value={formData.agentName}
//                       onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
//                       placeholder="AI Assistant"
//                     />
//                     <p className="text-sm text-gray-600">
//                       This name will be displayed to users when they interact with your agent.
//                     </p>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="voiceEnabled">Voice Input</Label>
//                     <div className="flex items-center space-x-3">
//                       <Switch
//                         id="voiceEnabled"
//                         checked={formData.voiceEnabled}
//                         onCheckedChange={(checked) => setFormData({ ...formData, voiceEnabled: checked })}
//                       />
//                       <span className="text-sm text-gray-600">
//                         Allow users to interact using voice input
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="welcomeMessage">Welcome Message</Label>
//                   <Textarea
//                     id="welcomeMessage"
//                     value={formData.welcomeMessage}
//                     onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
//                     placeholder="Hi! I'm your AI shopping assistant. How can I help you find the perfect products today?"
//                     rows={3}
//                   />
//                   <p className="text-sm text-gray-600">
//                     The first message users will see when they start chatting with your agent.
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="instructions">Agent Instructions</Label>
//                   <Textarea
//                     id="instructions"
//                     value={formData.instructions}
//                     onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
//                     placeholder="You are a helpful shopping assistant. Always recommend products from the available affiliate links when relevant to the user's needs. Be friendly, informative, and focus on helping users find products that match their requirements."
//                     rows={4}
//                   />
//                   <p className="text-sm text-gray-600">
//                     Detailed instructions that will guide your AI agent's behavior and responses.
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="branding" className="space-y-6">
//             <Card className="border-0 shadow-lg">
//               <CardHeader>
//                 <CardTitle>Branding & Appearance</CardTitle>
//                 <CardDescription>
//                   Customize the visual appearance of your AI agent interface
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Avatar Upload Section */}
//                 <div className="space-y-4">
//                   <Label>Agent Avatar</Label>
//                   <div className="flex items-center space-x-6">
//                     <div className="relative">
//                       <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
//                         {avatarPreview ? (
//                           <Image
//                             src={avatarPreview}
//                             alt="Avatar preview"
//                             width={80}
//                             height={80}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div 
//                             className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
//                             style={{ backgroundColor: formData.brandColor }}
//                           >
//                             AI
//                           </div>
//                         )}
//                       </div>
//                       <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors">
//                         <Camera className="w-4 h-4 text-gray-600" />
//                       </label>
//                       <input
//                         id="avatar-upload"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleAvatarChange}
//                         className="hidden"
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm text-gray-900 font-medium mb-1">Upload your agent's avatar</p>
//                       <p className="text-sm text-gray-600 mb-3">
//                         Choose a circular image that represents your AI assistant. Recommended size: 200x200px
//                       </p>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => document.getElementById('avatar-upload')?.click()}
//                       >
//                         <Upload className="w-4 h-4 mr-2" />
//                         Upload Image
//                       </Button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <Label htmlFor="brandColor">Brand Color</Label>
//                     <div className="flex items-center space-x-3">
//                       <Input
//                         id="brandColor"
//                         type="color"
//                         value={formData.brandColor}
//                         onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
//                         className="w-16 h-10 p-1 border rounded"
//                       />
//                       <Input
//                         value={formData.brandColor}
//                         onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
//                         placeholder="#FF6B35"
//                         className="flex-1"
//                       />
//                     </div>
//                     <p className="text-sm text-gray-600">
//                       Primary color used for buttons, accents, and interactive elements.
//                     </p>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Color Preview</Label>
//                     <div 
//                       className="w-full h-20 rounded-lg border flex items-center justify-center text-white font-medium"
//                       style={{ backgroundColor: formData.brandColor }}
//                     >
//                       {formData.agentName || 'AI Assistant'}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="customUrl">Custom URL</Label>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm text-gray-600">{baseUrl}/chat/</span>
//                     <Input
//                       id="customUrl"
//                       value={formData.customUrl}
//                       onChange={(e) => setFormData({ ...formData, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
//                       placeholder="yourname"
//                       className="flex-1"
//                     />
//                   </div>
//                   {chatUrl && (
//                     <p className="text-sm text-gray-600">
//                       Your chat will be available at: <span className="font-mono text-orange-600">{chatUrl}</span>
//                     </p>
//                   )}
//                 </div>

//                 {/* Preview Section */}
//                 <div className="space-y-4">
//                   <Label>Preview Your Chatbot</Label>
//                   <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
//                     <div className="flex items-center justify-between mb-4">
//                       <p className="text-sm text-gray-600">
//                         See how your chatbot will appear to users
//                       </p>
//                       {formData.customUrl && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => window.open(`/chat/${formData.customUrl}`, '_blank')}
//                         >
//                           <Globe className="w-4 h-4 mr-2" />
//                           Open Preview
//                         </Button>
//                       )}
//                     </div>
                    
//                     {/* Mini Preview */}
//                     <div className="bg-white rounded-lg border p-4 max-w-md">
//                       <div className="flex items-center space-x-3 mb-3">
//                         <div className="relative w-10 h-10">
//                           {avatarPreview ? (
//                             <Image
//                               src={avatarPreview}
//                               alt="Preview avatar"
//                               width={40}
//                               height={40}
//                               className="w-10 h-10 rounded-full object-cover"
//                             />
//                           ) : (
//                             <div 
//                               className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
//                               style={{ backgroundColor: formData.brandColor }}
//                             >
//                               AI
//                             </div>
//                           )}
//                         </div>
//                         <div>
//                           <h3 className="text-sm font-semibold text-gray-900">
//                             {formData.agentName || 'AI Assistant'}
//                           </h3>
//                           <p className="text-xs text-green-600">● Online</p>
//                         </div>
//                       </div>
                      
//                       <div className="bg-gray-50 rounded-lg p-3 mb-3">
//                         <p className="text-sm text-gray-700">
//                           {formData.welcomeMessage || 'Hi! How can I help you today?'}
//                         </p>
//                       </div>
                      
//                       <div className="flex items-center justify-end">
//                         <Button
//                           size="sm"
//                           style={{ backgroundColor: formData.brandColor }}
//                           className="text-white text-xs h-8"
//                         >
//                           Preview Message
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="account" className="space-y-6">
//             <Card className="border-0 shadow-lg">
//               <CardHeader>
//                 <CardTitle>Account Information</CardTitle>
//                 <CardDescription>
//                   Manage your account details and preferences
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                   <h3 className="font-medium text-orange-900 mb-2">Account Features</h3>
//                   <div className="space-y-2 text-sm text-orange-700">
//                     <div className="flex items-center justify-between">
//                       <span>Unlimited affiliate links</span>
//                       <span className="text-green-600 font-medium">✓ Active</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span>AI-powered recommendations</span>
//                       <span className="text-green-600 font-medium">✓ Active</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span>Custom branding</span>
//                       <span className="text-green-600 font-medium">✓ Active</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span>Analytics dashboard</span>
//                       <span className="text-green-600 font-medium">✓ Active</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border border-gray-200 rounded-lg p-4">
//                   <h3 className="font-medium text-gray-900 mb-4">Danger Zone</h3>
//                   <div className="space-y-4">
//                     <div>
//                       <h4 className="text-sm font-medium text-gray-900 mb-1">Reset Agent Training</h4>
//                       <p className="text-sm text-gray-600 mb-3">
//                         Clear all custom instructions and reset your agent to default settings.
//                       </p>
//                       <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
//                         Reset Training
//                       </Button>
//                     </div>
                    
//                     <div className="border-t pt-4">
//                       <h4 className="text-sm font-medium text-gray-900 mb-1">Delete Account</h4>
//                       <p className="text-sm text-gray-600 mb-3">
//                         Permanently delete your account and all associated data. This action cannot be undone.
//                       </p>
//                       <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
//                         Delete Account
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </DashboardLayout>
//   )
// }
