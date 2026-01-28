import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Camera, Send } from "lucide-react";
import CustomLoader from "@/components/CustomLoader";

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

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  total_questions: number;
}

const ExamTake = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  
  // Integrity check states
  const [showPledge, setShowPledge] = useState(true);
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [startSnapshot, setStartSnapshot] = useState<string | null>(null);

  useEffect(() => {
    initializeExam();
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [examId]);

  useEffect(() => {
    if (timeRemaining > 0 && !showPledge && !showCamera) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, showPledge, showCamera]);

  const initializeExam = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) throw examError;
      setExam(examData);
      setTimeRemaining(examData.duration_minutes * 60);

      // Check if already attempted
      const { data: existingAttempt } = await supabase
        .from("exam_attempts")
        .select("id")
        .eq("exam_id", examId)
        .eq("user_id", session.user.id)
        .single();

      if (existingAttempt) {
        toast({
          title: "Already Attempted",
          description: "You have already taken this exam",
          variant: "destructive"
        });
        navigate("/exam");
        return;
      }

      // Fetch all questions and randomize
      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId);

      if (questionsError) throw questionsError;

      // Randomly select required number of questions
      const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, examData.total_questions);
      setQuestions(selectedQuestions);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      navigate("/exam");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please allow camera permissions.",
        variant: "destructive"
      });
    }
  };

  const captureSnapshot = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.8);
      }
    }
    return null;
  };

  const handlePledgeAccept = () => {
    if (!pledgeAccepted) {
      toast({
        title: "Pledge Required",
        description: "Please accept the integrity pledge to continue",
        variant: "destructive"
      });
      return;
    }
    setShowPledge(false);
    setShowCamera(true);
    startCamera();
  };

  const handleCameraCapture = async () => {
    const snapshot = captureSnapshot();
    if (!snapshot) {
      toast({
        title: "Error",
        description: "Unable to capture photo. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setStartSnapshot(snapshot);
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    // Create exam attempt
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { data: attemptData, error } = await supabase
      .from("exam_attempts")
      .insert({
        exam_id: examId,
        user_id: user.id,
        student_name: profileData?.full_name || user.email || "Student",
        total_questions: exam!.total_questions,
        integrity_pledge_accepted: true,
        start_snapshot_url: snapshot
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setAttemptId(attemptData.id);
    setShowCamera(false);
  };

  const handleAnswerSelect = (questionId: string, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!attemptId) return;

    try {
      // Calculate score
      let correctCount = 0;
      let wrongCount = 0;
      
      // Save answers
      for (const question of questions) {
        const selectedOption = answers[question.id];
        const isCorrect = selectedOption === question.correct_option;
        
        if (selectedOption) {
          if (isCorrect) correctCount++;
          else wrongCount++;

          await supabase.from("exam_answers").insert({
            attempt_id: attemptId,
            question_id: question.id,
            selected_option: selectedOption,
            is_correct: isCorrect
          });
        }
      }

      const unansweredCount = questions.length - correctCount - wrongCount;
      const score = Math.round((correctCount / questions.length) * 100);

      // Capture end snapshot
      await startCamera();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const endSnapshot = captureSnapshot();

      // Update attempt with final scores
      await supabase
        .from("exam_attempts")
        .update({
          end_time: new Date().toISOString(),
          score,
          correct_answers: correctCount,
          wrong_answers: wrongCount,
          unanswered: unansweredCount,
          end_snapshot_url: endSnapshot
        })
        .eq("id", attemptId);

      toast({
        title: "Exam Submitted",
        description: `You scored ${score}%`,
      });

      navigate(`/exam/${examId}/results/${attemptId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <CustomLoader />;
  }

  // Integrity Pledge Dialog
  if (showPledge) {
    return (
      <AlertDialog open={showPledge}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Integrity Pledge
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-4">
              <p className="font-semibold text-foreground">
                Before starting the exam, please read and accept the following:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>I will not use any external help or resources during the exam</li>
                <li>I will not communicate with others during the exam</li>
                <li>I understand that my camera will capture photos at the start and end</li>
                <li>I will complete the exam honestly and independently</li>
                <li>I understand that this is a one-time attempt</li>
              </ul>
              
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox 
                  id="pledge" 
                  checked={pledgeAccepted}
                  onCheckedChange={(checked) => setPledgeAccepted(checked as boolean)}
                />
                <label
                  htmlFor="pledge"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept and agree to follow the integrity pledge
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => navigate("/exam")}>
              Cancel
            </Button>
            <Button onClick={handlePledgeAccept}>
              Continue
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Camera Capture Dialog
  if (showCamera) {
    return (
      <AlertDialog open={showCamera}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Camera className="h-6 w-6 inline mr-2" />
              Take Your Photo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please position yourself in front of the camera and capture your photo
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            <Button onClick={handleCameraCapture} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Timer */}
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{exam?.title}</h1>
              <p className="text-sm opacity-90">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-bold">
                <Clock className="h-5 w-5" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm opacity-90">Time Remaining</p>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </div>

      {/* Question Area */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQuestion?.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            >
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div
                    key={option}
                    className={`
                      flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${answers[currentQuestion?.id] === option 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <RadioGroupItem value={option} id={`option-${option}`} />
                    <Label 
                      htmlFor={`option-${option}`} 
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-semibold mr-2">{option}.</span>
                      {currentQuestion[`option_${option.toLowerCase()}` as keyof Question]}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Answered: {Object.keys(answers).length} / {questions.length}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Exam
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Grid */}
        <Card className="max-w-4xl mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={index === currentQuestionIndex ? "default" : "outline"}
                  size="sm"
                  className={`
                    ${answers[q.id] ? 'bg-green-100 border-green-500 hover:bg-green-200' : ''}
                    ${index === currentQuestionIndex ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamTake;