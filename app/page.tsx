
'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  MessageSquare, 
  CheckCircle,
  Users,
  DollarSign,
  Zap,
  Bot,
  Globe,
  Star,
  BarChart,
  TrendingUp,
  Monitor,
  Smartphone,
  Share2,
  Building,
  Quote
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Your Revenue-Generating AI Agent
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Linka.ai creates intelligent AI agents that engage your audience, answer questions, and drive revenue automatically.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See Your AI Agent in Action
            </h2>
            <p className="text-xl text-gray-600">
              Personalized AI agent that converts your audience into customers!
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Screenshot 1 */}
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Skincare Expert Welcome</h3>
                <p className="text-gray-600">Alexandra M. introduces her beauty expertise with personalized skincare guidance</p>
              </div>
              
              <div className="relative aspect-[9/16] bg-white rounded-2xl overflow-hidden mx-auto max-w-sm">
                <Image
                  src="/alexandra_greeting_new.jpg"
                  alt="Alexandra M. AI Agent Greeting Screen - Professional Skincare Expert Interface"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Beauty influencer branding with professional avatar</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Skincare expertise and specialization featured</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Interactive prompts for personalized advice</span>
                </div>
              </div>
            </motion.div>

            {/* Screenshot 2 */}
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Skincare Product Advice</h3>
                <p className="text-gray-600">Alexandra M. provides detailed product recommendations with explanations and benefits</p>
              </div>
              
              <div className="relative aspect-[9/16] bg-white rounded-2xl overflow-hidden mx-auto max-w-sm">
                <Image
                  src="/alexandra_chat_new.jpg"
                  alt="Alexandra M. AI Agent Conversation - Smart Product Recommendations Interface"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Detailed skincare product explanations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Expert beauty advice with product benefits</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Seamless affiliate link integration</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-16 text-center">
            <motion.div 
              className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to See Your Own AI Agent?
              </h3>
              <p className="text-gray-600 mb-6">
                Create your professional AI agent in minutes. No coding required - just your expertise and affiliate links.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/signup">
                    <Bot className="w-5 h-5 mr-2" />
                    Build Your Agent Free
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/agent">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Try Interactive Demo
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Linka AI Agents Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Linka AI Agents are Perfect for Creators & Brands
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Install this Linka on your website, social media accounts, blogs and even on digital screens on location!
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Websites</h3>
              <p className="text-gray-600">Embed your AI agent directly on your website to engage visitors and convert them into customers 24/7.</p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Share2 className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Media</h3>
              <p className="text-gray-600">Share your agent's link on Instagram, TikTok, Twitter, and other platforms to monetize your social presence.</p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Blogs & Content</h3>
              <p className="text-gray-600">Integrate your AI agent into blog posts and content to answer reader questions and recommend products.</p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Monitor className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Screens</h3>
              <p className="text-gray-600">Display QR codes linking to your agent on digital screens in stores, hotels, and physical locations.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Trusted by Creators & Brands Worldwide
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              See how businesses are using Linka.ai to engage customers and drive revenue
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="flex items-center mb-4">
                <Quote className="w-6 h-6 text-blue-600 mr-2" />
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Our hotel guests love getting instant recommendations for local restaurants and activities. Linka.ai has improved our customer experience tremendously."
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">Sarah Chen</p>
                <p className="text-sm text-gray-600">General Manager, Oceanview Resort</p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <Quote className="w-6 h-6 text-purple-600 mr-2" />
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Shoppers can now get personalized product recommendations instantly. Our conversion rate increased by 35% since implementing Linka.ai."
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">Marcus Rodriguez</p>
                <p className="text-sm text-gray-600">Marketing Director, Central Plaza Mall</p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <Quote className="w-6 h-6 text-green-600 mr-2" />
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "My followers love getting travel tips and destination recommendations from my AI agent. It's like having me available to chat 24/7!"
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">Emma Thompson</p>
                <p className="text-sm text-gray-600">Travel Creator, @WanderlustEmma</p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center mb-4">
                <Quote className="w-6 h-6 text-orange-600 mr-2" />
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Linka.ai helps my audience find the perfect recipes and kitchen tools. My affiliate revenue has doubled since I started using it!"
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">Chef Antonio</p>
                <p className="text-sm text-gray-600">Food Creator, @ChefTonysKitchen</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Build Your AI Agent?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join creators and brands who are already earning passive income through AI-powered recommendations. Get started in minutes!
            </p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up Free</h3>
                <p className="text-gray-600">Create your account in seconds</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize Agent</h3>
                <p className="text-gray-600">Add your expertise & affiliate links</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Earning</h3>
                <p className="text-gray-600">Deploy anywhere & earn 24/7</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8 text-gray-600">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                <span>No coding required</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                <span>Works 24/7</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                <span>Instant setup</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 text-lg">
              <Link href="/signup">
                <Zap className="w-6 h-6 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-12 py-4 text-lg border-2">
              <Link href="/login">
                <Bot className="w-6 h-6 mr-2" />
                Sign In
              </Link>
            </Button>
          </motion.div>

          <motion.p 
            className="text-sm text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Ready to try the demo? <Link href="/signup" className="text-orange-600 hover:underline font-medium">Create your free account</Link> to access the full builder.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect for Creators, Brands & Businesses
            </h2>
            <p className="text-xl text-gray-600">
              Turn your expertise into revenue with AI-powered recommendations and customer engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Deploy Everywhere
              </h3>
              <p className="text-gray-600">
                Get a custom linka.ai URL and embed code. Deploy your AI agent on websites, social media, blogs, or digital screens in physical locations.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Automatic Revenue Generation
              </h3>
              <p className="text-gray-600">
                Your AI naturally recommends products and services in conversations. No hard selling - just helpful suggestions that generate commissions and sales.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Scale Your Business
              </h3>
              <p className="text-gray-600">
                Handle thousands of customer inquiries simultaneously. Your AI agent works 24/7, helping your audience while you focus on growing your business.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. Scale as you grow with no hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$19</div>
                <p className="text-gray-600">per month</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>1 AI Agent</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>100 conversations/month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Basic customization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>linka.ai subdomain</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited affiliate links</span>
                </li>
              </ul>
              
              <Button asChild className="w-full" variant="outline">
                <Link href="/signup">
                  Get Started
                </Link>
              </Button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-500 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$59</div>
                <p className="text-gray-600">per month</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>3 AI Agents</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>40,000 conversations/month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced customization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Custom domain support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                <Link href="/signup">
                  Start Pro Trial
                </Link>
              </Button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <div className="text-2xl font-semibold text-gray-300 mb-2">Custom Pricing</div>
                <p className="text-gray-400">tailored to your needs</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Unlimited AI Agents</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Unlimited conversations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>API integration capabilities</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Digital screen deployment</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>White-label solutions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
              
              <Button asChild className="w-full bg-white text-gray-900 hover:bg-gray-100">
                <Link href="mailto:sales@linka.ai?subject=Enterprise Plan Inquiry&body=Hi, I'm interested in learning more about Linka.ai's Enterprise plan and would like to discuss pricing and features for my organization.">
                  Contact Us
                </Link>
              </Button>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include unlimited affiliate links and 24/7 automated responses
            </p>
            <p className="text-sm text-gray-500">
              Need something custom? <Link href="/contact" className="text-orange-600 hover:underline">Contact us</Link> for enterprise solutions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Start Building Your AI Agent Today
          </motion.h2>
          <motion.p 
            className="text-xl text-orange-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join creators and brands earning revenue through intelligent AI-powered customer engagement
          </motion.p>
          <motion.div 
            className="grid sm:grid-cols-3 gap-4 mb-8 text-orange-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Custom linka.ai URL</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Deploy anywhere</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>24/7 revenue generation</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-50 px-8 py-3">
              <Link href="/signup">
                Build Your AI Agent Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
