import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, FileText, Calendar, BarChart, Shuffle, ClipboardList, RefreshCw } from "lucide-react";
import CustomLoader from "@/components/CustomLoader";
import { format } from "date-fns";
import ExamFormDialog, { Exam } from "@/components/exam/ExamFormDialog";

const AdminExamDashboard = () => {
  usePageSEO({
    title: "Admin - Exam Management",
    description: "Manage exams, questions, and view student performance",
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowDialog(true);
  };

  const handleCreateNew = () => {
    setEditingExam(null);
    setShowDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      setEditingExam(null);
    }
  };

  const handleFormSuccess = () => {
    fetchExams();
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
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Form Dialog */}
      <ExamFormDialog
        open={showDialog}
        onOpenChange={handleDialogClose}
        editingExam={editingExam}
        onSuccess={handleFormSuccess}
      />

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
