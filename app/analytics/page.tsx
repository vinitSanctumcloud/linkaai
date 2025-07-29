"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  DollarSign,
  MousePointerClick,
  Calendar,
  Activity,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Clock,
  Zap,
  ExternalLink,
  Smartphone,
  Globe,
  CreditCard,
  Laptop,
  TabletSmartphone,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { RootState, AppDispatch } from "@/store";
import { fetchAgentDetails } from '@/store/slices/agentSlice'; // Adjust import path

// Enhanced interfaces with more realistic data types
interface AnalyticsSummary {
  totalClicks: number;
  totalViews: number;
  totalRevenue: number;
  conversionRate: string;
  avgSessionDuration: string;
  topReferrer: string;
  topCountry: string;
  topDevice: string;
  topBrowser: string;
  bounceRate: string;
  newVisitors: number;
  returningVisitors: number;
  totalConversions: number;
}

interface DailyStats {
  date: string;
  clicks: number;
  views: number;
  revenue: number;
  conversions: number;
  avgOrderValue: number;
  sessions: number;
}

interface ActivityItem {
  type: "click" | "view" | "conversion";
  createdAt: Date;
  value: number | null;
  userAgent?: string;
  location?: string;
  referrer?: string;
  browser?: string;
  ip?: string;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyStats: DailyStats[];
  recentActivity: ActivityItem[];
  hourlyActivity: { hour: string; activity: number }[];
  referrers: { name: string; value: number; icon: React.ReactNode }[];
  devices: { name: string; value: number; icon: React.ReactNode }[];
  countries: { name: string; value: number; flag: string }[];
  browsers: { name: string; value: number }[];
  revenueSources: { name: string; value: number }[];
}

interface Agent {
  id: string;
  name: string;
  metrics?: {
    clicks: number;
    views: number;
    revenue: number;
  };
}

const generateMockHourlyActivity = () => {
  const baseHours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const isBusinessHour = hour >= 9 && hour <= 17;
    const isLunchTime = hour >= 12 && hour <= 13;

    let activity = 50;
    if (isBusinessHour) activity += Math.floor(Math.random() * 80) + 50;
    if (isLunchTime) activity *= 0.7;

    activity += Math.floor(Math.random() * 30) - 15;

    return {
      hour: `${i}:00`,
      activity: Math.max(20, activity),
    };
  });

  return baseHours.map((hour, i) => {
    if (i === 0 || i === 23) return hour;
    const prev = baseHours[i - 1].activity;
    const next = baseHours[i + 1].activity;
    return {
      hour: hour.hour,
      activity: Math.floor((prev + hour.activity + next) / 3),
    };
  });
};

const generateDailyStats = (period: string) => {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 24;
  const baseDate = new Date();

  return Array.from({ length: days }, (_, i) => {
    const dateOffset = period === "7d" ? 6 - i : period === "30d" ? 29 - i : i;
    const date = new Date(baseDate);

    if (period === "1d") {
      date.setHours(date.getHours() - i);
    } else {
      date.setDate(date.getDate() - dateOffset);
    }

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;

    let baseClicks = isWeekend ? 60 : 120;
    if (isMonday) baseClicks *= 1.2;

    let baseViews = isWeekend ? 250 : 500;
    if (isMonday) baseViews *= 1.15;

    const monthlyTrend = period === "30d" ? 1 + (i / 30) * 0.3 : 1;
    const randomFactor = 0.8 + Math.random() * 0.4;

    const clicks = Math.floor(baseClicks * monthlyTrend * randomFactor);
    const views = Math.floor(baseViews * monthlyTrend * randomFactor);
    const conversions = Math.floor(clicks * (0.12 + Math.random() * 0.06));
    const avgOrderValue = 25 + Math.random() * 15;
    const revenue = parseFloat((conversions * avgOrderValue).toFixed(2));
    const sessions = Math.floor(views * (0.7 + Math.random() * 0.2));

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: period === "1d" ? "numeric" : undefined,
      }),
      clicks,
      views,
      revenue,
      conversions,
      avgOrderValue,
      sessions,
    };
  }).reverse();
};

