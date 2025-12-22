import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const ROICalculator = () => {
  const [hires, setHires] = useState(3);
  const [avgSalary, setAvgSalary] = useState(60000);
  const [agencyFee, setAgencyFee] = useState(20);

  const agencyCost = hires * avgSalary * (agencyFee / 100);
  const cydenaCost = 249 * 12; // Team plan annual
  const savings = agencyCost - cydenaCost;
  const savingsPercent = ((savings / agencyCost) * 100).toFixed(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>ROI Calculator</CardTitle>
        <CardDescription>
          See how much you could save with direct access to verified talent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Number of hires per year: {hires}</Label>
            <Slider
              value={[hires]}
              onValueChange={(value) => setHires(value[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Average salary per hire</Label>
            <Input
              id="salary"
              type="number"
              value={avgSalary}
              onChange={(e) => setAvgSalary(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Agency fee percentage: {agencyFee}%</Label>
            <Slider
              value={[agencyFee]}
              onValueChange={(value) => setAgencyFee(value[0])}
              min={15}
              max={25}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Agency Cost (per hire)</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(avgSalary * (agencyFee / 100))}</p>
            <p className="text-xs text-muted-foreground">{agencyFee}% of salary</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cydena (Flat Fee)</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(cydenaCost)}</p>
            <p className="text-xs text-muted-foreground">Unlimited hires/year</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Your Savings</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(savings)}</p>
            <p className="text-xs text-muted-foreground">Save {savingsPercent}%</p>
          </div>
        </div>
        <div className="pt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-center font-semibold text-primary">
            💡 Just 1 hire saves you {formatCurrency((avgSalary * (agencyFee / 100)) - cydenaCost)} vs agency fees
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
