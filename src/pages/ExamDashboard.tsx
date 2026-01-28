import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useApiAuth } from "@/hooks/useApiAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Trophy, BookOpen, Play, CheckCircle2, XCircle, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomLoader from "@/components/CustomLoader";
import { format, isPast, isFuture } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";

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
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  start_time: string;
  end_time: string;
  exams: Exam;
}

interface LeaderboardEntry {
  student_name: string;
  score: number;
  exam_title: string;
  subject: string;
}

const ExamDashboard = () => {
  usePageSEO({
    title: "Online Exam System - Shivankhed Khurd",
    description: "Take online exams in GK, Science, Math, and English. View your scores and compete on the leaderboard.",
    keywords: ["online exam", "test", "quiz", "education", "student", "Shivankhed Khurd"],
  });

  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [pastAttempts, setPastAttempts] = useState<ExamAttempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, isAuthenticated } = useApiAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { permission, requestPermission, checkUpcomingExams, subscribeToExamReminders } = useNotifications();

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.userId) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the exam system",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    fetchData(user.userId);
    
    // Check for upcoming exams and set up notifications
    checkUpcomingExams(user.userId);
    const setupReminders = async () => {
      const channel = await subscribeToExamReminders(user.userId);
      return () => {
        supabase.removeChannel(channel);
      };
    };
    setupReminders();
  }, [authLoading, isAuthenticated, user]);

  const fetchData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch upcoming exams
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select("*")
        .in("status", ["scheduled", "active"])
        .order("scheduled_at", { ascending: true });

      if (examsError) throw examsError;
      setUpcomingExams(examsData || []);

      // Fetch past attempts
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
            status
          )
        `)
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (attemptsError) throw attemptsError;
      setPastAttempts(attemptsData || []);

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
        title: "Error",
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

  const getStatusBadge = (exam: Exam) => {
    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);

    if (isFuture(scheduled)) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (isPast(ends)) {
      return <Badge variant="destructive">Ended</Badge>;
    } else {
      return <Badge className="bg-green-600">Active</Badge>;
    }
  };

  const canTakeExam = (exam: Exam) => {
    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);
    
    const hasAttempt = pastAttempts.some(attempt => attempt.exam_id === exam.id);
    
    // Check if exam is within the valid time window (started but not ended)
    const isWithinTimeWindow = now >= scheduled && now <= ends;
    
    // Check if exam status allows taking (scheduled or active)
    const isStatusValid = exam.status === "scheduled" || exam.status === "active";
    
    return !hasAttempt && isWithinTimeWindow && isStatusValid;
  };

  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}/take`);
  };

  if (authLoading || loading) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Online Exam System
            </h1>
            <p className="text-muted-foreground mb-4">
              Test your knowledge in GK, Science, Math, and English
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => navigate("/exam/rules")}
              >
                📖 Read Exam Rules & Guidelines
              </Button>
              {permission === "granted" ? (
                <Button variant="outline" disabled>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications On
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={requestPermission}
                >
                  <BellOff className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
            <TabsTrigger value="scores">My Scores</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Upcoming Exams Tab */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingExams.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No upcoming exams</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingExams.map((exam) => (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getSubjectColor(exam.subject)}>
                          {exam.subject}
                        </Badge>
                        {getStatusBadge(exam)}
                      </div>
                      <CardTitle className="text-xl">{exam.title}</CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(exam.scheduled_at), "PPP")}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {exam.duration_minutes} minutes
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {exam.total_questions} questions
                        </div>
                        
                        {canTakeExam(exam) ? (
                          <Button 
                            className="w-full mt-4" 
                            onClick={() => handleStartExam(exam.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Exam
                          </Button>
                        ) : pastAttempts.some(a => a.exam_id === exam.id) ? (
                          <Button className="w-full mt-4" variant="secondary" disabled>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Already Attempted
                          </Button>
                        ) : (
                          <Button className="w-full mt-4" variant="outline" disabled>
                            Not Available
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                    <p className="text-muted-foreground">No exam attempts yet</p>
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
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-2xl font-bold text-primary">
                            {attempt.score}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Correct</p>
                          <p className="text-xl font-semibold text-green-600">
                            {attempt.correct_answers}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Wrong</p>
                          <p className="text-xl font-semibold text-red-600">
                            {attempt.wrong_answers}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
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
                        View Details
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
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Highest scores across all exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No scores yet
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