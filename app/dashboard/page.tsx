"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  MousePointer,
  Plus,
  Bot,
  BarChart3,
  ChevronRight,
  Sparkles,
  Zap,
  ShoppingBag,
  Settings,
  LayoutTemplate,
} from "lucide-react";
import { motion } from "framer-motion";
import { initializeAuthState } from '@/store/slices/authSlice';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { RootState } from "@/store/types";

interface AnalyticsSummary {
  totalClicks: number;
  totalViews: number;
  totalRevenue: number;
  conversionRate: string;
}

interface Settings {
  customUrl?: string;
  agentName: string;
}

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [affiliateLinksCount, setAffiliateLinksCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { aiAgentData } = useSelector((state:RootState)=>state.auth)

  useEffect(() => {
      dispatch(initializeAuthState());
    }, [dispatch]);

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 sm:px-6 lg:px-8 py-6 max-w-[95%] mx-auto">
        <div className="mb-6 animate-fade-in relative">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Button
                  asChild
                  className="bg-orange-600 hover:bg-orange-700 text-white mb-3"
                >
                  <Link href="/pricing">Subscription</Link>
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white select-text">
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    Good {getTimeOfDay()},
                  </span>
                  <motion.span
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                      marginLeft: "0.50rem",
                    }}
                  >
                    {aiAgentData?.user?.first_name || "User"}
                  </motion.span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-lg select-text">
                  Here's what's happening with your AI agent today. Let's make
                  some sales!
                </p>
              </div>
              <div className="hidden sm:block">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-300 hover:scale-105 transition-transform duration-300 select-text"
                >
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  New features available!
                </Badge>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-amber-200/30 dark:bg-amber-800/20 blur-xl animate-float-slow pointer-events-none"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Zap className="h-8 w-8 text-white animate-bounce" />
                </div>
                <div className="absolute -inset-2 rounded-full bg-orange-400/30 animate-ping opacity-75 pointer-events-none"></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium select-text">
                Loading your dashboard...
              </p>
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 animate-progress pointer-events-none"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <StatCard
                title="Total Chats"
                value={analytics?.totalViews?.toLocaleString() || "0"}
                icon={<Users className="h-5 w-5" />}
                trend="up"
                change="5.7%"
                period="Last 7 days"
              />
              <StatCard
                title="Total Clicks"
                value={analytics?.totalClicks?.toLocaleString() || "0"}
                icon={<MousePointer className="h-5 w-5" />}
                trend="up"
                change="8.2%"
                period="Last 7 days"
              />
              {/* <StatCard
                title="Total Revenue"
                value={`$${analytics?.totalRevenue?.toFixed(2) || "0.00"}`}
                icon={<DollarSign className="h-5 w-5" />}
                trend="up"
                change="12.5%"
                period="Last 7 days"
                currency={true}
                comingSoon={true}
              />
              <StatCard
                title="Conversion Rate"
                value={`${analytics?.conversionRate || "0"}%`}
                icon={<TrendingUp className="h-5 w-5" />}
                trend="up"
                change="2.3%"
                period="Last 7 days"
                comingSoon={true}
              /> */}
              
              <button className="w-full rounded-2xl shadow-sm hover:shadow-md p-4 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-gray-100 transition-all duration-200 flex items-center justify-between group border border-gray-100">
                {/* Text with premium badge */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                    Conversation Log
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-amber-800 rounded-full border border-amber-200 shadow-inner">
                    PRO ONLY
                  </span>
                </div>

                {/* Icons with animation */}
                <div className="flex items-center">
                  <span className="text-gray-300 group-hover:text-gray-400 text-lg mr-2 transition-colors">🔒</span>
                  <span className="text-orange-500 group-hover:text-orange-600 text-xl transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 group relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-800/20 dark:to-amber-800/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 -z-10 pointer-events-none"></div>
                <Card className="border border-gray-200 h-full dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:-">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl shadow-inner">
                          <Bot className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="select-text">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          {settings?.agentName || "AI Shopping Assistant"}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          Your personalized AI agent is ready to boost your
                          sales
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4 select-text">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse pointer-events-none"></div>
                            <div className="absolute -inset-1 rounded-full bg-green-500/30 animate-ping opacity-75 pointer-events-none"></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Live Status
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                        >
                          Active & Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 group-hover:bg-gray-50/50 dark:group-hover:bg-gray-800/50 px-2 -mx-2 rounded-lg transition-colors duration-300">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 pointer-events-none"></div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Monetization
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                            {affiliateLinksCount}{" "}
                            {affiliateLinksCount === 1 ? "Link" : "Links"}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6 lg:col-span-2">
                <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:-">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white select-text">
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 select-text">
                      Get started in seconds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <Link href="/agent" passHref legacyBehavior>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full cursor-pointer justify-between px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
                        >
                          <div>
                            <div className="flex items-center">
                              <div className="mr-3 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700/70 transition-colors duration-200">
                                <Plus className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white select-text">
                                  Affiliate Links
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 select-text">
                                  Connect your products
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                          </div>
                        </Button>
                      </Link>
                      <Link href="/embed" passHref legacyBehavior>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full cursor-pointer justify-between px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
                        >
                          <div>
                            <div className="flex items-center">
                              <div className="mr-3 p-2bg-gray-100 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700/70 transition-colors duration-200">
                                <Bot className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white select-text">
                                  Share Agent & Grow
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 select-text">
                                  Share on social. Embed on Website
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                          </div>
                        </Button>
                      </Link>
                      <Link href="/analytics" passHref legacyBehavior>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-between cursor-pointer px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
                        >
                          <div>
                            <div className="flex items-center">
                              <div className="mr-3 p-2bg-gray-100 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700/70 transition-colors duration-200">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white select-text">
                                  View Analytics
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 select-text">
                                  Track performance
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {affiliateLinksCount === 0 && (
              <Card className="border border-orange-200 dark:border-orange-800 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 shadow-xl overflow-hidden relative">
                <CardHeader className="relative z-10">
                  <CardTitle className="text-orange-900 dark:text-orange-200 text-2xl select-text">
                    Let's Get You Started!
                  </CardTitle>
                  <CardDescription className="text-orange-800/90 dark:text-orange-300/90 select-text">
                    Follow these simple steps to launch your AI monetization
                    agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <OnboardingStep
                      step={1}
                      title="Add Your Recommendations"
                      description="Connect your affiliate links and let AI handle the rest"
                      buttonText="Add Links"
                      href="/agent"
                      icon={<ShoppingBag className="h-5 w-5" />}
                    />
                    <OnboardingStep
                      step={2}
                      title="Customize Your Agent"
                      description="Personalize your AI's behavior and knowledge base"
                      buttonText="Customize"
                      href="/settings"
                      icon={<Settings className="h-5 w-5" />}
                    />
                    <OnboardingStep
                      step={3}
                      title="Embed & Share"
                      description="Add to your site or share your unique link"
                      buttonText="Get Code"
                      href="/embed"
                      icon={<LayoutTemplate className="h-5 w-5" />}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900/50 shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white select-text">
                  Performance Tips
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 select-text">
                  Boost your conversion rate with these expert recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <TipCard
                    title="Optimize Agent's Persona"
                    description="Clearly define agent's role and specialization, and goals"
                    icon="✨"
                    color="purple"
                  />
                  <TipCard
                    title="Use Multiple Links"
                    description="More products = more opportunities"
                    icon="🔗"
                    color="emerald"
                  />
                  <TipCard
                    title="Promote Your Chat"
                    description="Share on social media for more traffic"
                    icon="📢"
                    color="orange"
                  />
                  <TipCard
                    title="Scale with Pro Monetization"
                    description="Earn commissions on related AI recommendations"
                    icon="💰"
                    color="orange"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slow-delay {
          animation: float-slow 8s ease-in-out infinite 2s;
        }
      `}</style>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  change,
  period,
  currency = false,
  comingSoon = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: "up" | "down";
  change: string;
  period: string;
  currency?: boolean;
  comingSoon?: boolean;
}) {
  const trendColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
  };
  return (
    <Card className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden group relative">
      {comingSoon && (
        <div className="absolute -right-2 top-3 z-20 overflow-hidden">
          <div
            className="relative bg-gradient-to-r from-amber-500 to-amber-600 h-6 flex items-center justify-center shadow-sm 
                         transform transition-all duration-300 group-hover:translate-y-0.5 group-hover:shadow-md"
          >
            <div className="text-white text-xs font-bold uppercase tracking-wider px-3 rounded-md">
              Coming Soon
            </div>
            <div className="absolute -left-1.5 top-0 h-full w-1.5 bg-amber-700/50 skew-x-12" />
            <div className="absolute -right-1.5 top-0 h-full w-1.5 bg-amber-700/50 -skew-x-12" />
          </div>
        </div>
      )}
      {comingSoon && (
        <div className="absolute inset-0 z-10 bg-white/30 dark:bg-black/20 transition-opacity duration-300 group-hover:opacity-70" />
      )}
      <CardContent
        className={`p-4 md:p-6 relative ${comingSoon ? "opacity-90 group-hover:opacity-100 transition-opacity duration-300" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {title}
            </p>
            <p
              className={`text-2xl font-bold text-gray-900 dark:text-white mt-1 ${currency ? "font-mono" : ""}`}
            >
              {value}
            </p>
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${trendColors[trend]}`}>
                {trend === "up" ? "↑" : "↓"} {change}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                • {period}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/70 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-300 pointer-events-none">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OnboardingStep({
  step,
  title,
  description,
  buttonText,
  href,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-orange-200 dark:border-orange-800/50 shadow-md hover:shadow-lg transition-all duration-300 hover:- backdrop-blur-sm group overflow-hidden">
      <div className="relative z-10 select-text">
        <div className="flex items-center mb-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-300 font-bold mr-3 shadow-inner pointer-events-none">
            {step}
          </div>
          <h3 className="font-semibold text-orange-900 dark:text-orange-200 group-hover:text-orange-950 dark:group-hover:text-orange-100 transition-colors duration-300">
            {title}
          </h3>
        </div>
        <p className="text-sm text-orange-800/80 dark:text-orange-300/80 mb-4 group-hover:text-orange-900/90 dark:group-hover:text-orange-200/90 transition-colors duration-300">
          {description}
        </p>
        <Link href={href} legacyBehavior>
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]"
          >
            <span className="flex items-center">
              {icon}
              <span className="ml-2">{buttonText}</span>
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TipCard({
  title,
  description,
  icon,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    purple:
      "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    emerald:
      "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:- overflow-hidden group">
      <div className="relative z-10 select-text">
        <div
          className={`h-10 w-10 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform duration-300 pointer-events-none`}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-gray-950 dark:group-hover:text-gray-100 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}
