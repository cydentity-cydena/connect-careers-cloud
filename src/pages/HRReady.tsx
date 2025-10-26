import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VerificationPanel } from "@/components/hrready/VerificationPanel";

const HRReady = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<any | null>(null);

  // Upload form state
  const [idFiles, setIdFiles] = useState<FileList | null>(null);
  const [idNotes, setIdNotes] = useState("");
  const [rtwFiles, setRtwFiles] = useState<FileList | null>(null);
  const [rtwNotes, setRtwNotes] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Load current verification snapshot
      try {
        const { data, error } = await supabase.functions.invoke(`hrready-get/${session.user.id}`);
        if (error) throw error;
        setVerification(data?.verification || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const uploadFiles = async (files: FileList, folder: string) => {
    if (!userId) throw new Error("Not authenticated");
    const paths: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("verification-documents")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      paths.push(path);
    }
    return paths;
  };

  const submitRequest = async (type: "identity" | "rtw", files: FileList | null, notes: string) => {
    if (!userId) return;
    if (!files || files.length === 0) {
      toast({ title: "Please attach document(s)", variant: "destructive" });
      return;
    }
    try {
      const paths = await uploadFiles(files, type);
      const { error } = await supabase
        .from("verification_requests")
        .insert({
          candidate_id: userId,
          verification_type: type,
          status: "pending",
          document_urls: paths,
          notes: notes || null,
        });
      if (error) throw error;
      toast({ title: `${type.toUpperCase()} submitted`, description: "We'll review shortly." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <SEO title="HR-Ready Verification | Cydena" description="Submit identity and right-to-work to become HR-Ready." />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">HR-Ready Verification</h1>
          <p className="text-muted-foreground">Prove identity and right to work to apply for jobs faster and earn badges on your profile.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section>
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-2">Your Current Status</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <VerificationPanel verification={verification} onEdit={() => {}} />
              )}
            </Card>
          </section>

          <section className="space-y-6">
            <Card className="p-4 space-y-3">
              <h3 className="font-medium">Submit Identity</h3>
              <Label>Document(s)</Label>
              <Input type="file" multiple onChange={(e) => setIdFiles(e.target.files)} />
              <Label>Notes (optional)</Label>
              <Textarea rows={3} value={idNotes} onChange={(e) => setIdNotes(e.target.value)} placeholder="Passport, driving licence, etc." />
              <Button onClick={() => submitRequest("identity", idFiles, idNotes)}>Submit Identity</Button>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-medium">Submit Right to Work</h3>
              <Label>Document(s)</Label>
              <Input type="file" multiple onChange={(e) => setRtwFiles(e.target.files)} />
              <Label>Notes (optional)</Label>
              <Textarea rows={3} value={rtwNotes} onChange={(e) => setRtwNotes(e.target.value)} placeholder="Visa type, country, permit details" />
              <Button onClick={() => submitRequest("rtw", rtwFiles, rtwNotes)}>Submit RTW</Button>
            </Card>
          </section>
        </div>

        <Separator className="my-8" />
        <div className="text-sm text-muted-foreground">
          Files are stored securely. Our team validates submissions promptly. Once approved, your profile shows HR-Ready badges and you can apply to jobs.
        </div>
      </main>
    </div>
  );
};

export default HRReady;