export default function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>(); // Use useAppDispatch instead of useDispatch
  const { agent: agentDetails, status, error } = useSelector((state: RootState) => state.agents);
  console.log({ agentDetails, status, error }, "Agent state");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeActivities, setRealtimeActivities] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeOfDay, setTimeOfDay] = useState("morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAgentDetails());
    }
  }, [dispatch, status]);

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; SM-S901U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
  ];

  const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Other"];
  const locations = ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR"];
  const referrers = ["google.com", "facebook.com", "twitter.com", "instagram.com", "direct", "newsletter"];
  const ips = Array.from({ length: 50 }, (_, i) => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);

  useEffect(() => {
    if (!analyticsData) return;

    const activityTypes: ("click" | "view" | "conversion")[] = ["click", "view", "conversion"];
    const interval = setInterval(() => {
      const now = new Date();
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const isConversion = type === "conversion";
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

      const newActivity: ActivityItem = {
        type,
        createdAt: now,
        value: isConversion ? parseFloat((Math.random() * 50 + 15).toFixed(2)) : null,
        userAgent,
        location: locations[Math.floor(Math.random() * locations.length)],
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        ip: ips[Math.floor(Math.random() * ips.length)],
      };

      setRealtimeActivities((prev) => [newActivity, ...prev.slice(0, 7)]);
    }, Math.random() * 4000 + 1000);

    return () => clearInterval(interval);
  }, [analyticsData]);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

      const mockData: AnalyticsData = {
        summary: {
          totalClicks: 2487,
          totalViews: 10245,
          totalRevenue: 8568.42,
          conversionRate: "24.3",
          avgSessionDuration: "3m 42s",
          topReferrer: "instagram.com",
          topCountry: "United States",
          topDevice: "Mobile",
          topBrowser: "Chrome",
          bounceRate: "32.5",
          newVisitors: 6842,
          returningVisitors: 3403,
          totalConversions: 50,
        },
        dailyStats: generateDailyStats(period),
        recentActivity: Array.from({ length: 8 }, (_, i) => {
          const types: ("click" | "view" | "conversion")[] = ["click", "view", "conversion"];
          const type = types[Math.floor(Math.random() * types.length)];
          const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

          return {
            type,
            createdAt: new Date(Date.now() - i * 45 * 60 * 1000),
            value: type === "conversion" ? parseFloat((Math.random() * 50 + 15).toFixed(2)) : null,
            userAgent,
            location: locations[Math.floor(Math.random() * locations.length)],
            referrer: referrers[Math.floor(Math.random() * referrers.length)],
            browser: browsers[Math.floor(Math.random() * browsers.length)],
            ip: ips[Math.floor(Math.random() * ips.length)],
          };
        }),
        hourlyActivity: generateMockHourlyActivity(),
        referrers: [
          { name: "Instagram", value: 45, icon: <ExternalLink className="w-4 h-4 text-pink-500" /> },
          { name: "Facebook", value: 30, icon: <ExternalLink className="w-4 h-4 text-blue-500" /> },
          { name: "Twitter", value: 15, icon: <ExternalLink className="w-4 h-4 text-sky-500" /> },
          { name: "Direct", value: 7, icon: <MousePointerClick className="w-4 h-4 text-gray-500" /> },
          { name: "Newsletter", value: 3, icon: <ExternalLink className="w-4 h-4 text-purple-500" /> },
        ],
        devices: [
          { name: "Mobile", value: 62, icon: <Smartphone className="w-4 h-4 text-indigo-500" /> },
          { name: "Desktop", value: 35, icon: <Laptop className="w-4 h-4 text-blue-500" /> },
          { name: "Tablet", value: 3, icon: <TabletSmartphone className="w-4 h-4 text-green-500" /> },
        ],
        countries: [
          { name: "United States", value: 58, flag: "🇺🇸" },
          { name: "United Kingdom", value: 15, flag: "🇬🇧" },
          { name: "Canada", value: 10, flag: "🇨🇦" },
          { name: "Australia", value: 8, flag: "🇦🇺" },
          { name: "Germany", value: 6, flag: "🇩🇪" },
          { name: "Other", value: 3, flag: "🌐" },
        ],
        browsers: [
          { name: "Chrome", value: 68 },
          { name: "Safari", value: 22 },
          { name: "Firefox", value: 5 },
          { name: "Edge", value: 3 },
          { name: "Other", value: 2 },
        ],
        revenueSources: [
          { name: "Subscriptions", value: 65 },
          { name: "One-time", value: 25 },
          { name: "Upsells", value: 10 },
        ],
      };

      setAnalyticsData(mockData);
      setRealtimeActivities([]);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  }, [period, agentDetails]);

  useEffect(() => {
    if (status === "succeeded" || status === "failed") {
      fetchAnalytics();
    }
  }, [fetchAnalytics, status]);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading agent data...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (status === "failed") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Error: {error || "Failed to load agent data"}</p>
            <Button
              onClick={() => dispatch(fetchAgentDetails())}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agentDetails) {
    console.warn("Agent details are null, using fallback analytics data");
  }

  const chartColors = [
    "#6366F1",
    "#3B82F6",
    "#F59E0B",
    "#EC4899",
    "#22C55E",
    "#EF4444",
    "#FBBF24",
    "#8B5CF6",
  ];

  const generateGradient = (color: string) => (
    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
    </linearGradient>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {entry.name === "Revenue"
                    ? `$${entry.value.toFixed(2)}`
                    : entry.name === "Rate"
                      ? `${entry.value}%`
                      : entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Engagement Metrics"
              description="Daily performance trends with 30% MoM growth"
              className="min-h-[400px]"
              chartHeight="340px"
              headerActions={
                <Select>
                  <SelectTrigger className="h-8 w-[120px] text-xs border-gray-200/80 hover:border-gray-300 bg-white/50 dark:bg-gray-800/50">
                    <SelectValue placeholder="Last 7 days" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200/80 bg-white/90 backdrop-blur-md dark:bg-gray-800/90 dark:border-gray-700/50">
                    <SelectItem value="7" className="text-xs hover:bg-gray-50/80 dark:hover:bg-gray-700/50">
                      Last 7 days
                    </SelectItem>
                    <SelectItem value="30" className="text-xs hover:bg-gray-50/80 dark:hover:bg-gray-700/50">
                      Last 30 days
                    </SelectItem>
                  </SelectContent>
                </Select>
              }
              footerContent={
                <div className="flex items-center justify-center gap-4 text-xs">
                  {[
                    { color: "bg-indigo-500", label: "Views" },
                    { color: "bg-sky-500", label: "Clicks" },
                    { color: "bg-rose-500", label: "Conversions" },
                  ].map((item, index) => (
                    <span key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className={`w-2 h-2 rounded-full ${item.color} mr-1.5`}></span>
                      {item.label}
                    </span>
                  ))}
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analyticsData?.dailyStats || []}
                  margin={{ top: 12, right: 16, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" strokeOpacity={0.6} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickMargin={8}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value.split(" ")[0]}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickMargin={8}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      background: "rgba(255,255,255,0.96)",
                      backdropFilter: "blur(4px)",
                      boxShadow: "0 6px 20px -6px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                    itemStyle={{ fontSize: "13px", padding: "2px 0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#6366F1"
                    strokeWidth={1.8}
                    fill="url(#viewGradient)"
                    name="Views"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#6366F1" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#0EA5E9"
                    strokeWidth={1.8}
                    fill="url(#clickGradient)"
                    name="Clicks"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#0EA5E9" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="#F43F5E"
                    strokeWidth={1.8}
                    dot={{ r: 3, stroke: "#F43F5E", strokeWidth: 1.5, fill: "#fff" }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#F43F5E" }}
                    name="Conversions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard
              title="Traffic Sources"
              description="Distribution of visitor sources"
              className="min-h-[452px]"
            >
              <div className="flex h-full flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="w-full flex flex-col justify-center space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-blue-500" />
                      Top Locations
                    </h3>
                    <div className="space-y-3">
                      {analyticsData?.countries
                        .slice(0, 4)
                        .map((country, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 text-lg">
                                {country.flag}
                              </span>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {country.name}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">
                                {country.value}%
                              </span>
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${country.value}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        );
      // case "engagement":
      //   return (
      //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      //       <ChartCard
      //         title="Daily Engagement"
      //         description="Detailed interaction metrics"
      //         className="min-h-[400px]"
      //       >
      //         <ResponsiveContainer width="100%" height="100%">
      //           <BarChart
      //             data={analyticsData?.dailyStats || []}
      //             margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
      //           >
      //             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.3} />
      //             <XAxis
      //               dataKey="date"
      //               tick={{ fontSize: 12, fill: "#6b7280" }}
      //               tickMargin={10}
      //               axisLine={false}
      //               tickLine={false}
      //             />
      //             <YAxis
      //               tick={{ fontSize: 12, fill: "#6b7280" }}
      //               tickMargin={10}
      //               axisLine={false}
      //               tickLine={false}
      //             />
      //             <Tooltip content={<CustomTooltip />} />
      //             <Legend />
      //             <Bar
      //               dataKey="views"
      //               fill={chartColors[0]}
      //               name="Views"
      //               radius={[4, 4, 0, 0]}
      //               animationDuration={800}
      //             />
      //             <Bar
      //               dataKey="clicks"
      //               fill={chartColors[1]}
      //               name="Clicks"
      //               radius={[4, 4, 0, 0]}
      //               animationDuration={800}
      //             />
      //           </BarChart>
      //         </ResponsiveContainer>
      //       </ChartCard>
      //       <ChartCard
      //         title="Hourly Activity"
      //         description="Peak engagement times (last 24h)"
      //         className="min-h-[400px]"
      //       >
      //         <ResponsiveContainer width="100%" height="100%">
      //           <BarChart
      //             data={analyticsData?.hourlyActivity || []}
      //             margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
      //           >
      //             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.3} />
      //             <XAxis
      //               dataKey="hour"
      //               tick={{ fontSize: 12, fill: "#6b7280" }}
      //               tickMargin={10}
      //               axisLine={false}
      //               tickLine={false}
      //             />
      //             <YAxis
      //               tick={{ fontSize: 12, fill: "#6b7280" }}
      //               tickMargin={10}
      //               axisLine={false}
      //               tickLine={false}
      //             />
      //             <Tooltip formatter={(value) => [`${value} interactions`, "Activity"]} />
      //             <Bar dataKey="activity" name="Activity" radius={[4, 4, 0, 0]} animationDuration={800}>
      //               {analyticsData?.hourlyActivity.map((entry, index) => (
      //                 <Cell
      //                   key={`cell-${index}`}
      //                   fill={entry.activity > 120 ? chartColors[0] : entry.activity > 80 ? chartColors[1] : chartColors[2]}
      //                 />
      //               ))}
      //             </Bar>
      //           </BarChart>
      //         </ResponsiveContainer>
      //       </ChartCard>
      //     </div>
      //   );
      // case "revenue":
      //   return (
      //     <div className="grid grid-cols-1 gap-6">
      //       <ChartCard
      //         title="Revenue Performance"
      //         description="Daily revenue and conversion trends"
      //         className="min-h-[400px]"
      //       >
      //         <ResponsiveContainer width="100%" height="100%">
      //           <LineChart
      //             data={analyticsData?.dailyStats || []}
      //             margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
      //           >
      //             <defs>{generateGradient(chartColors[2])}{generateGradient(chartColors[5])}</defs>
      //             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.3} />
      //             <XAxis
      //               dataKey="date"
      //               tick={{ fontSize: 12, fill: "#6b7280" }}
      //               tickMargin={10}
      //               axisLine={false}
      //               tickLine={false}
      //             />
      //             <YAxis
      //               tick={{ fontSize: 12, fill: "#6b7280" }}
      //               tickMargin={10}
      //               axisLine={false}
      //               tickLine={false}
      //             />
      //             <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
      //             <Legend />
      //             <Line
      //               type="monotone"
      //               dataKey="revenue"
      //               stroke={chartColors[2]}
      //               strokeWidth={2}
      //               name="Revenue ($)"
      //               dot={{ r: 4 }}
      //               activeDot={{ r: 6 }}
      //             />
      //             <Area
      //               type="monotone"
      //               dataKey="conversions"
      //               stroke={chartColors[5]}
      //               fillOpacity={1}
      //               fill={`url(#gradient-${chartColors[5]})`}
      //               name="Conversions"
      //               strokeWidth={2}
      //               activeDot={{ r: 6 }}
      //             />
      //           </LineChart>
      //         </ResponsiveContainer>
      //       </ChartCard>
      //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      //         <StatCard
      //           title="Avg. Revenue per Conversion"
      //           value={`$${analyticsData
      //             ? (analyticsData.dailyStats.reduce((sum, day) => sum + day.revenue, 0) /
      //               (analyticsData.dailyStats.reduce((sum, day) => sum + day.conversions, 0) || 1)).toFixed(2)
      //             : "0.00"}`}
      //           icon={<CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
      //           color="indigo"
      //           change="+5.2%"
      //           period="from last period"
      //           secondaryText="Based on 248 conversions"
      //         />
      //         <StatCard
      //           title="Projected Monthly Revenue"
      //           value={`$${analyticsData ? (analyticsData.summary.totalRevenue * 4.3).toLocaleString("en-US") : "0"}`}
      //           icon={<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />}
      //           color="green"
      //           change="+12.8%"
      //           period="from last month"
      //           secondaryText="Current trend continuing"
      //         />
      //         <StatCard
      //           title="Top Conversion Day"
      //           value={analyticsData?.dailyStats.reduce((max, day) => (day.revenue > max.revenue ? day : max), analyticsData?.dailyStats[0])?.date || "N/A"}
      //           icon={<Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      //           color="blue"
      //           change="+18%"
      //           period="higher than average"
      //           secondaryText={`$${analyticsData?.dailyStats.reduce((max, day) => (day.revenue > max.revenue ? day : max), analyticsData?.dailyStats[0])?.revenue.toFixed(2)} revenue`}
      //         />
      //       </div>
      //     </div>
      //   );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto font-inter min-h-screen bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
        >
          <div className="w-full sm:w-auto">
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Good {timeOfDay},</span>
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
                {agentDetails?.agent_name || "User"}
              </motion.span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm xs:text-base sm:text-lg max-w-full sm:max-w-md">
              Here's what's happening with your AI agent today.{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {analyticsData?.summary?.totalConversions || "0"} conversions
              </span>{" "}
              in the last 24 hours.
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end">
            {isLoading && <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 animate-spin" />}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full xs:w-36 sm:w-44 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors duration-200 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  <SelectValue />
                  <ChevronDown className="ml-2 h-4 w-4 sm:h-5 sm:w-5 opacity-50" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-lg">
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-32 sm:h-36 rounded-xl bg-gray-100/40 dark:bg-gray-800/40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            >
              <StatCard
                title="Total Chats"
                value={analyticsData?.summary.totalViews?.toLocaleString() || "0"}
                icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />}
                color="purple"
                change="+15.7%"
                period="from last period"
                secondaryText={`${analyticsData?.summary.avgSessionDuration} avg. session`}
              />
              <StatCard
                title="Total Clicks"
                value={analyticsData?.summary.totalClicks?.toLocaleString() || "0"}
                icon={<MousePointerClick className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />}
                color="blue"
                change="+8.2%"
                period="from last period"
                secondaryText={`${(((analyticsData?.summary.totalClicks || 0) / (analyticsData?.summary.totalViews || 1)) * 100).toFixed(1)}% CTR`}
              />
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/40 dark:bg-gray-800/40 backdrop-blur-sm p-1.5 rounded-xl h-auto relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <TabsTrigger
                  value="overview"
                  className="py-2 sm:py-2.5 text-xs sm:text-sm font-medium relative z-10 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 rounded-lg transition-all duration-300 hover:bg-gray-200/40 dark:hover:bg-gray-700/40"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="engagement"
                  className="py-2 sm:py-2.5 text-xs sm:text-sm font-medium relative z-10 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 rounded-lg transition-all duration-300 hover:bg-gray-200/40 dark:hover:bg-gray-700/40"
                >
                  Engagement
                </TabsTrigger>
                <TabsTrigger
                  value="revenue"
                  className="py-2 sm:py-2.5 text-xs sm:text-sm font-medium relative z-10 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 rounded-lg transition-all duration-300 hover:bg-gray-200/40 dark:hover:bg-gray-700/40"
                >
                  Revenue
                </TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            >
              <Card className="rounded-xl border border-gray-200/30 dark:border-gray-700/30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    <Activity className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                    Recent Activity
                    <Badge
                      variant="outline"
                      className="ml-2 bg-gray-100/40 dark:bg-gray-800/40 text-gray-800 dark:text-gray-200 border-gray-200/30 dark:border-gray-700/30 text-xs sm:text-sm"
                    >
                      {analyticsData?.recentActivity.length} events
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Latest interactions with your AI agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData?.recentActivity?.length === 0 ? (
                    <EmptyState
                      icon={<Activity className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />}
                      title="No activity yet"
                      description="Activity will appear here once users start interacting with your AI agent."
                    />
                  ) : (
                    <div className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                      {analyticsData?.recentActivity.slice(0, 8).map((activity, index) => (
                        <ActivityItem
                          key={`history-${index}`}
                          type={activity.type}
                          date={activity.createdAt}
                          value={activity.value}
                          userAgent={activity.userAgent}
                          location={activity.location}
                        />
                      ))}
                      <div className="pt-3 sm:pt-4 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
                          View all
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="rounded-xl border border-gray-200/30 dark:border-gray-700/30 bg-white/90 dark:bg-gray-900/90 h-full backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                      <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Letest Chats
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className="flex items-center bg-green-100/40 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200/30 dark:border-green-700/30 text-xs sm:text-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                      Live
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Updates as they happen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {realtimeActivities.length === 0 ? (
                    <EmptyState
                      icon={<Clock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />}
                      title="Waiting for activity"
                      description="Real-time updates will appear here as they happen."
                    />
                  ) : (
                    <div className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                      {realtimeActivities.map((activity, index) => (
                        <ActivityItem
                          key={`realtime-${index}`}
                          type={activity.type}
                          date={activity.createdAt}
                          value={activity.value}
                          userAgent={activity.userAgent}
                          location={activity.location}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  change,
  period,
  secondaryText,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "purple" | "orange" | "indigo" | "green";
  change: string;
  period: string;
  secondaryText?: string;
}) {
  const colorClasses = {
    emerald: { bg: "bg-emerald-100/80 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10" },
    blue: { bg: "bg-blue-100/80 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10" },
    purple: { bg: "bg-purple-100/80 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-500/10" },
    orange: { bg: "bg-orange-100/80 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-500/10" },
    indigo: { bg: "bg-indigo-100/80 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-500/10" },
    green: { bg: "bg-green-100/80 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400", iconBg: "bg-green-500/10" },
  };

  const isPositive = change.startsWith("+");

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <Card className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {secondaryText && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{secondaryText}</p>}
              <div className="flex items-center mt-3">
                {isPositive ? (
                  <ArrowUp className={`h-4 w-4 ${colorClasses[color].text}`} />
                ) : (
                  <ArrowDown className={`h-4 w-4 ${colorClasses[color].text}`} />
                )}
                <span className={`text-xs font-medium ml-2 ${colorClasses[color].text}`}>
                  {change} <span className="text-gray-500 dark:text-gray-400 text-xs">{period}</span>
                </span>
              </div>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClasses[color].bg} ${colorClasses[color].iconBg}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
  isLoading?: boolean;
  chartHeight?: string;
}

function ChartCard({
  title,
  description,
  children,
  className = "",
  headerActions,
  footerContent,
  isLoading = false,
  chartHeight = "320px",
}: ChartCardProps) {
  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="h-full">
      <Card
        className={`
        rounded-xl border border-transparent
        bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-900/90
        shadow-[0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.08)]
        backdrop-blur-[6px]
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        flex flex-col
        before:absolute before:inset-0 before:rounded-xl before:p-px 
        before:bg-gradient-to-br before:from-gray-100/80 before:to-gray-200/50 
        dark:before:from-gray-800/50 dark:before:to-gray-700/30
        before:-z-10
        ${className}
      `}
      >
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 tracking-[-0.01em]">{title}</CardTitle>
              <CardDescription className="text-xs text-gray-500/90 dark:text-gray-400/80 mt-0.5">{description}</CardDescription>
            </div>
            {headerActions && <div className="flex-shrink-0 -mt-1 -mr-1">{headerActions}</div>}
          </div>
        </CardHeader>
        <CardContent className="flex-1 px-4 pt-0 pb-3 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-[4px] rounded-b-xl">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-indigo-500/80 animate-spin" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Loading data...</span>
              </div>
            </div>
          ) : null}
          <div className="w-full relative" style={{ height: chartHeight }}>
            {children}
          </div>
        </CardContent>
        {footerContent && (
          <div className="px-4 pb-3 pt-1 border-t border-gray-100/50 dark:border-gray-800/30">{footerContent}</div>
        )}
      </Card>
    </motion.div>
  );
}

function ActivityItem({
  type,
  date,
  value,
  userAgent,
  location,
}: {
  type: "click" | "view" | "conversion";
  date: Date;
  value: number | null;
  userAgent?: string;
  location?: string;
}) {
  const typeConfig = {
    click: {
      label: "Clicked",
      icon: <MousePointerClick className="w-4 h-4 text-blue-500" strokeWidth={2} />,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    },
    view: {
      label: "Chats",
      icon: <Users className="w-4 h-4 text-purple-500" strokeWidth={2} />,
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    },
    conversion: {
      label: "Conversion",
      icon: <MousePointerClick className="w-4 h-4 text-blue-500" strokeWidth={2} />,
      // icon: <DollarSign className="w-4 h-4 text-green-500" strokeWidth={2} />,
      color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between py-3 group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 px-3 -mx-3 rounded-lg transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">{typeConfig[type].icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{typeConfig[type].label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
          </p>
          {(userAgent || location) && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {location && (
                <Badge
                  variant="outline"
                  className="text-xs py-1 px-2 bg-gray-100/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-lg font-normal"
                >
                  {location}
                </Badge>
              )}
              {userAgent && (
                <Badge
                  variant="outline"
                  className="text-xs py-1 px-2 bg-gray-100/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-lg font-normal"
                >
                  {userAgent.includes("Mobile") ? "Mobile" : "Desktop"}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      {/* {value && (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.1 }} className="flex-shrink-0">
          <Badge
            variant="outline"
            className="bg-green-100/80 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200/50 dark:border-green-700/50 rounded-lg font-medium"
          >
            +${value.toFixed(2)}
          </Badge>
        </motion.div>
      )} */}
    </motion.div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-10"
    >
      <div className="w-14 h-14 bg-gray-100/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}