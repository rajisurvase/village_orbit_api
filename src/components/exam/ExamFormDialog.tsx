import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shuffle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

// Standards for eligibility
const STANDARDS = [
  { value: "1st", label: "1st" },
  { value: "2nd", label: "2nd" },
  { value: "3rd", label: "3rd" },
  { value: "4th", label: "4th" },
  { value: "5th", label: "5th" },
  { value: "6th", label: "6th" },
  { value: "7th", label: "7th" },
  { value: "8th", label: "8th" },
  { value: "9th", label: "9th" },
  { value: "10th", label: "10th" },
  { value: "11th", label: "11th" },
  { value: "12th", label: "12th" },
];

// Zod schema for form validation
const examFormSchema = z.object({
  title: z.string().trim().min(1, "Exam title is required").max(200, "Title must be less than 200 characters"),
  subject: z.enum(["GK", "Science", "Math", "English"]),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  total_questions: z.number().int().min(1, "Minimum 1 question required").max(500, "Maximum 500 questions allowed"),
  duration_minutes: z.number().int().min(1, "Minimum 1 minute required").max(480, "Maximum 8 hours allowed"),
  scheduled_at: z.string().min(1, "Start date is required"),
  ends_at: z.string().min(1, "End date is required"),
  status: z.enum(["draft", "scheduled", "active", "completed", "cancelled"]),
  pass_marks: z.number().int().min(0, "Pass marks cannot be negative").max(100, "Pass marks cannot exceed 100%"),
  from_standard: z.string().optional(),
  to_standard: z.string().optional(),
  shuffle_questions: z.boolean(),
  allow_reattempt_till_end_date: z.boolean(),
}).refine((data) => {
  if (!data.scheduled_at || !data.ends_at) return true;
  return new Date(data.ends_at) > new Date(data.scheduled_at);
}, {
  message: "End date must be after start date",
  path: ["ends_at"],
});

export type ExamFormData = z.infer<typeof examFormSchema>;

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  total_questions: number;
  duration_minutes: number;
  scheduled_at: string;
  ends_at: string;
  status: string;
  created_at: string;
  from_standard: string | null;
  to_standard: string | null;
  shuffle_questions: boolean;
  pass_marks: number | null;
  allow_reattempt_till_end_date: boolean;
}

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExam: Exam | null;
  onSuccess: () => void;
}

const getInitialFormData = (exam?: Exam | null): ExamFormData => ({
  title: exam?.title || "",
  subject: (exam?.subject as ExamFormData["subject"]) || "GK",
  description: exam?.description || "",
  total_questions: exam?.total_questions || 100,
  duration_minutes: exam?.duration_minutes || 60,
  scheduled_at: exam?.scheduled_at
    ? format(new Date(exam.scheduled_at), "yyyy-MM-dd'T'HH:mm")
    : "",
  ends_at: exam?.ends_at
    ? format(new Date(exam.ends_at), "yyyy-MM-dd'T'HH:mm")
    : "",
  status: (exam?.status as ExamFormData["status"]) || "draft",
  pass_marks: exam?.pass_marks ?? 40,
  from_standard: exam?.from_standard || "",
  to_standard: exam?.to_standard || "",
  shuffle_questions: exam?.shuffle_questions ?? true,
  allow_reattempt_till_end_date: exam?.allow_reattempt_till_end_date ?? false,
});

