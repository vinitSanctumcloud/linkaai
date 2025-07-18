'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Upload, Bot, Plus, X, Save, Send, Mic, Eye, ArrowLeft, ArrowRight, Edit, Trash2, GitBranch, MessageSquare, InfoIcon, LinkIcon, Link2, ImageIcon, Share2 } from 'lucide-react'
import { toast } from 'sonner'

// Interfaces remain unchanged
interface ConditionalPrompt {
  id: string
  mainPrompt: string
  option1: { label: string; followUps: string[] }
  option2: { label: string; followUps: string[] }
}

interface PartnerLink {
  id: string
  category: string
  affiliateBrandName: string
  affiliateLink: string
  productReview?: string
  socialMediaLink?: string
  affiliateimage?: affiliateimage
}

interface affiliateimage {
  name?: string
}

interface LinkaProMonetization {
  id: string
  category: string
  affiliateBrandName: string
  mainUrl: string
  mainimage?: mainimage
}

interface mainimage {
  name?: string
}

interface AgentConfig {
  name: string
  trainingInstructions: string
  greeting: string
  prompts: string[]
  partnerLinks: PartnerLink[]
  linkaProMonetizations: LinkaProMonetization[]
  conditionalPrompts: ConditionalPrompt[]
  useConditionalPrompts: boolean
  greetingVideo: string | null
  greetingTitle: string
  greetingImage: string | null
}

