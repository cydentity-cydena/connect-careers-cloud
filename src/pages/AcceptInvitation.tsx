import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Loader2, CheckCircle, XCircle } from "lucide-react";
import SEO from "@/components/SEO";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");
  const token = searchParams.get('token');

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && token) {
        // Redirect to auth with return URL
        navigate(`/auth?redirect=/accept-invitation?token=${token}`);
      }
    };
    checkAuth();
  }, [token, navigate]);

  const handleAccept = async () => {
    if (!token) {
      setStatus('error');
      setMessage("Invalid invitation link");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please log in to accept the invitation");
      }

      const { data, error } = await supabase.functions.invoke('accept-team-invitation', {
        body: { invitation_token: token }
      });

      if (error) throw error;

      if (data.error) {
        setStatus('error');
        setMessage(data.error);
        toast({
          title: "Failed to accept invitation",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setStatus('success');
      setMessage(data.message || "Successfully joined the team!");
      toast({
        title: "Welcome to the team!",
        description: data.message || "You've successfully joined the team",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setStatus('error');
      setMessage(error.message || "Failed to accept invitation");
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SEO 
          title="Invalid Invitation - TrecCert"
          description="The invitation link is invalid or expired"
        />
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SEO 
        title="Accept Team Invitation - TrecCert"
        description="Join your team on TrecCert"
      />
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Team Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to accept the invitation and join your team.
              </p>
              <Button 
                onClick={handleAccept} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-sm font-medium text-green-600">
                {message}
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <XCircle className="h-12 w-12 text-destructive mx-auto" />
                <p className="text-sm font-medium text-destructive">
                  {message}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
