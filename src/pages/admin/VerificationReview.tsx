import { CandidateVerificationReview } from "@/components/admin/CandidateVerificationReview";
import Navigation from "@/components/Navigation";

export default function VerificationReview() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Verification Review</h1>
          <p className="text-muted-foreground">
            Review and verify candidate identity documents and right to work submissions
          </p>
        </div>
        <CandidateVerificationReview />
      </div>
    </>
  );
}
