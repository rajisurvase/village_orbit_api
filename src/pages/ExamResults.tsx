import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, AlertCircle, Trophy, Clock, ArrowLeft } from "lucide-react";
import CustomLoader from "@/components/CustomLoader";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string | null;
}

interface Answer {
  question_id: string;
  selected_option: string | null;
  is_correct: boolean | null;
}

interface Attempt {
  id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_questions: number;
  start_time: string;
  end_time: string;
  exams: {
    title: string;
    subject: string;
    duration_minutes: number;
  };
}

const ExamResults = () => {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      // Fetch attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          exams (
            title,
            subject,
            duration_minutes
          )
        `)
        .eq("id", attemptId)
        .single();

      if (attemptError) throw attemptError;
      setAttempt(attemptData);

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from("exam_answers")
        .select("*")
        .eq("attempt_id", attemptId);

      if (answersError) throw answersError;
      setAnswers(answersData || []);

      // Fetch questions
      const questionIds = answersData?.map(a => a.question_id) || [];
      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select("*")
        .in("id", questionIds);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAnswerIcon = (answer: Answer) => {
    if (!answer.selected_option) {
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
    return answer.is_correct ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getAnswerBadge = (answer: Answer) => {
    if (!answer.selected_option) {
      return <Badge variant="secondary">Not Answered</Badge>;
    }
    return answer.is_correct ? (
      <Badge className="bg-green-600">Correct</Badge>
    ) : (
      <Badge variant="destructive">Wrong</Badge>
    );
  };

  if (loading) {
    return <CustomLoader />;
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Results not found</p>
            <Button onClick={() => navigate("/exam")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeTaken = Math.round(
    (new Date(attempt.end_time).getTime() - new Date(attempt.start_time).getTime()) / 60000
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/exam")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Exam Results
            </h1>
            <p className="text-muted-foreground">
              {attempt.exams.title}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Score Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Your Performance</CardTitle>
                <CardDescription>
                  Completed on {format(new Date(attempt.end_time), "PPP")}
                </CardDescription>
              </div>
              <Badge className="bg-primary text-lg px-4 py-2">
                {attempt.exams.subject}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <Trophy className="h-12 w-12 text-yellow-500 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                <p className={`text-5xl font-bold ${getScoreColor(attempt.score)}`}>
                  {attempt.score}%
                </p>
              </div>
              
              <div className="md:col-span-3 grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-3xl font-bold text-green-600">
                    {attempt.correct_answers}
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Wrong</p>
                  <p className="text-3xl font-bold text-red-600">
                    {attempt.wrong_answers}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-gray-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Unanswered</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {attempt.unanswered}
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {timeTaken}m
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Solutions</CardTitle>
            <CardDescription>
              Review your answers and learn from explanations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => {
              const answer = answers.find(a => a.question_id === question.id);
              if (!answer) return null;

              return (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    {getAnswerIcon(answer)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">
                          Question {index + 1}
                        </h3>
                        {getAnswerBadge(answer)}
                      </div>
                      <p className="text-foreground mb-4">{question.question}</p>
                      
                      <div className="space-y-2 ml-4">
                        {['A', 'B', 'C', 'D'].map((option) => {
                          const optionText = question[`option_${option.toLowerCase()}` as keyof Question];
                          const isCorrect = option === question.correct_option;
                          const isSelected = option === answer.selected_option;
                          
                          return (
                            <div
                              key={option}
                              className={`
                                p-3 rounded-lg border-2
                                ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 
                                  isSelected && !isCorrect ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 
                                  'border-border'}
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{option}.</span>
                                <span>{optionText}</span>
                                {isCorrect && (
                                  <Badge className="ml-auto bg-green-600">
                                    Correct Answer
                                  </Badge>
                                )}
                                {isSelected && !isCorrect && (
                                  <Badge className="ml-auto" variant="destructive">
                                    Your Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            💡 Explanation:
                          </p>
                          <p className="text-blue-800 dark:text-blue-200">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < questions.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button onClick={() => navigate("/exam")} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;