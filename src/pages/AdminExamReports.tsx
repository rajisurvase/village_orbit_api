import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ArrowLeft, Search, FileSpreadsheet, RefreshCw, RotateCcw, Trophy, Medal, Award } from "lucide-react";
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

interface LeaderboardEntry {
  rank: number;
  student_name: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  time_taken: number | null;
  standard: string | null;
  school_name: string | null;
  end_time: string | null;
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardExam, setLeaderboardExam] = useState<string>("");
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
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

  const fetchLeaderboard = async (examId: string) => {
    if (!examId) return;
    
    try {
      setLoadingLeaderboard(true);
      
      const { data, error } = await supabase
        .from("exam_attempts")
        .select(`
          student_name,
          score,
          correct_answers,
          wrong_answers,
          total_questions,
          remaining_time_seconds,
          end_time,
          start_time,
          user_id
        `)
        .eq("exam_id", examId)
        .eq("status", "SUBMITTED")
        .not("score", "is", null)
        .order("score", { ascending: false });

      if (error) throw error;

      // Fetch profile data and calculate time taken
      const leaderboardWithDetails = await Promise.all(
        (data || []).map(async (entry, index) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("standard, school_name")
            .eq("id", entry.user_id)
            .single();
          
          // Calculate time taken in minutes
          let timeTaken = null;
          if (entry.start_time && entry.end_time) {
            const start = new Date(entry.start_time).getTime();
            const end = new Date(entry.end_time).getTime();
            timeTaken = Math.round((end - start) / 60000); // Convert to minutes
          }
          
          return {
            rank: index + 1,
            student_name: entry.student_name,
            score: entry.score,
            correct_answers: entry.correct_answers || 0,
            wrong_answers: entry.wrong_answers || 0,
            total_questions: entry.total_questions,
            time_taken: timeTaken,
            standard: profile?.standard || null,
            school_name: profile?.school_name || null,
            end_time: entry.end_time
          };
        })
      );

      setLeaderboard(leaderboardWithDetails);
    } catch (error: any) {
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleLeaderboardExamChange = (examId: string) => {
    setLeaderboardExam(examId);
    if (examId) {
      fetchLeaderboard(examId);
    } else {
      setLeaderboard([]);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return <span className="w-5 h-5 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
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
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="results">विद्यार्थी निकाल</TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              लीडरबोर्ड
            </TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results">
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
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  परीक्षा लीडरबोर्ड
                </CardTitle>
                <CardDescription>
                  निवडलेल्या परीक्षेचे टॉप विद्यार्थी आणि तपशीलवार माहिती
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Select value={leaderboardExam} onValueChange={handleLeaderboardExamChange}>
                    <SelectTrigger className="w-full md:w-80">
                      <SelectValue placeholder="परीक्षा निवडा" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.title} ({exam.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!leaderboardExam ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>लीडरबोर्ड पाहण्यासाठी परीक्षा निवडा</p>
                  </div>
                ) : loadingLeaderboard ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>या परीक्षेसाठी अद्याप कोणतेही निकाल नाहीत</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">क्रमांक</TableHead>
                          <TableHead>विद्यार्थ्याचे नाव</TableHead>
                          <TableHead>वर्ग</TableHead>
                          <TableHead>शाळा</TableHead>
                          <TableHead className="text-center">गुण</TableHead>
                          <TableHead className="text-center">बरोबर</TableHead>
                          <TableHead className="text-center">चुकीची</TableHead>
                          <TableHead className="text-center">वेळ (मिनिटे)</TableHead>
                          <TableHead>पूर्ण केलेली तारीख</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboard.map((entry) => (
                          <TableRow 
                            key={entry.rank} 
                            className={
                              entry.rank === 1 ? "bg-yellow-500/10" :
                              entry.rank === 2 ? "bg-gray-400/10" :
                              entry.rank === 3 ? "bg-orange-600/10" : ""
                            }
                          >
                            <TableCell>
                              <div className="flex items-center justify-center">
                                {getRankIcon(entry.rank)}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{entry.student_name}</TableCell>
                            <TableCell>{entry.standard || "N/A"}</TableCell>
                            <TableCell>{entry.school_name || "N/A"}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-bold text-lg ${
                                entry.score >= 80 ? "text-green-600" :
                                entry.score >= 60 ? "text-yellow-600" :
                                entry.score >= 40 ? "text-orange-600" : "text-red-600"
                              }`}>
                                {entry.score}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-500">{entry.correct_answers}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="destructive">{entry.wrong_answers}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {entry.time_taken !== null ? `${entry.time_taken} मि.` : "-"}
                            </TableCell>
                            <TableCell>
                              {entry.end_time 
                                ? format(new Date(entry.end_time), "dd/MM/yyyy HH:mm")
                                : "-"
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Summary Statistics */}
                    {leaderboard.length > 0 && (
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">एकूण सहभागी</p>
                              <p className="text-2xl font-bold text-primary">{leaderboard.length}</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">सर्वोच्च गुण</p>
                              <p className="text-2xl font-bold text-green-600">
                                {Math.max(...leaderboard.map(e => e.score))}%
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">सरासरी गुण</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {Math.round(leaderboard.reduce((acc, e) => acc + e.score, 0) / leaderboard.length)}%
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">किमान गुण</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {Math.min(...leaderboard.map(e => e.score))}%
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminExamReports;
