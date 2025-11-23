import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, X, Bookmark } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SavedSearchesDialog } from "./SavedSearchesDialog";

export interface FilterCriteria {
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  minExperience: number;
  maxExperience: number;
  hrReadyOnly: boolean;
  certifications: string[];
  clearance: string[];
  location: string;
  remoteOk: boolean;
  pciQsaOnly: boolean;
  highValueCertsOnly: boolean;
  specializations: string[];
}

interface SmartCandidateFiltersProps {
  onFilterChange: (filters: FilterCriteria) => void;
  currentFilters: FilterCriteria;
}

export const SmartCandidateFilters = ({
  onFilterChange,
  currentFilters,
}: SmartCandidateFiltersProps) => {
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);
  const [mustHaveInput, setMustHaveInput] = useState("");
  const [niceToHaveInput, setNiceToHaveInput] = useState("");
  const [certInput, setCertInput] = useState("");

  const handleAddSkill = (type: "must" | "nice") => {
    const input = type === "must" ? mustHaveInput : niceToHaveInput;
    if (!input.trim()) return;

    const newFilters = { ...currentFilters };
    if (type === "must") {
      newFilters.mustHaveSkills = [...newFilters.mustHaveSkills, input.trim()];
      setMustHaveInput("");
    } else {
      newFilters.niceToHaveSkills = [...newFilters.niceToHaveSkills, input.trim()];
      setNiceToHaveInput("");
    }
    onFilterChange(newFilters);
  };

  const handleRemoveSkill = (type: "must" | "nice", skill: string) => {
    const newFilters = { ...currentFilters };
    if (type === "must") {
      newFilters.mustHaveSkills = newFilters.mustHaveSkills.filter((s) => s !== skill);
    } else {
      newFilters.niceToHaveSkills = newFilters.niceToHaveSkills.filter((s) => s !== skill);
    }
    onFilterChange(newFilters);
  };

  const handleAddCert = () => {
    if (!certInput.trim()) return;
    const newFilters = { ...currentFilters };
    newFilters.certifications = [...newFilters.certifications, certInput.trim()];
    setCertInput("");
    onFilterChange(newFilters);
  };

  const handleRemoveCert = (cert: string) => {
    const newFilters = { ...currentFilters };
    newFilters.certifications = newFilters.certifications.filter((c) => c !== cert);
    onFilterChange(newFilters);
  };

  const handleExperienceChange = (value: number[]) => {
    onFilterChange({
      ...currentFilters,
      minExperience: value[0],
      maxExperience: value[1],
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      mustHaveSkills: [],
      niceToHaveSkills: [],
      minExperience: 0,
      maxExperience: 20,
      hrReadyOnly: false,
      certifications: [],
      clearance: [],
      location: "",
      remoteOk: false,
      pciQsaOnly: false,
      highValueCertsOnly: false,
      specializations: [],
    });
  };

  const hasActiveFilters =
    currentFilters.mustHaveSkills.length > 0 ||
    currentFilters.niceToHaveSkills.length > 0 ||
    currentFilters.hrReadyOnly ||
    currentFilters.certifications.length > 0 ||
    currentFilters.location ||
    currentFilters.minExperience > 0 ||
    currentFilters.maxExperience < 20;

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Smart Filters</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSavedSearchesOpen(true)}
                className="gap-2"
              >
                <Bookmark className="h-4 w-4" />
                Saved Searches
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Must-Have Skills */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-primary">
                Must-Have Skills
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Python, SIEM"
                  value={mustHaveInput}
                  onChange={(e) => setMustHaveInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill("must")}
                />
                <Button size="sm" onClick={() => handleAddSkill("must")}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentFilters.mustHaveSkills.map((skill) => (
                  <Badge key={skill} variant="default" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill("must", skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Nice-to-Have Skills */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Nice-to-Have Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Splunk, Tableau"
                  value={niceToHaveInput}
                  onChange={(e) => setNiceToHaveInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill("nice")}
                />
                <Button size="sm" onClick={() => handleAddSkill("nice")}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentFilters.niceToHaveSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill("nice", skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Experience Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Years of Experience: {currentFilters.minExperience}-{currentFilters.maxExperience}+
            </Label>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[currentFilters.minExperience, currentFilters.maxExperience]}
              onValueChange={handleExperienceChange}
              className="w-full"
            />
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Required Certifications</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., CISSP, CEH"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCert()}
              />
              <Button size="sm" onClick={handleAddCert}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentFilters.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="gap-1">
                  {cert}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveCert(cert)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Location</Label>
            <Input
              placeholder="e.g., London, Manchester, Remote"
              value={currentFilters.location}
              onChange={(e) =>
                onFilterChange({ ...currentFilters, location: e.target.value })
              }
            />
          </div>

          {/* Clearance & Special Qualifications */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Security Clearance (Premium Filter)</Label>
            <p className="text-xs text-muted-foreground">Filter candidates by government security clearance level</p>
            <div className="flex flex-wrap gap-2">
              {['DV', 'SC', 'SV', 'CTC', 'BPSS'].map((level) => (
                <Badge
                  key={level}
                  variant={currentFilters.clearance.includes(level) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newClearance = currentFilters.clearance.includes(level)
                      ? currentFilters.clearance.filter(c => c !== level)
                      : [...currentFilters.clearance, level];
                    onFilterChange({ ...currentFilters, clearance: newClearance });
                  }}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hr-ready"
                checked={currentFilters.hrReadyOnly}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...currentFilters, hrReadyOnly: !!checked })
                }
              />
              <Label htmlFor="hr-ready" className="text-sm cursor-pointer">
                HR-Ready Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={currentFilters.remoteOk}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...currentFilters, remoteOk: !!checked })
                }
              />
              <Label htmlFor="remote" className="text-sm cursor-pointer">
                Open to Remote
              </Label>
            </div>

          </div>
        </div>
      </Card>

      <SavedSearchesDialog
        open={savedSearchesOpen}
        onOpenChange={setSavedSearchesOpen}
        currentCriteria={hasActiveFilters ? currentFilters : undefined}
        onLoadSearch={(criteria) => onFilterChange(criteria)}
      />
    </>
  );
};
