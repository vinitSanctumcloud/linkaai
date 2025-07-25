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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Copy,
  Code,
  ExternalLink,
  Globe,
  Smartphone,
  Bot,
  Eye,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAgentDetails } from "@/store/slices/agentSlice";

interface Settings {
  customUrl?: string;
  agentName: string;
  brandColor: string;
}

export default function EmbedPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [settings, setSettings] = useState<Settings | null>(null);
  const [embedSize, setEmbedSize] = useState({ width: "400", height: "600" });
  const [isCopied, setIsCopied] = useState(false);
  const { agent: agentDetails, status, error } = useSelector((state: RootState) => state.agents);

  useEffect(() => {
    dispatch(fetchAgentDetails());
  }, [dispatch]);

  const handleCopy = () => {
    copyToClipboard(popupCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "top-right",
      duration: 2000,
    });
  };

  const agentSlug = agentDetails?.ai_agent_slug

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://earnlinks.ai";
  const chatUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/liveagent/${agentSlug}`

  const iframeCode = `<iframe 
  src="${chatUrl}" 
  width="${embedSize.width}" 
  height="${embedSize.height}"
  frameborder="0"
  style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>`;

  const widgetCode = `<!-- EarnLinks.AI Chat Widget -->
<div id="earnlinks-chat-widget"></div>
<script>
  (function() {
    var widget = document.createElement('iframe');
    widget.src = '${chatUrl}';
    widget.style.width = '${embedSize.width}px';
    widget.style.height = '${embedSize.height}px';
    widget.style.border = 'none';
    widget.style.borderRadius = '10px';
    widget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    widget.frameBorder = '0';
    document.getElementById('earnlinks-chat-widget').appendChild(widget);
  })();
</script>`;

  const popupCode = `<!-- EarnLinks.AI share Chat -->
<script>
  (function() {
    var button = document.createElement('button');
    button.innerHTML = '💬 Chat with AI';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '12px 20px';
    button.style.backgroundColor = '${settings?.brandColor || "#FF6B35"}';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '25px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '14px';
    
    button.onclick = function() {
      window.open('${chatUrl}', 'earnlinks-chat', 'width=400,height=600,scrollbars=no,resizable=yes');
    };
    
    document.body.appendChild(button);
  })();
