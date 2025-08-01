"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react"; // Assuming you're using lucide-react for icons

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
linkData: LinkData | null;
}

interface LinkData {
  id: number;
  brand?: string;
  image?: string;
  favicon?: string;
  title?: string;
  description?: string;
  affiliateLink?: string;
  socialMediaLink?: string;
  status?: number;
  proceesing?: string;
}

export default function PreviewModal({ isOpen, onClose, linkData }: PreviewModalProps) {
  const [link, setLink] = useState<LinkData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [socialMediaPost, setSocialMediaPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch link details from API
  useEffect(() => {
    if (!isOpen || !linkData) return;

    const fetchLinkDetails = async () => {
      setIsLoading(true);
      setError(null);

      const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("No access token found. Please log in.");
          setIsLoading(false);
          return;
        }

      try {
        const response = await fetch(`https://api.tagwell.co/api/v4/ai-agent/get-agent-link/details?id=${linkData.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(data.data.title);
        setLink(data.data);
        setTitle(data.data.title || "");
        setDescription(data.data.description || "");
        setAffiliateLink(data.data.affiliateLink || "");
        setSocialMediaPost(data.data.socialMediaLink || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch link details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkDetails();
  }, [isOpen, linkData?.id]);

  const handleRefresh = async () => {
    if (!linkData?.id) return;
    setIsLoading(true);
    setError(null);

    const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        setIsLoading(false);
        return;
      }

    try {
      const response = await fetch(`https://api.tagwell.co/api/v4/ai-agent/get-agent-link/details?id=${linkData.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: LinkData = await response.json();
      console.log(data);
      setLink(data);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setAffiliateLink(data.affiliateLink || "");
      setSocialMediaPost(data.socialMediaLink || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh link details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!linkData?.id) return;
    setIsLoading(true);
    setError(null);

    const updatedData = {
      title,
      description,
      affiliateLink,
      socialMediaLink: socialMediaPost,
    };

        const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        setIsLoading(false);
        return;
      }

    try {
      // Placeholder: Replace with actual update API endpoint (e.g., PUT or PATCH)
      const updateUrl = `https://api.tagwell.co/api/v4/ai-agent/update-agent-link?id=${linkData.id}`;
      const response = await fetch(updateUrl, {
        method: "PUT", // or "PATCH" depending on API
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }

      console.log("Update successful:", updatedData);
      onClose(); // Close modal after successful update
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLink(null);
    setTitle("");
    setDescription("");
    setAffiliateLink("");
    setSocialMediaPost("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-linka-dark-orange" />
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}
        {!isLoading && !error && link && (
          <>
            <div className="relative w-full h-64 rounded-md mb-1">
              {link.image ? (
                <img src={link.image} alt={link.title || "Product Preview"} className="w-full h-64 object-cover rounded-md" />
              ) : (
                <img
                  src="https://via.placeholder.com/300x400?text=Scenic+Document+Icon"
                  alt="Image not available"
                  className="w-full h-64 object-cover rounded-md"
                />
              )}
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="absolute top-2 right-2 w-8 h-8 p-0 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
                disabled={isLoading}
              >
                ↻
              </Button>
            </div>
            <div className="flex items-center space-x-4 mb-1">
              {link.brand && <h2 className="text-xl font-semibold text-gray-900">{link.brand}</h2>}
              {link.favicon ? (
                <img src={link.favicon} alt={`${link.brand} Logo`} className="w-12 h-12 object-contain" />
              ) : (
                <img src="https://via.placeholder.com/10x10?text=Scenic+Document+Icon" className="w-full h-12 object-contain" />
              )}
            </div>
            <div className="mb-1">
              <label htmlFor="title" className="text-sm text-gray-600 font-semibold">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none rounded-none"
                disabled={isLoading}
              />
            </div>
            <div className="mb-1">
              <label htmlFor="description" className="text-sm text-gray-600 font-semibold">
                Description/Review
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-none rounded-none"
                disabled={isLoading}
              />
            </div>
            <div className="mb-1">
              <label htmlFor="affiliateLink" className="text-sm text-gray-600 font-semibold">
                Affiliate Link
              </label>
              <Input
                id="affiliateLink"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="border-none rounded-none"
                disabled={isLoading}
              />
            </div>
            <div className="mb-1">
              <label htmlFor="socialMediaPost" className="text-sm text-gray-600 font-semibold">
                Social Media Review
              </label>
              <Textarea
                id="socialMediaPost"
                value={socialMediaPost}
                onChange={(e) => setSocialMediaPost(e.target.value)}
                className="border-none rounded-none"
                disabled={isLoading}
              />
            </div>
            <div className="mt-1 flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
                disabled={isLoading}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}