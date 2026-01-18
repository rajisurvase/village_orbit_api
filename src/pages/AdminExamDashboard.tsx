import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, FileText, Calendar, BarChart, Shuffle, ClipboardList, RefreshCw, Loader2 } from "lucide-react";
import CustomLoader from "@/components/CustomLoader";
import { format } from "date-fns";

interface Exam {
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

const AdminExamDashboard = () => {
  usePageSEO({
    title: "Admin - Exam Management",
    description: "Manage exams, questions, and view student performance",
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    title: string;
    subject: string;
    description: string;
    total_questions: number;
    duration_minutes: number;
    scheduled_at: string;
    ends_at: string;
    status: "draft" | "scheduled" | "active" | "completed" | "cancelled";
    pass_marks: number;
    from_standard: string;
    to_standard: string;
    shuffle_questions: boolean;
    allow_reattempt_till_end_date: boolean;
  }>({
    title: "",
    subject: "GK",
    description: "",
    total_questions: 100,
    duration_minutes: 60,
    scheduled_at: "",
    ends_at: "",
    status: "draft",
    pass_marks: 40,
    from_standard: "",
    to_standard: "",
    shuffle_questions: true,
    allow_reattempt_till_end_date: false
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .in("role", ["admin", "sub_admin"])
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    fetchExams();
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false })
        .throwOnError();

      setExams(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Exam title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.scheduled_at || !formData.ends_at) {
      toast({
        title: "Validation Error",
        description: "Start date and end date are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Safety: never let the button stay disabled forever
    const timeoutMs = 20000;
    let timeoutId: number | undefined;

    try {
      // Convert datetime-local format to ISO string
      const scheduledAt = new Date(formData.scheduled_at).toISOString();
      const endsAt = new Date(formData.ends_at).toISOString();

      const examData = {
        title: formData.title.trim(),
        subject: formData.subject as any,
        description: formData.description.trim() || null,
        total_questions: formData.total_questions,
        duration_minutes: formData.duration_minutes,
        scheduled_at: scheduledAt,
        ends_at: endsAt,
        status: formData.status as any,
        pass_marks: formData.pass_marks,
        from_standard: formData.from_standard || null,
        to_standard: formData.to_standard || null,
        shuffle_questions: formData.shuffle_questions,
        allow_reattempt_till_end_date: formData.allow_reattempt_till_end_date,
      };

      console.log("[EXAM] Submitting exam data:", examData);

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error("Request timed out while saving the exam. Please try again."));
        }, timeoutMs);
      });

      if (editingExam) {
        console.log("[EXAM] Starting update request...");
        const requestPromise = supabase
          .from("exams")
          .update(examData)
          .eq("id", editingExam.id)
          .throwOnError();

        await Promise.race([requestPromise, timeoutPromise]);

        toast({
          title: "Success",
          description: "Exam updated successfully",
        });
      } else {
        console.log("[EXAM] Starting insert request...");
        // Note: we intentionally avoid `.select()` here to keep the request small and reliable.
        const requestPromise = supabase.from("exams").insert(examData).throwOnError();

        await Promise.race([requestPromise, timeoutPromise]);

        toast({
          title: "Success",
          description: "Exam created successfully",
        });
      }

      console.log("[EXAM] Save request completed.");

      setShowDialog(false);
      resetForm();
      fetchExams();
    } catch (error: any) {
      console.error("[EXAM] Submit error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save exam",
        variant: "destructive",
      });
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      setSubmitting(false);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      description: exam.description || "",
      total_questions: exam.total_questions,
      duration_minutes: exam.duration_minutes,
      scheduled_at: exam.scheduled_at ? format(new Date(exam.scheduled_at), "yyyy-MM-dd'T'HH:mm") : "",
      ends_at: exam.ends_at ? format(new Date(exam.ends_at), "yyyy-MM-dd'T'HH:mm") : "",
      status: exam.status as any,
      pass_marks: exam.pass_marks || 40,
      from_standard: exam.from_standard || "",
      to_standard: exam.to_standard || "",
      shuffle_questions: exam.shuffle_questions ?? true,
      allow_reattempt_till_end_date: exam.allow_reattempt_till_end_date ?? false
    });
    setShowDialog(true);
  };

  const handleDelete = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam? This will also delete all questions and attempts.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", examId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Exam deleted successfully"
      });
      
      fetchExams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingExam(null);
    setFormData({
      title: "",
      subject: "GK",
      description: "",
      total_questions: 100,
      duration_minutes: 60,
      scheduled_at: "",
      ends_at: "",
      status: "draft",
      pass_marks: 40,
      from_standard: "",
      to_standard: "",
      shuffle_questions: true,
      allow_reattempt_till_end_date: false
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "secondary",
      scheduled: "default",
      active: "default",
      completed: "secondary",
      cancelled: "destructive"
    };
    return <Badge variant={colors[status] as any}>{status}</Badge>;
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Exam Management
              </h1>
              <p className="text-muted-foreground">
                Create and manage online exams
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => navigate("/admin/exam-reports")}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Student Reports
              </Button>
              <Button variant="outline" onClick={() => navigate("/exam/analytics")}>
                <BarChart className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </Button>
                </DialogTrigger>
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
                    <div>
                      <Label htmlFor="title">Exam Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GK">General Knowledge</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Math">Mathematics</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    {/* Standard Range Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="from_standard">From Standard</Label>
                        <Select
                          value={formData.from_standard || "none"}
                          onValueChange={(value) => setFormData({ ...formData, from_standard: value === "none" ? "" : value })}
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
                          Minimum class eligible for this exam
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="to_standard">To Standard</Label>
                        <Select
                          value={formData.to_standard || "none"}
                          onValueChange={(value) => setFormData({ ...formData, to_standard: value === "none" ? "" : value })}
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
                          Maximum class eligible for this exam
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total_questions">Total Questions *</Label>
                        <Input
                          id="total_questions"
                          type="number"
                          min="1"
                          value={formData.total_questions}
                          onChange={(e) => {
                            const next = parseInt(e.target.value, 10);
                            setFormData({
                              ...formData,
                              total_questions: Number.isFinite(next) ? next : 1,
                            });
                          }}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={formData.duration_minutes}
                          onChange={(e) => {
                            const next = parseInt(e.target.value, 10);
                            setFormData({
                              ...formData,
                              duration_minutes: Number.isFinite(next) ? next : 1,
                            });
                          }}
                          required
                        />
                      </div>
                    </div>

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
                            const next = parseInt(e.target.value, 10);
                            setFormData({
                              ...formData,
                              pass_marks: Number.isFinite(next) ? next : 0,
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-6">
                        <div className="flex items-center gap-2">
                          <Shuffle className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="shuffle">Shuffle Questions</Label>
                        </div>
                        <Switch
                          id="shuffle"
                          checked={formData.shuffle_questions}
                          onCheckedChange={(checked) => setFormData({ ...formData, shuffle_questions: checked })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scheduled_at">Start Date & Time *</Label>
                        <Input
                          id="scheduled_at"
                          type="datetime-local"
                          value={formData.scheduled_at}
                          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="ends_at">End Date & Time *</Label>
                        <Input
                          id="ends_at"
                          type="datetime-local"
                          value={formData.ends_at}
                          onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                          required
                        />
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
                          If enabled, students can reattempt the exam multiple times until end date. Latest attempt is final.
                        </p>
                      </div>
                      <Switch
                        id="allow_reattempt"
                        checked={formData.allow_reattempt_till_end_date}
                        onCheckedChange={(checked) => setFormData({ ...formData, allow_reattempt_till_end_date: checked })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
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
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowDialog(false);
                          resetForm();
                        }}
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
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams.filter(e => e.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams.filter(e => e.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">With Shuffle</CardTitle>
              <Shuffle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams.filter(e => e.shuffle_questions).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Exams</CardTitle>
            <CardDescription>Manage exam schedules and questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Standard Range</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Shuffle</TableHead>
                    <TableHead>Reattempt</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{exam.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        {exam.from_standard && exam.to_standard ? (
                          <span className="text-sm">
                            {exam.from_standard} - {exam.to_standard}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">All</span>
                        )}
                      </TableCell>
                      <TableCell>{exam.total_questions}</TableCell>
                      <TableCell>{exam.duration_minutes} min</TableCell>
                      <TableCell>
                        {exam.shuffle_questions ? (
                          <Badge variant="default" className="bg-green-500">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {exam.allow_reattempt_till_end_date ? (
                          <Badge variant="default" className="bg-blue-500">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Once</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(exam.scheduled_at), "PP")}
                      </TableCell>
                      <TableCell>{getStatusBadge(exam.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/exam/${exam.id}/questions`)}
                            title="Manage Questions"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(exam)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(exam.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminExamDashboard;
