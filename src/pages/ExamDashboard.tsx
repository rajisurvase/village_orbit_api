import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Trophy, BookOpen, Play, CheckCircle2, XCircle, Bell, BellOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomLoader from "@/components/CustomLoader";
import { format, isPast, isFuture } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import StudentExamCard from "@/components/exam/StudentExamCard";

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
  from_standard: string | null;
  to_standard: string | null;
  shuffle_questions: boolean;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number | null;
  correct_answers: number | null;
  wrong_answers: number | null;
  total_questions: number;
  start_time: string;
  end_time: string | null;
  status: string;
  can_reattempt: boolean;
  exams: Exam;
}

interface LeaderboardEntry {
  student_name: string;
  score: number;
  exam_title: string;
  subject: string;
}

interface StudentProfile {
  standard: string | null;
  full_name: string | null;
}

interface UserRoles {
  isStudent: boolean;
  isAdmin: boolean;
}

const ExamDashboard = () => {
  usePageSEO({
    title: "ऑनलाइन परीक्षा प्रणाली - Shivankhed Khurd",
    description: "GK, विज्ञान, गणित आणि इंग्रजीमध्ये ऑनलाइन परीक्षा द्या. तुमचे गुण पहा आणि लीडरबोर्डवर स्पर्धा करा.",
    keywords: ["online exam", "test", "quiz", "education", "student", "Shivankhed Khurd"],
  });

  const [eligibleExams, setEligibleExams] = useState<Exam[]>([]);
  const [pastAttempts, setPastAttempts] = useState<ExamAttempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoles>({ isStudent: false, isAdmin: false });
  const [inProgressAttempts, setInProgressAttempts] = useState<ExamAttempt[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { permission, requestPermission, checkUpcomingExams, subscribeToExamReminders } = useNotifications();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "प्रमाणीकरण आवश्यक",
        description: "कृपया परीक्षा प्रणाली वापरण्यासाठी लॉगिन करा",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    setUser(session.user);
    
    // Check user roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);
    
    const roles = rolesData?.map(r => r.role) || [];
    const isStudent = roles.includes("student");
    const isAdmin = roles.includes("admin") || roles.includes("sub_admin");
    setUserRoles({ isStudent, isAdmin });
    
    // If not a student and not an admin, show error
    if (!isStudent && !isAdmin) {
      toast({
        title: "प्रवेश नाकारला",
        description: "परीक्षा देण्यासाठी तुम्हाला 'विद्यार्थी' भूमिका आवश्यक आहे. कृपया प्रशासकाशी संपर्क साधा.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    // Fetch student profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("standard, full_name")
      .eq("id", session.user.id)
      .single();
    
    setStudentProfile(profileData);
    
    // Only fetch exam data for students
    if (isStudent) {
      fetchData(session.user.id, profileData?.standard);
      
      // Check for upcoming exams and set up notifications
      checkUpcomingExams(session.user.id);
      const channel = await subscribeToExamReminders(session.user.id);
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  };

  const fetchData = async (userId: string, studentStandard: string | null) => {
    try {
      setLoading(true);
      
      // Fetch all scheduled/active exams
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select("*")
        .in("status", ["scheduled", "active"])
        .order("scheduled_at", { ascending: true });

      if (examsError) throw examsError;
      
      // Filter exams based on student's standard eligibility
      const eligible = (examsData || []).filter(exam => {
        if (!exam.from_standard && !exam.to_standard) {
          return true; // No restrictions
        }
        
        if (!studentStandard) {
          return false; // Student has no standard set
        }
        
        const studentStd = parseInt(studentStandard.replace(/[^0-9]/g, '')) || 0;
        const fromStd = exam.from_standard ? parseInt(exam.from_standard.replace(/[^0-9]/g, '')) || 0 : 0;
        const toStd = exam.to_standard ? parseInt(exam.to_standard.replace(/[^0-9]/g, '')) || 12 : 12;
        
        return studentStd >= fromStd && studentStd <= toStd;
      });
      
      setEligibleExams(eligible);

      // Fetch all attempts for this user
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          exams (
            id,
            title,
            subject,
            description,
            total_questions,
            duration_minutes,
            scheduled_at,
            ends_at,
            status,
            from_standard,
            to_standard,
            shuffle_questions
          )
        `)
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (attemptsError) throw attemptsError;
      
      // Separate in-progress and completed attempts
      const inProgress = (attemptsData || []).filter(a => 
        a.status === "IN_PROGRESS" || a.status === "NOT_STARTED"
      );
      const completed = (attemptsData || []).filter(a => a.status === "SUBMITTED");
      
      setInProgressAttempts(inProgress);
      setPastAttempts(completed);

      // Fetch leaderboard (top 10 scores)
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("exam_attempts")
        .select(`
          student_name,
          score,
          exams!inner (
            title,
            subject
          )
        `)
        .eq("status", "SUBMITTED")
        .not("score", "is", null)
        .order("score", { ascending: false })
        .limit(10);

      if (leaderboardError) throw leaderboardError;
      
      const formattedLeaderboard = leaderboardData?.map((entry: any) => ({
        student_name: entry.student_name,
        score: entry.score,
        exam_title: entry.exams.title,
        subject: entry.exams.subject
      })) || [];
      
      setLeaderboard(formattedLeaderboard);

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

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      GK: "bg-blue-500",
      Science: "bg-green-500",
      Math: "bg-purple-500",
      English: "bg-orange-500"
    };
    return colors[subject] || "bg-gray-500";
  };

  const canTakeExam = (exam: Exam) => {
    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);
    
    // Check if exam is within the valid time window
    const isWithinTimeWindow = now >= scheduled && now <= ends;
    
    // Check if exam status allows taking
    const isStatusValid = exam.status === "scheduled" || exam.status === "active";
    
    // Check if student has already submitted this exam
    const hasSubmittedAttempt = pastAttempts.some(attempt => 
      attempt.exam_id === exam.id && attempt.status === "SUBMITTED" && !attempt.can_reattempt
    );
    
    // Check for in-progress attempt
    const hasInProgressAttempt = inProgressAttempts.some(attempt => 
      attempt.exam_id === exam.id
    );
    
    return !hasSubmittedAttempt && isWithinTimeWindow && isStatusValid;
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);
    
    // Check for in-progress attempt
    const inProgressAttempt = inProgressAttempts.find(a => a.exam_id === exam.id);
    if (inProgressAttempt) {
      return "resume";
    }
    
    // Check for submitted attempt
    const submittedAttempt = pastAttempts.find(a => a.exam_id === exam.id && a.status === "SUBMITTED");
    if (submittedAttempt) {
      return "completed";
    }
    
    if (isFuture(scheduled)) {
      return "upcoming";
    } else if (isPast(ends)) {
      return "ended";
    }
    
    return "active";
  };

  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}/take`);
  };

  const handleResumeExam = (examId: string) => {
    navigate(`/exam/${examId}/take`);
  };

  if (loading) {
    return <CustomLoader />;
  }

  // Show message for non-student users
  if (!userRoles.isStudent && !userRoles.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              प्रवेश नाकारला
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              परीक्षा प्रणाली वापरण्यासाठी तुम्हाला 'विद्यार्थी' भूमिका आवश्यक आहे.
            </p>
            <p className="text-sm text-muted-foreground">
              कृपया प्रशासकाशी संपर्क साधून तुम्हाला विद्यार्थी म्हणून नोंदणी करा.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              मुख्यपृष्ठावर परत जा
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              ऑनलाइन परीक्षा प्रणाली
            </h1>
            <p className="text-muted-foreground mb-2">
              GK, विज्ञान, गणित आणि इंग्रजीमध्ये तुमचे ज्ञान तपासा
            </p>
            {userRoles.isStudent && studentProfile?.standard && (
              <Badge variant="outline" className="mb-4">
                इयत्ता: {studentProfile.standard}
              </Badge>
            )}
            {userRoles.isStudent && !studentProfile?.standard && (
              <div className="flex items-center justify-center gap-2 text-yellow-600 mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">तुमची इयत्ता सेट केलेली नाही. कृपया प्रशासकाशी संपर्क साधा.</span>
              </div>
            )}
            <div className="flex gap-2 justify-center flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => navigate("/exam/rules")}
              >
                📖 परीक्षा नियम वाचा
              </Button>
              {permission === "granted" ? (
                <Button variant="outline" disabled>
                  <Bell className="h-4 w-4 mr-2" />
                  सूचना चालू
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={requestPermission}
                >
                  <BellOff className="h-4 w-4 mr-2" />
                  सूचना सुरू करा
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* In-Progress Exams Alert */}
      {inProgressAttempts.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <RefreshCw className="h-5 w-5" />
                अपूर्ण परीक्षा
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inProgressAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-semibold">{attempt.exams.title}</p>
                      <p className="text-sm text-muted-foreground">
                        सुरू केले: {format(new Date(attempt.start_time), "PPP, p")}
                      </p>
                    </div>
                    <Button onClick={() => handleResumeExam(attempt.exam_id)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      पुन्हा सुरू करा
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3">
            <TabsTrigger value="upcoming">उपलब्ध परीक्षा</TabsTrigger>
            <TabsTrigger value="scores">माझे गुण</TabsTrigger>
            <TabsTrigger value="leaderboard">लीडरबोर्ड</TabsTrigger>
          </TabsList>

          {/* Upcoming Exams Tab */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eligibleExams.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {studentProfile?.standard 
                        ? "सध्या तुमच्या इयत्तेसाठी कोणतीही परीक्षा उपलब्ध नाही"
                        : "तुमची इयत्ता सेट केलेली नसल्यामुळे परीक्षा दिसत नाहीत"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                eligibleExams.map((exam) => (
                  <StudentExamCard
                    key={exam.id}
                    exam={exam}
                    status={getExamStatus(exam)}
                    canTake={canTakeExam(exam)}
                    onStart={() => handleStartExam(exam.id)}
                    onResume={() => handleResumeExam(exam.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Past Scores Tab */}
          <TabsContent value="scores" className="mt-6">
            <div className="space-y-4">
              {pastAttempts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">अद्याप कोणतीही परीक्षा दिलेली नाही</p>
                  </CardContent>
                </Card>
              ) : (
                pastAttempts.map((attempt) => (
                  <Card key={attempt.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{attempt.exams.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(attempt.start_time), "PPP")}
                          </CardDescription>
                        </div>
                        <Badge className={getSubjectColor(attempt.exams.subject)}>
                          {attempt.exams.subject}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">गुण</p>
                          <p className="text-2xl font-bold text-primary">
                            {attempt.score ?? 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">बरोबर</p>
                          <p className="text-xl font-semibold text-green-600">
                            {attempt.correct_answers ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">चुकीचे</p>
                          <p className="text-xl font-semibold text-red-600">
                            {attempt.wrong_answers ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">एकूण</p>
                          <p className="text-xl font-semibold">
                            {attempt.total_questions}
                          </p>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => navigate(`/exam/${attempt.exam_id}/results/${attempt.id}`)}
                      >
                        तपशील पहा
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                  उत्कृष्ट कामगिरी
                </CardTitle>
                <CardDescription>
                  सर्व परीक्षांमधील सर्वोच्च गुण
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    अद्याप कोणतेही गुण नाहीत
                  </p>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold
                            ${index === 0 ? 'bg-yellow-500 text-white' : 
                              index === 1 ? 'bg-gray-400 text-white' : 
                              index === 2 ? 'bg-orange-600 text-white' : 
                              'bg-muted text-foreground'}
                          `}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{entry.student_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.exam_title}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {entry.score}%
                          </p>
                          <Badge className={getSubjectColor(entry.subject)} variant="outline">
                            {entry.subject}
                          </Badge>
                        </div>
                      </div>
                    ))}
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

export default ExamDashboard;