const ExamFormDialog = ({
  open,
  onOpenChange,
  editingExam,
  onSuccess,
}: ExamFormDialogProps) => {
  const [formData, setFormData] = useState<ExamFormData>(getInitialFormData());
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset form when dialog opens or editingExam changes
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(editingExam));
      setErrors({});
    }
  }, [open, editingExam]);

  const validateForm = useCallback((): boolean => {
    const result = examFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    let accessToken = session?.access_token ?? null;

    if (!accessToken) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      accessToken = refreshed.session?.access_token ?? null;
    }

    return accessToken;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (submitting) return;

    // Validate form data
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get fresh access token
      const accessToken = await getAccessToken();

      if (!accessToken) {
        toast({
          title: "Session expired",
          description: "Please login again.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Prepare exam data payload
      const examData = {
        title: formData.title.trim(),
        subject: formData.subject,
        description: formData.description?.trim() || null,
        total_questions: formData.total_questions,
        duration_minutes: formData.duration_minutes,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString(),
        status: formData.status,
        pass_marks: formData.pass_marks,
        from_standard: formData.from_standard || null,
        to_standard: formData.to_standard || null,
        shuffle_questions: formData.shuffle_questions,
        allow_reattempt_till_end_date: formData.allow_reattempt_till_end_date,
      };

      console.log("[ExamForm] Submitting exam data:", examData);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("admin-save-exam", {
        body: { examId: editingExam?.id ?? null, exam: examData },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-store",
        },
      });

      if (error) {
        console.error("[ExamForm] Edge function error:", error);
        throw new Error(error.message || "Failed to save exam");
      }

      if (!data?.id) {
        console.error("[ExamForm] No exam ID returned:", data);
        throw new Error("No exam ID returned from server");
      }

      console.log("[ExamForm] Exam saved successfully. ID:", data.id);

      toast({
        title: "Success",
        description: editingExam ? "Exam updated successfully" : "Exam created successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("[ExamForm] Submit error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save exam",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = <K extends keyof ExamFormData>(
    field: K,
    value: ExamFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingExam ? "Edit Exam" : "Create New Exam"}
          </DialogTitle>
          <DialogDescription>
            Fill in the exam details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Exam Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => updateField("subject", value as ExamFormData["subject"])}
            >
              <SelectTrigger className={errors.subject ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GK">General Knowledge</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Math">Mathematics</SelectItem>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-sm text-destructive mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          {/* Standard Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from_standard">From Standard</Label>
              <Select
                value={formData.from_standard || "none"}
                onValueChange={(value) => updateField("from_standard", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No restriction</SelectItem>
                  {STANDARDS.map((std) => (
                    <SelectItem key={std.value} value={std.value}>
                      {std.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum class eligible
              </p>
            </div>

            <div>
              <Label htmlFor="to_standard">To Standard</Label>
              <Select
                value={formData.to_standard || "none"}
                onValueChange={(value) => updateField("to_standard", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No restriction</SelectItem>
                  {STANDARDS.map((std) => (
                    <SelectItem key={std.value} value={std.value}>
                      {std.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum class eligible
              </p>
            </div>
          </div>

          {/* Questions & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_questions">Total Questions *</Label>
              <Input
                id="total_questions"
                type="number"
                min="1"
                max="500"
                value={formData.total_questions}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateField("total_questions", Number.isFinite(val) ? val : 1);
                }}
                className={errors.total_questions ? "border-destructive" : ""}
              />
              {errors.total_questions && (
                <p className="text-sm text-destructive mt-1">{errors.total_questions}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="480"
                value={formData.duration_minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateField("duration_minutes", Number.isFinite(val) ? val : 1);
                }}
                className={errors.duration_minutes ? "border-destructive" : ""}
              />
              {errors.duration_minutes && (
                <p className="text-sm text-destructive mt-1">{errors.duration_minutes}</p>
              )}
            </div>
          </div>

          {/* Pass Marks & Shuffle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pass_marks">Pass Marks (%)</Label>
              <Input
                id="pass_marks"
                type="number"
                min="0"
                max="100"
                value={formData.pass_marks}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateField("pass_marks", Number.isFinite(val) ? val : 0);
                }}
                className={errors.pass_marks ? "border-destructive" : ""}
              />
              {errors.pass_marks && (
                <p className="text-sm text-destructive mt-1">{errors.pass_marks}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="shuffle">Shuffle Questions</Label>
              </div>
              <Switch
                id="shuffle"
                checked={formData.shuffle_questions}
                onCheckedChange={(checked) => updateField("shuffle_questions", checked)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_at">Start Date & Time *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => updateField("scheduled_at", e.target.value)}
                className={errors.scheduled_at ? "border-destructive" : ""}
              />
              {errors.scheduled_at && (
                <p className="text-sm text-destructive mt-1">{errors.scheduled_at}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ends_at">End Date & Time *</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={formData.ends_at}
                onChange={(e) => updateField("ends_at", e.target.value)}
                className={errors.ends_at ? "border-destructive" : ""}
              />
              {errors.ends_at && (
                <p className="text-sm text-destructive mt-1">{errors.ends_at}</p>
              )}
            </div>
          </div>

          {/* Reattempt Setting */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="allow_reattempt" className="font-medium">
                  Allow Reattempt Till End Date
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                If enabled, students can reattempt until end date. Latest attempt is final.
              </p>
            </div>
            <Switch
              id="allow_reattempt"
              checked={formData.allow_reattempt_till_end_date}
              onCheckedChange={(checked) => updateField("allow_reattempt_till_end_date", checked)}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateField("status", value as ExamFormData["status"])}
            >
              <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive mt-1">{errors.status}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingExam ? "Update" : "Create"} Exam
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamFormDialog;
