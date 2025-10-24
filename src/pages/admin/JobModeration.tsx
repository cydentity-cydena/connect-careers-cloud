import { JobModeration as JobModerationComponent } from "@/components/admin/JobModeration";
import Navigation from "@/components/Navigation";

export default function JobModeration() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Job Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate job postings on the platform
          </p>
        </div>
        <JobModerationComponent />
      </div>
    </>
  );
}
