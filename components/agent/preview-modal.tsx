"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: {
    brandName?: string;
    imageUrl?: string;
    logoUrl?: string;
    title?: string;
    description?: string;
    affiliateLink?: string;
    socialMediaLink?: string;
    status?: number;
    proceesing?: string;
  } | null;
}

export default function PreviewModal({ isOpen, onClose, link }: PreviewModalProps) {
  if (!link) return null;

  const [title, setTitle] = useState(link.title || "");
  const [description, setDescription] = useState(link.description || "");
  const [affiliateLink, setAffiliateLink] = useState(link.affiliateLink || "");
  const [socialMediaPost, setSocialMediaPost] = useState(link.socialMediaLink || "");

  const handleRefresh = () => {
    console.log("Refresh button clicked");
  };

  const handleUpdate = () => {
    console.log("Update button clicked with:", { title, description, affiliateLink, socialMediaPost });
  };

  const handleClose = () => {
    // Explicitly call onClose to update parent state
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* <DialogHeader> Preview And Edit </DialogHeader> */}
      <DialogContent className="max-w-md p-6 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]" >
        <div className="relative w-full h-64 rounded-md mb-1">
          {link.imageUrl ? (
            <img src={link.imageUrl} alt={link.title || "Product Preview"} className="w-full h-64 object-cover rounded-md" />
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
          >
            ↻
          </Button>
        </div>
        <div className="flex items-center space-x-4 mb-1">
          {link.brandName && <h2 className="text-xl font-semibold text-gray-900">{link.brandName}</h2>}
          {link.logoUrl ? (
            <img src={link.logoUrl} alt={`${link.brandName} Logo`} className="w-12 h-12 object-contain" />
          ) : (
            <img src="https://via.placeholder.com/10x10?text=Scenic+Document+Icon" className="w-full h-12 object-contain" />
          )}
        </div>
        {/* Title input field */}
        <div className="mb-1">
          <label htmlFor="title" className="text-sm text-gray-600 font-semibold">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none rounded-none"
          />
        </div>
        {/* Description/Review textarea field */}
        <div className="mb-1">
          <label htmlFor="description" className="text-sm text-gray-600 font-semibold">
            Description/Review
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-none rounded-none"
          />
        </div>
        {/* Affiliate Link input field */}
        <div className="mb-1">
          <label htmlFor="affiliateLink" className="text-sm text-gray-600 font-semibold">
            Affiliate Link
          </label>
          <Input
            id="affiliateLink"
            value={affiliateLink}
            onChange={(e) => setAffiliateLink(e.target.value)}
            className="border-none rounded-none"
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
          />
        </div>
        <div className="mt-1 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-linka-carolina-blue text-linka-carolina-blue hover:bg-linka-carolina-blue hover:text-white transition-transform hover:scale-105"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className="bg-linka-dark-orange hover:bg-linka-dark-orange/80 transition-transform hover:scale-105"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}