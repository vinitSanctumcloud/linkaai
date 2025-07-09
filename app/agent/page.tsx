// 'use client'

// import { useState } from 'react'
// import { DashboardLayout } from '@/components/dashboard-layout'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
// import { Switch } from '@/components/ui/switch'
// import { Upload, Bot, Plus, X, Save, Send, Mic, Eye, ArrowLeft, ArrowRight, Edit, Trash2, GitBranch, MessageSquare, InfoIcon, LinkIcon, Link2 } from 'lucide-react'
// import { toast } from 'sonner'

// interface ConditionalPrompt {
//   id: string
//   mainPrompt: string
//   option1: { label: string; followUps: string[] }
//   option2: { label: string; followUps: string[] }
// }

// interface AgentConfig {
//   name: string
//   trainingInstructions: string
//   greeting: string
//   avatar: string | null
//   prompts: string[]
//   partnerUrls: string[]
//   conditionalPrompts: ConditionalPrompt[]
//   useConditionalPrompts: boolean
// }

// export default function AgentBuilderPage() {
//   const [currentStep, setCurrentStep] = useState(1) // Set to step 3 as per request
//   const [showPreview, setShowPreview] = useState(false)
//   const [agentConfig, setAgentConfig] = useState<AgentConfig>({
//     name: '',
//     trainingInstructions: '',
//     greeting: '',
//     avatar: null,
//     prompts: ['', '', '', ''],
//     partnerUrls: [''],
//     conditionalPrompts: [],
//     useConditionalPrompts: false
//   })

//   // Conditional prompt modal states
//   const [isConditionalModalOpen, setIsConditionalModalOpen] = useState(false)
//   const [editingConditionalPrompt, setEditingConditionalPrompt] = useState<ConditionalPrompt | null>(null)
//   const [conditionalForm, setConditionalForm] = useState<ConditionalPrompt>({
//     id: '',
//     mainPrompt: '',
//     option1: { label: '', followUps: ['', '', ''] },
//     option2: { label: '', followUps: ['', '', ''] }
//   })

//   const steps = [
//     { id: 1, title: 'AI Training', description: 'Name your agent and provide training instructions' },
//     { id: 2, title: 'Avatar & Greeting', description: 'Upload photo and create opening message' },
//     { id: 3, title: 'Prompts', description: 'Design conversation starters and branching logic' },
//     { id: 4, title: 'Partner URLs', description: 'Add your affiliate links' },
//     { id: 5, title: 'Preview & Test', description: 'Test your AI agent' }
//   ]

//   // Conditional prompt handlers
//   const openConditionalModal = (prompt?: ConditionalPrompt) => {
//     if (prompt) {
//       setEditingConditionalPrompt(prompt)
//       setConditionalForm(prompt)
//     } else {
//       setEditingConditionalPrompt(null)
//       setConditionalForm({
//         id: Date.now().toString(),
//         mainPrompt: '',
//         option1: { label: '', followUps: ['', '', ''] },
//         option2: { label: '', followUps: ['', '', ''] }
//       })
//     }
//     setIsConditionalModalOpen(true)
//   }

//   const saveConditionalPrompt = () => {
//     if (!conditionalForm.mainPrompt.trim() || !conditionalForm.option1.label.trim() || !conditionalForm.option2.label.trim()) {
//       toast.error('Please fill in all required fields')
//       return
//     }

//     setAgentConfig(prev => {
//       const newConditionalPrompts = editingConditionalPrompt
//         ? prev.conditionalPrompts.map(p => p.id === editingConditionalPrompt.id ? conditionalForm : p)
//         : [...prev.conditionalPrompts, conditionalForm]
//       return { ...prev, conditionalPrompts: newConditionalPrompts }
//     })

//     setIsConditionalModalOpen(false)
//     toast.success(editingConditionalPrompt ? 'Conditional prompt updated!' : 'Conditional prompt added!')
//   }

//   const deleteConditionalPrompt = (id: string) => {
//     setAgentConfig(prev => ({
//       ...prev,
//       conditionalPrompts: prev.conditionalPrompts.filter(p => p.id !== id)
//     }))
//     toast.success('Conditional prompt deleted!')
//   }

//   const updateConditionalForm = (field: string, value: any) => {
//     setConditionalForm(prev => ({ ...prev, [field]: value }))
//   }

