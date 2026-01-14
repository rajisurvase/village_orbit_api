import { useState, useEffect, useRef, useCallback } from "react";
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
import { Clock, Camera, Send, AlertTriangle } from "lucide-react";
import CustomLoader from "@/components/CustomLoader";
import ExamInstructionsMarathi from "@/components/exam/ExamInstructionsMarathi";
import AutoSaveIndicator from "@/components/exam/AutoSaveIndicator";

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
  shuffle_questions: boolean;
  from_standard: string | null;
  to_standard: string | null;
  scheduled_at: string;
  ends_at: string;
  status: string;
  allow_reattempt_till_end_date: boolean;
}

interface ExamAttempt {
  id: string;
  status: string;
  remaining_time_seconds: number;
  shuffled_question_order: string[];
  can_reattempt: boolean;
  integrity_pledge_accepted: boolean;
}

const ExamTake = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<string>("NOT_STARTED");
  
  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Integrity check states
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPledge, setShowPledge] = useState(false);
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [startSnapshot, setStartSnapshot] = useState<string | null>(null);
  
  // Confirmation dialog
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    initializeExam();
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [examId]);

  // Start timer when exam is in progress
  useEffect(() => {
    if (timeRemaining > 0 && attemptStatus === "IN_PROGRESS" && !showPledge && !showCamera && !showInstructions) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          // Save remaining time every 30 seconds
          if (prev % 30 === 0 && attemptId) {
            saveRemainingTime(prev - 1);
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [timeRemaining, attemptStatus, showPledge, showCamera, showInstructions, attemptId]);

  const saveRemainingTime = async (time: number) => {
    if (!attemptId) return;
    await supabase
      .from("exam_attempts")
      .update({ remaining_time_seconds: time, last_activity_at: new Date().toISOString() })
      .eq("id", attemptId);
  };

  const initializeExam = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Check if user has student role (backend enforcement)
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      
      const roles = rolesData?.map(r => r.role) || [];
      const isStudent = roles.includes("student");
      
      if (!isStudent) {
        toast({
          title: "प्रवेश नाकारला",
          description: "परीक्षा देण्यासाठी तुम्हाला 'विद्यार्थी' भूमिका आवश्यक आहे. कृपया प्रशासकाशी संपर्क साधा.",
          variant: "destructive"
        });
        navigate("/exam");
        return;
      }

      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) throw examError;
      setExam(examData);

      // Check if exam is within schedule
      const now = new Date();
      const scheduledAt = new Date(examData.scheduled_at);
      const endsAt = new Date(examData.ends_at);

      if (now < scheduledAt) {
        toast({
          title: "परीक्षा अद्याप सुरू झालेली नाही",
          description: "कृपया निर्धारित वेळेनंतर पुन्हा प्रयत्न करा",
          variant: "destructive"
        });
        navigate("/exam");
        return;
      }

      if (now > endsAt) {
        toast({
          title: "परीक्षेची वेळ संपली",
          description: "ही परीक्षा आता उपलब्ध नाही",
          variant: "destructive"
        });
        navigate("/exam");
        return;
      }

      // Check student eligibility based on standard
      const { data: profileData } = await supabase
        .from("profiles")
        .select("standard, full_name")
        .eq("id", session.user.id)
        .single();

      // Validate standard eligibility
      if (examData.from_standard || examData.to_standard) {
        if (!profileData?.standard) {
          toast({
            title: "तुमची इयत्ता सेट केलेली नाही",
            description: "कृपया प्रशासकाशी संपर्क साधून तुमची इयत्ता सेट करा",
            variant: "destructive"
          });
          navigate("/exam");
          return;
        }
        
        const studentStandard = parseInt(profileData.standard.replace(/[^0-9]/g, '')) || 0;
        const fromStandard = examData.from_standard ? parseInt(examData.from_standard.replace(/[^0-9]/g, '')) || 0 : 0;
        const toStandard = examData.to_standard ? parseInt(examData.to_standard.replace(/[^0-9]/g, '')) || 12 : 12;

        if (studentStandard < fromStandard || studentStandard > toStandard) {
          toast({
            title: "तुम्ही या परीक्षेसाठी पात्र नाही",
            description: `ही परीक्षा ${examData.from_standard || "1st"} ते ${examData.to_standard || "12th"} इयत्तेच्या विद्यार्थ्यांसाठी आहे. तुमची इयत्ता: ${profileData.standard}`,
            variant: "destructive"
          });
          navigate("/exam");
          return;
        }
      }

      // Check for existing attempt (resume logic)
      const { data: existingAttempt } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("exam_id", examId)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingAttempt) {
        // Check if submitted
        if (existingAttempt.status === "SUBMITTED") {
          // Check if reattempt is allowed via exam setting
          const allowReattempt = examData.allow_reattempt_till_end_date === true;
          const canReattemptViaAdmin = existingAttempt.can_reattempt === true;
          
          if (!allowReattempt && !canReattemptViaAdmin) {
            toast({
              title: "परीक्षा आधीच दिली आहे",
              description: "तुम्ही ही परीक्षा आधीच पूर्ण केली आहे",
              variant: "destructive"
            });
            navigate("/exam");
            return;
          }
          
          // Allow reattempt - start fresh attempt
          if (allowReattempt || canReattemptViaAdmin) {
            // Create new attempt for reattempt
            await loadQuestions(examData.shuffle_questions, examData.total_questions);
            setTimeRemaining(examData.duration_minutes * 60);
            setLoading(false);
            return;
          }
        }

        // Resume existing attempt
        if (existingAttempt.status === "IN_PROGRESS" || existingAttempt.status === "NOT_STARTED") {
          setAttemptId(existingAttempt.id);
          setAttemptStatus(existingAttempt.status);
          setTimeRemaining(existingAttempt.remaining_time_seconds || examData.duration_minutes * 60);
          
          // Load previous answers
          const { data: previousAnswers } = await supabase
            .from("exam_answers")
            .select("question_id, selected_option")
            .eq("attempt_id", existingAttempt.id);

          if (previousAnswers) {
            const answersMap: Record<string, string> = {};
            previousAnswers.forEach(ans => {
              if (ans.selected_option) {
                answersMap[ans.question_id] = ans.selected_option;
              }
            });
            setAnswers(answersMap);
          }

          // Load shuffled question order if exists
          if (existingAttempt.shuffled_question_order && existingAttempt.shuffled_question_order.length > 0) {
            const { data: allQuestions } = await supabase
              .from("exam_questions")
              .select("*")
              .eq("exam_id", examId);

            if (allQuestions) {
              const orderedQuestions = existingAttempt.shuffled_question_order
                .map((qId: string) => allQuestions.find(q => q.id === qId))
                .filter(Boolean) as Question[];
              setQuestions(orderedQuestions);
            }
          } else {
            await loadQuestions(examData.shuffle_questions, examData.total_questions);
          }

          // If pledge was accepted, skip to exam
          if (existingAttempt.integrity_pledge_accepted) {
            setShowInstructions(false);
            setShowPledge(false);
            setShowCamera(false);
            
            // Update status to IN_PROGRESS if NOT_STARTED
            if (existingAttempt.status === "NOT_STARTED") {
              await supabase
                .from("exam_attempts")
                .update({ status: "IN_PROGRESS", last_activity_at: new Date().toISOString() })
                .eq("id", existingAttempt.id);
              setAttemptStatus("IN_PROGRESS");
            }
          }

          setLoading(false);
          return;
        }
      }

      // New attempt - load questions
      await loadQuestions(examData.shuffle_questions, examData.total_questions);
      setTimeRemaining(examData.duration_minutes * 60);

    } catch (error: any) {
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
      navigate("/exam");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (shuffle: boolean, totalQuestions: number) => {
    const { data: questionsData, error: questionsError } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId);

    if (questionsError) throw questionsError;

    let selectedQuestions = [...questionsData];
    
    if (shuffle) {
      selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());
    }
    
    selectedQuestions = selectedQuestions.slice(0, totalQuestions);
    setQuestions(selectedQuestions);
    
    return selectedQuestions;
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
        title: "कॅमेरा त्रुटी",
        description: "कॅमेरा वापरण्याची परवानगी द्या",
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

  const handleInstructionsAccept = () => {
    setShowInstructions(false);
    setShowPledge(true);
  };

  const handlePledgeAccept = () => {
    if (!pledgeAccepted) {
      toast({
        title: "प्रतिज्ञा आवश्यक",
        description: "कृपया सत्यनिष्ठा प्रतिज्ञा स्वीकारा",
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
        title: "त्रुटी",
        description: "फोटो घेता आला नाही. कृपया पुन्हा प्रयत्न करा.",
        variant: "destructive"
      });
      return;
    }

    setStartSnapshot(snapshot);
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    // Get profile data
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Create or update exam attempt with shuffled order
    const shuffledOrder = questions.map(q => q.id);
    
    if (attemptId) {
      // Update existing attempt
      await supabase
        .from("exam_attempts")
        .update({
          status: "IN_PROGRESS",
          integrity_pledge_accepted: true,
          start_snapshot_url: snapshot,
          shuffled_question_order: shuffledOrder,
          last_activity_at: new Date().toISOString()
        })
        .eq("id", attemptId);
      
      setAttemptStatus("IN_PROGRESS");
    } else {
      // Create new attempt
      const { data: attemptData, error } = await supabase
        .from("exam_attempts")
        .insert({
          exam_id: examId,
          user_id: user.id,
          student_name: profileData?.full_name || user.email || "Student",
          total_questions: exam!.total_questions,
          integrity_pledge_accepted: true,
          start_snapshot_url: snapshot,
          status: "IN_PROGRESS",
          remaining_time_seconds: exam!.duration_minutes * 60,
          shuffled_question_order: shuffledOrder
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "त्रुटी",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setAttemptId(attemptData.id);
      setAttemptStatus("IN_PROGRESS");
    }

    setShowCamera(false);
  };

  // Auto-save answer on selection
  const handleAnswerSelect = useCallback(async (questionId: string, option: string) => {
    const previousAnswer = answers[questionId];
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    
    if (!attemptId) return;
    
    // Calculate time taken for this question
    const timeTaken = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    
    setAutoSaveStatus('saving');
    
    try {
      // Use the save_exam_answer function for atomic save
      const { error } = await supabase.rpc('save_exam_answer', {
        p_attempt_id: attemptId,
        p_question_id: questionId,
        p_selected_option: option,
        p_time_taken_seconds: timeTaken
      });

      if (error) throw error;
      
      setAutoSaveStatus('saved');
      setLastSaveTime(new Date());
      
      // Reset question start time for next question
      questionStartTimeRef.current = Date.now();
    } catch (error: any) {
      console.error("Auto-save error:", error);
      setAutoSaveStatus('error');
      // Revert to previous answer on error
      if (previousAnswer) {
        setAnswers(prev => ({ ...prev, [questionId]: previousAnswer }));
      }
      toast({
        title: "सेव्ह करताना त्रुटी",
        description: "उत्तर सेव्ह होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.",
        variant: "destructive"
      });
    }
  }, [attemptId, answers, toast]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleAutoSubmit = async () => {
    toast({
      title: "वेळ संपला!",
      description: "परीक्षा आपोआप सबमिट होत आहे...",
    });
    await finalSubmitExam();
  };

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  const finalSubmitExam = async () => {
    if (!attemptId) return;

    try {
      // Calculate final score
      let correctCount = 0;
      let wrongCount = 0;
      
      for (const question of questions) {
        const selectedOption = answers[question.id];
        if (selectedOption) {
          if (selectedOption === question.correct_option) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      }

      const unansweredCount = questions.length - correctCount - wrongCount;
      const score = Math.round((correctCount / questions.length) * 100);

      // Update attempt with final scores
      await supabase
        .from("exam_attempts")
        .update({
          status: "SUBMITTED",
          end_time: new Date().toISOString(),
          score,
          correct_answers: correctCount,
          wrong_answers: wrongCount,
          unanswered: unansweredCount,
          remaining_time_seconds: 0,
          can_reattempt: false
        })
        .eq("id", attemptId);

      toast({
        title: "परीक्षा सबमिट झाली!",
        description: `तुमचे गुण: ${score}%`,
      });

      navigate(`/exam/${examId}/results/${attemptId}`);
    } catch (error: any) {
      toast({
        title: "त्रुटी",
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

  // Marathi Instructions
  if (showInstructions) {
    return (
      <ExamInstructionsMarathi 
        examTitle={exam?.title || ""}
        duration={exam?.duration_minutes || 0}
        totalQuestions={exam?.total_questions || 0}
        onAccept={handleInstructionsAccept}
        onCancel={() => navigate("/exam")}
      />
    );
  }

  // Integrity Pledge Dialog (Marathi)
  if (showPledge) {
    return (
      <AlertDialog open={showPledge}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              सत्यनिष्ठा प्रतिज्ञा
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-4">
              <p className="font-semibold text-foreground">
                परीक्षा सुरू करण्यापूर्वी, कृपया खालील वाचा आणि स्वीकारा:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>मी परीक्षेदरम्यान कोणतीही बाह्य मदत किंवा संसाधने वापरणार नाही</li>
                <li>मी परीक्षेदरम्यान इतरांशी संवाद साधणार नाही</li>
                <li>मला माहित आहे की माझा कॅमेरा सुरुवातीला आणि शेवटी फोटो घेईल</li>
                <li>मी परीक्षा प्रामाणिकपणे आणि स्वतंत्रपणे पूर्ण करेन</li>
                <li>मला माहित आहे की हा एकदाच प्रयत्न आहे</li>
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
                  मी सत्यनिष्ठा प्रतिज्ञा स्वीकारतो आणि त्याचे पालन करण्यास सहमत आहे
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => navigate("/exam")}>
              रद्द करा
            </Button>
            <Button onClick={handlePledgeAccept}>
              पुढे जा
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
              तुमचा फोटो घ्या
            </AlertDialogTitle>
            <AlertDialogDescription>
              कृपया कॅमेऱ्यासमोर बसा आणि तुमचा फोटो घ्या
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
              फोटो घ्या
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Submit Confirmation Dialog (Marathi)
  if (showSubmitConfirm) {
    return (
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              परीक्षा सबमिट करायची आहे का?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-foreground font-medium">
                तुम्ही खात्री आहात का की तुम्हाला परीक्षा सबमिट करायची आहे?
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p>उत्तर दिलेले प्रश्न: <strong>{Object.keys(answers).length}</strong></p>
                <p>एकूण प्रश्न: <strong>{questions.length}</strong></p>
                <p>उर्वरित वेळ: <strong>{formatTime(timeRemaining)}</strong></p>
              </div>
              <p className="text-destructive font-medium">
                ⚠️ एकदा सबमिट केल्यानंतर, तुम्ही उत्तरे बदलू शकणार नाही!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>
              मागे जा
            </Button>
            <Button onClick={finalSubmitExam} className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              सबमिट करा
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Timer */}
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{exam?.title}</h1>
              <p className="text-sm opacity-90">
                प्रश्न {currentQuestionIndex + 1} पैकी {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaveTime} />
              <div className="text-right">
                <div className={`flex items-center gap-2 text-lg font-bold ${timeRemaining < 300 ? 'text-red-300 animate-pulse' : ''}`}>
                  <Clock className="h-5 w-5" />
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm opacity-90">उर्वरित वेळ</p>
              </div>
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
                मागील
              </Button>
              
              <div className="text-sm text-muted-foreground">
                उत्तर दिलेले: {Object.keys(answers).length} / {questions.length}
              </div>

              {isLastQuestion ? (
                <Button onClick={handleSubmitClick} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  परीक्षा सबमिट करा
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  पुढील
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Grid */}
        <Card className="max-w-4xl mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-lg">प्रश्न मार्गदर्शक</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={index === currentQuestionIndex ? "default" : "outline"}
                  size="sm"
                  className={`
                    ${answers[q.id] ? 'bg-green-100 border-green-500 hover:bg-green-200 text-green-800' : ''}
                    ${index === currentQuestionIndex ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    questionStartTimeRef.current = Date.now();
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                <span>उत्तर दिलेले</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>सध्याचा प्रश्न</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border rounded"></div>
                <span>उत्तर न दिलेले</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamTake;
