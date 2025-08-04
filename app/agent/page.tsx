"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Bot,
  Plus,
  Save,
  Send,
  Mic,
  ArrowLeft,
  ArrowRight,
  Edit,
  Trash2,
  GitBranch,
  MessageSquare,
  InfoIcon,
  LinkIcon,
  Link2,
  Info,
  Globe,
  Smartphone,
  Code,
  Copy,
  Trash2Icon,
  X,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


import { motion, AnimatePresence } from 'framer-motion';

import { CopyIcon, Cross2Icon, DotsVerticalIcon, OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { Toaster } from "@/components/ui/toaster";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { FaFilePdf, FaLink, FaMicrophone, FaPlay } from "react-icons/fa";
import { API } from "@/config/api";
import PreviewModal from "@/components/agent/preview-modal";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/types";

// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// Interfaces remain unchanged
export interface ConditionalPrompt {
  id: string;
  mainPrompt: string;
  option1: { label: string; followUps: string[] };
  option2: { label: string; followUps: string[] };
}

export interface PartnerLink {
  id: number;
  category: string;
  affiliateLink: string;
  brandName?: string;
  socialMediaLink?: string;
  // affiliateimage: string | undefined;
  // status?: "Submitted" | "Hold" | "Processing" | "Complete";
  status?: number;
  productReview?: string;
  proceesing?: string;
}

export interface LinkaProMonetizationProduct {
  id: number;
  proType?: string; // "products"
  category: string;
  affiliateLink?: string;
  categoryUrl?: string;
  status: number;
  proceesing?: string;
  brandName?: string;
}

export interface LinkaProMonetizationBlog {
  id: number;
  proType?: string; // "blogs"
  category: string;
  blogUrl?: string;
  brandName?: string;
  status: number;
  proceesing?: string;
}

export interface LinkaProMonetizationWebsite {
  id: number;
  proType?: string; // "websites"
  category: string;
  websiteUrl?: string;
  brandName?: string;
  status: number;
  proceesing?: string;
}

type LinkaProMonetization = LinkaProMonetizationProduct | LinkaProMonetizationBlog | LinkaProMonetizationWebsite;

interface mainimage {
  name?: string;
}

interface AgentConfig {
  name: string;
  trainingInstructions: string;
  prompts: string[];
  partnerLinks: PartnerLink[];
  linkaProMonetizations: LinkaProMonetization[];
  conditionalPrompts: ConditionalPrompt[];
  useConditionalPrompts: boolean;
  greetingTitle: string;
  greeting: string;
  greetingMediaType: string | null;
  greetingMedia: string | null;
  ai_agent_slug: string | null;
  avatar: string | null;
}

interface Brand {
  user_id: number;
  whitelabel_client_id: number;
  name: string;
}

interface Category {
  user_id: number;
  whitelabel_client_id: number;
  name: string;
}

export default function AgentBuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [progressData, setProgressData] = useState<{
    completed_steps: number;
    current_status: string;
    next_step: number;
    completed_at?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"partner" | "aipro" | "paywall">("partner");
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: "",
    trainingInstructions: "",
    prompts: ["", "", "", ""],
    partnerLinks: [],
    linkaProMonetizations: [],
    conditionalPrompts: [],
    useConditionalPrompts: false,
    greetingTitle: "",
    greeting: "",
    greetingMediaType: null,
    greetingMedia: null,
    avatar: null,
    ai_agent_slug: ""
  });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingPartnerLinkId, setEditingPartnerLinkId] = useState<string | null>(null);
  const [isConditionalModalOpen, setIsConditionalModalOpen] = useState(false);
  const [editingConditionalPrompt, setEditingConditionalPrompt] = useState<ConditionalPrompt | null>(null);
  const [conditionalForm, setConditionalForm] = useState<ConditionalPrompt>({
    id: "",
    mainPrompt: "",
    option1: { label: "", followUps: ["", "", ""] },
    option2: { label: "", followUps: ["", "", ""] },
  });
  const [imageError, setImageError] = useState(false);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);
  const [selectedMonetizationOption, setSelectedMonetizationOption] = useState("blogs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentLink, setAgentLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [siteDomain, setSiteDomain] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); // New state for preview modal
  const [selectedLink, setSelectedLink] = useState<PartnerLink | LinkaProMonetizationProduct | LinkaProMonetizationBlog | LinkaProMonetizationWebsite | null>(null); // New state for selected link

  const { agent: agentDetails } = useSelector((state: RootState) => state.agents)
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handlePreviewLink = (index: number, type: "partner" | "aipro") => {
    console.log(aiproLinksTableData[index])
    const link = type === "partner" ? partnerLinksTableData[index] : aiproLinksTableData[index];
    setSelectedLink(link);
    console.log(selectedLink)
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setSelectedLink(null); // Reset selected link
    mainContentRef.current?.focus();
  };


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("No access token found. Please log in.");
      toast.error("No access token found. Please log in.", {
        position: "top-right",
        duration: 2000,
      });
      setIsLoading(false);
      return;
    }

    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    // Validate file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF, or WebP).');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('images[]', file);
    formData.append('upload_path', 'ai-agent/avatars'); // Adjust path as needed

    try {
      const response = await fetch(API.UPLOAD_IMAGE, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image.');
      }

      const data = await response.json();
      // Assuming API returns the image URL in data.url or similar
      const imageUrl = data.data.cdn + data.data.images[0];
      if (!imageUrl) {
        toast.error("No image URL returned from the server.", {
          position: "top-right",
          duration: 2000,
        });
        return;
      }
      if (!imageUrl) {
        toast.error("No image URL returned from the server.", {
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      // Update agentConfig with the uploaded image URL
      setAgentConfig((prev) => ({ ...prev, avatar: imageUrl }));
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar.');
    }
  };

  useEffect(() => {
    if (isMonetizationModalOpen) {
      const fetchData = async () => {
        // setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("No access token found. Please log in.");
          toast.error("No access token found. Please log in.", {
            position: "top-right",
            duration: 2000,
          });
          setIsLoading(false);
          return;
        }

        try {
          // Fetch brands
          const brandsResponse = await fetch(API.BRAND_LIST, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (brandsResponse.ok) {
            const brandsData = await brandsResponse.json();
            setBrands(brandsData.data);
          }

          // Fetch categories
          const categoriesResponse = await fetch(API.CATEGORY_LIST, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData.data);
          }
        } catch (err) {
          setError('Failed to fetch brands or categories');
          console.error(err);
        } finally {
          // setLoading(false);
        }
      };
      fetchData();
    }
  }, [isMonetizationModalOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin; // e.g., https://example.com
      setSiteDomain(origin);
    }
  }, []);

  // console.log(siteDomain, "domaim")

  const CATEGORY_PRODUCTS_PLACEHOLDER = 'Travel Packages, Hotel Bookings, Tour Experiences';
  const CATEGORY_URL_PLACEHOLDER = 'https://www.tripadvisor.com/TravelDeals';
  const CATEGORY_BLOGS_PLACEHOLDER = 'Travel Tips, Destination Guides, Hotel Reviews';
  const BLOG_POST_URL_PLACEHOLDER = 'https://www.tripadvisor.com/blog';
  const CATEGORY_WEBSITES_PLACEHOLDER = 'Travel Booking, Review Aggregator, Tourism Guides';
  const WEBSITE_URL_PLACEHOLDER = 'https://www.tripadvisor.com';

  const CATEGORY_PLACEHOLDER = 'Travel, Hospitality, Tourism';
  const AFFILIATE_LINK_PLACEHOLDER = 'https://www.tripadvisor.com/PartnerLinks';
  const SOCIAL_MEDIA_LINK_PLACEHOLDER = 'https://www.instagram.com/tripadvisor';
  const PRODUCT_REVIEW_PLACEHOLDER = 'TripAdvisor is a trusted platform for millions of travelers, offering honest reviews, price comparisons, and seamless booking for hotels, flights, and attractions worldwide.';
  const BRAND_NAME_PLACEHOLDER = 'TripAdvisor';
  const AGENT_NAME_PLACEHOLDER = 'Sofia - Travel Consultant, Alex - Booking Specialist, Jamie - Customer Support';
  const TRAINING_INSTRUCTIONS_PLACEHOLDER = `# PERSONA
  Role or Expertise: Beauty Expert and Ayurvedic Health Coach specializing in skincare
  About your Expertise: You are Angela — a trusted skincare expert and Ayurvedic health coach who helps people feel radiant, confident, and connected to their body through intentional beauty rituals and holistic wellness. You have 65K social media followers and talk about all things beauty but like to provide natural remedies when possible.`;

  // const TRAINING_INSTRUCTIONS_PLACEHOLDER = (
  //   <>
  //     Line 1<br />
  //     Line 2<br />
  //     Line 3
  //   </>
  // );
  const PRIMARY_RECS = "Just add your category and affiliate links — that’s all it takes to have your AI understand your style and make recommendations on your behalf.xeFor additional context, you can include product reviews & social media links.Your AI agent will then make smart, personalized recommendations and engage your audience’s questions around the clock — helping you earn effortlessly."
  const SMART_RECS = "Expand Beyond your primary recs! Your AI agent doesn’t just respond — it proactively expands your product and brand recommendations based on your content. Whether it’s a blog, website, or a single affiliate link, Linka Pro helps you scale revenue with intelligent suggestions that track and attribute commissions to you automatically.Monetize effortlessly — your Linka agent learns your content and sells smarter, so you don’t have to."

  const [modalLinks, setModalLinks] = useState<PartnerLink[] | LinkaProMonetization[]>([]);
  const [partnerLinksTableData, setPartnerLinksTableData] = useState<PartnerLink[]>([]);
  const [aiproLinksTableData, setAiproLinksTableData] = useState<LinkaProMonetization[]>([]);

  const steps = [
    {
      id: 1,
      title: "Greeting Media",
      description: "Upload image or video and create opening message",
    },
    {
      id: 3,
      title: "Prompts",
      description: "Design conversation starters and branching logic",
    },
    {
      id: 2,
      title: "AI Training",
      description: "Name your agent and provide training instructions",
    },
    {
      id: 4,
      title: "Knowledge & Monetization",
      description: "Add your affiliate links and monetization options",
    },
    { id: 5, title: "Preview & Test", description: "Test your AI agent" },
  ];

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.", {
          position: "top-right",
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(API.AGENT_DETAILS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data.data.ai_agent.ai_agent_slug, "fd")
          const agentData = data.data.ai_agent;
          // console.log("agentData :: ", agentData);

          // Map prompts to extract prompt_text
          const sanitizedPrompts = Array.isArray(agentData.prompts) && agentData.prompts.length > 0
            ? agentData.prompts.map((prompt: { prompt_text: any; }) => (typeof prompt.prompt_text === "string" ? prompt.prompt_text : "")).concat(["", "", "", ""]).slice(0, 4)
            : ["", "", "", ""];

          // Map the API response to the agentConfig state
          setAgentConfig({
            // ...agentData,
            name: agentData.agent_name || "AIS",
            avatar: agentData.avatar_image_url || "",
            trainingInstructions: agentData.training_instructions || "",
            prompts: sanitizedPrompts,
            ai_agent_slug: agentData?.ai_agent_slug || "",
            partnerLinks: agentData.partner_links?.map((link: any) => ({
              id: link.id,
              category: link.category_name || "",
              affiliateLink: link.url || "",
              brandName: link.brand_name || "",
              socialMediaLink: link.social_media_link || "",
              productReview: link.product_review || "",
              status: link.status,
              proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
            })) || [],
            linkaProMonetizations: agentData.linka_pro_monetizations?.map((link: any) => {
              if (link.type === "products") {
                return {
                  id: link.id,
                  proType: "products",
                  category: link.category_name || "",
                  affiliateLink: link.affiliate_url || "",
                  categoryUrl: link.url || "",
                  status: link.status,
                  proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
                };
              } else if (link.type === "blogs") {
                return {
                  id: link.id,
                  proType: "blogs",
                  category: link.category_name || "",
                  blogUrl: link.url || "",
                  status: link.status,
                  proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
                };
              } else if (link.type === "websites") {
                return {
                  id: link.id,
                  proType: "websites",
                  category: link.category_name || "",
                  websiteUrl: link.url || "",
                  status: link.status,
                  proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
                };
              }
              return null;
            }).filter((link: any) => link !== null) || [],
            conditionalPrompts: agentData.conditional_prompts?.map((prompt: any) => ({
              id: prompt.id || Date.now().toString(),
              mainPrompt: prompt.main_prompt || "",
              option1: {
                label: prompt.option1?.label || "",
                followUps: prompt.option1?.follow_ups || ["", "", ""],
              },
              option2: {
                label: prompt.option2?.label || "",
                followUps: prompt.option2?.follow_ups || ["", "", ""],
              },
            })) || [],
            useConditionalPrompts: agentData.use_conditional_prompts || false,
            greetingTitle: agentData.greeting_title || "",
            greeting: agentData.welcome_greeting || "",
            greetingMediaType: agentData.greeting_media_type || null,
            greetingMedia: agentData.greeting_media_url || null,
          });
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch agent details: ${errorData.message || "Unknown error"}`);
          toast.error(`Failed to fetch agent details: ${errorData.message || "Unknown error"}`, {
            position: "top-right",
            duration: 2000,
          });
        }
      } catch (err) {
        setError("An error occurred while fetching agent details.");
        toast.error("An error occurred while fetching agent details.", {
          position: "top-right",
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDetails();
  }, []);

  useEffect(() => {
    if (currentStep === 4) {
      setActiveTab("partner"); // Set default tab to "partner" when entering step 4
      setSelectedMonetizationOption("blogs"); // Reset monetization option for "aipro" tab
      setModalLinks([]); // Clear modal links to avoid stale data
      setEditingLinkId(null); // Clear editing state
      setEditingPartnerLinkId(null); // Clear editing state
    }
  }, [currentStep]);

  useEffect(() => {
    const fetchLinks = async () => {
      console.log("Fetching links for activeTab:", activeTab, "page:", page, "monetizationOption:", selectedMonetizationOption); // Debug log
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.");
        setIsLoading(false);
        return;
      }

      let link_type = activeTab === "partner" ? "affiliate" : selectedMonetizationOption;
      try {
        const response = await fetch(
          API.LINK_LIST(link_type, page),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const links = data.data.link_list;
          const total = data.data.meta.total || 0; // Total number of links
          const limit = itemsPerPage; // Items per page
          setTotalPages(Math.ceil(total / limit)); // Calculate total pages

          if (activeTab === "partner") {
            const mappedLinks: PartnerLink[] = links.map((link: any) => ({
              id: link.id,
              category: link.category_name || "",
              affiliateLink: link.url || "",
              brandName: link.brand_name || "",
              socialMediaLink: link.social_media_link || "",
              productReview: link.product_review || "",
              status: link.status,
              proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
            }));
            setPartnerLinksTableData(mappedLinks);
            console.log(mappedLinks);
          } else if (activeTab === "aipro") {
            const mappedLinks: LinkaProMonetization[] = links.map((link: any) => {
              if (link.type === "products") {
                return {
                  id: link.id,
                  proType: "products",
                  category: link.category_name || "",
                  affiliateLink: link.affiliate_url || "",
                  categoryUrl: link.url || "",
                  status: link.status,
                  brandName: link.brand_name || "",
                  proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
                };
              } else if (link.type === "blogs") {
                return {
                  id: link.id,
                  proType: "blogs",
                  category: link.category_name || "",
                  blogUrl: link.url || "",
                  status: link.status,
                  brandName: link.brand_name || "",
                  proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
                };
              } else if (link.type === "websites") {
                return {
                  id: link.id,
                  proType: "websites",
                  category: link.category_name || "",
                  websiteUrl: link.url || "",
                  status: link.status,
                  brandName: link.brand_name || "",
                  proceesing: `${link.completed_process_link ?? 0}/${link.total_process_link} links`
                };
              }
              return null;
            }).filter((link: any) => link !== null);
            setAiproLinksTableData(mappedLinks);

            console.log(mappedLinks);
          }

          // setTotalPages(data.data.meta.total || 1);
          // toast.success("Links loaded successfully!");
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch links: ${errorData.message || "Unknown error"}`);
          toast.error(`Failed to fetch links: ${errorData.message || "Unknown error"}`, {
            position: "top-right",
            duration: 2000,
          });
        }
      } catch (err) {
        setError("An error occurred while fetching links.");
        toast.error("An error occurred while fetching links.");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentStep === 4 && (activeTab === "partner" || activeTab === "aipro")) {
      fetchLinks();
    }
  }, [activeTab, page, selectedMonetizationOption, currentStep, itemsPerPage]);

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.", {
          position: "top-right",
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          API.PROGRESS_STEP,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProgressData(data.data.progress);
          setCurrentStep(data.data.progress.next_step || 1); // Set current step to next_step from API
          // toast.success("Progress loaded successfully!");
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch progress: ${errorData.message || "Unknown error"}`
          );
          toast.error(
            `Failed to fetch progress: ${errorData.message || "Unknown error"}`, {
            position: "top-right",
            duration: 2000,
          }
          );
        }
      } catch (err) {
        setError("An error occurred while fetching progress.");
        toast.error("An error occurred while fetching progress.", {
          position: "top-right",
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  useEffect(() => {
    console.log("Modal open:", isMonetizationModalOpen, "Active tab:", activeTab);
    if (isMonetizationModalOpen) {
      if (activeTab === "partner") {
        setModalLinks([
          {
            id: Date.now(),
            category: "",
            affiliateLink: "",
            brandName: "",
            socialMediaLink: "",
            productReview: "",
            status: 0,
            proceesing: '0/0 links'
          },
        ]);
        console.log("Initialized modalLinks for partner:", modalLinks);
      } else if (activeTab === "aipro") {
        let newLink: LinkaProMonetization;
        switch (selectedMonetizationOption) {
          case "products":
            newLink = {
              id: Date.now(),
              proType: "products",
              category: "",
              affiliateLink: "",
              categoryUrl: "",
              status: 1,
              proceesing: '0/0 links'
            };
            break;
          case "blogs":
            newLink = {
              id: Date.now(),
              proType: "blogs",
              category: "",
              blogUrl: "",
              status: 1,
              proceesing: '0/0 links'
            };
            break;
          case "websites":
            newLink = {
              id: Date.now(),
              proType: "websites",
              category: "",
              websiteUrl: "",
              status: 1,
              proceesing: '0/0 links'
            };
            break;
          default:
            console.error("Unknown monetization option:", selectedMonetizationOption);
            toast.error(`Unknown monetization option: ${selectedMonetizationOption}`, {
              position: "top-right",
              duration: 2000,
            });
            return;
        }
        setModalLinks([newLink]);
        console.log("Initialized modalLinks for aipro:", [newLink]);
      }
    } else {
      setModalLinks([]);
      console.log("Reset modalLinks on modal close");
    }
  }, [isMonetizationModalOpen, activeTab, selectedMonetizationOption]);

  const handleEditLink = (index: number, type: "partner" | "aipro") => {
    if (type === "partner") {
      const link = partnerLinksTableData[index];
      setModalLinks([link]);
      // setEditingPartnerLinkId(link.id);
      setIsMonetizationModalOpen(true);
      console.log("Editing partner link:", link);
    } else {
      const link = aiproLinksTableData[index];
      setSelectedMonetizationOption(link.proType || "blogs");
      setModalLinks([link]);
      // setEditingLinkId(link.id || null); 
      setIsMonetizationModalOpen(true);
      console.log("Editing aipro link:", link);
    }
  };

  const handleDeleteLink = async (index: number, type: "partner" | "aipro") => {
    const linkId = type === "partner"
      ? partnerLinksTableData[index]?.id
      : aiproLinksTableData[index]?.id;

    if (!linkId) {
      toast.error("No ID found for this link.", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("No access token found. Please log in.", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    try {
      const response = await fetch(
        API.DELETE_LINK(linkId),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let link_type = activeTab === "partner" ? "affiliate" : selectedMonetizationOption;
      if (response.ok) {
        // Refetch links to update table data
        const fetchLinksResponse = await fetch(
          API.LINK_LIST(link_type, page),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (fetchLinksResponse.ok) {
          const data = await fetchLinksResponse.json();
          const links = data.data.link_list;

          if (type === "partner") {
            const mappedLinks: PartnerLink[] = links.map((link: any) => ({
              id: link.id,
              category: link.category_name || "",
              affiliateLink: link.url || "",
              brandName: link.brand_name || "",
              socialMediaLink: link.social_media_link || "",
              productReview: link.product_review || "",
              status: link.status,
            }));

            setPartnerLinksTableData(mappedLinks);
            if (mappedLinks.length === 0 && page > 1) {
              setPage((prev) => prev - 1);
            }
            toast.success("Partner link deleted successfully!", {
              position: "top-right",
              duration: 2000,
            });
          } else {
            const mappedLinks: LinkaProMonetization[] = links.map((link: any) => {
              if (link.type === "products") {
                return {
                  id: link.id,
                  proType: "products",
                  category: link.category_name || "",
                  affiliateLink: link.affiliate_url || "",
                  categoryUrl: link.url || "",
                  status: link.status,
                };
              } else if (link.type === "blogs") {
                return {
                  id: link.id,
                  proType: "blogs",
                  category: link.category_name || "",
                  blogUrl: link.url || "",
                  status: link.status,
                };
              } else if (link.type === "websites") {
                return {
                  id: link.id,
                  proType: "websites",
                  category: link.category_name || "",
                  websiteUrl: link.url || "",
                  status: link.status,
                };
              }
              return null;
            }).filter((link: any) => link !== null);
            setAiproLinksTableData(mappedLinks);
            if (mappedLinks.length === 0 && page > 1) {
              setPage((prev) => prev - 1);
            }
            toast.success("AI Pro monetization link deleted successfully!", {
              position: "top-right",
              duration: 2000,
            });
          }
        } else {
          const errorData = await fetchLinksResponse.json();
          toast.error(`Failed to refresh links: ${errorData.message || "Unknown error"}`, {
            position: "top-right",
            duration: 2000,
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete link: ${errorData.message || "Unknown error"}`, {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (err) {
      toast.error("An error occurred while deleting the link.", {
        position: "top-right",
        duration: 2000,
      });
      console.error("Error deleting link:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log(
      "Submitted monetization links:",
      agentConfig.linkaProMonetizations
    );
    // Here you can also add your API call or other submission logic
  };

  // Conditional prompt handlers (unchanged)
  const openConditionalModal = (prompt?: ConditionalPrompt) => {
    if (prompt) {
      setEditingConditionalPrompt(prompt);
      setConditionalForm(prompt);
    } else {
      setEditingConditionalPrompt(null);
      setConditionalForm({
        id: Date.now().toString(),
        mainPrompt: "",
        option1: { label: "", followUps: ["", "", ""] },
        option2: { label: "", followUps: ["", "", ""] },
      });
    }
    setIsConditionalModalOpen(true);
  };

  const handleRemoveLink = (id: number) => {
    setModalLinks((prev: any[]) => {
      const newLinks = prev.filter((link) => link.id !== id);
      if (newLinks.length === 0) {
        setIsMonetizationModalOpen(false); // Close modal if no links remain
        toast.info("All links removed. Modal closed.", {
          position: "top-right",
          duration: 2000,
        });
      } else {
        toast.success("Link removed from modal!", {
          position: "top-right",
          duration: 2000,
        });
      }
      return newLinks;
    });
  };

  const saveConditionalPrompt = () => {
    if (
      !conditionalForm.mainPrompt.trim() ||
      !conditionalForm.option1.label.trim() ||
      !conditionalForm.option2.label.trim()
    ) {
      toast.error("Please fill in all required fields", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    setAgentConfig((prev) => {
      const newConditionalPrompts = editingConditionalPrompt
        ? prev.conditionalPrompts.map((p) =>
          p.id === editingConditionalPrompt.id ? conditionalForm : p
        )
        : [...prev.conditionalPrompts, conditionalForm];
      return { ...prev, conditionalPrompts: newConditionalPrompts };
    });

    setIsConditionalModalOpen(false);
    toast.success(
      editingConditionalPrompt
        ? "Conditional prompt updated!"
        : "Conditional prompt added!"
      , {
        position: "top-right",
        duration: 2000,
      });
  };

  const deleteConditionalPrompt = (id: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      conditionalPrompts: prev.conditionalPrompts.filter((p) => p.id !== id),
    }));
    toast.success("Conditional prompt deleted!", {
      position: "top-right",
      duration: 2000,
    });
  };

  const updateConditionalForm = (field: string, value: any) => {
    setConditionalForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateConditionalOption = (
    option: "option1" | "option2",
    field: "label" | "followUps",
    value: any
  ) => {
    setConditionalForm((prev) => ({
      ...prev,
      [option]: { ...prev[option], [field]: value },
    }));
  };

  const handleInputChange = (field: keyof AgentConfig, value: any) => {
    setAgentConfig((prev) => ({ ...prev, [field]: value }));
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...agentConfig.prompts];
    newPrompts[index] = value;
    setAgentConfig((prev) => ({ ...prev, prompts: newPrompts }));
  };

  const addPartnerLink = () => {
    setAgentConfig((prev: any) => ({
      ...prev,
      partnerLinks: [
        ...prev.partnerLinks,
        {
          id: "",
          category: "",
          affiliateLink: "",
          brandName: "",
          productReview: "",
          socialMediaLink: "",
          status: 1,
        },
      ],
    }));
  };

  const removePartnerLink = (id: number) => {
    setAgentConfig((prev) => ({
      ...prev,
      partnerLinks: prev.partnerLinks.filter((link) => link.id !== id),
    }));
    toast.success("Partner link removed!", {
      position: "top-right",
      duration: 2000,
    });
  };

  type MonetizationLink = {
    id: string;
    type: "products" | "blogs" | "website";
    status: string;
  } & (
      | {
        type: "products";
        category: string;
        brandName: string;
        mainUrl: string;
      }
      | {
        type: "blogs";
        category: string;
        blogUrl: string;
      }
      | {
        type: "website";
        category: string;
        websiteUrl: string;
      }
    );

  const addLinkaProMonetization = () => {
    let newLink: LinkaProMonetization;
    switch (selectedMonetizationOption) {
      case "products":
        newLink = {
          id: Date.now(),
          proType: "products",
          category: "",
          affiliateLink: "",
          categoryUrl: "",
          status: 1,
          proceesing: '0/0 links'
        };
        break;
      case "blogs":
        newLink = {
          id: Date.now(),
          proType: "blogs",
          category: "",
          blogUrl: "",
          status: 1,
          proceesing: '0/0 links'
        };
        break;
      case "websites":
        newLink = {
          id: Date.now(),
          proType: "websites",
          category: "",
          websiteUrl: "",
          status: 1,
          proceesing: '0/0 links'
        };
        break;
      default:
        toast.error(`Unknown monetization option: ${selectedMonetizationOption}`, {
          position: "top-right",
          duration: 2000,
        });
        return;
    }
    setModalLinks((prev: any) => [...prev, newLink]);
  };

  const updateLinkaProMonetization = (
    id: number,
    field: keyof LinkaProMonetizationProduct | keyof LinkaProMonetizationBlog | keyof LinkaProMonetizationWebsite,
    value: string
  ) => {
    setModalLinks((prev: any) =>
      prev.map((link: any) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const updatePartnerLink = (
    id: number,
    field: string,
    value: string
  ) => {
    setModalLinks((prev: any) =>
      prev.map((link: any) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };


  const handleGreetingMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    console.log(type);
    console.log(event);
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected.", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("No access token found. Please log in.", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    if (type === "image") {
      if (!file.type.includes("image")) {
        toast.error("Please select a valid image file.", {
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB for image
      if (file.size > maxSize) {
        toast.error("Image file size exceeds 5MB limit.", {
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      const formData = new FormData();
      formData.append("images[]", file);
      formData.append("upload_path", "ai_agent");

      try {
        const response = await fetch(
          API.UPLOAD_IMAGE,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const imageUrl = data.data.cdn + data.data.images[0];
          if (!imageUrl) {
            toast.error("No image URL returned from the server.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }

          console.log(imageUrl);

          setAgentConfig((prev) => ({
            ...prev,
            greetingMedia: imageUrl,
            greetingMediaType: "image",
          }));
        } else {
          const errorData = await response.json();
          toast.error(
            `Failed to upload image: ${errorData.message || "Unknown error"}`
            , {
              position: "top-right",
              duration: 2000,
            });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(
          "An error occurred while uploading the image. Please try again."
          , {
            position: "top-right",
            duration: 2000,
          });
      }
    } else if (type === "video") {

      if (!file.type.includes("video")) {
        toast.error("Please select a valid video file.", {
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      const validFormats = ["video/mp4", "video/webm", "video/ogg"];
      if (!validFormats.includes(file.type)) {
        toast.error("Unsupported video format. Please use MP4, WebM, or OGG.", {
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      const maxSize = 50 * 1024 * 1024; // 50MB for video
      if (file.size > maxSize) {

        toast.error("Video file size exceeds 50MB limit.", {
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      const formData = new FormData();
      formData.append("video", file);

      try {
        const response = await fetch(
          API.UPLOAD_VIDEO,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const videoUrl = data.data.cdn + data.data.video;
          console.log(videoUrl);
          if (!videoUrl) {
            toast.error("No video URL returned from the server.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }

          setAgentConfig((prev) => ({
            ...prev,
            greetingMedia: videoUrl,
            greetingMediaType: "video",
          }));
          // toast.success("Video uploaded successfully!");
        } else {
          const errorData = await response.json();
          toast.error(
            `Failed to upload video: ${errorData.message || "Unknown error"}`, {
            position: "top-right",
            duration: 2000,
          }
          );
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        toast.error(
          "An error occurred while uploading the video. Please try again.",
          {
            position: "top-right",
            duration: 2000,
          }
        );
      }
    }
  };

  const handleSave = async () => {
    console.log("first");
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(API.AGENT_DETAILS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authorization headers here
          Authorization: `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }

      const data = await response.json();
      console.log(data.data.ai_agent.ai_agent_slug, "agent details");

      // Update the slug from fetched data (assuming the response contains the slug)
      const updatedSlug = data.data.ai_agent.ai_agent_slug;
      console.log(updatedSlug, "slug") // Fallback to original if not found
      const link = `${siteDomain}/liveagent/${updatedSlug}`;
      console.log(link, "linkfor url");

      setTimeout(() => {
        setAgentLink(link);
        setIsModalOpen(true);
      }, 1000); // 1-second delay, adjust as needed
    } catch (error) {
      console.error('Error fetching agent details:', error);
      // Fallback to original slug if fetch fails
      const link = `${siteDomain}/liveagent/${agentConfig?.ai_agent_slug}`;
      console.log(link, "linkfor url (fallback)");

      setTimeout(() => {
        setAgentLink(link);
        setIsModalOpen(true);
      }, 1000);
    }
  };

  const nextStep = async () => {
    if (progressData && currentStep > progressData.completed_steps + 1) {
      toast.error("Please complete the current step before proceeding.", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("No access token found", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    console.log(agentConfig);

    try {
      let response;
      let payload;
      let apiUrl;

      switch (currentStep) {
        case 1:
          if (!agentConfig.greetingTitle.trim()) {
            toast.error("Please provide a greeting title.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          if (!agentConfig.greeting.trim()) {
            toast.error("Please provide a welcome greeting.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          if (!agentConfig.avatar?.trim()) {
            toast.error("Please provide a Avatar.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          apiUrl = API.CREATE_AGENT_1;
          payload = {
            avatar_image_url: agentConfig.avatar,
            greeting_title: agentConfig.greetingTitle,
            welcome_greeting: agentConfig.greeting,
            greeting_media_url:
              agentConfig.greetingMedia ||
              "https://ddvtek8w6blll.cloudfront.net/linka/general/Weekend-in-Taipei.jpg",
            greeting_media_type: agentConfig.greetingMediaType || "image",
          };
          break;

        case 2:
          if (!agentConfig.name.trim()) {
            toast.error("Please provide an agent name.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          if (!agentConfig.trainingInstructions.trim()) {
            toast.error("Please provide training instructions.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }

          apiUrl = API.ADD_AGENT_DETAILS_2;
          payload = {
            agent_name: agentConfig.name,
            training_instructions: agentConfig.trainingInstructions,
            // ai_agenet_slug : agentConfig.ai_agent_slug
          };
          break;

        case 3:
          if (
            !agentConfig.useConditionalPrompts &&
            agentConfig.prompts.every((prompt) => !prompt.trim())
          ) {
            toast.error(
              "Please add at least one non-empty prompt or enable conditional prompts.",
              {
                position: "top-right",
                duration: 2000,
              });
            return;
          }
          if (
            agentConfig.useConditionalPrompts &&
            agentConfig.conditionalPrompts.length === 0
          ) {
            toast.error("Please add at least one conditional prompt.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }

          apiUrl = API.ADD_PROMPTS_3;
          payload = {
            prompts: agentConfig.useConditionalPrompts
              ? agentConfig.conditionalPrompts
                .map((cp) => cp.mainPrompt)
                .filter((p) => p.trim())
              : agentConfig.prompts.filter((p) => p.trim()),
          };
          break;

        case 4:
          setProgressData((prev) => ({
            ...prev,
            completed_steps: Math.max(prev?.completed_steps || 0, currentStep),
            next_step: 5,
            current_status: `Skipped step ${currentStep}`,
            completed_at: new Date().toISOString(),
          }));
          setCurrentStep(5);
          toast.success(`Step ${currentStep} saved successfully!`, {
            position: "top-right",
            duration: 2000,
          });
          return; // Exit early to avoid executing API call logic
        // break;

        case 5:
          if (
            !agentConfig.greetingTitle.trim() ||
            !agentConfig.greeting.trim()
          ) {
            toast.error("Please complete Step 1: Greeting Media.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          if (!agentConfig.greetingMedia) {
            toast.error("Please upload either an image or a video in Step 1.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          if (
            !agentConfig.name.trim() ||
            !agentConfig.trainingInstructions.trim()
          ) {
            toast.error("Please complete Step 2: AI Training.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          if (
            !agentConfig.useConditionalPrompts &&
            agentConfig.prompts.every((prompt) => !prompt.trim())
          ) {
            toast.error("Please add at least one non-empty prompt in Step 3.", {
              position: "top-right",
              duration: 2000,
            });
            return;
          }
          if (
            agentConfig.useConditionalPrompts &&
            agentConfig.conditionalPrompts.length === 0
          ) {
            toast.error(
              "Please add at least one conditional prompt in Step 3.", {
              position: "top-right",
              duration: 2000,
            }
            );
            return;
          }

          apiUrl = "/api/settings";
          payload = {
            agentName: agentConfig.name,
            trainingInstructions: agentConfig.trainingInstructions,
            agentGreeting: agentConfig.greeting,
            agentPrompts: agentConfig.useConditionalPrompts
              ? []
              : agentConfig.prompts.filter((p) => p.trim()),
            conditionalPrompts: agentConfig.useConditionalPrompts
              ? agentConfig.conditionalPrompts
              : [],
            partnerLinks: agentConfig.partnerLinks.filter(
              (link) => link.affiliateLink.trim() !== ""
            ),
            linkaProMonetizations: agentConfig.linkaProMonetizations.filter(
              (link) => (link as LinkaProMonetizationWebsite).category.trim() !== ""
            ),
            greetingTitle: agentConfig.greetingTitle,
            greeting_title: agentConfig.greetingTitle,
            welcome_greeting: agentConfig.greeting,
            greeting_media_url: agentConfig.greetingMedia,
            greeting_media_type: agentConfig.greetingMediaType,
          };
          break;

        default:
          toast.error("Invalid step.", {
            position: "top-right",
            duration: 2000,
          });
          return;
      }

      response = await fetch(apiUrl, {
        method: currentStep === 1 ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          currentStep === 3
            ? "AI Agent saved and published successfully!"
            : `Step ${currentStep} saved successfully!`
          , {
            position: "top-right",
            duration: 2000,
          });
        // Update progress data after successful save
        setProgressData((prev) => ({
          ...prev,
          completed_steps: Math.max(prev?.completed_steps || 0, currentStep),
          next_step: currentStep + 1,
          current_status: `Completed step ${currentStep}`,
          completed_at: new Date().toISOString(),
        }));
        if (currentStep < 5) setCurrentStep(currentStep + 1);
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to save Step ${currentStep}: ${errorData.message || "Unknown error"}`, {
          position: "top-right",
          duration: 2000,
        }
        );
      }
    } catch (error) {
      toast.error(`Error saving agent: ${error}`, {
        position: "top-right",
        duration: 2000,
      });
      toast.error("An error occurred while saving. Please try again.", {
        position: "top-right",
        duration: 2000,
      });
    }
  };

  const saveMonetization = async () => {
    // Validate required fields
    const hasEmptyRequiredFields = modalLinks.some((link) => {
      if (activeTab === "partner") {
        return (
          !(link as PartnerLink).category.trim() ||
          !(link as PartnerLink).affiliateLink.trim()
        );
      } else if (activeTab === "aipro") {
        if ((link as LinkaProMonetization).proType === "products") {
          return (
            !link.category.trim() ||
            !(link as LinkaProMonetizationProduct).categoryUrl?.trim()
          );
        } else if ((link as LinkaProMonetization).proType === "blogs") {
          return (
            !link.category.trim() ||
            !(link as LinkaProMonetizationBlog).blogUrl?.trim()
          );
        } else if ((link as LinkaProMonetization).proType === "websites") {
          return (
            !link.category.trim() ||
            !(link as LinkaProMonetizationWebsite).websiteUrl?.trim()
          );
        }
      }
      return false;
    });

    if (hasEmptyRequiredFields) {
      toast.error(
        `Please fill in all required fields for ${activeTab === "partner" ? "Primary Recs" : selectedMonetizationOption}`, {
        position: "top-right",
        duration: 2000,
      }
      );
      return;
    }

    // Prepare payload
    const payload = {
      links: modalLinks.map((link) => {
        if (activeTab === "partner") {
          return {
            link_type: "affiliate",
            category_name: (link as PartnerLink).category,
            affiliate_url: (link as PartnerLink).affiliateLink,
            main_url: (link as PartnerLink).affiliateLink,
            brand_name: (link as PartnerLink).brandName,
            social_media_link: (link as PartnerLink).socialMediaLink || "",
            product_review: (link as PartnerLink).productReview || "",
            status: (link as PartnerLink).status,
          };
        } else {
          return {
            link_type: (link as LinkaProMonetization).proType,
            category_name: link.category,
            affiliate_url: (link as LinkaProMonetizationProduct).affiliateLink || "",
            main_url:
              (link as LinkaProMonetizationProduct).categoryUrl ||
              (link as LinkaProMonetizationBlog).blogUrl ||
              (link as LinkaProMonetizationWebsite).websiteUrl ||
              "",
            brand_name: (link as LinkaProMonetizationProduct).affiliateLink
              ? link.category
              : "",
            social_media_link: "",
            product_review: "",
            status: link.status,
          };
        }
      }),
    };

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("No access token found. Please log in.", {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    try {
      const response = await fetch(
        API.ADD_LINKS_4,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      let link_type = activeTab === "partner" ? "affiliate" : selectedMonetizationOption;

      if (response.ok) {
        // Refetch links to update table data
        const fetchLinksResponse = await fetch(
          API.LINK_LIST(link_type, page),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (fetchLinksResponse.ok) {
          const data = await fetchLinksResponse.json();
          const links = data.data.link_list;

          if (activeTab === "partner") {
            const mappedLinks: PartnerLink[] = links.map((link: any) => ({
              id: link.id,
              category: link.category_name || "",
              affiliateLink: link.url || "",
              brandName: link.brand_name || "",
              socialMediaLink: link.social_media_link || "",
              productReview: link.product_review || "",
              status: link.status,
            }));
            setPartnerLinksTableData(mappedLinks);
          } else {
            const mappedLinks: LinkaProMonetization[] = links.map((link: any) => {
              if (link.type === "products") {
                return {
                  id: link.id,
                  proType: "products",
                  category: link.category_name || "",
                  affiliateLink: link.affiliate_url || "",
                  brandName: link.brand_name || "",
                  categoryUrl: link.url || "",
                  status: link.status,
                };
              } else if (link.type === "blogs") {
                return {
                  id: link.id,
                  proType: "blogs",
                  category: link.category_name || "",
                  blogUrl: link.url || "",
                  brandName: link.brand_name || "",
                  status: link.status,
                };
              } else if (link.type === "websites") {
                return {
                  id: link.id,
                  proType: "websites",
                  category: link.category_name || "",
                  websiteUrl: link.url || "",
                  brandName: link.brand_name || "",
                  status: link.status,
                };
              }
              return null;
            }).filter((link: any) => link !== null);
            setAiproLinksTableData(mappedLinks);
          }
          setIsMonetizationModalOpen(false);
          toast.success("Links saved successfully!", {
            position: "top-right",
            duration: 2000,
          });
        } else {
          const errorData = await fetchLinksResponse.json();
          toast.error(`Failed to refresh links: ${errorData.message || "Unknown error"}`, {
            position: "top-right",
            duration: 2000,
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save links: ${errorData.message || "Unknown error"}`, {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error saving links:", error);
      toast.error("An error occurred while saving links. Please try again.", {
        position: "top-right",
        duration: 2000,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          // <TooltipProvider>
          <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-linka-russian-violet tracking-tight">
                    Greeting Media
                  </CardTitle>
                </div>
                <p className="text-xs sm:text-sm text-linka-night/70 font-light">
                  Upload an image or video and create your opening message
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8 space-y-6 sm:space-y-8">
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-linka-russian-violet">
                    AI Agent Greeting
                  </h3>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label="Agent name tooltip"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                      >
                        <p>Upload visuals to represent your AI agent's avatar and greeting.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                  <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                    {/* Avatar Preview */}
                    <div className="relative group w-full md:w-1/2 max-w-[12rem] sm:max-w-[14rem]">
                      <Label className="text-sm sm:text-base font-medium text-linka-russian-violet mb-2 block mx-auto w-full text-center">
                        AI Chat Agent
                      </Label>
                      <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-linka-dark-orange/90 to-linka-carolina-blue/90 flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.02]">
                        {agentConfig.avatar ? (
                          <img
                            src={agentConfig.avatar}
                            alt="Agent Avatar"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={() => toast.error('Error loading avatar image.')}
                          />
                        ) : (
                          <Bot className="w-10 h-10 sm:w-14 sm:h-14 text-white/90 animate-pulse" />
                        )}
                      </div>
                      <div className="flex gap-2 sm:gap-3 absolute -bottom-1 right-4 sm:right-[30%]">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <label
                                  htmlFor="avatar-upload"
                                  className="bg-white border-2 border-linka-carolina-blue text-linka-carolina-blue rounded-full p-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-carolina-blue hover:text-white shadow-md flex items-center gap-1"
                                >
                                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                  <span className="text-xs font-medium hidden sm:inline">Image</span>
                                  <span className="sr-only">Upload avatar image</span>
                                </label>
                              </TooltipTrigger>
                              <TooltipContent
                                className="bg-white text-gray-800 border border-gray-200 rounded-md p-2 text-sm shadow-lg max-w-xs"
                                sideOffset={5}
                              >
                                <p>Upload an image (max 5MB) for your AI's avatar.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    {/* Greeting Media Preview */}
                    <div className="relative group w-full md:w-1/2 max-w-[12rem] sm:max-w-[14rem]">
                      <Label className="text-sm sm:text-base font-medium text-linka-russian-violet mb-2 block text-center">
                        AI Greeting Agent
                      </Label>
                      <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-linka-dark-orange/90 to-linka-carolina-blue/90 flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.02]">
                        {agentConfig.greetingMedia ? (
                          <video
                            src={agentConfig.greetingMedia}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover rounded-full"
                            onError={() =>
                              toast.error('Error loading video. Please ensure the file is a valid MP4, WebM, or OGG.')
                            }
                          />
                        ) : (
                          <Bot className="w-10 h-10 sm:w-14 sm:h-14 text-white/90 animate-pulse" />
                        )}
                      </div>
                      <div className="flex gap-2 sm:gap-3 absolute -bottom-1 right-4 sm:right-[30%]">
                        {/* Commented-out Image Upload */}
                        {/* <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleGreetingMediaUpload(e, 'image')}
              className="hidden"
              id="greeting-image-upload"
            />
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <label
                    htmlFor="greeting-image-upload"
                    className="bg-white border-2 border-linka-carolina-blue text-linka-carolina-blue rounded-full p-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-carolina-blue hover:text-white shadow-md flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    <span className="text-xs font-medium hidden sm:inline">Image</span>
                    <span className="sr-only">Upload greeting image</span>
                  </label>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-white text-gray-800 border border-gray-200 rounded-md p-2 text-sm shadow-lg max-w-xs"
                  sideOffset={5}
                >
                  <p>Upload an image (max 5MB) for your AI's greeting.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div> */}
                        <div>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleGreetingMediaUpload(e, 'video')}
                            className="hidden"
                            id="greeting-video-upload"
                          />
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <label
                                  htmlFor="greeting-video-upload"
                                  className="bg-white border-2 border-linka-carolina-blue text-linka-carolina-blue rounded-full p-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-carolina-blue hover:text-white shadow-md flex items-center gap-1"
                                >
                                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                  <span className="text-xs font-medium hidden sm:inline">Video</span>
                                  <span className="sr-only">Upload greeting video</span>
                                </label>
                              </TooltipTrigger>
                              <TooltipContent
                                className="bg-white text-gray-800 border border-gray-200 rounded-md p-2 text-sm shadow-lg max-w-xs"
                                sideOffset={5}
                              >
                                <p>Upload a video (max 50MB, MP4/WebM/OGG) for your AI's greeting.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-linka-night/60 mt-3 sm:mt-5 font-medium text-center">
                  Upload an image (max 5MB) for avatar or an image/video (max 30MB/50MB, MP4/WebM/OGG) for greeting
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="greeting-title"
                    className="text-linka-russian-violet font-medium flex items-center gap-1 text-sm sm:text-base"
                  >
                    Greeting Title{" "}
                    <span className="text-xs text-linka-dark-orange">(Max 50 chars)</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label="Agent name tooltip"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                      >
                        <p>Example: Hi, I'm Sabrina</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <input
                  id="greeting-title"
                  type="text"
                  placeholder="Example: Hi I'm { Your Name }"
                  value={agentConfig.greetingTitle || ""}
                  onChange={(e) => handleInputChange("greetingTitle", e.target.value)}
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-linka-night border border-linka-alice-blue rounded-xl focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 transition-all duration-300 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 bg-white/80 backdrop-blur-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-linka-night/50 italic">Pro tip: Keep it short and engaging</p>
                  <span
                    className={`text-xs ${agentConfig.greetingTitle?.length === 50 ? "text-red-400" : "text-linka-night/50"}`}
                  >
                    {agentConfig.greetingTitle?.length || 0}/50
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="greeting"
                    className="text-linka-russian-violet font-medium flex items-center gap-1 text-sm sm:text-base"
                  >
                    Opening Greeting{" "}
                    <span className="text-xs text-linka-dark-orange">(Max 120 chars)</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label="Agent name tooltip"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                      >
                        <p>Example: I can help you find the coolest places in NYC to visit!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="greeting"
                  placeholder="Example: I can help you find the coolest places in NYC to visit!"
                  value={agentConfig.greeting}
                  onChange={(e) => handleInputChange("greeting", e.target.value)}
                  rows={3}
                  maxLength={120}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-linka-night border border-linka-alice-blue rounded-xl focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 transition-all duration-300 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 bg-white/80 backdrop-blur-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-linka-night/50 italic">Pro tip: Keep it relevant to your expertise</p>
                  <span
                    className={`text-xs ${agentConfig.greeting?.length === 120 ? "text-red-400" : "text-linka-night/50"}`}
                  >
                    {agentConfig.greeting?.length || 0}/120
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-linka-alice-blue/30 to-white/50 rounded-xl p-4 sm:p-5 border border-linka-alice-blue/80 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[5px] opacity-5" />
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <p className="text-xs text-linka-night/60 font-medium uppercase tracking-wider">
                    Preview
                  </p>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-linka-night/70 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="whitespace-pre-line">
                        <p>Preview how your AI's greeting will appear to users.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-center space-y-2 sm:space-y-3 relative z-10">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-medium text-linka-russian-violet animate-in fade-in">
                    {agentConfig.greetingTitle || "Hi I'm Your AI"}
                  </h4>
                  <p className="text-base sm:text-lg md:text-xl font-semibold text-linka-night/90 animate-in fade-in delay-100">
                    {agentConfig.greeting ||
                      "I can help you find the coolest places in NYC to visit!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          // </TooltipProvider>
        );

      case 2:
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
                      These buttons will appear when users first interact with your AI (max 40 chars)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {agentConfig.prompts.map((prompt, index) => (
                      <div key={index} className="space-y-2">
                        <Label
                          htmlFor={`prompt-${index}`}
                          className="text-linka-russian-violet/90"
                        >
                          Prompt {index + 1}
                        </Label>
                        <Input
                          id={`prompt-${index}`}
                          placeholder={[
                            "Plan my itinerary (max 40 chars)",
                            "Local recommendations (max 40 chars)",
                            "Show best deals (max 40 chars)",
                            "About activities (max 40 chars)",
                          ][index]}
                          value={prompt}
                          onChange={(e) => updatePrompt(index, e.target.value)}
                          maxLength={40}
                          className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 transition-all duration-200"
                        />
                        <p className="text-xs text-linka-night/60">
                          {prompt.length}/40 characters
                        </p>
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
                      Create decision trees that adapt to different user needs (max 40 chars)
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
                                {prompt.mainPrompt.length > 40 ? prompt.mainPrompt.slice(0, 40) : prompt.mainPrompt || "Untitled Flow"}
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
                                        This will permanently delete "
                                        {prompt.mainPrompt.length > 40 ? prompt.mainPrompt.slice(0, 40) : prompt.mainPrompt || "this flow"}" and all its branches.
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
                                    {prompt.option1.label.length > 40 ? prompt.option1.label.slice(0, 40) : prompt.option1.label || "Option 1"}
                                  </Label>
                                </div>
                                <div className="space-y-2 ml-4">
                                  {prompt.option1.followUps.map((followUp, index) => (
                                    <div
                                      key={index}
                                      className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
                                    >
                                      {followUp.length > 40 ? followUp.slice(0, 40) : followUp || `Follow-up question ${index + 1}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-linka-carolina-blue" />
                                  <Label className="text-sm font-medium text-linka-russian-violet">
                                    {prompt.option2.label.length > 40 ? prompt.option2.label.slice(0, 40) : prompt.option2.label || "Option 2"}
                                  </Label>
                                </div>
                                <div className="space-y-2 ml-4">
                                  {prompt.option2.followUps.map((followUp, index) => (
                                    <div
                                      key={index}
                                      className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
                                    >
                                      {followUp.length > 40 ? followUp.slice(0, 40) : followUp || `Follow-up question ${index + 1}`}
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
                        className={`w-full border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 transition-all duration-300 ${agentConfig.conditionalPrompts.length >= 2 ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                        disabled={agentConfig.conditionalPrompts.length >= 2}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {agentConfig.conditionalPrompts.length === 0
                          ? "Create First Flow"
                          : "Add Another Flow"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full mx-auto border-none shadow-xl rounded-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold text-indigo-900 tracking-tight">
                AI Agent Setup
              </CardTitle>
              <p className="text-sm text-gray-500">
                Personalize your AI agent with a name and specific instructions
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="agent-name"
                    className="text-base font-medium text-gray-700"
                  >
                    Agent Name
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label="Agent name tooltip"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                      >
                        {AGENT_NAME_PLACEHOLDER}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="agent-name"
                  placeholder={AGENT_NAME_PLACEHOLDER}
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
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="training-instructions"
                    className="text-base font-medium text-gray-700"
                  >
                    Training Instructions
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label="Training instructions tooltip"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        className="whitespace-pre-line"
                      >
                        {TRAINING_INSTRUCTIONS_PLACEHOLDER}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="training-instructions"
                  placeholder={TRAINING_INSTRUCTIONS_PLACEHOLDER}
                  value={agentConfig.trainingInstructions}
                  onChange={(e) =>
                    handleInputChange('trainingInstructions', e.target.value)
                  }
                  rows={8}
                  className="w-full text-base p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder:text-gray-400/60 hover:border-gray-400 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clear and detailed instructions will improve your agent's performance
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        // Use the status_list from the API response
        const statusList: { [key: number]: string } = {
          2: "COMPLETED",
          1: "PROCESSING",
          [-1]: "CANCELLED",
          [-2]: "ONHOLD",
          0: "PENDING",
        };

        // Status color mapping for consistent UI
        const statusStyles: { [key: string]: string } = {
          COMPLETED: "bg-green-100 text-green-800",
          PROCESSING: "bg-yellow-100 text-yellow-800",
          PENDING: "bg-blue-100 text-blue-800",
          CANCELLED: "bg-red-100 text-red-800",
          ONHOLD: "bg-gray-100 text-gray-800",
        };

        return (
          <Card className="border-none shadow-lg rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl mx-2 sm:mx-0">
            {/* Yellow banner for free users */}
            <div className="bg-yellow-50 text-blue-700 rounded-xl p-3 text-sm font-medium text-left border-b border-yellow-200">
              To add knowledge, links and monetization to your AI-Agent,{" "}
              <Link
                href="/pricing"
                className="text-linka-dark-orange hover:underline font-semibold"
              >
                upgrade!
              </Link>
            </div>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl sm:text-2xl font-bold text-linka-russian-violet tracking-tight flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-linka-dark-orange" />
                  Monetization Options
                </CardTitle>
                <p className="text-xs sm:text-sm text-linka-night/70 font-light">
                  Choose how you want to customize & monetize your AI-agent
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                <Button
                  variant={activeTab === "partner" ? "default" : "outline"}
                  onClick={() => { setActiveTab("partner"); setIsAddContentOpen(false); }}
                  className={`text-xs sm:text-sm ${activeTab === "partner"
                    ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
                    : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                    } transition-all duration-300 hover:scale-105`}
                >
                  Primary Recs
                </Button>
                <Button
                  variant={activeTab === "aipro" ? "default" : "outline"}
                  onClick={() => { setActiveTab("aipro"); setIsAddContentOpen(false); }}
                  className={`text-xs sm:text-sm ${activeTab === "aipro"
                    ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
                    : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                    } transition-all duration-300 hover:scale-105`}
                >
                  Smart Recs
                </Button>
                <Button
                  variant={activeTab === "paywall" ? "default" : "outline"}
                  disabled={true}
                  onClick={() => setActiveTab("paywall")}
                  className={`text-xs sm:text-sm ${activeTab === "paywall"
                    ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
                    : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                    } transition-all duration-300 hover:scale-105`}
                >
                  Linka Paywall (Coming Soon)
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-grow min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-linka-russian-violet flex items-center gap-2">
                      <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-linka-carolina-blue" />
                      {activeTab === "aipro" ? "Smart Recs" : "Primary Recs"}
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              aria-label="Agent name tooltip"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="whitespace-pre-line">
                            <p>{activeTab === "aipro" ? SMART_RECS : PRIMARY_RECS}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                  </div>
                  {activeTab === "partner" ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsMonetizationModalOpen(true)}
                      className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 hover:text-linka-carolina-blue transition-all duration-300 hover:scale-[1.02] whitespace-nowrap flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 text-xs sm:text-sm"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Add URL
                    </Button>
                  ) : activeTab === "aipro" ? (
                    <div className="relative">
                      <div className="flex flex-col items-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddContentOpen(!isAddContentOpen)}
                          className="border-linka-dark-orange text-linka-dark-orange bg-white hover:bg-gray-50 rounded-lg shadow-sm px-4 py-6 text-sm font-medium transition-all duration-300 flex items-center gap-1 w-56 justify-between"
                        >
                          {isAddContentOpen ? (
                            <Minus className="w-5 h-5 text-linka-dark-orange" />
                          ) : (
                            <Plus className="w-5 h-5 text-linka-dark-orange" />
                          )}
                          <div className="flex flex-col items-start">
                            Add Content
                            <span className="text-xs text-gray-500">Enhance your AI-Agent</span>
                          </div>

                        </Button>
                      </div>
                      {isAddContentOpen && (
                        <div className="absolute z-10 mt-2 w-56 rounded-lg bg-white shadow-md border border-gray-200 right-0">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button
                              onClick={() => {
                                setIsMonetizationModalOpen(true);
                                setIsAddContentOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-start gap-2 rounded"
                            >
                              <FaLink className="w-4 h-4 text-linka-dark-orange mt-1" />
                              <div className="flex flex-col items-start">
                                Add URL
                                <span className="text-xs text-gray-500 text-wrap max-w-[160px]">
                                  Link to blogs or web pages.
                                </span>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setIsAddContentOpen(false);
                                // Handle Add PDF action
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-start gap-2 rounded"
                              disabled={true}
                            >
                              <FaFilePdf className="w-4 h-4 text-linka-dark-orange mt-1" />
                              <div className="flex flex-col items-start">
                                Add PDF(coming soon)
                                <span className="text-xs text-gray-500 text-wrap max-w-[160px]">
                                  Upload documents or detailed guides.
                                </span>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setIsAddContentOpen(false);
                                // Handle Add Audio action
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-start gap-2 rounded"
                            >
                              <FaMicrophone className="w-4 h-4 text-linka-dark-orange mt-1" />
                              <div className="flex flex-col items-start">
                                Add Audio(coming soon)
                                <span className="text-xs text-gray-500 text-wrap max-w-[160px]">
                                  Include sound clips or voice notes.
                                </span>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setIsAddContentOpen(false);
                                // Handle Add Video action
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-start gap-2 rounded"
                            >
                              <FaPlay className="w-4 h-4 text-linka-dark-orange mt-1" />
                              <div className="flex flex-col items-start">
                                Add Video(coming soon)
                                <span className="text-xs text-gray-500 text-wrap max-w-[160px]">
                                  Add videos or short clips.
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <p className="text-xs text-linka-night/60 mt-1">
                  {activeTab === "aipro"
                    ? "Smarter Recommendations. Scaled Earnings."
                    : "Your AI-Agent will make Personalized Recommendations based on your primary recs."}
                </p>
                {activeTab === "aipro" && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                    <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
                      <input
                        type="radio"
                        name="monetizationOption"
                        value="blogs"
                        className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
                        checked={selectedMonetizationOption === "blogs"}
                        onChange={() => {
                          setSelectedMonetizationOption("blogs");
                          setPage(1);
                          setIsAddContentOpen(false);
                        }}
                      />
                      Monetize Your Expertise
                    </label>
                    <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
                      <input
                        type="radio"
                        name="monetizationOption"
                        value="products"
                        className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
                        checked={selectedMonetizationOption === "products"}
                        onChange={() => {
                          setSelectedMonetizationOption("products");
                          setPage(1);
                          setIsAddContentOpen(false);
                        }}
                      />
                      Product Expansion
                    </label>
                    {/* <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
                      <input
                        type="radio"
                        name="monetizationOption"
                        value="websites"
                        className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
                        checked={selectedMonetizationOption === "websites"}
                        disabled={true}
                        onChange={() => {
                          setSelectedMonetizationOption("websites");
                          setPage(1);
                        }}
                      />
                      Website Monetization (coming soon)
                    </label> */}
                  </div>
                )}
              </div>
              {isLoading ? (
                <p className="text-sm text-linka-night/60 text-center">Loading links...</p>
              ) : activeTab === "partner" ? (
                <div className="overflow-x-auto position-static">
                  <table className="w-full text-xs sm:text-sm text-left text-linka-night/80">
                    <thead className="text-xs text-linka-russian-violet uppercase bg-linka-alice-blue/30">
                      <tr>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Product
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Category
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          URL
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Processing
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Clicks(total)
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerLinksTableData.map((link, index) => (
                        <tr
                          key={link.id || index}
                          className="bg-white border-b hover:bg-linka-alice-blue/10"
                        >
                          <td className="px-3 py-3 sm:px-6 sm:py-4"> {link.id || index} {link.brandName || ""}</td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">{link.category || ""}</td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            {link.affiliateLink ? (
                              <a
                                href={link.affiliateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-linka-carolina-blue underline"
                              >
                                Affiliate
                              </a>
                            ) : (
                              <span>Affiliate</span>
                            )}
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center justify-center rounded-full text-xs py-1 ${statusStyles[statusList[link.status !== undefined ? link.status : 0]] ||
                                  "bg-gray-100 text-gray-800"
                                  }`}
                              > {statusList[link.status !== undefined ? link.status : 0] || "Unknown"}
                              </span>
                              {link.status === -2 && (
                                <a
                                  href="/settings"
                                  className="text-gray-800 underline px-1 text-center"
                                >
                                  Insufficient Tokens
                                </a>
                              )}
                              {link.status === -1 && (
                                <span className="text-xs text-red-500 text-center">Link Blocked by Provider</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            {link.proceesing}
                          </td>
                          <td> 0 </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-linka-carolina-blue hover:text-linka-dark-orange text-xs"
                                >
                                  <DotsVerticalIcon className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                side="right"
                                align="end"
                                className="bg-white border border-linka-alice-blue rounded-md shadow-lg p-1"
                              >
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer hover:bg-linka-carolina-blue/10 p-2 rounded"
                                  onClick={() => handlePreviewLink(index, "partner")}
                                >
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer hover:bg-linka-carolina-blue/10 p-2 rounded"
                                  onClick={() => handleRetryLink(index)}
                                >
                                  Retry
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer text-red-500 hover:bg-red-50 p-2 rounded"
                                  onClick={() => handleDeleteLink(index, "partner")}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-linka-alice-blue/30 rounded-lg p-3 border border-linka-alice-blue/50 mt-3 sm:mt-4">
                    <div className="flex items-start gap-2">
                      <InfoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-linka-carolina-blue mt-0.5 flex-shrink-0" />
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
                </div>
              ) : activeTab === "aipro" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left text-linka-night/80">
                    <thead className="text-xs text-linka-russian-violet uppercase bg-linka-alice-blue/30">
                      <tr>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Product
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Category
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          URL
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Processing
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Clicks(total)
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiproLinksTableData.map((link, index) => {
                        let url: string | undefined;
                        if (link.proType === "products") {
                          url = (link as LinkaProMonetizationProduct).categoryUrl;
                        } else if (link.proType === "blogs") {
                          url = (link as LinkaProMonetizationBlog).blogUrl;
                        } else if (link.proType === "websites") {
                          url = (link as LinkaProMonetizationWebsite).websiteUrl;
                        }
                        return (
                          <tr
                            key={link.id || index}
                            className="bg-white border-b hover:bg-linka-alice-blue/10"
                          >
                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                              {link.brandName || "Unnamed Link"}
                            </td>
                            <td className="px-3 py-3 sm:px-6 sm:py-4">{link.category || "Unnamed Link"}</td>
                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-linka-carolina-blue underline"
                                >
                                  {link.proType?.charAt(0).toUpperCase() + link.proType!.slice(1)}
                                </a>
                              ) : (
                                <span>{link.proType?.charAt(0).toUpperCase() + link.proType!.slice(1)}</span>
                              )}
                            </td>
                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                              <div className="flex flex-col gap-1">
                                <span
                                  className={`inline-flex items-center justify-center rounded-full text-xs py-1 ${statusStyles[statusList[link.status !== undefined ? link.status : 0]] ||
                                    "bg-gray-100 text-gray-800"
                                    }`}
                                > {statusList[link.status !== undefined ? link.status : 0] || "Unknown"}
                                </span>
                                {link.status === -2 && (
                                  <a
                                    href="/settings"
                                    className="text-gray-800 underline px-1 text-center"
                                  >
                                    Insufficient Tokens
                                  </a>
                                )}
                                {link.status === -1 && (
                                  <span className="text-xs text-red-500 text-center">Link Blocked by Provider</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                              {link.proceesing}
                            </td>
                            <td> 0 </td>
                            <td className="px-3 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-linka-carolina-blue hover:text-linka-dark-orange text-xs"
                                  >
                                    <DotsVerticalIcon className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  side="right"
                                  align="end"
                                  className="bg-white border border-linka-alice-blue rounded-md shadow-lg p-1"
                                >
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer hover:bg-linka-carolina-blue/10 p-2 rounded"
                                    onClick={() => handlePreviewLink(index, "aipro")}
                                  >
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer hover:bg-linka-carolina-blue/10 p-2 rounded"
                                    onClick={() => handleRetryLink(index)}
                                  >
                                    Retry
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer text-red-500 hover:bg-red-50 p-2 rounded"
                                    onClick={() => handleDeleteLink(index, "aipro")}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="bg-linka-alice-blue/30 rounded-lg p-3 border border-linka-alice-blue/50 mt-3 sm:mt-4">
                    <div className="flex items-start gap-2">
                      <InfoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-linka-carolina-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-linka-russian-violet mb-1">Pro Tips:</p>
                        <ul className="text-xs text-linka-night/60 space-y-1">
                          <li className="flex items-start gap-1.5">
                            <span>•</span>
                            <span>Your AI Agent will scan your pages and the links on the pages</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>•</span>
                            <span>Ensure affiliate links on your webpage are not broken links</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>•</span>
                            <span>Provide URLs, PDFs and even voice chat to enhance the knowledge of your agent</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === "paywall" ? (
                <div className="overflow-x-auto">{/* Paywall table or content */}</div>
              ) : (
                <p className="text-xs sm:text-sm text-linka-night/60 text-center">
                  {activeTab === "partner" ? "No partner links added yet." : "No monetization links added yet."}
                </p>
              )}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-linka-night">Items per page:</Label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="border border-linka-alice-blue rounded-md p-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-linka-night">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <div className="bg-gray-100 h-[800px] md:h-[950px] flex items-center justify-center">
            <Toaster />
            <div className="w-full max-w-9xl h-full">
              <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white border border-gray-200 h-full">
                <CardHeader className="px-4 py-3 sm:px-6 sm:py-4 flex flex-row justify-between">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                    Live Preview
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 font-normal">
                      This is exactly what your users will see
                    </p>
                  </CardTitle>

                  <CardTitle>
                    <button
                      onClick={handleViewAgent}
                      className="bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 active:bg-orange-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      View Agent
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 h-[calc(100%-80px)]">
                  {/* Preview Container */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 h-[500px] md:h-[600px] flex flex-col w-full max-w-md mx-auto">
                    {/* Avatar Container */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-blue-400 flex items-center justify-center shadow-md">
                        {agentConfig.greetingMedia && agentConfig.greetingMediaType && !imageError ? (
                          agentConfig.greetingMediaType.toLowerCase() === "video" ? (
                            <video
                              src={agentConfig.greetingMedia}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-cover rounded-full"
                              onError={() => toast.error("Error loading video. Please ensure the file is a valid MP4, WebM, or OGG.", {
                                position: "top-right",
                                duration: 2000,
                              })}
                            />
                          ) : (
                            <img
                              src={agentConfig.greetingMedia}
                              alt="Greeting Image"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={() => {
                                setImageError(true);
                                toast.error("Error loading greeting image.", {
                                  position: "top-right",
                                  duration: 2000,
                                });
                              }}
                            />
                          )
                        ) : (
                          <div className="flex flex-col items-center">
                            <Bot className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white/90 animate-pulse" />
                            {imageError && (
                              <p className="text-[10px] sm:text-xs text-red-500 mt-1 sm:mt-2">Failed to load image</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Greeting Text */}
                    <div className="text-center mb-4 sm:mb-6">
                      <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800">
                        {agentConfig.greetingTitle}
                      </h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-700 mt-1 sm:mt-2">
                        {agentConfig.greeting}
                      </p>
                    </div>

                    {/* Prompt Buttons */}
                    <div className="flex-1 overflow-y-auto px-1 sm:px-2">
                      <div className="space-y-3">
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                            {(agentConfig.useConditionalPrompts && agentConfig.conditionalPrompts.length > 0
                              ? agentConfig.conditionalPrompts.slice(0, 2).map((cp) => cp.mainPrompt)
                              : agentConfig.prompts.filter((prompt) => prompt.trim() !== "")
                            ).map((prompt, index) => (
                              <button
                                key={index}
                                className="border border-gray-300 rounded-md py-2 px-3 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer text-left transition-colors duration-200"
                              >
                                <span className="font-medium text-gray-800 line-clamp-2">
                                  {prompt || `Prompt ${index + 1}`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="mt-auto">
                      <div className="flex bg-gray-200 rounded-md px-3 py-2 items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type or ask me something..."
                          className="flex-1 bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-500 focus:outline-none font-medium"
                          disabled
                        />
                        <button className="text-black p-1 sm:p-2 rounded-full flex items-center justify-center  transition-colors duration-200">
                          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button className="bg-black text-white p-1 sm:p-2 rounded-full flex items-center justify-center  transition-colors duration-200">
                          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">⚡️</span>
                      <h3 className="text-xs sm:text-sm font-semibold text-blue-900">
                        Pro Tips
                      </h3>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-blue-800">
                      <li>Ask relevant questions to test your avatar.</li>
                      <li>Preview images and videos may take a moment to load on first launch.</li>
                      <li>Refine your agent's persona and instructions based on results.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // For Retry action
  const handleRetryLink = (index: any) => {
    console.log(`Retry link at index ${index}`, agentConfig.partnerLinks[index]);
    console.log('Make API call to retry processing here');
  };

  // For Delete action
  const handleDeleteLink1 = (index: any) => {
    console.log(`Delete link at index ${index}`, agentConfig.partnerLinks[index]);
    console.log('Make API call to delete here');
  };

  // For Update Image action
  const handleUpdateImage = (index: any) => {
    console.log(`Update image for link at index ${index}`, agentConfig.partnerLinks[index]);
    console.log('Open image upload modal here');
  };

  const agentSlug = agentDetails?.ai_agent_slug;
  const chatUrl = agentSlug ? `${siteDomain}/liveagent/${agentSlug}` : null;

  const handleViewAgent = () => {
    if (chatUrl) {
      router.push(chatUrl);
    }
  };
  return (
    <DashboardLayout key={isPreviewModalOpen ? "modal-open" : "modal-closed"}>
      <div className="mx-auto py-6 sm:py-4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-linka-russian-violet mb-4 sm:mb-0">
            Build Your AI Agent
          </h1>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-between">
          <div className="w-full md:w-2/4 lg:w-1/4">
            <div className="stepper space-y-3 sm:space-y-4 relative">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div
                    className={`stepper-item flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-md ${progressData && progressData.completed_steps >= step.id
                      ? "bg-white text-linka-russian-violet border-2 border-orange-200"
                      : currentStep === step.id
                        ? "bg-orange-100 text-linka-russian-violet border-2 border-orange-300"
                        : "bg-white text-linka-russian-violet hover:bg-orange-50 border border-orange-200"
                      }`}
                    onClick={() => {
                      setCurrentStep(step.id);
                    }}
                  >
                    <div
                      className={`stepper-number w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white font-bold transition-all ${progressData && progressData.completed_steps >= step.id
                        ? "bg-orange-500 ring-2 ring-orange-500 ring-offset-2"
                        : currentStep === step.id
                          ? "bg-orange-500 ring-2 ring-orange-500 ring-offset-2"
                          : "bg-orange-400"
                        } mr-10 sm:mr-4`}
                    >
                      {progressData &&
                        progressData.completed_steps >= step.id ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-xs text-linka-night/60">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-5 sm:left-6 top-14 sm:top-16 w-0.5 h-8 sm:h-10 bg-orange-300`}
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
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`border-orange-300 text-orange-500 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200 ${currentStep !== 1
                    ? "hover:scale-105"
                    : "opacity-50 cursor-not-allowed"
                    }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {currentStep === 5 ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className={`px-4 py-2 rounded-md text-white font-medium ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isSaving ? 'Saving...' : 'Save & Publish Agent'}
                    </Button>

                    {isModalOpen && agentLink && (
                      <AgentSaveModal
                        agentLink={agentLink}
                        onClose={() => setIsModalOpen(false)}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={nextStep}
                      disabled={!nextStep} // Added condition to disable if no nextStep function
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 transition-all duration-300 hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
        <Dialog
          open={isConditionalModalOpen}
          onOpenChange={setIsConditionalModalOpen}
        >
          <DialogContent className="max-w-full sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConditionalPrompt
                  ? "Edit Conditional Prompt"
                  : "Add Conditional Prompt"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="main-prompt"
                  className="text-linka-russian-violet font-medium"
                >
                  Main Prompt
                </Label>
                <Input
                  id="main-prompt"
                  placeholder="e.g., Are you planning a trip for leisure or business?"
                  value={conditionalForm.mainPrompt}
                  onChange={(e) =>
                    updateConditionalForm("mainPrompt", e.target.value)
                  }
                  className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="option1-label"
                    className="text-linka-russian-violet font-medium"
                  >
                    Option 1 Label
                  </Label>
                  <Input
                    id="option1-label"
                    placeholder="e.g., Leisure"
                    value={conditionalForm.option1.label}
                    onChange={(e) =>
                      updateConditionalOption(
                        "option1",
                        "label",
                        e.target.value
                      )
                    }
                    className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                  />
                  <div className="mt-4 space-y-2">
                    <Label className="text-linka-russian-violet">
                      Follow-up Questions
                    </Label>
                    {conditionalForm.option1.followUps.map(
                      (followUp, index) => (
                        <Input
                          key={index}
                          placeholder={`Follow-up ${index + 1}`}
                          value={followUp}
                          onChange={(e) => {
                            const newFollowUps = [
                              ...conditionalForm.option1.followUps,
                            ];
                            newFollowUps[index] = e.target.value;
                            updateConditionalOption(
                              "option1",
                              "followUps",
                              newFollowUps
                            );
                          }}
                          className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                        />
                      )
                    )}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="option2-label"
                    className="text-linka-russian-violet font-medium"
                  >
                    Option 2 Label
                  </Label>
                  <Input
                    id="option2-label"
                    placeholder="e.g., Business"
                    value={conditionalForm.option2.label}
                    onChange={(e) =>
                      updateConditionalOption(
                        "option2",
                        "label",
                        e.target.value
                      )
                    }
                    className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                  />
                  <div className="mt-4 space-y-2">
                    <Label className="text-linka-russian-violet">
                      Follow-up Questions
                    </Label>
                    {conditionalForm.option2.followUps.map(
                      (followUp, index) => (
                        <Input
                          key={index}
                          placeholder={`Follow-up ${index + 1}`}
                          value={followUp}
                          onChange={(e) => {
                            const newFollowUps = [
                              ...conditionalForm.option2.followUps,
                            ];
                            newFollowUps[index] = e.target.value;
                            updateConditionalOption(
                              "option2",
                              "followUps",
                              newFollowUps
                            );
                          }}
                          className="border-linka-alice-blue focus:ring-2 focus:ring-linka-carolina-blue"
                        />
                      )
                    )}
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
          <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-linka-russian-violet">
                {activeTab === "partner"
                  ? "Primary Recs"
                  : selectedMonetizationOption === "products"
                    ? "Product Monetization"
                    : selectedMonetizationOption === "blogs"
                      ? "Blog or Webpage Monetization"
                      : selectedMonetizationOption === "websites"
                        ? "Website Monetization"
                        : "AI Pro Monetization"}
              </DialogTitle>
            </DialogHeader>
            {/* {loading && <p>Loading brands and categories...</p>} */}
            {error && <p className="text-red-500">{error}</p>}
            <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
              {activeTab === "partner" ? (
                <div className="space-y-4">
                  {modalLinks.map((link) => (
                    <Card
                      key={link.id}
                      className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 bg-white/90 rounded-lg shadow-md"
                    >
                      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center space-x-2">
                              <Label
                                htmlFor={`partner-category-${link.id}`}
                                className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                              >
                                Category <span className="text-red-500">*</span>
                              </Label>
                              <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                      aria-label="Category tooltip"
                                    >
                                      <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="whitespace-pre-line">
                                    {CATEGORY_PLACEHOLDER}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="relative">
                              <Input
                                id={`partner-category-${link.id}`}
                                list={`category-suggestions-${link.id}`}
                                placeholder={CATEGORY_PLACEHOLDER}
                                value={(link as PartnerLink).category}
                                onChange={(e) => updatePartnerLink(link.id, 'category', e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                              />
                              <datalist id={`category-suggestions-${link.id}`}>
                                {(categories || []).map((category) => (
                                  <option key={category.name} value={category.name} />
                                ))}
                              </datalist>
                            </div>
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center space-x-2">
                              <Label
                                htmlFor={`partner-link-${link.id}`}
                                className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                              >
                                Affiliate Link <span className="text-red-500">*</span>
                              </Label>
                              <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                      aria-label="Affiliate link tooltip"
                                    >
                                      <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="whitespace-pre-line">
                                    {AFFILIATE_LINK_PLACEHOLDER}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="relative">
                              <Input
                                id={`partner-link-${link.id}`}
                                placeholder={AFFILIATE_LINK_PLACEHOLDER}
                                value={(link as PartnerLink).affiliateLink}
                                onChange={(e) => updatePartnerLink(link.id!, 'affiliateLink', e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-9 pl-8 sm:pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                              />
                              <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-linka-dark-orange" />
                            </div>
                          </div>
                        </div>
                        {/* <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-linka-russian-violet font-semibold text-lg">
                              Additional Information
                            </h3>
                            <TooltipProvider>
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                    aria-label="Additional information tooltip"
                                  >
                                    <Info className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="whitespace-pre-line">
                                  Optional: Provide your AI-Agent with more context
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Label
                                  htmlFor={`partner-social-${link.id}`}
                                  className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                >
                                  Social Media Link
                                </Label>
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                        aria-label="Social media link tooltip"
                                      >
                                        <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="whitespace-pre-line">
                                      {SOCIAL_MEDIA_LINK_PLACEHOLDER}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Input
                                id={`partner-social-${link.id}`}
                                placeholder={SOCIAL_MEDIA_LINK_PLACEHOLDER}
                                value={(link as PartnerLink).socialMediaLink || ''}
                                onChange={(e) => updatePartnerLink(link.id!, 'socialMediaLink', e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Label
                                  htmlFor={`partner-review-${link.id}`}
                                  className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                >
                                  Product Review
                                </Label>
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                        aria-label="Product review tooltip"
                                      >
                                        <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="whitespace-pre-line">
                                      {PRODUCT_REVIEW_PLACEHOLDER}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Input
                                id={`partner-review-${link.id}`}
                                placeholder={PRODUCT_REVIEW_PLACEHOLDER}
                                value={(link as PartnerLink).productReview || ''}
                                onChange={(e) => updatePartnerLink(link.id!, 'productReview', e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Label
                                  htmlFor={`partner-brand-${link.id}`}
                                  className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                >
                                  Brand Name
                                </Label>
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                        aria-label="Brand name tooltip"
                                      >
                                        <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="whitespace-pre-line">
                                      {BRAND_NAME_PLACEHOLDER}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="relative">
                                <Input
                                  id={`partner-brand-${link.id}`}
                                  list={`brand-suggestions-${link.id}`}
                                  placeholder={BRAND_NAME_PLACEHOLDER}
                                  value={(link as PartnerLink).brandName}
                                  onChange={(e) => updatePartnerLink(link.id!, 'brandName', e.target.value)}
                                  className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                                <datalist id={`brand-suggestions-${link.id}`}>
                                  {brands.map((brand) => (
                                    <option key={brand.name} value={brand.name} />
                                  ))}
                                </datalist>
                              </div>
                            </div>
                          </div>
                        </div> */}
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex justify-end gap-2 sm:gap-4 mt-3 sm:mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsMonetizationModalOpen(false)}
                      className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveMonetization}
                      className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="max-h-[60vh] overflow-y-auto px-1">
                    {modalLinks.length > 0 ? (
                      <div className="space-y-4">
                        {modalLinks.map((link) => (
                          <Card
                            key={link.id}
                            className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 bg-white/90 rounded-lg shadow-md"
                          >
                            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4 relative">
                              {modalLinks.length > 1 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      className="absolute top-2 right-2 text-red-600 hover:text-red-700 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                                      aria-label="Remove link"
                                      disabled={modalLinks.length === 1}
                                    >
                                      <X className={`w-4 h-4 sm:w-5 sm:h-5 ${modalLinks.length === 1 ? 'opacity-50' : ''}`} />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-red-100">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-linka-russian-violet">Remove this link?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will remove the link from the modal. This action cannot be undone until you save or cancel.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-linka-alice-blue hover:bg-linka-alice-blue">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRemoveLink(link.id)}
                                        className="bg-red-600 hover:bg-red-700 transition-all duration-200"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Link
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              {(link as LinkaProMonetization).proType === "blogs" && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Label
                                        htmlFor={`pro-category-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category <span className="text-red-500">*</span>
                                      </Label>
                                      <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                              aria-label="Category tooltip"
                                            >
                                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="whitespace-pre-line">
                                            {CATEGORY_BLOGS_PLACEHOLDER}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id={`pro-category-${link.id}`}
                                        list={`pro-category-suggestions-${link.id}`}
                                        placeholder={CATEGORY_BLOGS_PLACEHOLDER}
                                        value={link.category || ''}
                                        onChange={(e) => updateLinkaProMonetization(link.id!, 'category', e.target.value)}
                                        className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                      <datalist id={`category-suggestions-${link.id}`}>
                                        {(categories || []).map((category) => (
                                          <option key={category.name} value={category.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  </div>
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Label
                                        htmlFor={`pro-blog-url-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Blog or Webpage URL <span className="text-red-500">*</span>
                                      </Label>
                                      <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                              aria-label="Blog post URL tooltip"
                                            >
                                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="whitespace-pre-line">
                                            {BLOG_POST_URL_PLACEHOLDER}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id={`pro-blog-url-${link.id}`}
                                        placeholder={BLOG_POST_URL_PLACEHOLDER}
                                        value={(link as LinkaProMonetizationBlog).blogUrl || ''}
                                        onChange={(e) => updateLinkaProMonetization(link.id!, 'blogUrl', e.target.value)}
                                        className="text-xs sm:text-sm h-8 sm:h-9 pl-8 sm:pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                      <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-linka-dark-orange" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              {(link as LinkaProMonetization).proType === "products" && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Label
                                        htmlFor={`pro-category-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category <span className="text-red-500">*</span>
                                      </Label>
                                      <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                              aria-label="Category tooltip"
                                            >
                                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="whitespace-pre-line">
                                            {CATEGORY_PRODUCTS_PLACEHOLDER}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id={`pro-category-${link.id}`}
                                        list={`pro-category-suggestions-${link.id}`}
                                        placeholder={CATEGORY_PRODUCTS_PLACEHOLDER}
                                        value={link.category || ''}
                                        onChange={(e) => updateLinkaProMonetization(link.id!, 'category', e.target.value)}
                                        className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                      <datalist id={`pro-category-suggestions-${link.id}`}>
                                        {categories.map((category) => (
                                          <option key={category.name} value={category.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  </div>
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Label
                                        htmlFor={`pro-affiliate-link-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Affiliate Link
                                      </Label>
                                      <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                              aria-label="Affiliate link tooltip"
                                            >
                                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="whitespace-pre-line">
                                            {AFFILIATE_LINK_PLACEHOLDER}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id={`pro-affiliate-link-${link.id}`}
                                        placeholder={AFFILIATE_LINK_PLACEHOLDER}
                                        value={(link as LinkaProMonetizationProduct).affiliateLink || ''}
                                        onChange={(e) => updateLinkaProMonetization(link.id!, 'affiliateLink', e.target.value)}
                                        className="text-xs sm:text-sm h-8 sm:h-9 pl-8 sm:pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                      <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-linka-dark-orange" />
                                    </div>
                                  </div>
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Label
                                        htmlFor={`pro-category-url-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category URL <span className="text-red-500">*</span>
                                      </Label>
                                      <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                              aria-label="Category URL tooltip"
                                            >
                                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="whitespace-pre-line">
                                            {CATEGORY_URL_PLACEHOLDER}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id={`pro-category-url-${link.id}`}
                                        placeholder={CATEGORY_URL_PLACEHOLDER}
                                        value={(link as LinkaProMonetizationProduct).categoryUrl || ''}
                                        onChange={(e) => updateLinkaProMonetization(link.id!, 'categoryUrl', e.target.value)}
                                        className="text-xs sm:text-sm h-8 sm:h-9 pl-8 sm:pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                      <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-linka-dark-orange" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              {(link as LinkaProMonetization).proType === "websites" && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Label
                                        htmlFor={`pro-website-category-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category <span className="text-red-500">*</span>
                                      </Label>
                                      <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                              aria-label="Category tooltip"
                                            >
                                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="whitespace-pre-line">
                                            {CATEGORY_WEBSITES_PLACEHOLDER}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id={`pro-website-category-${link.id}`}
                                        list={`pro-website-category-suggestions-${link.id}`}
                                        placeholder={CATEGORY_WEBSITES_PLACEHOLDER}
                                        value={link.category || ''}
                                        onChange={(e) => updateLinkaProMonetization(link.id!, 'category', e.target.value)}
                                        className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                      <datalist id={`pro-website-category-suggestions-${link.id}`}>
                                        {categories.map((category) => (
                                          <option key={category.name} value={category.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  </div>
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Label
                                        htmlFor={`pro-website-url-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Website URL <span className="text-red-500">*</span>
                                      </Label>
                                      <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-linka-russian-violet hover:text-linka-carolina-blue focus:outline-none"
                                              aria-label="Website URL tooltip"
                                            >
                                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="whitespace-pre-line">
                                            {WEBSITE_URL_PLACEHOLDER}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id={`pro-website-url-${link.id}`}
                                        placeholder={WEBSITE_URL_PLACEHOLDER}
                                        value={(link as LinkaProMonetizationWebsite).websiteUrl || ''}
                                        onChange={(e) => updateLinkaProMonetization(link.id!, 'websiteUrl', e.target.value)}
                                        className="text-xs sm:text-sm h-8 sm:h-9 pl-8 sm:pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                      <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-linka-dark-orange" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 rounded-xl border-2 border-dashed border-linka-alice-blue bg-white/50">
                        <LinkIcon className="w-8 h-8 sm:w-12 sm:h-12 text-linka-dark-orange/70 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-linka-russian-violet mb-1 sm:mb-2">
                          No AI Pro Monetization Added
                        </h3>
                        <p className="text-xs sm:text-sm text-linka-night/60 mb-3 sm:mb-4">
                          Add your first AI Pro monetization link to get started
                        </p>
                        <Button
                          onClick={addLinkaProMonetization}
                          className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 text-xs sm:text-sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add AI Pro Link
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-3 sm:mt-4">
                    <Button
                      onClick={addLinkaProMonetization}
                      className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Add New Link
                    </Button>
                    <Button
                      onClick={saveMonetization}
                      className="bg-linka-carolina-blue hover:bg-linka-carolina-blue/80 transition-transform hover:scale-105 text-white text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Submit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsMonetizationModalOpen(false)}
                      className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={handleClosePreviewModal}
          linkData={selectedLink}
        />
      </div>
    </DashboardLayout >
  );
}

const AgentSaveModal = ({ agentLink, onClose }: { agentLink: string; onClose: () => void }) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const iframeCode = `<iframe src="${agentLink}" width="100%" height="600" frameborder="0"></iframe>`;
  const widgetCode = `
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${agentLink}/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
`;

  const handleCopy = useCallback(async (text: string, type: 'share' | 'iframe' | 'widget') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'share') setCopiedShare(true);
      if (type === 'iframe') setCopiedIframe(true);
      if (type === 'widget') setCopiedWidget(true);
      setCopyError(null);
      setTimeout(() => {
        if (type === 'share') setCopiedShare(false);
        if (type === 'iframe') setCopiedIframe(false);
        if (type === 'widget') setCopiedWidget(false);
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyError('Failed to copy to clipboard. Please try again.');
      setTimeout(() => setCopyError(null), 2000);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setTimeout(onClose, 500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[625px] p-0 overflow-auto bg-gray-100 rounded-xl w-[calc(100vw-20px)]">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-full">
          <DialogHeader className="flex flex-row justify-between items-start p-2 sm:p-4 pb-2 sm:pb-4 border-b border-gray-200">
            <DialogTitle className="text-sm sm:text-2xl font-bold text-gray-900 flex items-center font-sans">
              <span className="inline-block mr-1 sm:mr-2">🎉</span>
              Your AI-Agent is Live!
            </DialogTitle>
          </DialogHeader>

          <div className="px-2 sm:px-4 pb-2 sm:pb-4 mt-5">
            <Tabs defaultValue="share" className="w-full mx-auto ">
              <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-1 bg-gray-200/50 rounded-lg shadow-sm">
                <TabsTrigger
                  value="share"
                  className="py-1 sm:py-2 text-[10px] sm:text-sm flex items-center justify-center rounded-md data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-orange-100 hover:text-orange-700 font-medium"
                  aria-label="Share URL Tab"
                >
                  <Smartphone className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Share URL</span>
                </TabsTrigger>

                <TabsTrigger
                  value="iframe"
                  className="py-1 sm:py-2 text-[10px] sm:text-sm flex items-center justify-center rounded-md data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-orange-100 hover:text-orange-700 font-medium"
                  aria-label="Iframe Tab"
                >
                  <Globe className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Iframe</span>
                </TabsTrigger>

                <TabsTrigger
                  value="widget"
                  className="py-1 sm:py-2 text-[10px] sm:text-sm flex items-center justify-center rounded-md data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-orange-100 hover:text-orange-700 font-medium"
                  aria-label="Widget Tab"
                >
                  <Code className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Widget</span>
                </TabsTrigger>
              </TabsList>


              <TabsContent value="iframe" className="mt-2 sm:mt-4">
                <div className="space-y-1 sm:space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 text-xs sm:text-base mb-1 font-sans">
                      Simple Iframe Embed
                    </h3>
                    <p className="text-gray-600 text-[10px] sm:text-sm font-sans">
                      Basic iframe code that you can paste directly into your HTML.
                    </p>
                  </div>
                  <div className="relative flex items-center">
                    <Textarea
                      value={iframeCode}
                      readOnly
                      rows={3}
                      className="font-mono text-[10px] sm:text-sm p-1 sm:p-3 pr-8 sm:pr-12 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
                      aria-label="Iframe embed code"
                    />
                    <div className="absolute top-1 right-1 flex items-center space-x-1 sm:space-x-2">
                      <Button
                        onClick={() => handleCopy(iframeCode, 'iframe')}
                        className="h-6 w-6 sm:h-9 sm:w-9 p-0 bg-blue-50 hover:bg-blue-100 text-orange-600 focus:outline-none focus:ring-0"
                        variant="ghost"
                        size="sm"
                        aria-label="Copy iframe code"
                      >
                        <Copy className="h-3 w-3 sm:h-5 sm:w-5" />
                      </Button>
                      {copiedIframe && (
                        <span className="text-[10px] sm:text-sm text-green-600 font-medium truncate">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="widget" className="mt-2 sm:mt-4">
                <div className="space-y-1 sm:space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 text-xs sm:text-base mb-1 font-sans">
                      JavaScript Widget
                    </h3>
                    <p className="text-gray-600 text-[10px] sm:text-sm font-sans">
                      Dynamic widget that loads asynchronously and is more flexible.
                    </p>
                  </div>
                  <div className="relative flex items-center">
                    <Textarea
                      value={widgetCode}
                      readOnly
                      rows={4}
                      className="font-mono text-[10px] sm:text-sm p-1 sm:p-3 pr-8 sm:pr-12 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-blue-500 bg-white shadow-sm"
                      aria-label="Widget script code"
                    />
                    <div className="absolute top-1 right-1 flex items-center space-x-1 sm:space-x-2">
                      <Button
                        onClick={() => handleCopy(widgetCode, 'widget')}
                        className="h-6 w-6 sm:h-9 sm:w-9 p-0 bg-orange-50 hover:bg-orange-100 text-orange-600 focus:outline-none focus:ring-0"
                        variant="ghost"
                        size="sm"
                        aria-label="Copy widget code"
                      >
                        <Copy className="h-3 w-3 sm:h-5 sm:w-5" />
                      </Button>
                      {copiedWidget && (
                        <span className="text-[10px] sm:text-sm text-green-600 font-medium truncate">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="share" className="mt-2 sm:mt-4">
                <div className="space-y-1 sm:space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 text-xs sm:text-base mb-1 font-sans">
                      Share Chat Link
                    </h3>
                    <p className="text-gray-600 text-[10px] sm:text-sm font-sans">
                      Copy and share this URL to let others chat with your AI agent.
                    </p>
                  </div>
                  <div className="relative flex items-center">
                    <div
                      onClick={() => handleCopy(agentLink, 'share')}
                      className="font-mono text-[10px] sm:text-sm p-1 sm:p-3 pr-8 sm:pr-12 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 flex items-center overflow-hidden bg-white shadow-sm flex-1"
                      aria-label="Share URL"
                    >
                      <span className="truncate">{agentLink}</span>
                    </div>
                    <div className="absolute top-1 right-1 flex items-center space-x-1 sm:space-x-2">
                      <Button
                        onClick={() => handleCopy(agentLink, 'share')}
                        className="h-6 w-6 sm:h-9 sm:w-9 p-0 bg-orange-50 hover:bg-orange-100 text-orange-600 focus:outline-none focus:ring-0"
                        variant="ghost"
                        size="sm"
                        aria-label="Copy share URL"
                      >
                        <Copy className="h-3 w-3 sm:h-5 sm:w-5" />
                      </Button>
                      {copiedShare && (
                        <span className="text-[10px] sm:text-sm text-green-600 font-medium truncate">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-2 p-2 sm:p-4 pt-0">
            <button
              onClick={() => handleOpenChange(false)}
              className="px-2 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-xs shadow-sm"
              aria-label="Close dialog"
            >
              Close
            </button>
            <a
              href={agentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 sm:px-4 py-1 sm:py-2 border border-transparent rounded-md bg-gradient-to-r from-orange-400 to-orange-700 text-white font-medium hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 inline-flex items-center text-xs shadow-sm"
              aria-label="Open agent in new tab"
            >
              <OpenInNewWindowIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Open Agent
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
