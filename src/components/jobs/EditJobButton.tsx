import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";

interface EditJobButtonProps {
  jobId: string;
  createdBy: string;
  variant?: "default" | "ghost" | "outline";
}

export const EditJobButton = ({ jobId, createdBy, variant = "outline" }: EditJobButtonProps) => {
  const navigate = useNavigate();
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEditPermission();
  }, [createdBy]);

  const checkEditPermission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCanEdit(false);
        return;
      }

      // Check if user is the job creator
      if (user.id === createdBy) {
        setCanEdit(true);
        return;
      }

      // Check if user is an admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setCanEdit(!!roles);
    } catch (error) {
      console.error("Error checking edit permission:", error);
      setCanEdit(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !canEdit) return null;

  return (
    <Button
      variant={variant}
      onClick={() => navigate(`/jobs/create?edit=${jobId}`)}
    >
      <Pencil className="h-4 w-4 mr-2" />
      Edit Job
    </Button>
  );
};