//   const updateConditionalOption = (option: 'option1' | 'option2', field: 'label' | 'followUps', value: any) => {
//     setConditionalForm(prev => ({
//       ...prev,
//       [option]: { ...prev[option], [field]: value }
//     }))
//   }

//   const handleInputChange = (field: keyof AgentConfig, value: any) => {
//     setAgentConfig(prev => ({ ...prev, [field]: value }))
//   }

//   const updatePrompt = (index: number, value: string) => {
//     const newPrompts = [...agentConfig.prompts]
//     newPrompts[index] = value
//     setAgentConfig(prev => ({ ...prev, prompts: newPrompts }))
//   }

//   const addPartnerUrl = () => {
//     setAgentConfig(prev => ({ ...prev, partnerUrls: [...prev.partnerUrls, ''] }))
//   }

//   const updatePartnerUrl = (index: number, value: string) => {
//     const newUrls = [...agentConfig.partnerUrls]
//     newUrls[index] = value
//     setAgentConfig(prev => ({ ...prev, partnerUrls: newUrls }))
//   }

//   const removePartnerUrl = (index: number) => {
//     setAgentConfig(prev => ({
//       ...prev,
//       partnerUrls: prev.partnerUrls.filter((_, i) => i !== index)
//     }))
//   }

//   const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         setAgentConfig(prev => ({ ...prev, avatar: e.target?.result as string }))
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleSave = async () => {
//     try {
//       const response = await fetch('/api/settings', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           agentName: agentConfig.name,
//           trainingInstructions: agentConfig.trainingInstructions,
//           agentGreeting: agentConfig.greeting,
//           avatarUrl: agentConfig.avatar,
//           agentPrompts: agentConfig.useConditionalPrompts ? [] : agentConfig.prompts,
//           conditionalPrompts: agentConfig.useConditionalPrompts ? agentConfig.conditionalPrompts : [],
//           partnerUrls: agentConfig.partnerUrls.filter(url => url.trim() !== '')
//         }),
//       })

//       if (response.ok) {
//         toast.success('AI Agent saved successfully!')
//       } else {
//         toast.error('Failed to save AI Agent')
//       }
//     } catch (error) {
//       toast.error('An error occurred while saving')
//     }
//   }

//   const nextStep = () => {
//     if (currentStep < 5) setCurrentStep(currentStep + 1)
//   }

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1)
//   }

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <Card className="w-full mx-auto border-none shadow-xl rounded-2xl bg-white/95 backdrop-blur-sm">
//             <CardHeader className="pb-4">
//               <CardTitle className="text-3xl font-bold text-indigo-900 tracking-tight">
//                 AI Agent Setup
//               </CardTitle>
//               <p className="text-sm text-gray-500">Personalize your AI agent with a name and specific instructions</p>
//             </CardHeader>
//             <CardContent className="space-y-6 p-6">
//               <div className="space-y-3">
//                 <Label
//                   htmlFor="agent-name"
//                   className="text-base font-medium text-gray-700"
//                 >
//                   Agent Name
//                   <span className="text-red-500 ml-1">*</span>
//                 </Label>
//                 <Input
//                   id="agent-name"
//                   placeholder="e.g., Sofia, Alex, Travel Guide"
//                   value={agentConfig.name}
//                   onChange={(e) => handleInputChange('name', e.target.value)}
//                   className="w-full text-base p-3 border border-gray-300 rounded-lg 
//                   focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 
//                   transition-all duration-200 placeholder:text-gray-400/60
//                   hover:border-gray-400"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Pick a unique, friendly name for your AI agent
//                 </p>
//               </div>

//               <div className="space-y-3">
//                 <Label
//                   htmlFor="training-instructions"
//                   className="text-base font-medium text-gray-700"
//                 >
//                   Training Instructions
//                   <span className="text-red-500 ml-1">*</span>
//                 </Label>
//                 <Textarea
//                   id="training-instructions"
//                   placeholder="Describe your agent's role, tone, and how it should respond..."
//                   value={agentConfig.trainingInstructions}
//                   onChange={(e) => handleInputChange('trainingInstructions', e.target.value)}
//                   rows={8}
//                   className="w-full text-base p-3 border border-gray-300 rounded-lg 
//                   focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 
//                   transition-all duration-200 placeholder:text-gray-400/60
//                   hover:border-gray-400 resize-none"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Clear and detailed instructions will improve your agent's performance
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         )
//       case 2:
//         return (
//           <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
//             <CardHeader className="px-6 pt-6 pb-4">
//               <div className="space-y-1">
//                 <CardTitle className="text-2xl font-bold text-linka-russian-violet tracking-tight">
//                   Avatar & Greeting
//                 </CardTitle>
//                 <p className="text-sm text-linka-night/70 font-light">
//                   Personalize your AI’s identity and welcome message
//                 </p>
//               </div>
//             </CardHeader>

//             <CardContent className="px-6 pb-8 space-y-8">
//               {/* Avatar Upload */}
//               <div className="flex flex-col items-center">
//                 <div className="relative group">
//                   <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-linka-dark-orange/90 to-linka-carolina-blue/90 flex items-center justify-center mx-auto mb-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.02]">
//                     {agentConfig.avatar ? (
//                       <img
//                         src={agentConfig.avatar}
//                         alt="Agent Avatar"
//                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                       />
//                     ) : (
//                       <Bot className="w-14 h-14 sm:w-20 sm:h-20 text-white/90 animate-pulse" />
//                     )}
//                   </div>

//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleAvatarUpload}
//                     className="hidden"
//                     id="avatar-upload"
//                   />

//                   <label
//                     htmlFor="avatar-upload"
//                     className="absolute -bottom-2 -right-2 bg-white border-2 border-linka-dark-orange text-linka-dark-orange rounded-full p-2.5 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-dark-orange hover:text-white shadow-md"
//                   >
//                     <Upload className="w-5 h-5" strokeWidth={2.5} />
//                     <span className="sr-only">Upload avatar</span>
//                   </label>
//                 </div>
//                 <p className="text-xs text-linka-night/60 mt-5 font-medium">
//                   Recommended: Square image, 500×500px, max 2MB
//                 </p>
//               </div>

//               {/* Greeting Input */}
//               <div className="space-y-3">
//                 <Label htmlFor="greeting" className="text-linka-russian-violet font-medium flex items-center gap-1">
//                   Opening Greeting <span className="text-xs text-linka-dark-orange">(Max 120 chars)</span>
//                 </Label>
//                 <Textarea
//                   id="greeting"
//                   placeholder="Example: “Hello! I’m your AI assistant, how can I help?”"
//                   value={agentConfig.greeting}
//                   onChange={(e) => handleInputChange('greeting', e.target.value)}
//                   rows={3}
//                   maxLength={120}
//                   className="w-full px-4 py-3 text-linka-night border border-linka-alice-blue rounded-xl focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 transition-all duration-300 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 bg-white/80 backdrop-blur-sm"
//                 />
//                 <div className="flex justify-between items-center">
//                   <p className="text-xs text-linka-night/50 italic">
//                     Pro tip: Keep it friendly and inviting
//                   </p>
//                   <span className={`text-xs ${agentConfig.greeting?.length === 120 ? 'text-red-400' : 'text-linka-night/50'}`}>
//                     {agentConfig.greeting?.length || 0}/120
//                   </span>
//                 </div>
//               </div>

//               {/* Live Preview */}
//               <div className="bg-gradient-to-br from-linka-alice-blue/30 to-white/50 rounded-xl p-5 border border-linka-alice-blue/80 overflow-hidden relative">
//                 <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[5px] opacity-5" />
//                 <p className="text-xs text-linka-night/60 mb-3 font-medium uppercase tracking-wider">
//                   Live Preview
//                 </p>
//                 <div className="text-center space-y-3 relative z-10">
//                   <h4 className="text-xl md:text-2xl font-medium text-linka-russian-violet animate-in fade-in">
//                     Hi, I'm <span className="text-linka-dark-orange font-semibold bg-gradient-to-r from-linka-dark-orange/80 to-linka-dark-orange bg-clip-text text-transparent">
//                       {agentConfig.name || 'Your AI'}
//                     </span>
//                   </h4>
//                   <p className="text-lg md:text-xl font-semibold text-linka-night/90 animate-in fade-in delay-100">
//                     {agentConfig.greeting || 'How can I assist you today?'}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )
//       case 3:
//         return (
//           <Card className="border-none shadow-lg rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
//             <CardHeader className="px-6 pt-6 pb-4">
//               <div className="space-y-1">
//                 <CardTitle className="text-2xl font-bold text-linka-russian-violet tracking-tight">
//                   Conversation Design
//                 </CardTitle>
//                 <p className="text-sm text-linka-night/70 font-light">
//                   Craft engaging prompts and branching dialogue flows
//                 </p>
//               </div>
//             </CardHeader>

//             <CardContent className="px-6 pb-8 space-y-6">
//               {/* Conditional Prompts Toggle */}
//               <div className="flex items-center justify-between p-4 bg-linka-alice-blue/50 rounded-xl border border-linka-alice-blue transition-all duration-300 hover:bg-linka-alice-blue/70">
//                 <div className="space-y-1">
//                   <Label htmlFor="conditional-toggle" className="text-linka-russian-violet font-medium flex items-center gap-2">
//                     <GitBranch className="w-4 h-4 text-linka-dark-orange" />
//                     Enable Conditional Prompts
//                   </Label>
//                   <p className="text-xs text-linka-night/60">
//                     Create dynamic conversations that adapt to user choices
//                   </p>
//                 </div>
//                 <Switch
//                   id="conditional-toggle"
//                   checked={agentConfig.useConditionalPrompts}
//                   onCheckedChange={(checked) => handleInputChange('useConditionalPrompts', checked)}
//                   className="data-[state=checked]:bg-linka-dark-orange"
//                 />
//               </div>

//               {!agentConfig.useConditionalPrompts ? (
//                 /* Simple Prompts Mode */
//                 <div className="space-y-6 animate-in fade-in">
//                   <div className="space-y-2">
//                     <h3 className="text-lg font-medium text-linka-russian-violet flex items-center gap-2">
//                       <MessageSquare className="w-5 h-5 text-linka-carolina-blue" />
//                       Conversation Starters
//                     </h3>
//                     <p className="text-xs text-linka-night/60">
//                       These buttons will appear when users first interact with your AI
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 gap-4">
//                     {agentConfig.prompts.map((prompt, index) => (
//                       <div key={index} className="space-y-2">
//                         <Label htmlFor={`prompt-${index}`} className="text-linka-russian-violet/90">
//                           Prompt {index + 1}
//                         </Label>
//                         <Input
//                           id={`prompt-${index}`}
//                           placeholder={[
//                             "Help me plan my itinerary",
//                             "Find local recommendations",
//                             "Show me the best deals",
//                             "Tell me about activities"
//                           ][index]}
//                           value={prompt}
//                           onChange={(e) => updatePrompt(index, e.target.value)}
//                           className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 transition-all duration-200"
//                         />
//                       </div>
//                     ))}
//                   </div>

//                   {/* Preview Section */}
//                   <div className="bg-linka-alice-blue/30 rounded-xl p-4 border border-linka-alice-blue/50 mt-4">
//                     <p className="text-xs text-linka-night/70 mb-3 font-medium uppercase tracking-wider">
//                       Button Preview
//                     </p>
//                     <div className="grid grid-cols-2 gap-3">
//                       {agentConfig.prompts.map((prompt, index) => (
//                         <div
//                           key={index}
//                           className="bg-white border border-linka-columbia-blue/50 rounded-lg p-3 text-sm font-medium text-linka-night hover:shadow-sm transition-all duration-200 hover:border-linka-carolina-blue hover:translate-y-[-2px]"
//                         >
//                           {prompt || `Prompt ${index + 1}`}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 /* Conditional Prompts Mode */
//                 <div className="space-y-6 animate-in fade-in">
//                   <div className="space-y-2">
//                     <h3 className="text-lg font-medium text-linka-russian-violet flex items-center gap-2">
//                       <GitBranch className="w-5 h-5 text-linka-dark-orange" />
//                       Branching Flows
//                     </h3>
//                     <p className="text-xs text-linka-night/60">
//                       Create decision trees that adapt to different user needs
//                     </p>
//                   </div>

