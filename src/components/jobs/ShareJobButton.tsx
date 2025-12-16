import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Linkedin, Twitter, Facebook, Link, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareJobButtonProps {
  jobId: string;
  jobTitle: string;
  companyName?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ShareJobButton = ({ 
  jobId, 
  jobTitle, 
  companyName,
  variant = "outline",
  size = "sm"
}: ShareJobButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  const jobUrl = `${window.location.origin}/jobs/${jobId}`;
  const shareText = companyName 
    ? `Check out this ${jobTitle} position at ${companyName} on Cydena!`
    : `Check out this ${jobTitle} position on Cydena!`;

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=600');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareOnLinkedIn} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-[#0A66C2]" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Link className="h-4 w-4 mr-2" />
          )}
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
