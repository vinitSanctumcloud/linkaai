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
import { useRouter } from 'next/navigation';
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
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [embedSize, setEmbedSize] = useState({ width: "100%", height: "750px" });
  const [isCopied, setIsCopied] = useState(false);
  const { agent: agentDetails, status, error } = useSelector((state: RootState) => state.agents);
  const [siteDomain, setSiteDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setSiteDomain(origin);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchAgentDetails());
  }, [dispatch]);

  const handleCopy = (code: string) => {
    copyToClipboard(code);
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

  const handleViewAgent = () => {
    if (chatUrl) {
      router.push(chatUrl);
    }
  };
  const agentSlug = agentDetails?.ai_agent_slug;
  const chatUrl = agentSlug ? `${siteDomain}/liveagent/${agentSlug}` : null;
  const chatUrl1 = agentSlug ? `${siteDomain}/liveagent1/${agentSlug}` : null;

  const iframeCode = agentSlug
    ? `<iframe 
  src="${chatUrl1}" 
  width="${embedSize.width}" 
  height="${embedSize.height}"
  frameborder="0"
  style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); position: fixed; bottom: 0; right: 0; background-color: transparent; z-index: 1000;">
</iframe>`
    : "// Please create an AI Agent to generate the embed code.";

  const widgetCode = agentSlug
    ? `<!-- EarnLinks.AI Chat Widget -->
<div id="earnlinks-chat-widget"></div>
<script>
  (function() {
    var widget = document.createElement('iframe');
    widget.src = '${chatUrl1}';
    widget.style.width = '${embedSize.width}';
    widget.style.height = '${embedSize.height}';
    widget.style.border = 'none';
    widget.style.borderRadius = '10px';
    widget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    widget.style.position = 'fixed';
    widget.style.bottom = '.5rem';
    widget.style.right = '1rem';
    widget.style.zIndex = '1000';
    widget.frameBorder = '0';
    widget.setAttribute('allowtransparency', 'true');
    document.getElementById('earnlinks-chat-widget').appendChild(widget);
  })();
</script>`
    : "// Please create an AI Agent to generate the widget code.";

  const popupCode = agentSlug
    ? `<!-- EarnLinks.AI share Chat -->
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
</script>`
    : "// Please create an AI Agent to generate the popup code.";

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 px-4 sm:px-1 lg:px-1 py-6 max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Share Your AI-Agent
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Share everywhere and grow your revenue
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="w-full lg:w-1/3 space-y-4 md:space-y-6">
            <Card className="border border-gray-200 shadow-sm rounded-xl">
              <CardHeader className="px-3 sm:px-3">
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  Share your AI agent with your audience
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Add it to your link-in-bio, embed it on your website, or share
                  it directly in chats and emails.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <Tabs defaultValue="share" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1 bg-gray-100 rounded-lg">
                    <TabsTrigger
                      value="share"
                      className="py-2 text-xs sm:text-sm flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Smartphone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Share URL</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="iframe"
                      className="py-2 text-xs sm:text-sm flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Iframe</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="widget"
                      className="py-2 text-xs sm:text-sm flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Code className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Widget</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="iframe" className="mt-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2">
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
                          className="font-mono text-xs sm:text-sm p-3 pr-10 bg-gray-50 border-gray-200"
                        />
                        {agentSlug && (
                          <Button
                            onClick={() => copyToClipboard(iframeCode)}
                            className="absolute top-2 right-2 h-7 w-7 p-0 bg-gray-100 hover:bg-gray-200"
                            variant="ghost"
                            size="sm"
                            aria-label="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="widget" className="mt-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2">
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
                          className="font-mono text-xs sm:text-sm p-3 pr-10 bg-gray-50 border-gray-200"
                        />
                        {agentSlug && (
                          <Button
                            onClick={() => copyToClipboard(widgetCode)}
                            className="absolute top-2 right-2 h-7 w-7 p-0 bg-gray-100 hover:bg-gray-200"
                            variant="ghost"
                            size="sm"
                            aria-label="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="share" className="mt-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2">
                          Share Chat Link
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Copy and share this URL to let others chat with your AI agent.
                        </p>
                      </div>
                      <div className="relative">
                        {agentSlug ? (
                          <>
                            <div
                              onClick={() => handleCopy(chatUrl!)}
                              className="font-mono text-xs sm:text-sm p-3 pr-10 border rounded-md cursor-pointer hover:bg-gray-50 flex items-center overflow-hidden bg-gray-50 border-gray-200"
                            >
                              <span className="truncate">{chatUrl}</span>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => copyToClipboard(chatUrl!)}
                                    className="absolute top-2 right-2 h-7 w-7 p-0 bg-gray-100 hover:bg-gray-200"
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Copy URL"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {isCopied ? 'Copied!' : 'Copy URL'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        ) : (
                          <p className="text-gray-500 text-xs sm:text-sm">
                            Please create an AI Agent to generate a shareable link.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
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
                      Width
                    </Label>
                    <Input
                      id="width"
                      value={embedSize.width}
                      onChange={(e) =>
                        setEmbedSize({ ...embedSize, width: e.target.value })
                      }
                      placeholder="100% or 600px"
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
                      placeholder="750px"
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-orange-200 shadow-sm rounded-xl bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 text-lg sm:text-xl">
                  Integration Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Use '100%' width for full responsiveness on small screens.",
                  "Ensure height is at least 750px for optimal chat display.",
                  "Test the share link in mobile browsers for best results.",
                  "Preview on various devices to confirm layout compatibility.",
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

          <div className="w-full lg:w-2/3 space-y-4 md:space-y-6 flex justify-center items-start bg-gray-50">
            <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl w-full max-w-4xl">
              <CardHeader className="px-6 pt-6 pb-4 bg-gradient-to-r">
                <div className="space-y-1 flex flex-row justify-between">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      Live Preview
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600">
                      See exactly how your AI Agent will appear to users
                    </CardDescription>
                  </div>
                  <CardTitle>
                    <button
                      onClick={handleViewAgent}
                      className="bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 active:bg-orange-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      View Agent
                    </button>
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="relative w-3xl h-full flex justify-center items-center">
                  <div
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 relative"
                    style={{
                      width: embedSize.width,
                      height: embedSize.height,
                      minWidth: "300px",
                      minHeight: "750px",
                      maxWidth: "100%",
                      maxHeight: "800px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                      overflow: "hidden",
                    }}
                  >
                    {agentSlug && chatUrl ? (
                      <iframe
                        src={chatUrl}
                        className="w-full h-full border-0 rounded-xl"
                        style={{
                          transform: "scale(1)",
                          transformOrigin: "top left",
                          minHeight: "750px",
                          maxHeight: "800px",
                          width: "100%",
                        }}
                        title="Chat Preview"
                        allow="microphone; clipboard-write"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-modals"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                        <Bot className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-center text-base font-medium px-4">
                          Build your Agent now
                        </p>
                      </div>
                    )}
                  </div>

                  {embedSize.width !== "100%" && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-200 sm:block hidden">
                      {embedSize.width} × {embedSize.height}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    variant={embedSize.width === "600px" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmbedSize({ width: "600px", height: "750px" })}
                    className="text-sm py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 transition-colors duration-200"
                  >
                    Mobile (600px)
                  </Button>
                  <Button
                    variant={embedSize.width === "700px" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmbedSize({ width: "700px", height: "750px" })}
                    className="text-sm py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 transition-colors duration-200"
                  >
                    Desktop (700px)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}