//                   {agentConfig.conditionalPrompts.length === 0 ? (
//                     <div className="text-center py-8 rounded-xl border-2 border-dashed border-linka-alice-blue bg-white/50">
//                       <GitBranch className="w-12 h-12 text-linka-carolina-blue/70 mx-auto mb-4 animate-pulse" />
//                       <h3 className="text-lg font-medium text-linka-russian-violet mb-2">
//                         No Conversation Flows Yet
//                       </h3>
//                       <p className="text-linka-night/60 mb-4 max-w-md mx-auto">
//                         Create your first branching conversation to guide users through different paths
//                       </p>
//                       <Button
//                         onClick={() => openConditionalModal()}
//                         className="bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white shadow-md transition-all duration-300 hover:scale-105"
//                       >
//                         <Plus className="w-4 h-4 mr-2" />
//                         Create Flow
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {agentConfig.conditionalPrompts.map((prompt) => (
//                         <Card
//                           key={prompt.id}
//                           className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 overflow-hidden"
//                         >
//                           <CardHeader className="pb-3">
//                             <div className="flex items-center justify-between">
//                               <h4 className="font-medium text-linka-russian-violet flex items-center gap-2">
//                                 <MessageSquare className="w-4 h-4 text-linka-carolina-blue" />
//                                 {prompt.mainPrompt || "Untitled Flow"}
//                               </h4>
//                               <div className="flex gap-2">
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   onClick={() => openConditionalModal(prompt)}
//                                   className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 transition-all duration-200 hover:scale-105"
//                                 >
//                                   <Edit className="w-4 h-4" />
//                                 </Button>
//                                 <AlertDialog>
//                                   <AlertDialogTrigger asChild>
//                                     <Button
//                                       variant="outline"
//                                       size="sm"
//                                       className="border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
//                                     >
//                                       <Trash2 className="w-4 h-4" />
//                                     </Button>
//                                   </AlertDialogTrigger>
//                                   <AlertDialogContent className="border-red-100">
//                                     <AlertDialogHeader>
//                                       <AlertDialogTitle className="text-linka-russian-violet">
//                                         Delete this flow?
//                                       </AlertDialogTitle>
//                                       <AlertDialogDescription>
//                                         This will permanently delete "{prompt.mainPrompt || 'this flow'}" and all its branches.
//                                       </AlertDialogDescription>
//                                     </AlertDialogHeader>
//                                     <AlertDialogFooter>
//                                       <AlertDialogCancel className="border-linka-alice-blue hover:bg-linka-alice-blue">
//                                         Cancel
//                                       </AlertDialogCancel>
//                                       <AlertDialogAction
//                                         onClick={() => deleteConditionalPrompt(prompt.id)}
//                                         className="bg-red-600 hover:bg-red-700 transition-all duration-200"
//                                       >
//                                         <Trash2 className="w-4 h-4 mr-2" />
//                                         Delete Flow
//                                       </AlertDialogAction>
//                                     </AlertDialogFooter>
//                                   </AlertDialogContent>
//                                 </AlertDialog>
//                               </div>
//                             </div>
//                           </CardHeader>
//                           <CardContent className="pt-0">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                               {/* Option 1 */}
//                               <div className="space-y-3">
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-2 h-2 rounded-full bg-linka-dark-orange" />
//                                   <Label className="text-sm font-medium text-linka-russian-violet">
//                                     {prompt.option1.label || "Option 1"}
//                                   </Label>
//                                 </div>
//                                 <div className="space-y-2 ml-4">
//                                   {prompt.option1.followUps.map((followUp, index) => (
//                                     <div
//                                       key={index}
//                                       className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
//                                     >
//                                       {followUp || `Follow-up question ${index + 1}`}
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>

//                               {/* Option 2 */}
//                               <div className="space-y-3">
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-2 h-2 rounded-full bg-linka-carolina-blue" />
//                                   <Label className="text-sm font-medium text-linka-russian-violet">
//                                     {prompt.option2.label || "Option 2"}
//                                   </Label>
//                                 </div>
//                                 <div className="space-y-2 ml-4">
//                                   {prompt.option2.followUps.map((followUp, index) => (
//                                     <div
//                                       key={index}
//                                       className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
//                                     >
//                                       {followUp || `Follow-up question ${index + 1}`}
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}

//                       {/* Add New Flow Button */}
//                       <Button
//                         onClick={() => openConditionalModal()}
//                         variant="outline"
//                         className={`w-full border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 transition-all duration-300 ${agentConfig.conditionalPrompts.length >= 2 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
//                         disabled={agentConfig.conditionalPrompts.length >= 2}
//                       >
//                         <Plus className="w-4 h-4 mr-2" />
//                         {agentConfig.conditionalPrompts.length === 0 ? 'Create First Flow' : 'Add Another Flow'}
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )
//       case 4:
//         return (
//           <Card className="border-none shadow-lg rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
//             <CardHeader className="px-6 pt-6 pb-4">
//               <div className="space-y-1">
//                 <CardTitle className="text-2xl font-bold text-linka-russian-violet tracking-tight flex items-center gap-2">
//                   <LinkIcon className="w-5 h-5 text-linka-dark-orange" />
//                   Partner URLs
//                 </CardTitle>
//                 <p className="text-sm text-linka-night/70 font-light">
//                   Add affiliate links for your AI to recommend
//                 </p>
//               </div>
//             </CardHeader>

//             <CardContent className="px-6 pb-6 space-y-4">
//               {agentConfig.partnerUrls.length > 0 ? (
//                 <div className="space-y-3">
//                   {agentConfig.partnerUrls.map((url, index) => (
//                     <div
//                       key={index}
//                       className="flex flex-col sm:flex-row gap-2 items-start sm:items-center group animate-in fade-in"
//                     >
//                       <div className="relative flex-1 w-full">
//                         <Input
//                           placeholder="https://your-affiliate-link.com"
//                           value={url}
//                           onChange={(e) => updatePartnerUrl(index, e.target.value)}
//                           className="w-full pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40 hover:border-linka-carolina-blue/50 transition-all duration-200"
//                         />
//                         <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linka-night/50" />
//                       </div>

//                       {agentConfig.partnerUrls.length > 1 && (
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() => removePartnerUrl(index)}
//                           className="border-red-200 text-red-500 hover:bg-red-50 transition-all duration-200 hover:scale-105 group-hover:opacity-100 sm:opacity-80"
//                           aria-label="Remove URL"
//                         >
//                           <X className="w-4 h-4" />
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 rounded-xl border-2 border-dashed border-linka-alice-blue bg-white/50">
//                   <Link2 className="w-12 h-12 text-linka-carolina-blue/70 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-linka-russian-violet mb-2">
//                     No Partner URLs Added
//                   </h3>
//                   <p className="text-linka-night/60 mb-4">
//                     Add your first affiliate link to get started
//                   </p>
//                 </div>
//               )}

//               <Button
//                 variant="outline"
//                 onClick={addPartnerUrl}
//                 className="w-full border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 hover:text-linka-carolina-blue transition-all duration-300 hover:scale-[1.02]"
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 {agentConfig.partnerUrls.length > 0 ? 'Add Another URL' : 'Add First URL'}
//               </Button>

//               {/* URL Validation Tips */}
//               <div className="bg-linka-alice-blue/30 rounded-lg p-3 border border-linka-alice-blue/50 mt-4">
//                 <div className="flex items-start gap-2">
//                   <InfoIcon className="w-4 h-4 text-linka-carolina-blue mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-xs font-medium text-linka-russian-violet mb-1">Pro Tips:</p>
//                     <ul className="text-xs text-linka-night/60 space-y-1">
//                       <li className="flex items-start gap-1.5">
//                         <span>•</span>
//                         <span>Use shortened affiliate links when possible</span>
//                       </li>
//                       <li className="flex items-start gap-1.5">
//                         <span>•</span>
//                         <span>Include UTM parameters for tracking</span>
//                       </li>
//                       <li className="flex items-start gap-1.5">
//                         <span>•</span>
//                         <span>Test all links before saving</span>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )
//       case 5:
//         return (
//           <div className="space-y-6">
//             <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white border border-gray-200">
//               <CardHeader className="px-6 pt-6 pb-4">
//                 <CardTitle className="text-2xl font-semibold text-linka-russian-violet">Live Preview</CardTitle>
//                 <p className="text-sm text-linka-night/70">This is exactly what your users will see</p>
//               </CardHeader>

//               <CardContent className="px-6 pb-6">
//                 {/* Preview Container */}
//                 <div className="bg-gray-50 rounded-xl p-4 sm:p-6 h-[90vh] flex flex-col w-[50%] mx-auto">
//                   {/* Avatar Section */}
//                   <div className="flex justify-center mb-6 w-full">
//                     <div className="w-full h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-linka-dark-orange to-linka-carolina-blue flex items-center justify-center shadow-md">
//                       {agentConfig.avatar ? (
//                         <img
//                           src={agentConfig.avatar}
//                           alt="AI Agent"
//                           className="w-full h-full object-cover "
//                         />
//                       ) : (
//                         <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
//                       )}
//                     </div>
//                   </div>

//                   {/* Greeting Section */}
//                   <div className="text-center mb-6 sm:mb-8">
//                     <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
//                       Hi, I'm <span className="text-linka-dark-orange">{agentConfig.name || 'Your Agent'}</span>,
//                     </h4>
//                     <p className="text-lg sm:text-xl font-normal text-gray-700">
//                       {agentConfig.greeting || 'Ready to Assist'}
//                     </p>
//                   </div>

//                   {/* Prompts Grid */}
//                   <div className="flex-1 overflow-y-auto px-1 sm:px-4">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8">
//                       {(agentConfig.useConditionalPrompts && agentConfig.conditionalPrompts.length > 0
//                         ? agentConfig.conditionalPrompts.slice(0, 2).map(cp => cp.mainPrompt)
//                         : agentConfig.prompts
//                       ).map((prompt, index) => (
//                         <button
//                           key={index}
//                           className="border border-gray-300 rounded-md py-2 px-4 text-sm hover:bg-gray-100 cursor-pointer text-left transition-colors duration-200"
//                         >
//                           <span className="font-medium text-gray-800">
//                             {prompt || `Prompt ${index + 1}`}
//                           </span>
//                         </button>
//                       ))}
//                     </div>

//                     {/* QR Code Section - Desktop Only */}
//                     <div className="mt-6 p-4 bg-orange-50 rounded-md items-center gap-6 justify-center mx-auto hidden sm:flex w-fit">
//                       <div>
//                         <p className="text-sm font-semibold text-linka-russian-violet">Continue on phone</p>
//                         <p className="text-xs text-linka-night/70">Scan QR</p>
//                       </div>
//                       <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1">
//                         <div className="w-12 h-12 bg-linka-russian-violet rounded-sm flex items-center justify-center">
//                           <div className="grid grid-cols-3 gap-0.5">
//                             {[...Array(9)].map((_, i) => (
//                               <div
//                                 key={i}
//                                 className={`w-2 h-2 rounded-sm ${i % 3 === 0 ? 'bg-white' : i % 2 === 0 ? 'bg-linka-carolina-blue' : 'bg-white'}`}
//                               />
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Input Area */}
//                   <div className="mt-4 sm:mt-6">
//                     <div className="flex bg-gray-200 rounded-full px-4 py-2 items-center gap-2">
//                       <input
//                         type="text"
//                         placeholder="Type or ask me something..."
//                         className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
//                         disabled
//                       />
//                       <button
//                         className="bg-linka-dark-orange text-white p-2 rounded-full flex items-center justify-center hover:bg-linka-dark-orange/90 transition-colors duration-200"
//                       >
//                         <Send className="w-4 h-4" />
//                       </button>
//                       <button
//                         className="bg-linka-dark-orange text-white p-2 rounded-full flex items-center justify-center hover:bg-linka-dark-orange/90 transition-colors duration-200"
//                       >
//                         <Mic className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )
//       default:
//         return null
//     }
//   }

//   return (
//     <DashboardLayout>
//       <div className="container mx-auto px-2 py-6 sm:py-4">
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-linka-russian-violet mb-4 sm:mb-0">Build Your AI Agent</h1>
//           <div className="flex gap-4">
//             <Button
//               variant="outline"
//               onClick={() => setShowPreview(!showPreview)}
//               className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
//             >
//               <Eye className="w-4 h-4 mr-2" />
//               {showPreview ? 'Hide Preview' : 'Show Preview'}
//             </Button>
//             <Button
//               onClick={handleSave}
//               className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               Save
//             </Button>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-between">
//           <div className="w-full md:w-2/4 lg:w-1/4">
//             <div className="stepper space-y-3 sm:space-y-4 relative">
//               {steps.map((step, index) => (
//                 <div key={step.id} className="relative">
//                   <div
//                     className={`stepper-item flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-md ${currentStep === step.id
//                       ? 'bg-orange-100 text-linka-russian-violet border-2 border-orange-300'
//                       : 'bg-white text-linka-russian-violet hover:bg-orange-50 border border-orange-200'
//                       }`}
//                     onClick={() => setCurrentStep(step.id)}
//                   >
//                     <div
//                       className={`stepper-number w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white font-bold transition-all ${currentStep === step.id
//                         ? 'bg-orange-500 ring-2 ring-orange-300 ring-offset-2'
//                         : 'bg-orange-400'
//                         } mr-3 sm:mr-4`}
//                     >
//                       {index + 1}
//                     </div>
//                     <div>
//                       <h3 className="text-sm sm:text-base font-semibold">{step.title}</h3>
//                       {/* <p
//                         className={`text-sm sm:text-[12px] ${currentStep === step.id ? 'text-linka-russian-violet/90' : 'text-linka-night/70'
//                           }`}
//                       >
//                         {step.description}
//                       </p> */}
//                     </div>
//                   </div>
//                   {index < steps.length - 1 && (
//                     <div
//                       className={`absolute left-5 sm:left-6 top-14 sm:top-16 w-0.5 h-8 sm:h-10 ${index < currentStep ? 'bg-orange-200' : 'bg-orange-300'}`}
//                     ></div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="w-full md:w-2/4 lg:w-3/4">
//             {renderStepContent()}
//             <div className="flex justify-between mt-6 items-center">


//               {/* Step Indicator - Centered */}
//               <div className="text-sm text-gray-500 hidden sm:block">
//                 Step {currentStep} of 5
//               </div>

//               <div className='flex gap-4'>
//                 {/* Previous Button - Always visible except first step */}
//                 <Button
//                   variant="outline"
//                   onClick={prevStep}
//                   disabled={currentStep === 1}
//                   className={`border-orange-300 text-orange-500 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200 ${currentStep !== 1 ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
//                     }`}
//                 >
//                   <ArrowLeft className="w-4 h-4 mr-2" />
//                   Previous
//                 </Button>
//                 {/* Next/Save Buttons - Conditional Rendering */}
//                 {currentStep === 5 ? (
//                   // Final Step - Show only Save & Publish
//                   <Button
//                     onClick={handleSave}
//                     className="bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white shadow-md px-6 py-2 transition-all duration-300 hover:scale-[1.02]"
//                   >
//                     <Save className="w-4 h-4 mr-2" />
//                     Save & Publish Agent
//                   </Button>
//                 ) : (
//                   // Intermediate Steps - Show Next Button
//                   <div className="flex gap-4">
//                     <Button
//                       onClick={nextStep}
//                       className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 transition-all duration-300 hover:scale-105"
//                     >
//                       Next
//                       <ArrowRight className="w-4 h-4 ml-2" />
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <Dialog open={isConditionalModalOpen} onOpenChange={setIsConditionalModalOpen}>
//           <DialogContent className="max-w-full sm:max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>{editingConditionalPrompt ? 'Edit Conditional Prompt' : 'Add Conditional Prompt'}</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-6">
//               <div>
//                 <Label htmlFor="main-prompt" className="text-linka-russian-violet font-medium">Main Prompt</Label>
//                 <Input
//                   id="main-prompt"
//                   placeholder="e.g., Are you planning a trip for leisure or business?"
//                   value={conditionalForm.mainPrompt}
//                   onChange={(e) => updateConditionalForm('mainPrompt', e.target.value)}
//                   className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
//                 />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label htmlFor="option1-label" className="text-linka-russian-violet font-medium">Option 1 Label</Label>
//                   <Input
//                     id="option1-label"
//                     placeholder="e.g., Leisure"
//                     value={conditionalForm.option1.label}
//                     onChange={(e) => updateConditionalOption('option1', 'label', e.target.value)}
//                     className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
//                   />
//                   <div className="mt-4 space-y-2">
//                     <Label className="text-linka-russian-violet">Follow-up Questions</Label>
//                     {conditionalForm.option1.followUps.map((followUp, index) => (
//                       <Input
//                         key={index}
//                         placeholder={`Follow-up ${index + 1}`}
//                         value={followUp}
//                         onChange={(e) => {
//                           const newFollowUps = [...conditionalForm.option1.followUps]
//                           newFollowUps[index] = e.target.value
//                           updateConditionalOption('option1', 'followUps', newFollowUps)
//                         }}
//                         className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <Label htmlFor="option2-label" className="text-linka-russian-violet font-medium">Option 2 Label</Label>
//                   <Input
//                     id="option2-label"
//                     placeholder="e.g., Business"
//                     value={conditionalForm.option2.label}
//                     onChange={(e) => updateConditionalOption('option2', 'label', e.target.value)}
//                     className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
//                   />
//                   <div className="mt-4 space-y-2">
//                     <Label className="text-linka-russian-violet">Follow-up Questions</Label>
//                     {conditionalForm.option2.followUps.map((followUp, index) => (
//                       <Input
//                         key={index}
//                         placeholder={`Follow-up ${index + 1}`}
//                         value={followUp}
//                         onChange={(e) => {
//                           const newFollowUps = [...conditionalForm.option2.followUps]
//                           newFollowUps[index] = e.target.value
//                           updateConditionalOption('option2', 'followUps', newFollowUps)
//                         }}
//                         className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end gap-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsConditionalModalOpen(false)}
//                   className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={saveConditionalPrompt}
//                   className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
//                 >
//                   Save
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   )
// }