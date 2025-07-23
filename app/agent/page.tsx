"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TrashIcon,
  RefreshCwIcon,
  EyeIcon
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// interface PartnerLink {
//   addKnowledge: string;
//   name: string;
//   url: string;
//   // status: 'active' | 'inactive'; // Adjust based on your possible status values
// }

// Interfaces remain unchanged
interface ConditionalPrompt {
  id: string;
  mainPrompt: string;
  option1: { label: string; followUps: string[] };
  option2: { label: string; followUps: string[] };
}

interface PartnerLink {
  id?: string;
  category: string;
  affiliateLink: string;
  affiliateBrandName?: string;
  socialMediaLink?: string;
  // affiliateimage: string | undefined;
  status?: "Submitted" | "Hold" | "Processing" | "Complete";
  productReview?: string
}

interface LinkaProMonetization {
  id: string;
  name: string;
  url: string;
  status: "active" | "inactive";
  blogUrl?: string; // optional
  websiteUrl?: string; // optional
  category: string;
  affiliateBrandName: string;
  mainUrl: string;
  mainimage?: mainimage;
}

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
  // greetingVideo: string | null
  // greetingImage: string | null
  greetingTitle: string;
  greeting: string;
  greetingMediaType: string | null;
  greetingMedia: string | null;
  // linkaProMonetizations: MonetizationLink[];
}

