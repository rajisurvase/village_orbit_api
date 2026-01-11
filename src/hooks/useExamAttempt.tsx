import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  selected_option: string;
  time_taken_seconds: number;
}

interface AttemptState {
  id: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";
  remaining_time_seconds: number;
  shuffled_question_order: string[];
  last_activity_at: string;
}

interface UseExamAttemptReturn {
  attempt: AttemptState | null;
  questions: Question[];
  answers: Record<string, Answer>;
  currentQuestionIndex: number;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  loading: boolean;
  
  initializeAttempt: (examId: string, userId: string, studentName: string) => Promise<string | null>;
  loadExistingAttempt: (attemptId: string) => Promise<void>;
  saveAnswer: (questionId: string, selectedOption: string, timeTaken: number) => Promise<void>;
  updateRemainingTime: (seconds: number) => Promise<void>;
  startExam: () => Promise<void>;
  submitExam: () => Promise<{ score: number; correct: number; wrong: number; unanswered: number } | null>;
  setCurrentQuestionIndex: (index: number) => void;
}

export const useExamAttempt = (): UseExamAttemptReturn => {
  const { toast } = useToast();
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize a new attempt or get existing one
  const initializeAttempt = useCallback(async (
    examId: string,
    userId: string,
    studentName: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Check for existing attempt
      const { data: existingAttempt, error: fetchError } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("exam_id", examId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingAttempt) {
        // If completed and can't reattempt, return null
        if (existingAttempt.status === "SUBMITTED" && !existingAttempt.can_reattempt) {
          toast({
            title: "परीक्षा पूर्ण झाली",
            description: "तुम्ही ही परीक्षा आधीच दिली आहे",
            variant: "destructive"
          });
          return null;
        }
        
        // Return existing attempt
        return existingAttempt.id;
      }

      // Get exam details
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("total_questions, duration_minutes, shuffle_questions")
        .eq("id", examId)
        .single();

      if (examError) throw examError;

      // Get questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select("id")
        .eq("exam_id", examId);

      if (questionsError) throw questionsError;

      // Create shuffled order
      let questionIds = questionsData.map(q => q.id);
      if (examData.shuffle_questions !== false) {
        questionIds = questionIds.sort(() => Math.random() - 0.5);
      }
      questionIds = questionIds.slice(0, examData.total_questions);

      // Create new attempt
      const { data: newAttempt, error: createError } = await supabase
        .from("exam_attempts")
        .insert({
          exam_id: examId,
          user_id: userId,
          student_name: studentName,
          total_questions: examData.total_questions,
          status: "NOT_STARTED",
          remaining_time_seconds: examData.duration_minutes * 60,
          shuffled_question_order: questionIds,
          integrity_pledge_accepted: false
        })
        .select()
        .single();

      if (createError) throw createError;

      return newAttempt.id;
    } catch (error: any) {
      console.error("Error initializing attempt:", error);
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load existing attempt with answers
  const loadExistingAttempt = useCallback(async (attemptId: string) => {
    try {
      setLoading(true);

      // Fetch attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (attemptError) throw attemptError;

      const statusValue = attemptData.status as "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" || "NOT_STARTED";
      setAttempt({
        id: attemptData.id,
        status: statusValue,
        remaining_time_seconds: attemptData.remaining_time_seconds || 0,
        shuffled_question_order: attemptData.shuffled_question_order || [],
        last_activity_at: attemptData.last_activity_at
      });

      // Fetch questions in shuffled order
      if (attemptData.shuffled_question_order?.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from("exam_questions")
          .select("*")
          .in("id", attemptData.shuffled_question_order);

        if (questionsError) throw questionsError;

        // Sort by shuffled order
        const orderedQuestions = attemptData.shuffled_question_order
          .map((id: string) => questionsData.find(q => q.id === id))
          .filter(Boolean);

        setQuestions(orderedQuestions);
      }

      // Fetch existing answers
      const { data: answersData, error: answersError } = await supabase
        .from("exam_answers")
        .select("question_id, selected_option, time_taken_seconds")
        .eq("attempt_id", attemptId);

      if (answersError) throw answersError;

      const answersMap: Record<string, Answer> = {};
      answersData?.forEach(a => {
        answersMap[a.question_id] = {
          question_id: a.question_id,
          selected_option: a.selected_option || "",
          time_taken_seconds: a.time_taken_seconds || 0
        };
      });
      setAnswers(answersMap);

      // Find first unanswered question
      if (attemptData.shuffled_question_order) {
        const firstUnanswered = attemptData.shuffled_question_order.findIndex(
          (id: string) => !answersMap[id]
        );
        if (firstUnanswered >= 0) {
          setCurrentQuestionIndex(firstUnanswered);
        }
      }
    } catch (error: any) {
      console.error("Error loading attempt:", error);
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Save answer with debounce
  const saveAnswer = useCallback(async (
    questionId: string,
    selectedOption: string,
    timeTaken: number
  ) => {
    if (!attempt?.id) return;

    // Update local state immediately
    setAnswers(prev => ({
      ...prev,
      [questionId]: { question_id: questionId, selected_option: selectedOption, time_taken_seconds: timeTaken }
    }));

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");

    // Debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Get correct answer for validation
        const question = questions.find(q => q.id === questionId);
        const isCorrect = question ? selectedOption === question.correct_option : false;

        const { error } = await supabase
          .from("exam_answers")
          .upsert({
            attempt_id: attempt.id,
            question_id: questionId,
            selected_option: selectedOption,
            is_correct: isCorrect,
            time_taken_seconds: timeTaken,
            answered_at: new Date().toISOString()
          }, {
            onConflict: "attempt_id,question_id"
          });

        if (error) throw error;

        // Update attempt last activity
        await supabase
          .from("exam_attempts")
          .update({ last_activity_at: new Date().toISOString() })
          .eq("id", attempt.id);

        setSaveStatus("saved");
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving answer:", error);
        setSaveStatus("error");
      }
    }, 500);
  }, [attempt?.id, questions]);

  // Update remaining time
  const updateRemainingTime = useCallback(async (seconds: number) => {
    if (!attempt?.id) return;

    try {
      await supabase
        .from("exam_attempts")
        .update({ remaining_time_seconds: seconds })
        .eq("id", attempt.id);

      setAttempt(prev => prev ? { ...prev, remaining_time_seconds: seconds } : null);
    } catch (error) {
      console.error("Error updating time:", error);
    }
  }, [attempt?.id]);

  // Start exam (update status)
  const startExam = useCallback(async () => {
    if (!attempt?.id) return;

    try {
      const { error } = await supabase
        .from("exam_attempts")
        .update({
          status: "IN_PROGRESS",
          start_time: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        })
        .eq("id", attempt.id);

      if (error) throw error;

      setAttempt(prev => prev ? { ...prev, status: "IN_PROGRESS" } : null);
    } catch (error: any) {
      console.error("Error starting exam:", error);
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [attempt?.id, toast]);

  // Submit exam
  const submitExam = useCallback(async () => {
    if (!attempt?.id) return null;

    try {
      setLoading(true);

      // Calculate score
      let correct = 0;
      let wrong = 0;

      for (const question of questions) {
        const answer = answers[question.id];
        if (answer?.selected_option) {
          if (answer.selected_option === question.correct_option) {
            correct++;
          } else {
            wrong++;
          }
        }
      }

      const unanswered = questions.length - correct - wrong;
      const score = Math.round((correct / questions.length) * 100);

      // Update attempt
      const { error } = await supabase
        .from("exam_attempts")
        .update({
          status: "SUBMITTED",
          end_time: new Date().toISOString(),
          score,
          correct_answers: correct,
          wrong_answers: wrong,
          unanswered,
          can_reattempt: false
        })
        .eq("id", attempt.id);

      if (error) throw error;

      setAttempt(prev => prev ? { ...prev, status: "SUBMITTED" } : null);

      return { score, correct, wrong, unanswered };
    } catch (error: any) {
      console.error("Error submitting exam:", error);
      toast({
        title: "त्रुटी",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [attempt?.id, questions, answers, toast]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    attempt,
    questions,
    answers,
    currentQuestionIndex,
    saveStatus,
    lastSaved,
    loading,
    initializeAttempt,
    loadExistingAttempt,
    saveAnswer,
    updateRemainingTime,
    startExam,
    submitExam,
    setCurrentQuestionIndex
  };
};
