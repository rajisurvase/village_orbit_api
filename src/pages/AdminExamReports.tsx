import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Search, FileSpreadsheet, RefreshCw, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomLoader from "@/components/CustomLoader";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  student_name: string;
  score: number | null;
  correct_answers: number | null;
  wrong_answers: number | null;
  unanswered: number | null;
  total_questions: number;
  status: string;
  start_time: string;
  end_time: string | null;
  can_reattempt: boolean;
  exams: {
    title: string;
    subject: string;
    total_marks: number | null;
  };
  profiles?: {
    standard: string | null;
    school_name: string | null;
  };
}

interface Exam {
  id: string;
  title: string;
  subject: string;
}

const AdminExamReports = () => {
  usePageSEO({
    title: "परीक्षा निकाल - Admin",
    description: "विद्यार्थ्यांचे परीक्षा निकाल पहा आणि Excel मध्ये डाउनलोड करा",
  });

  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (exams.length > 0) {
      fetchAttempts();
    }
  }, [selectedExam, statusFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .in("role", ["admin", "sub_admin"]);

    if (!roles || roles.length === 0) {
      toast({
        title: "प्रवेश नाकारला",
        description: "या पेजवर प्रवेश करण्याची परवानगी नाही",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    await fetchExams();
    await fetchAttempts();
  };

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, subject")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching exams:", error);
    } else {
      setExams(data || []);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("exam_attempts")
        .select(`
          *,
          exams (
            title,
            subject,
            total_marks
          )
        `)
        .order("start_time", { ascending: false });

      if (selectedExam !== "all") {
        query = query.eq("exam_id", selectedExam);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profile data for each attempt
      const attemptsWithProfiles = await Promise.all(
        (data || []).map(async (attempt) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("standard, school_name")
            .eq("id", attempt.user_id)
            .single();
          
          return {
            ...attempt,
            profiles: profile
          };
        })
      );

      setAttempts(attemptsWithProfiles);
    } catch (error: any) {
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReattempt = async (attemptId: string) => {
    if (!confirm("या विद्यार्थ्याला परत परीक्षा देण्याची परवानगी देता का?")) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call the reset function
      const { error } = await supabase.rpc("reset_exam_attempt", {
        p_admin_user_id: session?.user.id,
        p_attempt_id: attemptId
      });

      if (error) throw error;

      toast({
        title: "यशस्वी",
        description: "विद्यार्थ्याला परत परीक्षा देता येईल"
      });

      fetchAttempts();
    } catch (error: any) {
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    const filteredData = filteredAttempts.map((attempt) => ({
      "विद्यार्थ्याचे नाव": attempt.student_name,
      "वर्ग": attempt.profiles?.standard || "N/A",
      "शाळेचे नाव": attempt.profiles?.school_name || "N/A",
      "परीक्षेचे नाव": attempt.exams.title,
      "विषय": attempt.exams.subject,
      "एकूण गुण": attempt.exams.total_marks || attempt.total_questions,
      "मिळालेले गुण": attempt.correct_answers || 0,
      "टक्केवारी": attempt.score ? `${attempt.score}%` : "0%",
      "बरोबर उत्तरे": attempt.correct_answers || 0,
      "चुकीची उत्तरे": attempt.wrong_answers || 0,
      "न दिलेली उत्तरे": attempt.unanswered || 0,
      "परीक्षेची तारीख": attempt.start_time ? format(new Date(attempt.start_time), "dd/MM/yyyy HH:mm") : "N/A",
      "स्थिती": attempt.status === "SUBMITTED" ? "पूर्ण" : attempt.status === "IN_PROGRESS" ? "चालू" : "सुरू नाही"
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "निकाल");

    // Auto-size columns
    const maxWidth = 30;
    const colWidths = Object.keys(filteredData[0] || {}).map((key) => ({
      wch: Math.min(maxWidth, Math.max(key.length + 2, 15))
    }));
    worksheet["!cols"] = colWidths;

    const fileName = `परीक्षा_निकाल_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "डाउनलोड यशस्वी",
      description: "Excel फाइल डाउनलोड झाली"
    });
  };

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      attempt.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.profiles?.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.exams.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge className="bg-green-500">पूर्ण</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-orange-500">चालू</Badge>;
      default:
        return <Badge variant="secondary">सुरू नाही</Badge>;
    }
  };

  if (loading && attempts.length === 0) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/exam-management")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            मागे जा
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                परीक्षा निकाल
              </h1>
              <p className="text-muted-foreground">
                विद्यार्थ्यांचे निकाल पहा आणि Excel मध्ये डाउनलोड करा
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchAttempts}>
                <RefreshCw className="h-4 w-4 mr-2" />
                रिफ्रेश
              </Button>
              <Button onClick={exportToExcel} disabled={filteredAttempts.length === 0}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel डाउनलोड
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="नाव, शाळा किंवा परीक्षा शोधा..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="परीक्षा निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सर्व परीक्षा</SelectItem>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="स्थिती निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सर्व स्थिती</SelectItem>
                  <SelectItem value="SUBMITTED">पूर्ण</SelectItem>
                  <SelectItem value="IN_PROGRESS">चालू</SelectItem>
                  <SelectItem value="NOT_STARTED">सुरू नाही</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground flex items-center">
                एकूण निकाल: {filteredAttempts.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>विद्यार्थी निकाल</CardTitle>
            <CardDescription>
              सर्व परीक्षांचे निकाल एका ठिकाणी
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>विद्यार्थी</TableHead>
                    <TableHead>वर्ग</TableHead>
                    <TableHead>शाळा</TableHead>
                    <TableHead>परीक्षा</TableHead>
                    <TableHead>गुण</TableHead>
                    <TableHead>स्थिती</TableHead>
                    <TableHead>तारीख</TableHead>
                    <TableHead>कृती</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        कोणतेही निकाल सापडले नाहीत
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.student_name}</TableCell>
                        <TableCell>{attempt.profiles?.standard || "N/A"}</TableCell>
                        <TableCell>{attempt.profiles?.school_name || "N/A"}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{attempt.exams.title}</div>
                            <Badge variant="outline" className="text-xs">
                              {attempt.exams.subject}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-bold text-lg">
                              {attempt.score !== null ? `${attempt.score}%` : "-"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {attempt.correct_answers || 0}/{attempt.total_questions}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                        <TableCell>
                          {attempt.start_time
                            ? format(new Date(attempt.start_time), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReattempt(attempt.id)}
                            disabled={attempt.status !== "SUBMITTED" || attempt.can_reattempt}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            परत परीक्षा
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminExamReports;
