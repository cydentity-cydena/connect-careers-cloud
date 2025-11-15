import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, Trash2 } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMove: (stage: string) => void;
  onBulkReject: () => void;
  onBulkMessage: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkMove,
  onBulkReject,
  onBulkMessage,
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-4 z-50 animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{selectedCount} selected</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-primary-foreground/20" />

      <Select onValueChange={onBulkMove}>
        <SelectTrigger className="w-[180px] bg-primary-foreground text-primary">
          <SelectValue placeholder="Move to stage..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="screening">Screening</SelectItem>
          <SelectItem value="interview">Interview</SelectItem>
          <SelectItem value="offer">Offer</SelectItem>
          <SelectItem value="hired">Hired</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="secondary"
        size="sm"
        onClick={onBulkMessage}
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        Send Message
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={onBulkReject}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Reject All
      </Button>
    </div>
  );
};
