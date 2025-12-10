import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Briefcase, Building2, Shield, X } from "lucide-react";
import { toast } from "sonner";

type SimulatedRole = "candidate" | "employer" | "recruiter" | null;

interface RoleSimulatorProps {
  onRoleChange: (role: SimulatedRole) => void;
  currentSimulatedRole: SimulatedRole;
}

const STORAGE_KEY = "cydena_simulated_role";

export const useRoleSimulator = () => {
  const [simulatedRole, setSimulatedRole] = useState<SimulatedRole>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored as SimulatedRole;
  });

  const setRole = (role: SimulatedRole) => {
    if (role) {
      localStorage.setItem(STORAGE_KEY, role);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSimulatedRole(role);
  };

  const clearSimulation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSimulatedRole(null);
  };

  return { simulatedRole, setRole, clearSimulation };
};

export const RoleSimulator = ({ onRoleChange, currentSimulatedRole }: RoleSimulatorProps) => {
  const [selectedRole, setSelectedRole] = useState<string>(currentSimulatedRole || "none");

  const handleApply = () => {
    const role = selectedRole === "none" ? null : selectedRole as SimulatedRole;
    onRoleChange(role);
    if (role) {
      toast.success(`Now viewing as ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    } else {
      toast.success("Returned to Admin view");
    }
  };

  const roleDetails = {
    candidate: {
      icon: UserCheck,
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      features: ["Profile management", "Job applications", "HR-Ready verification", "Skills assessments"]
    },
    employer: {
      icon: Building2,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      features: ["Job postings", "Candidate pipeline", "Team management", "Analytics dashboard"]
    },
    recruiter: {
      icon: Briefcase,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      features: ["Client management", "Candidate sourcing", "Placements tracking", "Commission reports"]
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Role Simulator
        </CardTitle>
        <CardDescription>
          Test different user experiences without switching accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSimulatedRole && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Shield className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-500 font-medium">
              Currently simulating: {currentSimulatedRole.charAt(0).toUpperCase() + currentSimulatedRole.slice(1)}
            </span>
            <Badge variant="outline" className="ml-auto bg-amber-500 text-amber-950">
              SIMULATED
            </Badge>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {(Object.keys(roleDetails) as Array<keyof typeof roleDetails>).map((role) => {
            const { icon: Icon, color, features } = roleDetails[role];
            const isSelected = selectedRole === role;
            
            return (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold capitalize">{role}</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="text-primary">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select role to simulate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Override (Admin)</SelectItem>
              <SelectItem value="candidate">Candidate</SelectItem>
              <SelectItem value="employer">Employer</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleApply} className="gap-2">
            Apply
          </Button>

          {currentSimulatedRole && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedRole("none");
                onRoleChange(null);
                toast.success("Returned to Admin view");
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Exit Simulation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SimulationBanner = ({ 
  role, 
  onExit 
}: { 
  role: SimulatedRole; 
  onExit: () => void;
}) => {
  if (!role) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium">
            Admin Simulation Mode: Viewing as {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </div>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={onExit}
          className="gap-1 bg-amber-950 text-amber-500 hover:bg-amber-900"
        >
          <X className="h-3 w-3" />
          Exit
        </Button>
      </div>
    </div>
  );
};
