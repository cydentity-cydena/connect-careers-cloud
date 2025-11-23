import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail } from "lucide-react";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  firstName: z.string().trim().max(100, { message: "First name must be less than 100 characters" }).optional(),
  lastName: z.string().trim().max(100, { message: "Last name must be less than 100 characters" }).optional(),
});

interface MailchimpSignupProps {
  userType: 'candidate' | 'employer' | 'recruiter';
  title?: string;
  description?: string;
}

export const MailchimpSignup = ({ userType, title, description }: MailchimpSignupProps) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = emailSchema.safeParse({ email, firstName, lastName });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-subscribe', {
        body: {
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          userType,
        },
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Success!",
        description: data.message || "You've been added to our mailing list.",
      });

      // Clear form
      setEmail("");
      setFirstName("");
      setLastName("");
    } catch (error: any) {
      console.error('Subscription error:', error);
      const errorMessage = error?.message || "Unable to subscribe at this time. Please try again later.";
      toast({
        title: "Subscription Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-[hsl(189,97%,55%)]/10 border-2 border-[hsl(189,97%,55%)] rounded-lg p-6 text-center print:hidden">
        <Mail className="w-12 h-12 text-[hsl(189,97%,55%)] mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-700">Check your email for updates from Cydena.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[hsl(189,97%,55%)]/10 to-[hsl(189,97%,55%)]/5 border-2 border-[hsl(189,97%,55%)] rounded-lg p-6 print:hidden">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title || "Stay Updated"}
      </h3>
      <p className="text-gray-700 mb-4 text-sm">
        {description || "Get the latest updates and insights delivered to your inbox."}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={100}
            className="border-gray-300"
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={100}
            className="border-gray-300"
          />
        </div>
        
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
          className="border-gray-300"
        />
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[hsl(189,97%,55%)] hover:bg-[hsl(189,97%,45%)] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
};