export default function AgentBuilderPage() {
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
  const [activeTab, setActiveTab] = useState<"partner" | "aipro" | "paywall">(
    "partner"
  );
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: "",
    trainingInstructions: "",
    prompts: ["", "", "", ""],
    // partnerLinks: [],
    // linkaProMonetizations: [],
    partnerLinks: [
      {
        id: "1",
        category: "Travel",
        affiliateBrandName: "TripAdvisor",
        affiliateLink: "Social Media",
        productReview: "Great travel reviews",
        socialMediaLink: "https://twitter.com/tripadvisor",
        // affiliateimage: "travel.jpg",
        // name: "test",
        // url: "active",
        status: "Hold",
      },
    ],
    linkaProMonetizations: [
      {
        id: "1",
        category: "Tech",
        affiliateBrandName: "Apple",
        mainUrl: "https://apple.com",
        mainimage: { name: "tech.jpg" },
        name: "test 1",
        url: "",
        status: "inactive",
        blogUrl: "", // added
        websiteUrl: "", // added
      },
    ],

    conditionalPrompts: [],
    useConditionalPrompts: false,
    greetingTitle: "",
    greeting: "",
    // greetingVideo: null,
    // greetingImage: null
    greetingMediaType: null,
    greetingMedia: null,
  });

  // Conditional prompt modal states
  const [isConditionalModalOpen, setIsConditionalModalOpen] = useState(false);
  const [editingConditionalPrompt, setEditingConditionalPrompt] =
    useState<ConditionalPrompt | null>(null);
  const [conditionalForm, setConditionalForm] = useState<ConditionalPrompt>({
    id: "",
    mainPrompt: "",
    option1: { label: "", followUps: ["", "", ""] },
    option2: { label: "", followUps: ["", "", ""] },
  });

  // Monetization modal state
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);

  const [selectedMonetizationOption, setSelectedMonetizationOption] = useState("productExpansion");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Greeting Media",
      description: "Upload image or video and create opening message",
    },
    {
      id: 2,
      title: "AI Training",
      description: "Name your agent and provide training instructions",
    },
    {
      id: 3,
      title: "Prompts",
      description: "Design conversation starters and branching logic",
    },
    {
      id: 4,
      title: "Knowledge & Monetization",
      description: "Add your affiliate links and monetization options",
    },
    { id: 5, title: "Preview & Test", description: "Test your AI agent" },
  ];

  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.tagwell.co/api/v4/ai-agent/agent/links/list?link_type=affiliate&page=${page}`,
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
          console.log(data);
          const links = data.data.link_list;

          // Map API response to partnerLinks or linkaProMonetizations based on activeTab
          if (activeTab === "partner") {
            const mappedLinks: PartnerLink[] = links.map((link: any) => ({
              id: link.id,
              category: link.category_name || "",
              affiliateLink: link.affiliate_url || "",
              affiliateBrandName: link.brand_name || "",
              socialMediaLink: link.social_media_link || "",
              productReview: link.product_review || "",
              status: link.status || "active",
            }));
            setAgentConfig((prev) => ({
              ...prev,
              partnerLinks: mappedLinks,
            }));
          } else if (activeTab === "aipro") {
            const mappedLinks: LinkaProMonetization[] = links.map((link: any) => ({
              id: link.id,
              name: link.brand_name || link.category_name || link.link_type,
              url: link.main_url || link.affiliate_url || link.blog_url || link.website_url || "",
              status: link.status || "active",
              category: link.category_name || "",
              affiliateBrandName: link.brand_name || "",
              mainUrl: link.main_url || "",
              blogUrl: link.link_type === "blog_monetization" ? link.main_url : "",
              websiteUrl: link.link_type === "website_monetization" ? link.main_url : "",
              mainimage: link.main_image ? { name: link.main_image } : undefined,
            }));
            setAgentConfig((prev) => ({
              ...prev,
              linkaProMonetizations: mappedLinks,
            }));
          }

          console.log(agentConfig);

          setTotalPages(data.data.meta.total || 1);
          toast.success("Affiliate links loaded successfully!");
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch links: ${errorData.message || "Unknown error"}`);
          toast.error(`Failed to fetch links: ${errorData.message || "Unknown error"}`);
        }
      } catch (err) {
        setError("An error occurred while fetching links.");
        toast.error("An error occurred while fetching links.");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "partner" || activeTab === "aipro") {
      fetchLinks();
    }
  }, [activeTab, page]);

  const handleEditLink = (index: number, type: "partner" | "aipro") => {
    if (type === "partner") {
      const link = agentConfig.partnerLinks[index];
      setIsMonetizationModalOpen(true);
      // Optionally, set state to prefill the modal with link data
      console.log("Editing partner link:", link);
    } else {
      const link = agentConfig.linkaProMonetizations[index];
      setIsMonetizationModalOpen(true);
      setSelectedMonetizationOption(
        link.blogUrl ? "blogMonetization" : link.websiteUrl ? "websiteMonetization" : "productExpansion"
      );
      console.log("Editing aipro link:", link);
    }
  };

  const handleDeleteLink = (index: number, type: "partner" | "aipro") => {
    if (type === "partner") {
      const linkId = agentConfig.partnerLinks[index].id;
      if (linkId) {
        removePartnerLink(linkId);
      } else {
        toast.error("No ID found for this link.");
      }
    } else {
      const linkId = agentConfig.linkaProMonetizations[index].id;
      if (linkId) {
        removeLinkaProMonetization(linkId);
      } else {
        toast.error("No ID found for this link.");
      }
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

  const saveConditionalPrompt = () => {
    if (
      !conditionalForm.mainPrompt.trim() ||
      !conditionalForm.option1.label.trim() ||
      !conditionalForm.option2.label.trim()
    ) {
      toast.error("Please fill in all required fields");
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
    );
  };

  const deleteConditionalPrompt = (id: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      conditionalPrompts: prev.conditionalPrompts.filter((p) => p.id !== id),
    }));
    toast.success("Conditional prompt deleted!");
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
          affiliateBrandName: "",
          productReview: "",
          socialMediaLink: "",
          status: "active",
        },
      ],
    }));
  };

  const updatePartnerLink = (
    id: string,
    field: string,
    value: string | File | null
  ) => {
    setAgentConfig((prevConfig) => ({
      ...prevConfig,
      partnerLinks: prevConfig.partnerLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removePartnerLink = (id: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      partnerLinks: prev.partnerLinks.filter((link) => link.id !== id),
    }));
    toast.success("Partner link removed!");
  };

  type MonetizationLink = {
    id: string;
    type: "productExpansion" | "blogMonetization" | "websiteMonetization";
    status: string;
  } & (
      | {
        type: "productExpansion";
        category: string;
        affiliateBrandName: string;
        mainUrl: string;
      }
      | {
        type: "blogMonetization";
        category: string;
        blogUrl: string;
      }
      | {
        type: "websiteMonetization";
        category: string;
        websiteUrl: string;
      }
    );

  const addLinkaProMonetization = () => {
    // Create a MonetizationLink first
    let newLink: MonetizationLink;

    switch (selectedMonetizationOption) {
      case "productExpansion":
        newLink = {
          id: Date.now().toString(),
          type: "productExpansion",
          status: "active",
          category: "",
          affiliateBrandName: "",
          mainUrl: "",
        };
        break;
      case "blogMonetization":
        newLink = {
          id: Date.now().toString(),
          type: "blogMonetization",
          status: "active",
          category: "",
          blogUrl: "",
        };
        break;
      case "websiteMonetization":
        newLink = {
          id: Date.now().toString(),
          type: "websiteMonetization",
          status: "active",
          category: "",
          websiteUrl: "",
        };
        break;
      default:
        // exhaustive check
        throw new Error(
          `Unknown monetization option: ${selectedMonetizationOption}`
        );
    }

    // Convert MonetizationLink to LinkaProMonetization
    const convertedLink: LinkaProMonetization = {
      id: newLink.id,
      category: newLink.category ?? "",
      affiliateBrandName:
        newLink.type === "productExpansion" ? newLink.affiliateBrandName : "",
      mainUrl: newLink.type === "productExpansion" ? newLink.mainUrl : "",
      name: newLink.type,
      url:
        newLink.type === "productExpansion"
          ? newLink.mainUrl
          : newLink.type === "blogMonetization"
            ? newLink.blogUrl
            : (newLink.websiteUrl ?? ""),
      blogUrl: newLink.type === "blogMonetization" ? newLink.blogUrl : "",
      websiteUrl:
        newLink.type === "websiteMonetization" ? newLink.websiteUrl : "",
      status: newLink.status === "active" ? "active" : "inactive",
    };

    setAgentConfig((prev) => ({
      ...prev,
      linkaProMonetizations: [...prev.linkaProMonetizations, convertedLink],
    }));
  };

  const updateLinkaProMonetization = (
    id: string,
    field: keyof LinkaProMonetization,
    value: string | File | null
  ) => {
    setAgentConfig((prev) => ({
      ...prev,
      linkaProMonetizations: prev.linkaProMonetizations.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeLinkaProMonetization = (id: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      linkaProMonetizations: prev.linkaProMonetizations.filter(
        (link) => link.id !== id
      ),
    }));
    toast.success("Linka Pro Monetization removed!");
  };

  const handleGreetingMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    console.log(type);
    console.log(event);
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("No access token found. Please log in.");
      return;
    }

    if (type === "image") {
      if (!file.type.includes("image")) {
        toast.error("Please select a valid image file.");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB for image
      if (file.size > maxSize) {
        toast.error("Image file size exceeds 5MB limit.");
        return;
      }

      const formData = new FormData();
      formData.append("images[]", file);
      formData.append("upload_path", "ai_agent");

      try {
        const response = await fetch(
          "https://api.tagwell.co/api/v4/ai-agent/upload/image",
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const imageUrl = data.data.cdn + data.data.images[0]; // Adjust based on actual API response structure
          if (!imageUrl) {
            toast.error("No image URL returned from the server.");
            return;
          }

          console.log(imageUrl);

          setAgentConfig((prev) => ({
            ...prev,
            greetingMedia: imageUrl,
            greetingMediaType: "image",
            // greetingImage: imageUrl,
            // greetingVideo: null // Clear video if image is uploaded
          }));
          toast.success("Image uploaded successfully!");
        } else {
          const errorData = await response.json();
          toast.error(
            `Failed to upload image: ${errorData.message || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(
          "An error occurred while uploading the image. Please try again."
        );
      }
    } else if (type === "video") {
      if (!file.type.includes("video")) {
        toast.error("Please select a valid video file.");
        return;
      }

      const validFormats = ["video/mp4", "video/webm", "video/ogg"];
      if (!validFormats.includes(file.type)) {
        toast.error("Unsupported video format. Please use MP4, WebM, or OGG.");
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB for video
      if (file.size > maxSize) {
        toast.error("Video file size exceeds 10MB limit.");
        return;
      }

      const formData = new FormData();
      formData.append("video", file);

      try {
        const response = await fetch(
          "https://api.tagwell.co/api/v4/ai-agent/upload/video",
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const videoUrl = data.url; // Adjust based on actual API response structure
          if (!videoUrl) {
            toast.error("No video URL returned from the server.");
            return;
          }

          setAgentConfig((prev) => ({
            ...prev,
            // greetingVideo: videoUrl,
            // greetingImage: null // Clear image if video is uploaded
            greetingMedia: videoUrl,
            greetingMediaType: "video",
          }));
          toast.success("Video uploaded successfully!");
        } else {
          const errorData = await response.json();
          toast.error(
            `Failed to upload video: ${errorData.message || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        toast.error(
          "An error occurred while uploading the video. Please try again."
        );
      }
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: agentConfig.name,
          trainingInstructions: agentConfig.trainingInstructions,
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
            (link) => link.mainUrl.trim() !== ""
          ),
          // agentGreeting: agentConfig.greeting,
          greetingTitle: agentConfig.greetingTitle,
        }),
      });

      if (response.ok) {
        toast.success("AI Agent saved successfully!");
        // Update progress data
        setProgressData((prev) => ({
          ...prev,
          completed_steps: Math.max(prev?.completed_steps || 0, currentStep),
          next_step: currentStep < 5 ? currentStep + 1 : 5,
          current_status: `Saved step ${currentStep}`,
          completed_at: new Date().toISOString(),
        }));
      } else {
        toast.error("Failed to save AI Agent");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    }
  };

  const nextStep = async () => {
    if (progressData && currentStep > progressData.completed_steps + 1) {
      toast.error("Please complete the current step before proceeding.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("No access token found");
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
            toast.error("Please provide a greeting title.");
            return;
          }
          if (!agentConfig.greeting.trim()) {
            toast.error("Please provide a welcome greeting.");
            return;
          }
          apiUrl = "https://api.tagwell.co/api/v4/ai-agent/create-agent";
          payload = {
            avatar_image_url: null,
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
            toast.error("Please provide an agent name.");
            return;
          }
          if (!agentConfig.trainingInstructions.trim()) {
            toast.error("Please provide training instructions.");
            return;
          }

          apiUrl = "https://api.tagwell.co/api/v4/ai-agent/add-agent-details";
          payload = {
            agent_name: agentConfig.name,
            training_instructions: agentConfig.trainingInstructions,
          };
          break;

        case 3:
          if (
            !agentConfig.useConditionalPrompts &&
            agentConfig.prompts.every((prompt) => !prompt.trim())
          ) {
            toast.error(
              "Please add at least one non-empty prompt or enable conditional prompts."
            );
            return;
          }
          if (
            agentConfig.useConditionalPrompts &&
            agentConfig.conditionalPrompts.length === 0
          ) {
            toast.error("Please add at least one conditional prompt.");
            return;
          }

          apiUrl = "https://api.tagwell.co/api/v4/ai-agent/add-prompts";
          payload = {
            prompts: agentConfig.useConditionalPrompts
              ? agentConfig.conditionalPrompts
                .map((cp) => cp.mainPrompt)
                .filter((p) => p.trim())
              : agentConfig.prompts.filter((p) => p.trim()),
          };
          break;

        case 4:
          if (
            agentConfig.partnerLinks.length === 0 &&
            agentConfig.linkaProMonetizations.length === 0
          ) {
            toast.warning(
              "No monetization links added. You can skip this step if not needed."
            );
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
              (link) => link.mainUrl.trim() !== ""
            ),
            greetingTitle: agentConfig.greetingTitle,
            // greetingImage: agentConfig.greetingImage,
            // greetingVideo: agentConfig.greetingVideo
          };
          break;

        case 5:
          if (
            !agentConfig.greetingTitle.trim() ||
            !agentConfig.greeting.trim()
          ) {
            toast.error("Please complete Step 1: Greeting Media.");
            return;
          }
          if (!agentConfig.greetingMedia) {
            toast.error("Please upload either an image or a video in Step 1.");
            return;
          }
          if (
            !agentConfig.name.trim() ||
            !agentConfig.trainingInstructions.trim()
          ) {
            toast.error("Please complete Step 2: AI Training.");
            return;
          }
          if (
            !agentConfig.useConditionalPrompts &&
            agentConfig.prompts.every((prompt) => !prompt.trim())
          ) {
            toast.error("Please add at least one non-empty prompt in Step 3.");
            return;
          }
          if (
            agentConfig.useConditionalPrompts &&
            agentConfig.conditionalPrompts.length === 0
          ) {
            toast.error(
              "Please add at least one conditional prompt in Step 3."
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
              (link) => link.mainUrl.trim() !== ""
            ),
            greetingTitle: agentConfig.greetingTitle,
            greeting_title: agentConfig.greetingTitle,
            welcome_greeting: agentConfig.greeting,
            greeting_media_url: agentConfig.greetingMedia,
            greeting_media_type: agentConfig.greetingMediaType,
          };
          break;

        default:
          toast.error("Invalid step.");
          return;
      }

      console.log(apiUrl);
      console.log(payload);
      console.log(currentStep);
      console.log(accessToken);

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
          currentStep === 5
            ? "AI Agent saved and published successfully!"
            : `Step ${currentStep} saved successfully!`
        );
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
          `Failed to save Step ${currentStep}: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error(`Error saving agent: ${error}`);
      toast.error("An error occurred while saving. Please try again.");
    }
  };

  // const saveMonetization = () => {
  //   // Ensure all required fields are filled
  //   const hasEmptyRequiredFields = agentConfig.linkaProMonetizations.some(
  //     (link) =>
  //       !link.category.trim() ||
  //       !link.affiliateBrandName.trim() ||
  //       !link.mainUrl.trim()
  //   );
  //   if (hasEmptyRequiredFields) {
  //     toast.error(
  //       "Please fill in all required fields (Category, Affiliate Brand Name, Main URL)"
  //     );
  //     return;
  //   }

  //   setIsMonetizationModalOpen(false);
  //   toast.success("Monetization saved successfully!");
  // };

  const saveMonetization = async () => {
    // Validate required fields based on selectedMonetizationOption
    let link_type = "";
    const hasEmptyRequiredFields = agentConfig.linkaProMonetizations.some((link) => {
      if (selectedMonetizationOption === "productExpansion") {
        link_type = "products";
        return !link.category.trim() || !link.affiliateBrandName.trim() || !link.mainUrl.trim();
      } else if (selectedMonetizationOption === "blogMonetization") {
        link_type = "blogs";
        return !link.category.trim() || !link.blogUrl?.trim();
      } else if (selectedMonetizationOption === "websiteMonetization") {
        link_type = "website";
        return !link.category.trim() || !link.websiteUrl?.trim();
      }
      return false;
    });

    if (hasEmptyRequiredFields) {
      toast.error(
        `Please fill in all required fields for ${selectedMonetizationOption.replace(/([A-Z])/g, ' $1').trim()}`
      );
      return;
    }

    // Prepare payload for the API
    const payload = {
      partnerLinks: agentConfig.linkaProMonetizations.map((link) => ({
        link_type: link_type, // e.g., "product_expansion", "blog_monetization", "website_monetization"
        category_name: link.category || "",
        affiliate_url: link.affiliateBrandName || link.mainUrl || link.blogUrl || link.websiteUrl || "",
        main_url: link.mainUrl || link.blogUrl || link.websiteUrl || "",
        brand_name: link.affiliateBrandName || "",
        social_media_link: "", // Not used in Linka Pro, included for consistency
        product_review: "", // Not used in Linka Pro, included for consistency
      })),
    };

    // Get access token
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("No access token found. Please log in.");
      return;
    }

    try {
      // Make API call to save Linka Pro monetization links
      const response = await fetch(
        "https://api.tagwell.co/api/v4/ai-agent/add-links",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setIsMonetizationModalOpen(false);
        toast.success("Linka Pro monetization links saved successfully!");
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to save monetization links: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error saving monetization links:", error);
      toast.error("An error occurred while saving monetization links. Please try again.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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
                <h3 className="text-base sm:text-lg font-medium text-linka-russian-violet mb-3 sm:mb-4">
                  AI Agent Greeting
                </h3>
                <div className="relative group w-full max-w-[12rem] sm:max-w-[14rem]">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-linka-dark-orange/90 to-linka-carolina-blue/90 flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.02]">
                    {agentConfig.greetingMedia &&
                      agentConfig.greetingMediaType ? (
                      agentConfig.greetingMediaType === "video" ? (
                        <video
                          src={agentConfig.greetingMedia}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover rounded-full"
                          onError={() =>
                            toast.error(
                              "Error loading video. Please ensure the file is a valid MP4, WebM, or OGG."
                            )
                          }
                        />
                      ) : (
                        <img
                          src={agentConfig.greetingMedia}
                          alt="Greeting Image"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={() =>
                            toast.error("Error loading greeting image.")
                          }
                        />
                      )
                    ) : (
                      <Bot className="w-10 h-10 sm:w-14 sm:h-14 text-white/90 animate-pulse" />
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3 absolute -bottom-1 right-4 sm:right-6">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleGreetingMediaUpload(e, "image")}
                        className="hidden"
                        id="greeting-image-upload"
                      />
                      <label
                        htmlFor="greeting-image-upload"
                        className="bg-white border-2 border-linka-carolina-blue text-linka-carolina-blue rounded-full p-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-carolina-blue hover:text-white shadow-md flex items-center gap-1"
                      >
                        <Upload
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          strokeWidth={2.5}
                        />
                        <span className="text-xs font-medium hidden sm:inline">
                          Image
                        </span>
                        <span className="sr-only">Upload greeting image</span>
                      </label>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleGreetingMediaUpload(e, "video")}
                        className="hidden"
                        id="greeting-video-upload"
                      />
                      <label
                        htmlFor="greeting-video-upload"
                        className="bg-white border-2 border-linka-carolina-blue text-linka-carolina-blue rounded-full p-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-linka-carolina-blue hover:text-white shadow-md flex items-center gap-1"
                      >
                        <Upload
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          strokeWidth={2.5}
                        />
                        <span className="text-xs font-medium hidden sm:inline">
                          Video
                        </span>
                        <span className="sr-only">Upload greeting video</span>
                      </label>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-linka-night/60 mt-3 sm:mt-5 font-medium text-center">
                  Upload either an image (max 5MB) or a video (max 10MB,
                  MP4/WebM/OGG)
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label
                  htmlFor="greeting-title"
                  className="text-linka-russian-violet font-medium flex items-center gap-1 text-sm sm:text-base"
                >
                  Greeting Title{" "}
                  <span className="text-xs text-linka-dark-orange">
                    (Max 50 chars)
                  </span>
                </Label>
                <input
                  id="greeting-title"
                  type="text"
                  placeholder="Example: Hi I'm { Your Name }"
                  value={agentConfig.greetingTitle || ""}
                  onChange={(e) =>
                    handleInputChange("greetingTitle", e.target.value)
                  }
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-linka-night border border-linka-alice-blue rounded-xl focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 transition-all duration-300 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 bg-white/80 backdrop-blur-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-linka-night/50 italic">
                    Pro tip: Keep it short and engaging
                  </p>
                  <span
                    className={`text-xs ${agentConfig.greetingTitle?.length === 50 ? "text-red-400" : "text-linka-night/50"}`}
                  >
                    {agentConfig.greetingTitle?.length || 0}/50
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label
                  htmlFor="greeting"
                  className="text-linka-russian-violet font-medium flex items-center gap-1 text-sm sm:text-base"
                >
                  Opening Greeting{" "}
                  <span className="text-xs text-linka-dark-orange">
                    (Max 120 chars)
                  </span>
                </Label>
                <Textarea
                  id="greeting"
                  placeholder="Example: I can help you find the coolest places in NYC to visit!"
                  value={agentConfig.greeting}
                  onChange={(e) =>
                    handleInputChange("greeting", e.target.value)
                  }
                  rows={3}
                  maxLength={120}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-linka-night border border-linka-alice-blue rounded-xl focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 transition-all duration-300 placeholder:text-linka-night/30 hover:border-linka-carolina-blue/50 bg-white/80 backdrop-blur-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-linka-night/50 italic">
                    Pro tip: Keep it relevant to your expertise
                  </p>
                  <span
                    className={`text-xs ${agentConfig.greeting?.length === 120 ? "text-red-400" : "text-linka-night/50"}`}
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
                    {agentConfig.greeting ||
                      "I can help you find the coolest places in NYC to visit!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
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
                  onChange={(e) => handleInputChange("name", e.target.value)}
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
                  onChange={(e) =>
                    handleInputChange("trainingInstructions", e.target.value)
                  }
                  rows={8}
                  className="w-full text-base p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder:text-gray-400/60 hover:border-gray-400 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clear and detailed instructions will improve your agent's
                  performance
                </p>
              </div>
            </CardContent>
          </Card>
        );
      // case 4:
      //   return (
      //     <Card className="border-none shadow-lg rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl mx-2 sm:mx-0">
      //       <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
      //         <div className="space-y-1">
      //           <CardTitle className="text-xl sm:text-2xl font-bold text-linka-russian-violet tracking-tight flex items-center gap-2">
      //             <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-linka-dark-orange" />
      //             Monetization Options
      //           </CardTitle>
      //           <p className="text-xs sm:text-sm text-linka-night/70 font-light">
      //             Choose how you want to customize & monetize your AI-agent
      //           </p>
      //         </div>
      //         <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
      //           <Button
      //             variant={activeTab === "partner" ? "default" : "outline"}
      //             onClick={() => setActiveTab("partner")}
      //             className={`text-xs sm:text-sm ${
      //               activeTab === "partner"
      //                 ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
      //                 : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
      //             } transition-all duration-300 hover:scale-105`}
      //           >
      //             Linka Basic
      //           </Button>
      //           <Button
      //             variant={activeTab === "aipro" ? "default" : "outline"}
      //             onClick={() => setActiveTab("aipro")}
      //             className={`text-xs sm:text-sm ${
      //               activeTab === "aipro"
      //                 ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
      //                 : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
      //             } transition-all duration-300 hover:scale-105`}
      //           >
      //             Linka Pro
      //           </Button>
      //           <Button
      //             variant={activeTab === "paywall" ? "default" : "outline"}
      //             onClick={() => setActiveTab("paywall")}
      //             className={`text-xs sm:text-sm ${
      //               activeTab === "paywall"
      //                 ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
      //                 : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
      //             } transition-all duration-300 hover:scale-105`}
      //           >
      //             Linka Paywall
      //           </Button>
      //           <Button className="ml-auto text-xs sm:text-sm hidden sm:inline-flex">
      //             Upgrade
      //           </Button>
      //         </div>
      //       </CardHeader>

      //       <CardContent className="px-4 sm:px-6">
      //         <div className="space-y-2">
      //           {/* Title */}
      //           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
      //             <div className="flex-grow min-w-0">
      //               <h3 className="text-base sm:text-lg font-medium text-linka-russian-violet flex items-center gap-2">
      //                 <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-linka-carolina-blue" />
      //                 {activeTab === "aipro"
      //                   ? "AI Smart Recommendations"
      //                   : "Linka Basic"}
      //               </h3>
      //             </div>

      //             {/* Button */}
      //             <Button
      //               variant="outline"
      //               onClick={() => setIsMonetizationModalOpen(true)}
      //               className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 hover:text-linka-carolina-blue transition-all duration-300 hover:scale-[1.02] whitespace-nowrap flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 text-xs sm:text-sm"
      //             >
      //               <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
      //               {activeTab === "aipro"
      //                 ? agentConfig.linkaProMonetizations?.length > 0
      //                   ? "Add Link"
      //                   : "Add First Link"
      //                 : agentConfig.partnerLinks?.length > 0
      //                   ? "Add Link"
      //                   : "Add First Link"}
      //             </Button>
      //           </div>

      //           {/* Description */}
      //           <p className="text-xs text-linka-night/60 mt-1">
      //             {activeTab === "aipro"
      //               ? "Add monetization links for AI Pro services"
      //               : "Personalized Recommendatons. 24/7 Earnings"}
      //           </p>

      //           {/* Radio Buttons - Only show for Linka Pro */}
      //           {activeTab === "aipro" && (
      //             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
      //               <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
      //                 <input
      //                   type="radio"
      //                   name="monetizationOption"
      //                   value="productExpansion"
      //                   className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
      //                   checked={
      //                     selectedMonetizationOption === "productExpansion"
      //                   }
      //                   onChange={() =>
      //                     setSelectedMonetizationOption("productExpansion")
      //                   }
      //                 />
      //                 Product Expansion
      //               </label>
      //               <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
      //                 <input
      //                   type="radio"
      //                   name="monetizationOption"
      //                   value="blogMonetization"
      //                   className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
      //                   checked={
      //                     selectedMonetizationOption === "blogMonetization"
      //                   }
      //                   onChange={() =>
      //                     setSelectedMonetizationOption("blogMonetization")
      //                   }
      //                 />
      //                 Blog Monetization
      //               </label>
      //               <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
      //                 <input
      //                   type="radio"
      //                   name="monetizationOption"
      //                   value="websiteMonetization"
      //                   className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
      //                   checked={
      //                     selectedMonetizationOption === "websiteMonetization"
      //                   }
      //                   onChange={() =>
      //                     setSelectedMonetizationOption("websiteMonetization")
      //                   }
      //                 />
      //                 Website Monetization
      //               </label>
      //             </div>
      //           )}
      //         </div>
      //       </CardContent>

      //       <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6 sm:space-y-8">
      //         {activeTab === "partner" &&
      //         agentConfig.partnerLinks.length > 0 ? (
      //           <div className="overflow-x-auto">
      //             <table className="w-full text-xs sm:text-sm text-left text-linka-night/80">
      //               <thead className="text-xs text-linka-russian-violet uppercase bg-linka-alice-blue/30">
      //                 <tr>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     Link Name
      //                   </th>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     URL
      //                   </th>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     Status
      //                   </th>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     Actions
      //                   </th>
      //                 </tr>
      //               </thead>
      //               <tbody>
      //                 {agentConfig.partnerLinks.map((link, index) => (
      //                   <tr
      //                     key={index}
      //                     className="bg-white border-b hover:bg-linka-alice-blue/10"
      //                   >
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4">
      //                       {link.category}
      //                     </td>
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4">
      //                       <a
      //                         href={link.affiliateLink}
      //                         target="_blank"
      //                         rel="noopener noreferrer"
      //                         className="text-linka-carolina-blue hover:underline break-all"
      //                       >
      //                         {link.affiliateLink}
      //                       </a>
      //                     </td>
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4">
      //                       <span
      //                         className={`px-2 py-1 rounded-full text-xs ${
      //                           link.status === "active"
      //                             ? "bg-green-100 text-green-800"
      //                             : "bg-red-100 text-red-800"
      //                         }`}
      //                       >
      //                         {link.status}
      //                       </span>
      //                     </td>
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
      //                       <Button
      //                         variant="ghost"
      //                         size="sm"
      //                         onClick={() => handleEditLink(index, "partner")}
      //                         className="text-linka-carolina-blue hover:text-linka-dark-orange text-xs"
      //                       >
      //                         Edit
      //                       </Button>
      //                       <Button
      //                         variant="ghost"
      //                         size="sm"
      //                         onClick={() => handleDeleteLink(index, "partner")}
      //                         className="text-red-500 hover:text-red-700 text-xs"
      //                       >
      //                         Delete
      //                       </Button>
      //                     </td>
      //                   </tr>
      //                 ))}
      //               </tbody>
      //             </table>
      //           </div>
      //         ) : activeTab === "aipro" &&
      //           agentConfig.linkaProMonetizations.length > 0 ? (
      //           <div className="overflow-x-auto">
      //             <table className="w-full text-xs sm:text-sm text-left text-linka-night/80">
      //               <thead className="text-xs text-linka-russian-violet uppercase bg-linka-alice-blue/30">
      //                 <tr>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     Link Name
      //                   </th>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     URL
      //                   </th>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     Status
      //                   </th>
      //                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
      //                     Actions
      //                   </th>
      //                 </tr>
      //               </thead>
      //               <tbody>
      //                 {agentConfig.linkaProMonetizations.map((link, index) => (
      //                   <tr
      //                     key={index}
      //                     className="bg-white border-b hover:bg-linka-alice-blue/10"
      //                   >
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4">
      //                       {link.category}
      //                     </td>
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4">
      //                       <a
      //                         href={link.url}
      //                         target="_blank"
      //                         rel="noopener noreferrer"
      //                         className="text-linka-carolina-blue hover:underline break-all"
      //                       >
      //                         {link.url}
      //                       </a>
      //                     </td>
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4">
      //                       <span
      //                         className={`px-2 py-1 rounded-full text-xs ${
      //                           link.status === "active"
      //                             ? "bg-green-100 text-green-800"
      //                             : "bg-red-100 text-red-800"
      //                         }`}
      //                       >
      //                         {link.status}
      //                       </span>
      //                     </td>
      //                     <td className="px-3 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
      //                       <Button
      //                         variant="ghost"
      //                         size="sm"
      //                         onClick={() => handleEditLink(index, "aipro")}
      //                         className="text-linka-carolina-blue hover:text-linka-dark-orange text-xs"
      //                       >
      //                         Edit
      //                       </Button>
      //                       <Button
      //                         variant="ghost"
      //                         size="sm"
      //                         onClick={() => handleDeleteLink(index, "aipro")}
      //                         className="text-red-500 hover:text-red-700 text-xs"
      //                       >
      //                         Delete
      //                       </Button>
      //                     </td>
      //                   </tr>
      //                 ))}
      //               </tbody>
      //             </table>
      //           </div>
      //         ) : (
      //           <p className="text-xs sm:text-sm text-linka-night/60 text-center">
      //             {activeTab === "partner"
      //               ? "No partner links added yet."
      //               : "No monetization links added yet."}
      //           </p>
      //         )}

      //         {/* Pagination Controls */}
      //         {totalPages > 1 && (
      //           <div className="flex justify-between items-center mt-4">
      //             <Button
      //               variant="outline"
      //               onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
      //               disabled={page === 1}
      //               className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
      //             >
      //               <ArrowLeft className="w-4 h-4 mr-2" />
      //               Previous
      //             </Button>
      //             <span className="text-sm text-linka-night">
      //               Page {page} of {totalPages}
      //             </span>
      //             <Button
      //               variant="outline"
      //               onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
      //               disabled={page === totalPages}
      //               className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
      //             >
      //               Next
      //               <ArrowRight className="w-4 h-4 ml-2" />
      //             </Button>
      //           </div>
      //         )}

      //         <div className="bg-linka-alice-blue/30 rounded-lg p-3 border border-linka-alice-blue/50 mt-3 sm:mt-4">
      //           <div className="flex items-start gap-2">
      //             <InfoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-linka-carolina-blue mt-0.5 flex-shrink-0" />
      //             <div>
      //               <p className="text-xs font-medium text-linka-russian-violet mb-1">
      //                 Pro Tips:
      //               </p>
      //               <ul className="text-xs text-linka-night/60 space-y-1">
      //                 <li className="flex items-start gap-1.5">
      //                   <span>•</span>
      //                   <span>Test all links before sharing</span>
      //                 </li>
      //                 <li className="flex items-start gap-1.5">
      //                   <span>•</span>
      //                   <span>
      //                     Ensure affiliate links are valid and trackable
      //                   </span>
      //                 </li>
      //                 <li className="flex items-start gap-1.5">
      //                   <span>•</span>
      //                   <span>
      //                     Provide detailed product reviews to enhance user trust
      //                   </span>
      //                 </li>
      //                 <li className="flex items-start gap-1.5">
      //                   <span>•</span>
      //                   <span>
      //                     Upload high-quality images to enhance visual appeal
      //                   </span>
      //                 </li>
      //               </ul>
      //             </div>
      //           </div>
      //         </div>
      //       </CardContent>
      //     </Card>
      //   );

      case 4:
        return (
          <Card className="border-none shadow-lg rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl mx-2 sm:mx-0">
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
                  onClick={() => setActiveTab("partner")}
                  className={`text-xs sm:text-sm ${activeTab === "partner"
                      ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
                      : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                    } transition-all duration-300 hover:scale-105`}
                >
                  Linka Basic
                </Button>
                <Button
                  variant={activeTab === "aipro" ? "default" : "outline"}
                  onClick={() => setActiveTab("aipro")}
                  className={`text-xs sm:text-sm ${activeTab === "aipro"
                      ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
                      : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                    } transition-all duration-300 hover:scale-105`}
                >
                  Linka Pro
                </Button>
                <Button
                  variant={activeTab === "paywall" ? "default" : "outline"}
                  onClick={() => setActiveTab("paywall")}
                  className={`text-xs sm:text-sm ${activeTab === "paywall"
                      ? "bg-linka-dark-orange hover:bg-linka-dark-orange/90 text-white"
                      : "border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10"
                    } transition-all duration-300 hover:scale-105`}
                >
                  Linka Paywall Upgrade
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-grow min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-linka-russian-violet flex items-center gap-2">
                      <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-linka-carolina-blue" />
                      {activeTab === "aipro" ? "AI Smart Recommendations" : "Linka Basic"}
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsMonetizationModalOpen(true)}
                    className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue/10 hover:text-linka-carolina-blue transition-all duration-300 hover:scale-[1.02] whitespace-nowrap flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {activeTab === "aipro"
                      ? agentConfig.linkaProMonetizations?.length > 0
                        ? "Add Link"
                        : "Add First Link"
                      : agentConfig.partnerLinks?.length > 0
                        ? "Add Link"
                        : "Add First Link"}
                  </Button>
                </div>
                <p className="text-xs text-linka-night/60 mt-1">
                  {activeTab === "aipro"
                    ? "Add monetization links for AI Pro services"
                    : "Personalized Recommendations. 24/7 Earnings"}
                </p>
                {activeTab === "aipro" && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                    <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
                      <input
                        type="radio"
                        name="monetizationOption"
                        value="productExpansion"
                        className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
                        checked={selectedMonetizationOption === "productExpansion"}
                        onChange={() => setSelectedMonetizationOption("productExpansion")}
                      />
                      Product Expansion
                    </label>
                    <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
                      <input
                        type="radio"
                        name="monetizationOption"
                        value="blogMonetization"
                        className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
                        checked={selectedMonetizationOption === "blogMonetization"}
                        onChange={() => setSelectedMonetizationOption("blogMonetization")}
                      />
                      Blog Monetization
                    </label>
                    <label className="flex items-center gap-1 text-xs sm:text-sm text-linka-night/80">
                      <input
                        type="radio"
                        name="monetizationOption"
                        value="websiteMonetization"
                        className="accent-linka-carolina-blue w-3 h-3 sm:w-4 sm:h-4"
                        checked={selectedMonetizationOption === "websiteMonetization"}
                        onChange={() => setSelectedMonetizationOption("websiteMonetization")}
                      />
                      Website Monetization
                    </label>
                  </div>
                )}
              </div>
              {isLoading ? (
                <p className="text-sm text-linka-night/60 text-center">Loading links...</p>
              ) : activeTab === "partner" && agentConfig.partnerLinks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left text-linka-night/80">
                    <thead className="text-xs text-linka-russian-violet uppercase bg-linka-alice-blue/30">
                      <tr>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Link Name
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          URL
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentConfig.partnerLinks.map((link, index) => (
                        <tr
                          key={link.id || index} // Use link.id if available, fallback to index
                          className="bg-white border-b hover:bg-linka-alice-blue/10"
                        >
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            {link.affiliateBrandName || link.category || "Unnamed Link"}
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            <a
                              href={link.affiliateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-linka-carolina-blue hover:underline break-all"
                            >
                              {link.affiliateLink || "No URL"}
                            </a>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${link.status === "Hold"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {link.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLink(index, "partner")}
                              className="text-linka-carolina-blue hover:text-linka-dark-orange text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLink(index, "partner")}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === "aipro" && agentConfig.linkaProMonetizations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left text-linka-night/80">
                    <thead className="text-xs text-linka-russian-violet uppercase bg-linka-alice-blue/30">
                      <tr>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Link Name
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          URL
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentConfig.linkaProMonetizations.map((link, index) => (
                        <tr
                          key={link.id || index}
                          className="bg-white border-b hover:bg-linka-alice-blue/10"
                        >
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            {link.name || link.affiliateBrandName || link.category || "Unnamed Link"}
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            <a
                              href={link.url || link.mainUrl || link.blogUrl || link.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-linka-carolina-blue hover:underline break-all"
                            >
                              {link.url || link.mainUrl || link.blogUrl || link.websiteUrl || "No URL"}
                            </a>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${link.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {link.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLink(index, "aipro")}
                              className="text-linka-carolina-blue hover:text-linka-dark-orange text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLink(index, "aipro")}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-linka-night/60 text-center">
                  {activeTab === "partner"
                    ? "No partner links added yet."
                    : "No monetization links added yet."}
                </p>
              )}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
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
              <div className="bg-linka-alice-blue/30 rounded-lg p-3 border border-linka-alice-blue/50 mt-3 sm:mt-4">
                <div className="flex items-start gap-2">
                  <InfoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-linka-carolina-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-linka-russian-violet mb-1">
                      Pro Tips:
                    </p>
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
        );

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
                      These buttons will appear when users first interact with
                      your AI
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
                          placeholder={
                            [
                              "Help me plan my itinerary",
                              "Find local recommendations",
                              "Show me the best deals",
                              "Tell me about activities",
                            ][index]
                          }
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
                        Create your first branching conversation to guide users
                        through different paths
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
                                        This will permanently delete "
                                        {prompt.mainPrompt || "this flow"}" and
                                        all its branches.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-linka-alice-blue hover:bg-linka-alice-blue">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteConditionalPrompt(prompt.id)
                                        }
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
                                  {prompt.option1.followUps.map(
                                    (followUp, index) => (
                                      <div
                                        key={index}
                                        className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
                                      >
                                        {followUp ||
                                          `Follow-up question ${index + 1}`}
                                      </div>
                                    )
                                  )}
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
                                  {prompt.option2.followUps.map(
                                    (followUp, index) => (
                                      <div
                                        key={index}
                                        className="bg-linka-alice-blue/50 rounded-lg p-3 text-sm text-linka-night border border-linka-alice-blue hover:bg-white transition-all duration-200"
                                      >
                                        {followUp ||
                                          `Follow-up question ${index + 1}`}
                                      </div>
                                    )
                                  )}
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
      case 5:
        return (
          <div className="space-y-6">
            <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white border border-gray-200">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-2xl font-semibold text-linka-russian-violet">
                  Live Preview
                </CardTitle>
                <p className="text-sm text-linka-night/70">
                  This is exactly what your users will see
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 h-[90vh] flex flex-col w-[full] lg:w-[50%] mx-auto">
                  <div className="flex justify-center mb-6 w-full">
                    <div className="w-52 h-52 sm:w-72 sm:h-72 rounded-full overflow-hidden bg-gradient-to-br from-linka-dark-orange to-linka-carolina-blue flex items-center justify-center shadow-md">
                      {agentConfig.greetingMedia ? (
                        <video
                          src={agentConfig.greetingMedia}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover rounded-full"
                          onError={() =>
                            toast.error(
                              "Error loading video in preview. Please ensure the file is a valid MP4, WebM, or OGG."
                            )
                          }
                        />
                      ) : agentConfig.greetingMedia ? (
                        <img
                          src={agentConfig.greetingMedia}
                          alt="Greeting Media"
                          className="w-full h-full object-cover"
                          onError={() =>
                            toast.error(
                              "Error loading greeting image in preview."
                            )
                          }
                        />
                      ) : (
                        <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="text-center mb-6 sm:mb-8">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {agentConfig.greetingTitle || "Your Agent"}
                    </h4>
                    <p className="text-lg sm:text-xl font-normal text-gray-700">
                      {agentConfig.greeting ||
                        "Ready to assist you with your needs!"}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-1 sm:px-4">
                    <div className="space-y-4">
                      <div>
                        {/* <h5 className="text-sm font-semibold text-linka-russian-violet mb-2">
                          Conversation Starters
                        </h5> */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          {(agentConfig.useConditionalPrompts &&
                            agentConfig.conditionalPrompts.length > 0
                            ? agentConfig.conditionalPrompts
                              .slice(0, 2)
                              .map((cp) => cp.mainPrompt)
                            : agentConfig.prompts.filter(
                              (prompt) => prompt.trim() !== ""
                            )
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
                    <div className="flex bg-gray-200 rounded-md px-4 py-2 items-center gap-2">
                      <input
                        type="text "
                        placeholder="Type or ask me something..."
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none font-bold"
                        disabled
                      />

                      <button className=" text-black p-2 rounded-full flex items-center justify-center hover:bg-linka-dark-orange/90 transition-colors duration-200">
                        <Mic className="w-6 h-6" />

                      </button>
                      <button className="bg-black text-white p-2 rounded-full flex items-center justify-center hover:bg-linka-dark-orange/90 transition-colors duration-200">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">⚡️</span>
                    <h3 className="text-sm font-semibold text-blue-900">
                      Pro Tips
                    </h3>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-blue-800">
                    <li>Ask relevant questions to test your avatar.</li>
                    <li>
                      Preview images and videos may take a moment to load on
                      first launch.
                    </li>
                    <li>
                      Refine your agent’s persona and instructions based on
                      results.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };



  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://api.tagwell.co/api/v4/ai-agent/agent/progress",
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
          toast.success("Progress loaded successfully!");
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch progress: ${errorData.message || "Unknown error"}`
          );
          toast.error(
            `Failed to fetch progress: ${errorData.message || "Unknown error"}`
          );
        }
      } catch (err) {
        setError("An error occurred while fetching progress.");
        toast.error("An error occurred while fetching progress.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Add new link when modal opens
  useEffect(() => {
    if (
      isMonetizationModalOpen &&
      activeTab === "aipro" &&
      agentConfig.linkaProMonetizations.length === 0
    ) {
      addLinkaProMonetization();
    }
    if (
      isMonetizationModalOpen &&
      activeTab === "partner" &&
      agentConfig.partnerLinks.length === 0
    ) {
      addPartnerLink();
    }
  }, [
    isMonetizationModalOpen,
    activeTab,
    agentConfig.linkaProMonetizations.length,
    agentConfig.partnerLinks.length,
  ]);
  // For Preview action
  const handlePreviewLink = (index: any) => {
    console.log(`Preview link at index ${index}`, agentConfig.partnerLinks[index]);
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

  return (
    <DashboardLayout>
      <div className="mx-auto py-6 sm:py-4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-linka-russian-violet mb-4 sm:mb-0">
            Build Your AI Agent
          </h1>
          {/* <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div> */}
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
                      if (
                        progressData &&
                        progressData.completed_steps >= step.id - 1
                      ) {
                        setCurrentStep(step.id);
                      } else {
                        toast.error(
                          "Please complete the previous steps first."
                        );
                      }
                    }}
                  >
                    <div
                      className={`stepper-number w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white font-bold transition-all ${progressData && progressData.completed_steps >= step.id
                        ? "bg-orange-400"
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
        <Dialog
          open={isMonetizationModalOpen}
          onOpenChange={setIsMonetizationModalOpen}
        >
          <DialogContent className="max-w-full sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {activeTab === "partner"
                  ? "Primary Recs"
                  : "Product Monetization"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {activeTab === "partner" ? (
                <div>
                  {agentConfig.partnerLinks.length > 0 ? (
                    <div className="space-y-4">
                      {agentConfig.partnerLinks.map((link) => (
                        <Card
                          key={link.id}
                          className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 bg-white/90 rounded-lg shadow-md"
                        >
                          <CardContent className="p-4 space-y-4 relative">
                            {/* Row 1: Category & Affiliate Link */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`partner-category-${link.id}`}
                                  className="text-linka-russian-violet font-medium"
                                >
                                  Category <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`partner-category-${link.id}`}
                                  placeholder="e.g., Travel, Fashion"
                                  value={link.category}
                                  onChange={(e) =>
                                    updatePartnerLink(link.id!, "category", e.target.value)
                                  }
                                  className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`partner-link-${link.id}`}
                                  className="text-linka-russian-violet font-medium"
                                >
                                  Affiliate Link <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                  <Input
                                    id={`partner-link-${link.id}`}
                                    placeholder="https://affiliate-link.com"
                                    value={link.affiliateLink}
                                    onChange={(e) =>
                                      updatePartnerLink(link.id!, "affiliateLink", e.target.value)
                                    }
                                    className="pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                  />
                                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linka-dark-orange" />
                                </div>
                              </div>
                            </div>

                            {/* Combined Row 2 & 3: Additional Information */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-linka-russian-violet font-semibold text-lg">
                                  Additional Information
                                </h3>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button>
                                        <InfoIcon className="w-4 h-4 text-linka-russian-violet" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Optional: Provide your AI-Agent with more context</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`partner-social-${link.id}`}
                                    className="text-linka-russian-violet font-medium"
                                  >
                                    Social Media
                                  </Label>
                                  <Input
                                    id={`partner-social-${link.id}`}
                                    placeholder="https://social-media.com"
                                    value={link.socialMediaLink || ""}
                                    onChange={(e) =>
                                      updatePartnerLink(link.id!, "socialMediaLink", e.target.value)
                                    }
                                    className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`partner-review-${link.id}`}
                                    className="text-linka-russian-violet font-medium"
                                  >
                                    Product Review
                                  </Label>
                                  <Input
                                    id={`partner-review-${link.id}`}
                                    placeholder="e.g., Great product!"
                                    value={link.productReview || ""}
                                    onChange={(e) =>
                                      updatePartnerLink(link.id!, "productReview", e.target.value)
                                    }
                                    className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`partner-brand-${link.id}`}
                                    className="text-linka-russian-violet font-medium"
                                  >
                                    Brand Name
                                  </Label>
                                  <Input
                                    id={`partner-brand-${link.id}`}
                                    placeholder="e.g., TripAdvisor"
                                    value={link.affiliateBrandName}
                                    onChange={(e) =>
                                      updatePartnerLink(link.id!, "affiliateBrandName", e.target.value)
                                    }
                                    className="border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                  />
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

                    <Button
                      onClick={async () => {
                        const hasEmptyRequiredFields =
                          agentConfig.partnerLinks.some(
                            (link) =>
                              !link.category.trim() ||
                              !link.affiliateBrandName?.trim() ||
                              !link.affiliateLink.trim()
                          );
                        if (hasEmptyRequiredFields) {
                          toast.error(
                            "Please fill in all required fields (Category, Affiliate Brand Name, Affiliate Link)"
                          );
                          return;
                        }
                        // Prepare payload for the API
                        const payload = {
                          links: agentConfig.partnerLinks.map((link) => ({
                            link_type: "affiliate",
                            category_name: link.category,
                            "affiliate_url": "",
                            "main_url": link.affiliateLink || "Electronics",
                            "brand_name": link.affiliateBrandName || "",
                            "social_media_link": link.socialMediaLink || "",
                            "product_review": link.productReview || "",
                          })),
                        };

                        // Get access token
                        const accessToken = localStorage.getItem("accessToken");
                        if (!accessToken) {
                          toast.error("No access token found. Please log in.");
                          return;
                        }

                        try {
                          // Make API call to save partner links
                          const response = await fetch(
                            "https://api.tagwell.co/api/v4/ai-agent/add-links",
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                              },
                              body: JSON.stringify(payload),
                            }
                          );

                          if (response.ok) {
                            setIsMonetizationModalOpen(false);

                            toast.success("Partner links saved successfully!");
                          } else {
                            const errorData = await response.json();
                            toast.error(
                              `Failed to save partner links: ${errorData.message || "Unknown error"}`
                            );
                          }
                        } catch (error) {
                          console.error("Error saving partner links:", error);
                          toast.error("An error occurred while saving partner links. Please try again.");
                        }
                        setIsMonetizationModalOpen(false);
                        toast.success("Partner links saved successfully!");
                      }}
                      className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mx-2 sm:mx-0">
                  <form onSubmit={handleSubmit}>
                    {agentConfig.linkaProMonetizations.length > 0 ? (
                      <div className="space-y-4">
                        {agentConfig.linkaProMonetizations.map((link) => (
                          <Card
                            key={link.id}
                            className="border-2 border-linka-columbia-blue/50 hover:border-linka-carolina-blue/70 transition-all duration-300 bg-white/90 rounded-lg shadow-md"
                          >
                            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4 relative">
                              {selectedMonetizationOption ===
                                "productExpansion" && (
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                                    <div className="space-y-1 sm:space-y-2">
                                      <Label
                                        htmlFor={`pro-category-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id={`pro-category-${link.id}`}
                                        placeholder="e.g., Subscription, Service"
                                        value={link.category}
                                        onChange={(e) =>
                                          updateLinkaProMonetization(
                                            link.id,
                                            "category",
                                            e.target.value
                                          )
                                        }
                                        className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2">
                                      <Label
                                        htmlFor={`pro-brand-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Brand Affiliate Link{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id={`pro-brand-${link.id}`}
                                        placeholder="e.g., AI Pro"
                                        value={link.affiliateBrandName}
                                        onChange={(e) =>
                                          updateLinkaProMonetization(
                                            link.id,
                                            "affiliateBrandName",
                                            e.target.value
                                          )
                                        }
                                        className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2">
                                      <Label
                                        htmlFor={`pro-main-url-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category URL{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <div className="relative">
                                        <Input
                                          id={`pro-main-url-${link.id}`}
                                          placeholder="https://main-url.com"
                                          value={link.mainUrl}
                                          onChange={(e) =>
                                            updateLinkaProMonetization(
                                              link.id,
                                              "mainUrl",
                                              e.target.value
                                            )
                                          }
                                          className="text-xs sm:text-sm h-8 sm:h-9 pl-8 sm:pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                        />
                                        <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-linka-dark-orange" />
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {selectedMonetizationOption ===
                                "blogMonetization" && (
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                    <div className="space-y-1 sm:space-y-2">
                                      <Label
                                        htmlFor={`pro-category-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id={`pro-category-${link.id}`}
                                        placeholder="e.g., Technology, Lifestyle"
                                        value={link.category}
                                        onChange={(e) =>
                                          updateLinkaProMonetization(
                                            link.id,
                                            "category",
                                            e.target.value
                                          )
                                        }
                                        className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2">
                                      <Label
                                        htmlFor={`pro-blog-url-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Blog Post URL{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <div className="relative">
                                        <Input
                                          id={`pro-blog-url-${link.id}`}
                                          placeholder="https://blog-post-url.com"
                                          value={link.blogUrl}
                                          onChange={(e) =>
                                            updateLinkaProMonetization(
                                              link.id,
                                              "blogUrl",
                                              e.target.value
                                            )
                                          }
                                          className="text-xs sm:text-sm h-8 sm:h-9 pl-8 sm:pl-10 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                        />
                                        <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-linka-dark-orange" />
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {selectedMonetizationOption ===
                                "websiteMonetization" && (
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                    <div className="space-y-1 sm:space-y-2">
                                      <Label
                                        htmlFor={`pro-website-category-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Category{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id={`pro-website-category-${link.id}`}
                                        placeholder="e.g., E-commerce, Portfolio"
                                        value={link.category}
                                        onChange={(e) =>
                                          updateLinkaProMonetization(
                                            link.id,
                                            "category",
                                            e.target.value
                                          )
                                        }
                                        className="text-xs sm:text-sm h-8 sm:h-9 border-linka-alice-blue focus:border-linka-carolina-blue focus:ring-2 focus:ring-linka-carolina-blue/30 placeholder:text-linka-night/40"
                                      />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2">
                                      <Label
                                        htmlFor={`pro-website-url-${link.id}`}
                                        className="text-xs sm:text-sm text-linka-russian-violet font-medium"
                                      >
                                        Website URL{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <div className="relative">
                                        <Input
                                          id={`pro-website-url-${link.id}`}
                                          placeholder="https://your-website.com"
                                          value={link.websiteUrl}
                                          onChange={(e) =>
                                            updateLinkaProMonetization(
                                              link.id,
                                              "websiteUrl",
                                              e.target.value
                                            )
                                          }
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
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-3 sm:mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsMonetizationModalOpen(false)}
                        className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        Cancel
                      </Button>

                      <Button
                        onClick={addLinkaProMonetization}
                        className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Add New Link
                      </Button>

                      <Button
                        onClick={saveMonetization}
                        type="submit"
                        className="bg-linka-carolina-blue hover:bg-linka-carolina-blue/80 transition-transform hover:scale-105 text-white text-xs sm:text-sm h-8 sm:h-9"
                      >
                        Submit All
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );


}