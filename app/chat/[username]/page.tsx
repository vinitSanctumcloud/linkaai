'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Mic, Send, X, Bot } from 'lucide-react'

interface ConditionalPrompt {
  id: string
  mainPrompt: string
  option1: {
    label: string
    followUps: string[]
  }
  option2: {
    label: string
    followUps: string[]
  }
}

interface UserSettings {
  agentName: string
  agentGreeting: string
  brandColor: string
  voiceEnabled: boolean
  welcomeMessage?: string
  instructions?: string
  avatarUrl?: string
  agentPrompts?: string[]
  conditionalPrompts?: ConditionalPrompt[]
}

interface AffiliateLink {
  id: string
  url: string
  title?: string
  description?: string
  image?: string
  brand?: string
  category?: string
}

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const params = useParams()
  const username = params.username as string

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [recommendations, setRecommendations] = useState<AffiliateLink[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isGreetingMode, setIsGreetingMode] = useState(true)
  const [conditionalMode, setConditionalMode] = useState<'main' | 'followup' | 'none'>('none')
  const [selectedConditionalPrompt, setSelectedConditionalPrompt] = useState<ConditionalPrompt | null>(null)
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUserData()
  }, [username])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchUserData = async () => {
    try {
      // Fetch actual user settings from API
      const response = await fetch('/api/settings')
      let settings = null

      if (response.ok) {
        settings = await response.json()
      }

      // Use fetched settings or fallback to demo data
      const userConfig = {
        agentName: settings?.agentName || 'Sofia',
        agentGreeting: settings?.agentGreeting || 'Ready to Assist',
        brandColor: settings?.brandColor || '#F97316',
        voiceEnabled: settings?.voiceEnabled !== false,
        welcomeMessage: settings?.welcomeMessage || 'Hi! I\'m Sofia, your travel assistant. How can I help you today?',
        avatarUrl: settings?.avatarUrl || 'https://i.pinimg.com/736x/10/62/95/1062954a6b7562f4a6757c3ee1f8da5e.jpg',
        agentPrompts: settings?.agentPrompts || [
          'Help me plan my Sonoma itinerary',
          'How can I explore Sonoma like a local',
          'Find restaurants or Insider Pass details',
          'Tell me about spas or outdoor sports'
        ],
        conditionalPrompts: settings?.conditionalPrompts || [
          {
            id: 'demo-1',
            mainPrompt: 'Are you a creator or brand?',
            option1: {
              label: "I'm a Creator",
              followUps: [
                'Help me grow my audience',
                'Find content inspiration',
                'Monetize my content'
              ]
            },
            option2: {
              label: "I'm a Brand",
              followUps: [
                'Find brand ambassadors',
                'Launch a campaign',
                'Measure ROI'
              ]
            }
          }
        ]
      }

      setUserSettings(userConfig)

      // Set conditional mode based on configuration
      if (userConfig.conditionalPrompts && userConfig.conditionalPrompts.length > 0) {
        setConditionalMode('main')
        setSelectedConditionalPrompt(userConfig.conditionalPrompts[0]) // Start with first conditional prompt
      } else {
        setConditionalMode('none')
      }

      // Mock affiliate links for demo - travel/fitness themed to match screenshots
      setAffiliateLinks([
        {
          id: '1',
          url: 'https://amazon.com/fitness-gear',
          title: 'Fitness',
          description: 'Outdoor activities and sports equipment for your Monterey adventure',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          brand: 'FitGear',
          category: 'Fitness'
        },
        {
          id: '2',
          url: 'https://amazon.com/travel-guides',
          title: 'Travel Guides',
          description: 'Local insider guides and maps for the best Monterey experience',
          image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          brand: 'TravelPro',
          category: 'Travel'
        },
        {
          id: '3',
          url: 'https://amazon.com/outdoor-gear',
          title: 'Outdoor Gear',
          description: 'Essential equipment for hiking and outdoor exploration',
          image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          brand: 'AdventureGear',
          category: 'Outdoor'
        }
      ])

      // Add welcome message
      setMessages([{
        id: '1',
        content: 'Hi! I\'m your AI shopping assistant. How can I help you find the perfect products today?',
        isUser: false,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const inputMessage = messageText || message
    if (!inputMessage.trim()) return

    // Switch to conversation mode if we're in greeting mode
    if (isGreetingMode) {
      setIsGreetingMode(false)
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)

    // Simulate AI response with exact formatting from screenshot
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: Date.now().toString() + '-ai',
        content: `What is there to do in Monterey?

Here are some amazing activities and attractions in Monterey:

1. Visit the famous <a href="#" class="text-blue-600 hover:underline font-medium">Monterey Bay Aquarium</a> and explore marine life
2. Walk along the scenic <a href="#" class="text-blue-600 hover:underline font-medium">17-Mile Drive</a> for breathtaking coastal views  
3. Explore the historic <a href="#" class="text-blue-600 hover:underline font-medium">Fisherman's Wharf</a> with shops and restaurants
4. Take a whale watching tour from <a href="#" class="text-blue-600 hover:underline font-medium">Monterey Harbor</a>`,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)

      // Show recommendations matching screenshot
      setRecommendations(affiliateLinks.slice(0, 3))
    }, 2000)

    try {
      // Track analytics
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          type: 'view',
          metadata: { message: inputMessage, username }
        })
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const handleConditionalOptionClick = (option: 'option1' | 'option2') => {
    if (!selectedConditionalPrompt) return

    setSelectedOption(option)
    setConditionalMode('followup')

    // Send the option selection as a message
    const optionLabel = selectedConditionalPrompt[option].label
    handleSendMessage(`I selected: ${optionLabel}`)
  }

  const handleConditionalFollowUpClick = (followUpPrompt: string) => {
    handleSendMessage(followUpPrompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceInput = () => {
    if (!userSettings?.voiceEnabled) return

    setIsListening(!isListening)
    toast.info(isListening ? 'Voice input stopped' : 'Voice input started', {
      position: "top-right",
      duration: 2000,
    })
  }

  const handleLinkClick = async (linkId: string) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          affiliateLinkId: linkId,
          type: 'click',
          metadata: { username }
        })
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  const brandColor = userSettings?.brandColor || '#F97316'

  // Greeting Screen - Exact match to screenshot
  if (isGreetingMode) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-2 sm:p-4">
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 w-full max-w-md h-full sm:h-[90vh] sm:max-h-[800px] flex flex-col mx-auto shadow-sm overflow-hidden">
          {/* Avatar - Responsive sizing */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              {userSettings?.avatarUrl ? (
                <img
                  src={userSettings.avatarUrl}
                  alt="AI Agent"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              )}
            </div>
          </div>

          {/* Greeting - Responsive text sizing */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h4 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 mb-1 sm:mb-2">
              Hi, I'm <span className="text-orange-500 font-semibold">{userSettings?.agentName || 'AI Agent'}</span>,
            </h4>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
              {userSettings?.agentGreeting || 'Ready to Assist'}
            </p>
          </div>

          {/* Suggestion Buttons - Responsive grid and padding */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex-1 overflow-y-auto">
            {conditionalMode === 'main' && selectedConditionalPrompt ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <h4 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-2 sm:mb-4">
                    {selectedConditionalPrompt.mainPrompt}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleConditionalOptionClick('option1')}
                    className="bg-white border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center hover:bg-orange-50 hover:border-orange-300 transition-colors text-xs sm:text-sm"
                  >
                    <span className="font-medium text-gray-900">{selectedConditionalPrompt.option1.label}</span>
                  </button>
                  <button
                    onClick={() => handleConditionalOptionClick('option2')}
                    className="bg-white border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center hover:bg-orange-50 hover:border-orange-300 transition-colors text-xs sm:text-sm"
                  >
                    <span className="font-medium text-gray-900">{selectedConditionalPrompt.option2.label}</span>
                  </button>
                </div>
              </div>
            ) : conditionalMode === 'followup' && selectedConditionalPrompt && selectedOption ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                    Great! Here are some ways I can help you as a {selectedConditionalPrompt[selectedOption].label.toLowerCase()}:
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {selectedConditionalPrompt[selectedOption].followUps.map((followUp, index) => (
                    <button
                      key={index}
                      onClick={() => handleConditionalFollowUpClick(followUp)}
                      className="bg-white border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-left hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    >
                      <span className="font-medium text-gray-900">{followUp}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {userSettings?.agentPrompts?.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="bg-white border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-left hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    <span className="font-medium text-gray-900">{prompt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QR Code Section - Hidden on mobile */}
          <div className="bg-orange-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 items-center justify-between hidden sm:flex">
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">Continue on phone</p>
              <p className="text-xs sm:text-sm text-gray-600">Scan QR</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-lg flex items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-sm flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area - Responsive sizing */}
          <div className="mt-auto px-2 pb-2 sm:px-3 sm:pb-3">
            <div className="bg-gray-200 rounded-full flex items-center p-1 sm:p-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent text-xs sm:text-sm md:text-base text-gray-900 placeholder-gray-500 outline-none px-2 sm:px-3 py-1 sm:py-2 md:py-3 min-w-0"
                aria-label="Message input"
              />
              <div className="flex items-center pr-1 sm:pr-2 space-x-1">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim()}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-0 sm:mr-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                  aria-label="Send message"
                >
                  <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                </button>
                <button
                  onClick={handleVoiceInput}
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
                    }`}
                  aria-label={isListening ? "Stop listening" : "Voice input"}
                >
                  <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Conversation Screen - Exact match to screenshot
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-50 rounded-none sm:rounded-2xl p-4 sm:p-6 min-h-[100vh] sm:min-h-[700px] flex flex-col max-w-md w-full mx-auto shadow-none sm:shadow-sm">
        {/* Header - Simplified on mobile */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-0 sm:border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 mr-2 sm:mr-3">
              {userSettings?.avatarUrl ? (
                <img
                  src={userSettings.avatarUrl}
                  alt="AI Agent"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              )}
            </div>
            <span className="font-bold text-sm sm:text-base text-gray-900">
              {userSettings?.agentName || 'AI Agent'}
            </span>
          </div>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 sm:bg-gray-200 flex items-center justify-center hover:bg-gray-200 sm:hover:bg-gray-300 transition-colors">
            <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          </button>
        </div>

        {/* Conversation Content - Adjusted for mobile */}
        <div className="flex-1 overflow-y-auto mb-4 sm:mb-6 pr-1 sm:pr-2 custom-scrollbar">
          <div className="mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
              What is there to do in Monterey?
            </h4>
            <p className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm">
              Here are some amazing activities and attractions in Monterey:
            </p>

            {/* Numbered list - adjusted spacing */}
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-gray-700 text-xs sm:text-sm">
              <li>Visit the famous <a href="#" className="text-blue-600 hover:underline font-medium">Monterey Bay Aquarium</a></li>
              <li>Walk along the scenic <a href="#" className="text-blue-600 hover:underline font-medium">17-Mile Drive</a></li>
              <li>Explore the historic <a href="#" className="text-blue-600 hover:underline font-medium">Fisherman's Wharf</a></li>
              <li>Take a whale watching tour from <a href="#" className="text-blue-600 hover:underline font-medium">Monterey Harbor</a></li>
            </ol>
          </div>

          {/* Recommendations - adjusted for mobile */}
          <div className="mb-3 sm:mb-4">
            <h5 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-xs sm:text-sm">
              Recommendations based on your inquiries
            </h5>
            <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-1 sm:pb-2">
              {affiliateLinks.map((link) => (
                <div key={link.id} className="flex-shrink-0 w-36 sm:w-44 bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm overflow-hidden">
                  <img
                    src={link.image}
                    alt={link.title}
                    className="w-full h-16 sm:h-20 object-cover"
                  />
                  <div className="p-2 sm:p-3">
                    <h6 className="font-bold text-gray-900 text-xs">{link.title}</h6>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{link.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area - Larger touch targets on mobile */}
        <div className="bg-gray-200 rounded-full p-2 sm:p-3 flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none px-2 sm:px-3 text-xs sm:text-sm"
          />
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => handleSendMessage()}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 active:bg-orange-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
            <button
              onClick={handleVoiceInput}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500' : 'bg-orange-500 hover:bg-orange-600'
                }`}
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Global CSS for custom scrollbar */}
        <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #d1d1d1;
      }
    `}</style>
      </div>
    </div>
  )
}