</script>`;

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Share Your AI-Agent
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Share everywhere and grow your revenue
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Configuration and Embed Options */}
          <div className="space-y-4 md:space-y-6">
            {/* Embed Options Card */}
            <Card className="border border-gray-200 shadow-sm rounded-xl w-full max-w-3xl mx-auto">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  Share your AI agent with your audience.
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Add it to your link-in-bio, embed it on your website, or share
                  it directly in chats and emails.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <Tabs defaultValue="share" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1">
                    <TabsTrigger
                      value="share"
                      className="py-2 text-xs xs:text-sm flex items-center justify-center"
                    >
                      <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Share URL</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="iframe"
                      className="py-2 text-xs xs:text-sm flex items-center justify-center"
                    >
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Iframe</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="widget"
                      className="py-2 text-xs xs:text-sm flex items-center justify-center"
                    >
                      <Code className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Widget</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="iframe" className="mt-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                          Simple Iframe Embed
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Basic iframe code that you can paste directly into
                          your HTML.
                        </p>
                      </div>
                      <div className="relative">
                        <Textarea
                          value={iframeCode}
                          readOnly
                          rows={4}
                          className="font-mono text-xs sm:text-sm p-3 pr-10"
                        />
                        <Button
                          onClick={() => copyToClipboard(iframeCode)}
                          className="absolute top-2 right-2 h-7 w-7 p-0"
                          variant="ghost"
                          size="sm"
                          aria-label="Copy code"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="widget" className="mt-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                          JavaScript Widget
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Dynamic widget that loads asynchronously and is more
                          flexible.
                        </p>
                      </div>
                      <div className="relative">
                        <Textarea
                          value={widgetCode}
                          readOnly
                          rows={6}
                          className="font-mono text-xs sm:text-sm p-3 pr-10"
                        />
                        <Button
                          onClick={() => copyToClipboard(widgetCode)}
                          className="absolute top-2 right-2 h-7 w-7 p-0"
                          variant="ghost"
                          size="sm"
                          aria-label="Copy code"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="share" className="mt-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                          Share Chat Link
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Copy and share this URL to let others chat with your AI agent.
                        </p>
                      </div>
                      <div className="relative">
                        <div
                          onClick={handleCopy}
                          className="font-mono text-xs sm:text-sm p-3 pr-10 border rounded-md cursor-pointer hover:bg-gray-50 flex items-center overflow-hidden"
                        >
                          <span className="truncate">{chatUrl}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => copyToClipboard(chatUrl)}
                                className="absolute top-2 right-2 h-7 w-7 p-0"
                                variant="ghost"
                                size="sm"
                                aria-label="Copy URL"
                              >
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {isCopied ? 'Copied!' : 'Copy URL'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Configuration Card */}
            <Card className=" rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Code className="mr-2 h-5 w-5 text-orange-600" />
                  Widget Configuration
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Customize your chat widget appearance and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width" className="text-sm sm:text-base">
                      Width (px)
                    </Label>
                    <Input
                      id="width"
                      value={embedSize.width}
                      onChange={(e) =>
                        setEmbedSize({ ...embedSize, width: e.target.value })
                      }
                      placeholder="400"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm sm:text-base">
                      Height (px)
                    </Label>
                    <Input
                      id="height"
                      value={embedSize.height}
                      onChange={(e) =>
                        setEmbedSize({ ...embedSize, height: e.target.value })
                      }
                      placeholder="600"
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                {chatUrl && (
                  <div className="pt-4">
                    <Label className="text-sm sm:text-base">
                      Your Chat URL
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <div className="flex-1 flex items-center">
                        <Input
                          value={chatUrl}
                          readOnly
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(chatUrl)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(chatUrl, "_blank")}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Open</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Integration Tips Card */}
            <Card className="border border-orange-200 shadow-sm rounded-xl bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 text-lg sm:text-xl">
                  Integration Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Place the iframe code where you want the chat to appear on your page.",
                  "For mobile responsiveness, consider using percentage widths like '100%'.",
                  "The share option works great for websites where space is limited.",
                  "Test your implementation on different devices to ensure optimal experience.",
                ].map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <Badge
                      variant="secondary"
                      className="mr-3 mt-0.5 bg-orange-100 text-orange-800"
                    >
                      {index + 1}
                    </Badge>
                    <p className="text-orange-700 text-xs sm:text-sm">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Only Live Preview */}
          <div className="space-y-4 md:space-y-6">
            <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-linka-dark-orange" />
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600">
                    See exactly how your chat widget will appear to users
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-3  pb-3 sm:pb-6">
                <div className="p-2 sm:p-6 rounded-lg">
                  {/* Preview container with responsive sizing */}
                  <div className="relative w-full">
                    <div
                      className={`mx-auto bg-red-50 rounded-lg sm:rounded-xl shadow-md overflow-hidden ${embedSize.width === "100%" ? "w-full" : "w-auto"
                        }`}
                      style={{
                        width:
                          embedSize.width === "100%"
                            ? "100%"
                            : `${Math.min(
                              parseInt(embedSize.width),
                              typeof window !== "undefined"
                                ? window.innerWidth - 40
                                : 400
                            )}px`,
                        height: `${Math.min(parseInt(embedSize.height), 600)}px`,
                        minHeight: "250px",
                        maxWidth: "100%",
                      }}
                    >
                      {chatUrl ? (
                        <iframe
                          src={chatUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          title="Chat Preview"
                          allow="microphone"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4">
                          <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3" />
                          <p className="text-gray-500 text-center text-xs sm:text-sm">
                            Configure your agent to see the preview
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Size indicator - hidden on small screens */}
                    {embedSize.width !== "100%" && (
                      <div className="hidden sm:block absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-200">
                        {embedSize.width} × {embedSize.height} px
                      </div>
                    )}
                  </div>

                  {/* Responsive controls - stacked on mobile */}
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                    <Button
                      variant={
                        embedSize.width === "400" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setEmbedSize({ width: "400", height: "600" })
                      }
                      className="text-xs sm:text-sm py-1 sm:py-2"
                    >
                      Mobile
                    </Button>
                    <Button
                      variant={
                        embedSize.width === "650" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setEmbedSize({ width: "650", height: "600" })
                      }
                      className="text-xs sm:text-sm py-1 sm:py-2"
                    >
                      Desktop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
