import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck } from "lucide-react";

const statusColors: Record<string, string> = {
  green: 'bg-green-500/20 text-green-700 dark:text-green-400',
  amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  red: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

const mockCertifications = [
  {
    name: "CompTIA Security+",
    issuer: "CompTIA",
    status: "green",
    source: "manual"
  },
  {
    name: "Certified Ethical Hacker (CEH)",
    issuer: "EC-Council",
    status: "green",
    source: "manual"
  },
  {
    name: "CISSP",
    issuer: "ISC2",
    status: "green",
    source: "manual"
  },
  {
    name: "AWS Certified Security - Specialty",
    issuer: "Amazon Web Services",
    status: "green",
    source: "manual"
  }
];

export function CertificationsExample() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <FileCheck className="h-5 w-5 mt-1 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">Certifications</h4>
            <Badge variant="secondary">4/4</Badge>
          </div>
          <div className="space-y-2">
            {mockCertifications.map((cert, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[cert.status]} variant="outline">
                    ✓ {cert.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
                  <span>by {cert.issuer}</span>
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    📄 Manual
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