export default function AgentBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'partner' | 'aipro'>('partner')
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    trainingInstructions: '',
    greeting: '',
    prompts: ['', '', '', ''],
    partnerLinks: [],
    linkaProMonetizations: [],
    // partnerLinks: [
    //   { id: '1', category: 'Travel', affiliateBrandName: 'TripAdvisor', affiliateLink: 'https://tripadvisor.com', productReview: 'Great travel reviews', socialMediaLink: 'https://twitter.com/tripadvisor', affiliateimage: { name: 'travel.jpg' } },
    //   { id: '2', category: 'Fashion', affiliateBrandName: 'Zara', affiliateLink: 'https://zara.com', productReview: 'Stylish clothing', socialMediaLink: 'https://instagram.com/zara', affiliateimage: { name: 'fashion.jpg' } }
    // ],
    // linkaProMonetizations: [
    //   { id: '1', category: 'Tech', affiliateBrandName: 'Apple', mainUrl: 'https://apple.com', mainimage: { name: 'tech.jpg' } },
    //   { id: '2', category: 'Fitness', affiliateBrandName: 'Nike', mainUrl: 'https://nike.com', mainimage: { name: 'fitness.jpg' } }
    // ],
    conditionalPrompts: [],
    useConditionalPrompts: false,
    greetingTitle: '',
    greetingVideo: null,
    greetingImage: null
  })

  // Conditional prompt modal states
  const [isConditionalModalOpen, setIsConditionalModalOpen] = useState(false)
  const [editingConditionalPrompt, setEditingConditionalPrompt] = useState<ConditionalPrompt | null>(null)
  const [conditionalForm, setConditionalForm] = useState<ConditionalPrompt>({
    id: '',
    mainPrompt: '',
    option1: { label: '', followUps: ['', '', ''] },
    option2: { label: '', followUps: ['', '', ''] }
  })

  // Monetization modal state
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false)

  const steps = [
    { id: 1, title: 'Greeting Media', description: 'Upload image or video and create opening message' },
    { id: 2, title: 'AI Training', description: 'Name your agent and provide training instructions' },
    { id: 3, title: 'Prompts', description: 'Design conversation starters and branching logic' },
    { id: 4, title: 'Monetization', description: 'Add your affiliate links and monetization options' },
    { id: 5, title: 'Preview & Test', description: 'Test your AI agent' }
  ]

  // Conditional prompt handlers (unchanged)
  const openConditionalModal = (prompt?: ConditionalPrompt) => {
    if (prompt) {
      setEditingConditionalPrompt(prompt)
      setConditionalForm(prompt)
    } else {
      setEditingConditionalPrompt(null)
      setConditionalForm({
        id: Date.now().toString(),
        mainPrompt: '',
        option1: { label: '', followUps: ['', '', ''] },
        option2: { label: '', followUps: ['', '', ''] }
      })
    }
    setIsConditionalModalOpen(true)
  }

  const saveConditionalPrompt = () => {
    if (!conditionalForm.mainPrompt.trim() || !conditionalForm.option1.label.trim() || !conditionalForm.option2.label.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setAgentConfig(prev => {
      const newConditionalPrompts = editingConditionalPrompt
        ? prev.conditionalPrompts.map(p => p.id === editingConditionalPrompt.id ? conditionalForm : p)
        : [...prev.conditionalPrompts, conditionalForm]
      return { ...prev, conditionalPrompts: newConditionalPrompts }
    })

    setIsConditionalModalOpen(false)
    toast.success(editingConditionalPrompt ? 'Conditional prompt updated!' : 'Conditional prompt added!')
  }

  const deleteConditionalPrompt = (id: string) => {
    setAgentConfig(prev => ({
      ...prev,
      conditionalPrompts: prev.conditionalPrompts.filter(p => p.id !== id)
    }))
    toast.success('Conditional prompt deleted!')
  }

  const updateConditionalForm = (field: string, value: any) => {
    setConditionalForm(prev => ({ ...prev, [field]: value }))
  }

  const updateConditionalOption = (option: 'option1' | 'option2', field: 'label' | 'followUps', value: any) => {
    setConditionalForm(prev => ({
      ...prev,
      [option]: { ...prev[option], [field]: value }
    }))
  }

  const handleInputChange = (field: keyof AgentConfig, value: any) => {
    setAgentConfig(prev => ({ ...prev, [field]: value }))
  }

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...agentConfig.prompts]
    newPrompts[index] = value
    setAgentConfig(prev => ({ ...prev, prompts: newPrompts }))
  }

  const addPartnerLink = () => {
    setAgentConfig(prev => ({
      ...prev,
      partnerLinks: [
        ...prev.partnerLinks,
        {
          id: Date.now().toString(),
          category: '',
          affiliateBrandName: '',
          affiliateLink: '',
          productReview: '',
          socialMediaLink: '',
          affiliateimage: undefined
        }
      ]
    }))
  }

  const updatePartnerLink = (id: string, field: string, value: string | File | null) => {
    setAgentConfig((prevConfig) => ({
      ...prevConfig,
      partnerLinks: prevConfig.partnerLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    }))
  }

  const removePartnerLink = (id: string) => {
    setAgentConfig(prev => ({
      ...prev,
      partnerLinks: prev.partnerLinks.filter(link => link.id !== id)
    }))
    toast.success('Partner link removed!')
  }

  const addLinkaProMonetization = () => {
    setAgentConfig(prev => ({
      ...prev,
      linkaProMonetizations: [...prev.linkaProMonetizations, { id: Date.now().toString(), category: '', affiliateBrandName: '', mainUrl: '', mainimage: undefined }]
    }))
  }

  const updateLinkaProMonetization = (id: string, field: keyof LinkaProMonetization, value: string | File | null) => {
    setAgentConfig(prev => ({
      ...prev,
      linkaProMonetizations: prev.linkaProMonetizations.map(link => link.id === id ? { ...link, [field]: value } : link)
    }))
  }

  const removeLinkaProMonetization = (id: string) => {
    setAgentConfig(prev => ({
      ...prev,
      linkaProMonetizations: prev.linkaProMonetizations.filter(link => link.id !== id)
    }))
    toast.success('Linka Pro Monetization removed!')
  }
  
  const handleGreetingMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0]
    if (!file) {
      toast.error('No file selected.')
      return
    }

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      toast.error('No access token found. Please log in.')
      return
    }

    if (type === 'image') {
      if (!file.type.includes('image')) {
        toast.error('Please select a valid image file.')
        return
      }

      const maxSize = 5 * 1024 * 1024 // 5MB for image
      if (file.size > maxSize) {
        toast.error('Image file size exceeds 5MB limit.')
        return
      }

      const formData = new FormData()
      formData.append('images[]', file)
      formData.append('upload_path', 'ai_agent')

      try {
        const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/upload/image', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          const imageUrl = data.url // Adjust based on actual API response structure
          if (!imageUrl) {
            toast.error('No image URL returned from the server.')
            return
          }

          setAgentConfig((prev) => ({
            ...prev,
            greetingImage: imageUrl,
            greetingVideo: null // Clear video if image is uploaded
          }))
          toast.success('Image uploaded successfully!')
        } else {
          const errorData = await response.json()
          toast.error(`Failed to upload image: ${errorData.message || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('An error occurred while uploading the image. Please try again.')
      }
    } else if (type === 'video') {
      if (!file.type.includes('video')) {
        toast.error('Please select a valid video file.')
        return
      }

      const validFormats = ['video/mp4', 'video/webm', 'video/ogg']
      if (!validFormats.includes(file.type)) {
        toast.error('Unsupported video format. Please use MP4, WebM, or OGG.')
        return
      }

      const maxSize = 10 * 1024 * 1024 // 10MB for video
      if (file.size > maxSize) {
        toast.error('Video file size exceeds 10MB limit.')
        return
      }

      const formData = new FormData()
      formData.append('video', file)

      try {
        const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/upload/video', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          const videoUrl = data.url // Adjust based on actual API response structure
          if (!videoUrl) {
            toast.error('No video URL returned from the server.')
            return
          }

          setAgentConfig((prev) => ({
            ...prev,
            greetingVideo: videoUrl,
            greetingImage: null // Clear image if video is uploaded
          }))
          toast.success('Video uploaded successfully!')
        } else {
          const errorData = await response.json()
          toast.error(`Failed to upload video: ${errorData.message || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error uploading video:', error)
        toast.error('An error occurred while uploading the video. Please try again.')
      }
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agentConfig.name,
          trainingInstructions: agentConfig.trainingInstructions,
          agentGreeting: agentConfig.greeting,
          agentPrompts: agentConfig.useConditionalPrompts ? [] : agentConfig.prompts.filter(p => p.trim()),
          conditionalPrompts: agentConfig.useConditionalPrompts ? agentConfig.conditionalPrompts : [],
          partnerLinks: agentConfig.partnerLinks.filter(link => link.affiliateLink.trim() !== ''),
          linkaProMonetizations: agentConfig.linkaProMonetizations.filter(link => link.mainUrl.trim() !== ''),
          greetingTitle: agentConfig.greetingTitle,
          greetingImage: agentConfig.greetingImage,
          greetingVideo: agentConfig.greetingVideo
        }),
      })

      if (response.ok) {
        toast.success('AI Agent saved successfully!')
      } else {
        toast.error('Failed to save AI Agent')
      }
    } catch (error) {
      toast.error('An error occurred while saving')
    }
  }

  const nextStep = async () => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }

    try {
      let response
      let payload
      let apiUrl

      switch (currentStep) {
        case 1:
          if (!agentConfig.greetingTitle.trim()) {
            toast.error('Please provide a greeting title.')
            return
          }
          if (!agentConfig.greeting.trim()) {
            toast.error('Please provide a welcome greeting.')
            return
          }
          apiUrl = 'https://api.tagwell.co/api/v4/ai-agent/create-agent'
          payload = {
            greeting_media_type: agentConfig.greetingVideo ? 'video' : 'image',
            greeting_title: agentConfig.greetingTitle,
            welcome_greeting: agentConfig.greeting,
            greeting_image_url: agentConfig.greetingImage,
            greeting_video_url: agentConfig.greetingVideo
          }
          break

        case 2:
          if (!agentConfig.name.trim()) {
            toast.error('Please provide an agent name.')
            return
          }
          if (!agentConfig.trainingInstructions.trim()) {
            toast.error('Please provide training instructions.')
            return
          }

          apiUrl = 'https://api.tagwell.co/api/v4/ai-agent/add-agent-details'
          payload = {
            agent_name: agentConfig.name,
            training_instructions: agentConfig.trainingInstructions
          }
          break

        case 3:
          if (!agentConfig.useConditionalPrompts && agentConfig.prompts.every((prompt) => !prompt.trim())) {
            toast.error('Please add at least one non-empty prompt or enable conditional prompts.')
            return
          }
          if (agentConfig.useConditionalPrompts && agentConfig.conditionalPrompts.length === 0) {
            toast.error('Please add at least one conditional prompt.')
            return
          }

          apiUrl = 'https://api.tagwell.co/api/v4/ai-agent/add-prompts'
          payload = {
            prompts: agentConfig.useConditionalPrompts
              ? agentConfig.conditionalPrompts.map((cp) => cp.mainPrompt).filter((p) => p.trim())
              : agentConfig.prompts.filter((p) => p.trim())
          }
          break

        case 4:
          if (
            agentConfig.partnerLinks.length === 0 &&
            agentConfig.linkaProMonetizations.length === 0
          ) {
            toast.warning('No monetization links added. You can skip this step if not needed.')
          }

          apiUrl = '/api/settings'
          payload = {
            agentName: agentConfig.name,
            trainingInstructions: agentConfig.trainingInstructions,
            agentGreeting: agentConfig.greeting,
            agentPrompts: agentConfig.useConditionalPrompts
              ? []
              : agentConfig.prompts.filter((p) => p.trim()),
            conditionalPrompts: agentConfig.useConditionalPrompts ? agentConfig.conditionalPrompts : [],
            partnerLinks: agentConfig.partnerLinks.filter((link) => link.affiliateLink.trim() !== ''),
            linkaProMonetizations: agentConfig.linkaProMonetizations.filter(
              (link) => link.mainUrl.trim() !== ''
            ),
            greetingTitle: agentConfig.greetingTitle,
            greetingImage: agentConfig.greetingImage,
            greetingVideo: agentConfig.greetingVideo
          }
          break

        case 5:
          if (!agentConfig.greetingTitle.trim() || !agentConfig.greeting.trim()) {
            toast.error('Please complete Step 1: Greeting Media.')
            return
          }
          if (!agentConfig.greetingImage && !agentConfig.greetingVideo) {
            toast.error('Please upload either an image or a video in Step 1.')
            return
          }
          if (!agentConfig.name.trim() || !agentConfig.trainingInstructions.trim()) {
            toast.error('Please complete Step 2: AI Training.')
            return
          }
          if (
            !agentConfig.useConditionalPrompts &&
            agentConfig.prompts.every((prompt) => !prompt.trim())
          ) {
            toast.error('Please add at least one non-empty prompt in Step 3.')
            return
          }
          if (agentConfig.useConditionalPrompts && agentConfig.conditionalPrompts.length === 0) {
            toast.error('Please add at least one conditional prompt in Step 3.')
            return
          }

          apiUrl = '/api/settings'
          payload = {
            agentName: agentConfig.name,
            trainingInstructions: agentConfig.trainingInstructions,
            agentGreeting: agentConfig.greeting,
            agentPrompts: agentConfig.useConditionalPrompts
              ? []
              : agentConfig.prompts.filter((p) => p.trim()),
            conditionalPrompts: agentConfig.useConditionalPrompts ? agentConfig.conditionalPrompts : [],
            partnerLinks: agentConfig.partnerLinks.filter((link) => link.affiliateLink.trim() !== ''),
            linkaProMonetizations: agentConfig.linkaProMonetizations.filter(
              (link) => link.mainUrl.trim() !== ''
            ),
            greetingTitle: agentConfig.greetingTitle,
            greetingImage: agentConfig.greetingImage,
            greetingVideo: agentConfig.greetingVideo
          }
          break

        default:
          toast.error('Invalid step.')
          return
      }

      response = await fetch(apiUrl, {
        method: currentStep === 1 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(
          currentStep === 5
            ? 'AI Agent saved and published successfully!'
            : `Step ${currentStep} saved successfully!`
        )
        if (currentStep < 5) setCurrentStep(currentStep + 1)
      } else {
        const errorData = await response.json()
        toast.error(`Failed to save Step ${currentStep}: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error(`Error saving agent: ${error}`)
      toast.error('An error occurred while saving. Please try again.')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl sm:text-2xl font-bold text-linka-russian-violet tracking-tight">
                  Greeting Media
                </CardTitle>
                <p className="text-xs sm:text-sm text-linka-night/70 font-light">
                  Upload an image or video and create your opening message
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8 space-y-6 sm:space-y-8">
              <div className="flex flex-col items-center w-full">
                <h3 className="text-base sm:text-lg font-medium text-linka-russian-violet mb-3 sm:mb-4">AI Agent Greeting</h3>
                <div className="relative group w-full max-w-[12rem] sm:max-w-[14rem]">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-linka-dark-orange/90 to-linka-carolina-blue/90 flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.02]">
                    {agentConfig.greetingVideo ? (
                      <video
                        src={agentConfig.greetingVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover rounded-full"
                        onError={() => toast.error('Error loading video. Please ensure the file is a valid MP4, WebM, or OGG.')}
                      />
                    ) : agentConfig.greetingImage ? (
                      <img
                        src={agentConfig.greetingImage}
                        alt="Greeting Image"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => toast.error('Error loading greeting image.')}
                      />
                    ) : (
                      <Bot className="w-10 h-10 sm:w-14 sm:h-14 text-white/90 animate-pulse" />
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3 absolute -bottom-1 right-4 sm:right-6">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleGreetingMediaUpload(e, 'image')}
                        className="hidden"
                        id="greeting-image-upload"
                      />
                      <label
                        htmlFor="greeting-image-upload"
                        className="bg-white border-2 border-linka-carolina-blue text-linka-carolina-blue rounded-full p-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-carolina-blue hover:text-white shadow-md flex items-center gap-1"
                      >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                        <span className="text-xs font-medium hidden sm:inline">Image</span>
                        <span className="sr-only">Upload greeting image</span>
                      </label>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleGreetingMediaUpload(e, 'video')}
                        className="hidden"
                        id="greeting-video-upload"
                      />
                      <label
                        htmlFor="greeting-video-upload"
                        className="bg-white border-2 border-linka-carolina-blue text-linka-carolina-blue rounded-full p-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-carolina-blue hover:text-white shadow-md flex items-center gap-1"
                      >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                        <span className="text-xs font-medium hidden sm:inline">Video</span>
                        <span className="sr-only">Upload greeting video</span>
                      </label>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-linka-night/60 mt-3 sm:mt-5 font-medium text-center">
                  Upload either an image (max 5MB) or a video (max 10MB, MP4/WebM/OGG)
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="greeting-title" className="text-linka-russian-violet font-medium flex items-center gap-1 text-sm sm:text-base">
                  Greeting Title <span className="text-xs text-linka-dark-orange">(Max 50 chars)</span>
                </Label>
                <input
                  id="greeting-title"
                  type="text"
                  placeholder="Example: Hi I'm { Your Name }"
                  value={agentConfig.greetingTitle || ""}
                  onChange={(e) => handleInputChange('greetingTitle', e.target.value)}
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-linka-night border border-linka-alice-blue rounded-xl focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 transition-all duration-300 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 bg-white/80 backdrop-blur-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-linka-night/50 italic">
                    Pro tip: Keep it short and engaging
                  </p>
                  <span
                    className={`text-xs ${agentConfig.greetingTitle?.length === 50 ? 'text-red-400' : 'text-linka-night/50'}`}
                  >
                    {agentConfig.greetingTitle?.length || 0}/50
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="greeting" className="text-linka-russian-violet font-medium flex items-center gap-1 text-sm sm:text-base">
                  Opening Greeting <span className="text-xs text-linka-dark-orange">(Max 120 chars)</span>
                </Label>
                <Textarea
                  id="greeting"
                  placeholder="Example: I can help you find the coolest places in NYC to visit!"
                  value={agentConfig.greeting}
                  onChange={(e) => handleInputChange('greeting', e.target.value)}
                  rows={3}
                  maxLength={120}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-linka-night border border-linka-alice-blue rounded-xl focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 transition-all duration-300 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 bg-white/80 backdrop-blur-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-linka-night/50 italic">
                    Pro tip: Keep it relevant to your expertise
                  </p>
                  <span
                    className={`text-xs ${agentConfig.greeting?.length === 120 ? 'text-red-400' : 'text-linka-night/50'}`}
                  >
                    {agentConfig.greeting?.length || 0}/120
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-linka-alice-blue/30 to-white/50 rounded-xl p-4 sm:p-5 border border-linka-alice-blue/80 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[5px] opacity-5" />
                <p className="text-xs text-linka-night/60 mb-2 sm:mb-3 font-medium uppercase tracking-wider">
                  Live Preview
                </p>
                <div className="text-center space-y-2 sm:space-y-3 relative z-10">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-medium text-linka-russian-violet animate-in fade-in">
                    {agentConfig.greetingTitle || "Hi I'm Your AI"}
                  </h4>
                  <p className="text-base sm:text-lg md:text-xl font-semibold text-linka-night/90 animate-in fade-in delay-100">
                    {agentConfig.greeting || 'I can help you find the coolest places in NYC to visit!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card className="w-full mx-auto border-none shadow-xl rounded-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold text-indigo-900 tracking-tight">
                AI Agent Setup
              </CardTitle>
              <p className="text-sm text-gray-500">Personalize your AI agent with a name and specific instructions</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <Label
                  htmlFor="agent-name"
                  className="text-base font-medium text-gray-700"
                >
                  Agent Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Sofia, Alex, Travel Guide"
                  value={agentConfig.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full text-base p-3 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 
                  transition-all duration-200 placeholder:text-gray-400/60
                  hover:border-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pick a unique, friendly name for your AI agent
                </p>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="training-instructions"
                  className="text-base font-medium text-gray-700"
                >
                  Training Instructions
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="training-instructions"
                  placeholder={`# PERSONA
- Their Role (e.g., digital concierge, stylist, skincare expert)
- Tone and personality (e.g., friendly, elegant, witty, minimal)

# INSTRUCTIONS
- What they specialize in (e.g., travel, tech, fashion)
- Their Goal for users (e.g., recommend, inspire, solve problems)

# EXAMPLE
You are Sabrina, the CEO of Croissants and Cafes website. You are warm, elegant, and knowledgeable about European-inspired fashion, Parisian luxury, and curated travel + shopping experiences in France. You help visitors discover high-quality brands, wardrobe staples, and timeless fashion finds — always in a chic, minimal, and helpful tone.`}
                  value={agentConfig.trainingInstructions}
                  onChange={(e) => handleInputChange('trainingInstructions', e.target.value)}
                  rows={8}
                  className="w-full text-base p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder:text-gray-400/60 hover:border-gray-400 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clear and detailed instructions will improve your agent's performance
                </p>
              </div>
            </CardContent>
          </Card>
        )
      case 4:
        return (
          <Card className="border-none shadow-lg rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-linka-russian-violet tracking-tight flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-linka-dark-orange" />
                  Partner URLs & Monetization
                </CardTitle>
                <p className="text-sm text-linka-night/70 font-light">
                  Add affiliate links and Linka Pro monetization options
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant={activeTab === 'partner' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('partner')}
                  className={`${activeTab === 'partner'
                    ? 'bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white'
                    : 'border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10'
                    } transition-all duration-300 hover:scale-105`}
                >
                  Linka Basic
                </Button>
                <Button
                  variant={activeTab === 'aipro' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('aipro')}
                  className={`${activeTab === 'aipro'
                    ? 'bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white'
                    : 'border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10'
                    } transition-all duration-300 hover:scale-105`}
                >
                  Linka AI Pro Monetization
                </Button>
                <Button className='ml-auto'>
                  Upgarde
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'aipro' ? (
                <div className="space-y-2">
                <h3 className="text-lg font-medium text-linka-russian-violet flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-linka-carolina-blue" />
                        AI Smart Recommendations </h3>
                  <p className="text-xs text-linka-night/60">
                    Add monetization links for AI Pro services
                  </p>
                </div> 
              ) : (<div className="space-y-2">
                <h3 className="text-lg font-medium text-linka-russian-violet flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-linka-carolina-blue" />
                    Partner Links
                  </h3>
                  <p className="text-xs text-linka-night/60">
                    Add affiliate links with detailed information for your AI to recommend
                  </p>
                </div> )} 
            </CardContent>
            <CardContent className="px-6 pb-6 space-y-8">
              <Button
                variant="outline"
                onClick={() => setIsMonetizationModalOpen(true)}
                className="w-full border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 hover:text-linka-carolina-blue transition-all duration-300 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'partner' ? (agentConfig.partnerLinks.length > 0 ? 'Add Another Partner Link' : 'Add First Partner Link') : (agentConfig.linkaProMonetizations.length > 0 ? 'Add Another Monetization Link' : 'Add First Monetization Link')}
              </Button>
              <div className="bg-linka-alice-blue/30 rounded-lg p-3 border border-linka-alice-blue/50 mt-4">
                <div className="flex items-start gap-2">
                  <InfoIcon className="w-4 h-4 text-linka-carolina-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-linka-russian-violet mb-1">Pro Tips:</p>
                    <ul className="text-xs text-linka-night/60 space-y-1">
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>Test all links before sharing</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>Ensure affiliate links are valid and trackable</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>Provide detailed product reviews to enhance user trust</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>Upload high-quality images to enhance visual appeal</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 3:
        return (
          <Card className="border-none shadow-lg rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-linka-russian-violet tracking-tight">
                  Conversation Design
                </CardTitle>
                <p className="text-sm text-linka-night/70 font-light">
                  Craft engaging prompts and branching dialogue flows
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-8 space-y-6">
              {!agentConfig.useConditionalPrompts ? (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-linka-russian-violet flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-linka-carolina-blue" />
                      Conversation Starters
                    </h3>
                    <p className="text-xs text-linka-night/60">
                      These buttons will appear when users first interact with your AI
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {agentConfig.prompts.map((prompt, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`prompt-${index}`} className="text-linka-russian-violet/90">
                          Prompt {index + 1}
                        </Label>
                        <Input
                          id={`prompt-${index}`}
                          placeholder={[
                            "Help me plan my itinerary",
                            "Find local recommendations",
                            "Show me the best deals",
                            "Tell me about activities"
                          ][index]}
                          value={prompt}
                          onChange={(e) => updatePrompt(index, e.target.value)}
                          className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 transition-all duration-200"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="bg-linka-alice-blue/30 rounded-xl p-4 border border-linka-alice-blue/50 mt-4">
                    <p className="text-xs text-linka-night/70 mb-3 font-medium uppercase tracking-wider">
                      Button Preview
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {agentConfig.prompts.map((prompt, index) => (
                        <div
                          key={index}
                          className="bg-white border border-linka-columbia-blue/50 rounded-lg p-3 text-sm font-medium text-linka-night hover:shadow-sm transition-all duration-200 hover:border-linka-carolina-blue hover:translate-y-[-2px]"
                        >
                          {prompt || `Prompt ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-linka-russian-violet flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-linka-dark-orange" />
                      Branching Flows
                    </h3>
                    <p className="text-xs text-linka-night/60">
                      Create decision trees that adapt to different user needs
                    </p>
                  </div>
                  {agentConfig.conditionalPrompts.length === 0 ? (
                    <div className="text-center py-8 rounded-xl border-2 border-dashed border-linka-alice-blue bg-white/50">
                      <GitBranch className="w-12 h-12 text-linka-carolina-blue/70 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-medium text-linka-russian-violet mb-2">
                        No Conversation Flows Yet
                      </h3>
                      <p className="text-linka-night/60 mb-4 max-w-md mx-auto">
                        Create your first branching conversation to guide users through different paths
                      </p>
                      <Button
                        onClick={() => openConditionalModal()}
                        className="bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white shadow-md transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Flow
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {agentConfig.conditionalPrompts.map((prompt) => (
                        <Card
                          key={prompt.id}
                          className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 overflow-hidden"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-linka-russian-violet flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-linka-carolina-blue" />
                                {prompt.mainPrompt || "Untitled Flow"}
                              </h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openConditionalModal(prompt)}
                                  className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 transition-all duration-200 hover:scale-105"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-red-100">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-linka-russian-violet">
                                        Delete this flow?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete "{prompt.mainPrompt || 'this flow'}" and all its branches.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-linka-alice-blue hover:bg-linka-alice-blue">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteConditionalPrompt(prompt.id)}
                                        className="bg-red-600 hover:bg-red-700 transition-all duration-200"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Flow
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-linka-dark-orange" />
                                  <Label className="text-sm font-medium text-linka-russian-violet">
                                    {prompt.option1.label || "Option 1"}
                                  </Label>
                                </div>
                                <div className="space-y-2 ml-4">
                                  {prompt.option1.followUps.map((followUp, index) => (
                                    <div
                                      key={index}
                                      className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
                                    >
                                      {followUp || `Follow-up question ${index + 1}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-linka-carolina-blue" />
                                  <Label className="text-sm font-medium text-linka-russian-violet">
                                    {prompt.option2.label || "Option 2"}
                                  </Label>
                                </div>
                                <div className="space-y-2 ml-4">
                                  {prompt.option2.followUps.map((followUp, index) => (
                                    <div
                                      key={index}
                                      className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
                                    >
                                      {followUp || `Follow-up question ${index + 1}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        onClick={() => openConditionalModal()}
                        variant="outline"
                        className={`w-full border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 transition-all duration-300 ${agentConfig.conditionalPrompts.length >= 2 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                        disabled={agentConfig.conditionalPrompts.length >= 2}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {agentConfig.conditionalPrompts.length === 0 ? 'Create First Flow' : 'Add Another Flow'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      case 5:
        return (
          <div className="space-y-6">
            <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white border border-gray-200">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-2xl font-semibold text-linka-russian-violet">Live Preview</CardTitle>
                <p className="text-sm text-linka-night/70">This is exactly what your users will see</p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 h-[90vh] flex flex-col w-[full] lg:w-[50%] mx-auto">
                  <div className="flex justify-center mb-6 w-full">
                    <div className="w-52 h-52 sm:w-72 sm:h-72 rounded-full overflow-hidden bg-gradient-to-br from-linka-dark-orange to-linka-carolina-blue flex items-center justify-center shadow-md">
                      {agentConfig.greetingVideo ? (
                        <video
                          src={agentConfig.greetingVideo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover rounded-full"
                          onError={() => toast.error('Error loading video in preview. Please ensure the file is a valid MP4, WebM, or OGG.')}
                        />
                      ) : agentConfig.greetingImage ? (
                        <img
                          src={agentConfig.greetingImage}
                          alt="Greeting Media"
                          className="w-full h-full object-cover"
                          onError={() => toast.error('Error loading greeting image in preview.')}
                        />
                      ) : (
                        <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="text-center mb-6 sm:mb-8">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {agentConfig.greetingTitle || 'Your Agent'}
                    </h4>
                    <p className="text-lg sm:text-xl font-normal text-gray-700">
                      {agentConfig.greeting || 'Ready to assist you with your needs!'}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-1 sm:px-4">
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-semibold text-linka-russian-violet mb-2">Conversation Starters</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          {(agentConfig.useConditionalPrompts && agentConfig.conditionalPrompts.length > 0
                            ? agentConfig.conditionalPrompts.slice(0, 2).map(cp => cp.mainPrompt)
                            : agentConfig.prompts.filter(prompt => prompt.trim() !== '')
                          ).map((prompt, index) => (
                            <button
                              key={index}
                              className="border border-gray-300 rounded-md py-2 px-4 text-sm hover:bg-gray-100 cursor-pointer text-left transition-colors duration-200"
                            >
                              <span className="font-medium text-gray-800">
                                {prompt || `Prompt ${index + 1}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <div className="flex bg-gray-200 rounded-full px-4 py-2 items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type or ask me something..."
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
                        disabled
                      />
                      <button
                        className="bg-linka-dark-orange text-white p-2 rounded-full flex items-center justify-center hover:bg-linka-dark-orange/90 transition-colors duration-200"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        className="bg-linka-dark-orange text-white p-2 rounded-full flex items-center justify-center hover:bg-linka-dark-orange/90 transition-colors duration-200"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">⚡️</span>
                    <h3 className="text-sm font-semibold text-blue-900">Pro Tips</h3>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-blue-800">
                    <li>Ask relevant questions to test your avatar.</li>
                    <li>Preview images and videos may take a moment to load on first launch.</li>
                    <li>Refine your agent’s persona and instructions based on results.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  const saveMonetization = () => {
    // Ensure all required fields are filled
    const hasEmptyRequiredFields = agentConfig.linkaProMonetizations.some(link => 
      !link.category.trim() || !link.affiliateBrandName.trim() || !link.mainUrl.trim()
    );
    if (hasEmptyRequiredFields) {
      toast.error('Please fill in all required fields (Category, Affiliate Brand Name, Main URL)');
      return;
    }

    setIsMonetizationModalOpen(false);
    toast.success('Monetization saved successfully!');
  };

  // Add new link when modal opens
  useEffect(() => {
    if (isMonetizationModalOpen && activeTab === 'aipro' && agentConfig.linkaProMonetizations.length === 0) {
      addLinkaProMonetization();
    }
    if (isMonetizationModalOpen && activeTab === 'partner' && agentConfig.partnerLinks.length === 0) {
      addPartnerLink();
    }
  }, [isMonetizationModalOpen, activeTab, agentConfig.linkaProMonetizations.length, agentConfig.partnerLinks.length]);

  return (
    <DashboardLayout>
      <div className="mx-auto px-2 py-6 sm:py-4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-linka-russian-violet mb-4 sm:mb-0">Build Your AI Agent</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-between">
          <div className="w-full md:w-2/4 lg:w-1/4">
            <div className="stepper space-y-3 sm:space-y-4 relative">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div
                    className={`stepper-item flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-md ${currentStep === step.id
                      ? 'bg-orange-100 text-linka-russian-violet border-2 border-orange-300'
                      : 'bg-white text-linka-russian-violet hover:bg-orange-50 border border-orange-200'
                      }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div
                      className={`stepper-number w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white font-bold transition-all ${currentStep === step.id
                        ? 'bg-orange-500 ring-2 ring-orange-300 ring-offset-2'
                        : 'bg-orange-400'
                        } mr-3 sm:mr-4`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">{step.title}</h3>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-5 sm:left-6 top-14 sm:top-16 w-0.5 h-8 sm:h-10 ${index < currentStep ? 'bg-orange-200' : 'bg-orange-300'}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-2/4 lg:w-3/4">
            {renderStepContent()}
            <div className="flex justify-between mt-6 items-center">
              <div className="text-sm text-gray-500 hidden sm:block">
                Step {currentStep} of 5
              </div>
              <div className='flex gap-4'>
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`border-orange-300 text-orange-500 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200 ${currentStep !== 1 ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {currentStep === 5 ? (
                  <Button
                    onClick={handleSave}
                    className="bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white shadow-md px-6 py-2 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save & Publish Agent
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={nextStep}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 transition-all duration-300 hover:scale-105"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Dialog open={isConditionalModalOpen} onOpenChange={setIsConditionalModalOpen}>
          <DialogContent className="max-w-full sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingConditionalPrompt ? 'Edit Conditional Prompt' : 'Add Conditional Prompt'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="main-prompt" className="text-linka-russian-violet font-medium">Main Prompt</Label>
                <Input
                  id="main-prompt"
                  placeholder="e.g., Are you planning a trip for leisure or business?"
                  value={conditionalForm.mainPrompt}
                  onChange={(e) => updateConditionalForm('mainPrompt', e.target.value)}
                  className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="option1-label" className="text-linka-russian-violet font-medium">Option 1 Label</Label>
                  <Input
                    id="option1-label"
                    placeholder="e.g., Leisure"
                    value={conditionalForm.option1.label}
                    onChange={(e) => updateConditionalOption('option1', 'label', e.target.value)}
                    className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                  />
                  <div className="mt-4 space-y-2">
                    <Label className="text-linka-russian-violet">Follow-up Questions</Label>
                    {conditionalForm.option1.followUps.map((followUp, index) => (
                      <Input
                        key={index}
                        placeholder={`Follow-up ${index + 1}`}
                        value={followUp}
                        onChange={(e) => {
                          const newFollowUps = [...conditionalForm.option1.followUps]
                          newFollowUps[index] = e.target.value
                          updateConditionalOption('option1', 'followUps', newFollowUps)
                        }}
                        className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="option2-label" className="text-linka-russian-violet font-medium">Option 2 Label</Label>
                  <Input
                    id="option2-label"
                    placeholder="e.g., Business"
                    value={conditionalForm.option2.label}
                    onChange={(e) => updateConditionalOption('option2', 'label', e.target.value)}
                    className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                  />
                  <div className="mt-4 space-y-2">
                    <Label className="text-linka-russian-violet">Follow-up Questions</Label>
                    {conditionalForm.option2.followUps.map((followUp, index) => (
                      <Input
                        key={index}
                        placeholder={`Follow-up ${index + 1}`}
                        value={followUp}
                        onChange={(e) => {
                          const newFollowUps = [...conditionalForm.option2.followUps]
                          newFollowUps[index] = e.target.value
                          updateConditionalOption('option2', 'followUps', newFollowUps)
                        }}
                        className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsConditionalModalOpen(false)}
                  className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveConditionalPrompt}
                  className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isMonetizationModalOpen} onOpenChange={setIsMonetizationModalOpen}>
          <DialogContent className="max-w-full sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{activeTab === 'partner' ? 'Partner Links' : 'AI Pro Monetization'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {activeTab === 'partner' ? (
                <div>
                  {agentConfig.partnerLinks.length > 0 ? (
                    <div className="space-y-4">
                      {agentConfig.partnerLinks.map((link) => (
                        <Card
                          key={link.id}
                          className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 bg-white/90 rounded-lg shadow-md"
                        >
                          <CardContent className="p-4 space-y-4 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`partner-category-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Category <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`partner-category-${link.id}`}
                                  placeholder="e.g., Travel, Fashion"
                                  value={link.category}
                                  onChange={(e) => updatePartnerLink(link.id, 'category', e.target.value)}
                                  className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`partner-link-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Affiliate Link <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                  <Input
                                    id={`partner-link-${link.id}`}
                                    placeholder="https://affiliate-link.com"
                                    value={link.affiliateLink}
                                    onChange={(e) => updatePartnerLink(link.id, 'affiliateLink', e.target.value)}
                                    className="pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                  />
                                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linka-dark-orange" />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`partner-brand-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Brand Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`partner-brand-${link.id}`}
                                  placeholder="e.g., TripAdvisor"
                                  value={link.affiliateBrandName}
                                  onChange={(e) => updatePartnerLink(link.id, 'affiliateBrandName', e.target.value)}
                                  className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`partner-social-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Social Media
                                </Label>
                                <Input
                                  id={`partner-social-${link.id}`}
                                  placeholder="https://social-media.com"
                                  value={link.socialMediaLink || ''}
                                  onChange={(e) => updatePartnerLink(link.id, 'socialMediaLink', e.target.value)}
                                  className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`partner-review-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Product Review
                                </Label>
                                <Input
                                  id={`partner-review-${link.id}`}
                                  placeholder="e.g., Great product!"
                                  value={link.productReview || ''}
                                  onChange={(e) => updatePartnerLink(link.id, 'productReview', e.target.value)}
                                  className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`image-${link.id}`}
                                  className="text-linka-russian-violet font-medium block text-sm"
                                >
                                  Affiliate Image (Optional)
                                </Label>

                                <div className="relative flex items-center">
                                  <ImageIcon className="absolute left-3 w-5 h-5 text-linka-dark-orange pointer-events-none" />

                                  <div className="relative w-full">
                                    <Input
                                      id={`image-${link.id}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files ? e.target.files[0] : null;
                                        updatePartnerLink(link.id, 'affiliateimage', file);
                                      }}
                                      className="
                                                  pl-10 pr-4 py-2 w-full 
                                                  border border-linka-alice-blue rounded-md text-sm 
                                                  bg-white text-linka-russian-violet opacity-0
                                                  absolute z-10 cursor-pointer
                                                  h-full
                                                "
                                    />
                                    <div className="
                                                  pl-10 pr-4 py-2 w-full 
                                                  border border-linka-alice-blue rounded-md text-sm 
                                                  bg-white text-linka-russian-violet
                                                  flex items-center
                                                ">
                                      <span className="text-linka-night/40">
                                        {link.affiliateimage ? link.affiliateimage?.name : 'Choose file...'}
                                      </span>
                                      <span className="
                                                  ml-auto mr-4 py-2 px-4 
                                                  rounded-md border-0 
                                                  text-sm font-medium 
                                                  bg-linka-carolina-blue text-white 
                                                  hover:bg-linka-carolina-blue/90
                                                  active:bg-linka-carolina-blue/80
                                                  cursor-pointer
                                                ">
                                        Browse
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 rounded-xl border-2 border-dashed border-linka-alice-blue bg-white/50">
                      <LinkIcon className="w-12 h-12 text-linka-dark-orange/70 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-linka-russian-violet mb-2">
                        No Partner Links Added
                      </h3>
                      <p className="text-linka-night/60 mb-4">
                        Add your first partner link to get started
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsMonetizationModalOpen(false)}
                      className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
                    >
                      Cancel
                    </Button>
                    {/* <Button
                      onClick={addPartnerLink}
                      className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Link
                    </Button> */}
                    <Button
                      onClick={() => {
                        const hasEmptyRequiredFields = agentConfig.partnerLinks.some(link => 
                          !link.category.trim() || !link.affiliateBrandName.trim() || !link.affiliateLink.trim()
                        );
                        if (hasEmptyRequiredFields) {
                          toast.error('Please fill in all required fields (Category, Affiliate Brand Name, Affiliate Link)');
                          return;
                        }
                        setIsMonetizationModalOpen(false);
                        toast.success('Partner links saved successfully!');
                      }}
                      className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {agentConfig.linkaProMonetizations.length > 0 ? (
                    <div className="space-y-4">
                      {agentConfig.linkaProMonetizations.map((link) => (
                        <Card
                          key={link.id}
                          className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 bg-white/90 rounded-lg shadow-md"
                        >
                          <CardContent className="p-4 space-y-4 relative">
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLinkaProMonetization(link.id)}
                              className="absolute top-2 right-2 text-red-500 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                            >
                              <X className="w-5 h-5" />
                              <span className="sr-only">Remove AI Pro Link</span>
                            </Button> */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`pro-category-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Category <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`pro-category-${link.id}`}
                                  placeholder="e.g., Subscription, Service"
                                  value={link.category}
                                  onChange={(e) => updateLinkaProMonetization(link.id, 'category', e.target.value)}
                                  className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`pro-brand-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Main Affiliate Brand Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`pro-brand-${link.id}`}
                                  placeholder="e.g., AI Pro"
                                  value={link.affiliateBrandName}
                                  onChange={(e) => updateLinkaProMonetization(link.id, 'affiliateBrandName', e.target.value)}
                                  className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`pro-main-url-${link.id}`} className="text-linka-russian-violet font-medium">
                                  Category URL <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                  <Input
                                    id={`pro-main-url-${link.id}`}
                                    placeholder="https://main-url.com"
                                    value={link.mainUrl}
                                    onChange={(e) => updateLinkaProMonetization(link.id, 'mainUrl', e.target.value)}
                                    className="pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                  />
                                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linka-dark-orange" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 rounded-xl border-2 border-dashed border-linka-alice-blue bg-white/50">
                      <LinkIcon className="w-12 h-12 text-linka-dark-orange/70 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-linka-russian-violet mb-2">
                        No AI Pro Monetization Added
                      </h3>
                      <p className="text-linka-night/60 mb-4">
                        Add your first AI Pro monetization link to get started
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsMonetizationModalOpen(false)}
                      className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addLinkaProMonetization}
                      className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}


