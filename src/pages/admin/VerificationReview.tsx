import { CandidateVerificationReview } from "@/components/admin/CandidateVerificationReview";
import { CertificationVerificationReview } from "@/components/admin/CertificationVerificationReview";
import { VerificationReviewPanel } from "@/components/admin/VerificationReviewPanel";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VerificationReview() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Verification Review</h1>
          <p className="text-muted-foreground">
            Review and verify candidate and business submissions
          </p>
        </div>
        
        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Business Verifications</TabsTrigger>
            <TabsTrigger value="documents">Identity & RTW Documents</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="businesses">
            <VerificationReviewPanel />
          </TabsContent>
          
          <TabsContent value="documents">
            <CandidateVerificationReview />
          </TabsContent>
          
          <TabsContent value="certifications">
            <CertificationVerificationReview />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
