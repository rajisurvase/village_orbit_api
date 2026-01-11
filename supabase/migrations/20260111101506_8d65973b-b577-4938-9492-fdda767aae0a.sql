-- =====================================================
-- EXAM SYSTEM ENHANCEMENT MIGRATION
-- =====================================================

-- 1. Add 'student' role to the app_role enum if not exists
-- Note: We'll use the existing 'user' role and add student-specific fields

-- 2. Add new columns to profiles table for student information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS standard VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS school_name VARCHAR(255) DEFAULT NULL;

-- 3. Add new columns to exams table for standard range and shuffle config
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS from_standard VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS to_standard VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT TRUE;

-- 4. Add new columns to exam_attempts for enhanced state management
ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED')),
ADD COLUMN IF NOT EXISTS remaining_time_seconds INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS shuffled_question_order TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS can_reattempt BOOLEAN DEFAULT FALSE;

-- 5. Add time_taken column to exam_answers for tracking per-question time
ALTER TABLE public.exam_answers 
ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT 0;

-- 6. Create index for faster exam attempt lookups
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_exam ON public.exam_attempts(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON public.exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON public.exam_answers(attempt_id);

-- 7. Update the exam_attempts to have proper default for status
UPDATE public.exam_attempts 
SET status = 'SUBMITTED' 
WHERE end_time IS NOT NULL AND status IS NULL;

UPDATE public.exam_attempts 
SET status = 'IN_PROGRESS' 
WHERE end_time IS NULL AND status IS NULL;

-- 8. Create function to check if student is eligible for exam based on standard
CREATE OR REPLACE FUNCTION public.is_student_eligible_for_exam(
  p_user_id UUID,
  p_exam_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_standard VARCHAR(50);
  v_from_standard VARCHAR(50);
  v_to_standard VARCHAR(50);
  v_standard_order INTEGER;
  v_from_order INTEGER;
  v_to_order INTEGER;
BEGIN
  -- Get student's standard
  SELECT standard INTO v_student_standard
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Get exam's standard range
  SELECT from_standard, to_standard INTO v_from_standard, v_to_standard
  FROM public.exams
  WHERE id = p_exam_id;
  
  -- If exam has no standard restrictions, allow all
  IF v_from_standard IS NULL AND v_to_standard IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- If student has no standard set, deny
  IF v_student_standard IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Extract numeric value from standard (e.g., "7th" -> 7)
  v_standard_order := REGEXP_REPLACE(v_student_standard, '[^0-9]', '', 'g')::INTEGER;
  v_from_order := COALESCE(REGEXP_REPLACE(v_from_standard, '[^0-9]', '', 'g')::INTEGER, 0);
  v_to_order := COALESCE(REGEXP_REPLACE(v_to_standard, '[^0-9]', '', 'g')::INTEGER, 12);
  
  RETURN v_standard_order >= v_from_order AND v_standard_order <= v_to_order;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 9. Create function to check if exam is within valid time window
CREATE OR REPLACE FUNCTION public.is_exam_within_schedule(p_exam_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.exams
    WHERE id = p_exam_id
    AND NOW() >= scheduled_at
    AND NOW() <= ends_at
    AND (status = 'scheduled' OR status = 'active')
  )
$$;

-- 10. Create function to get or create exam attempt
CREATE OR REPLACE FUNCTION public.get_or_create_exam_attempt(
  p_user_id UUID,
  p_exam_id UUID,
  p_student_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_id UUID;
  v_exam RECORD;
  v_shuffled_order TEXT[];
  v_questions UUID[];
BEGIN
  -- Check for existing active attempt
  SELECT id INTO v_attempt_id
  FROM public.exam_attempts
  WHERE user_id = p_user_id 
  AND exam_id = p_exam_id
  AND (status = 'IN_PROGRESS' OR (status = 'NOT_STARTED' AND can_reattempt = TRUE));
  
  IF v_attempt_id IS NOT NULL THEN
    -- Update last activity
    UPDATE public.exam_attempts 
    SET last_activity_at = NOW()
    WHERE id = v_attempt_id;
    RETURN v_attempt_id;
  END IF;
  
  -- Check if already submitted without reattempt permission
  SELECT id INTO v_attempt_id
  FROM public.exam_attempts
  WHERE user_id = p_user_id 
  AND exam_id = p_exam_id
  AND status = 'SUBMITTED'
  AND can_reattempt = FALSE;
  
  IF v_attempt_id IS NOT NULL THEN
    RAISE EXCEPTION 'You have already attempted this exam';
  END IF;
  
  -- Get exam details
  SELECT * INTO v_exam
  FROM public.exams
  WHERE id = p_exam_id;
  
  -- Get question IDs
  SELECT ARRAY_AGG(id ORDER BY random()) INTO v_questions
  FROM public.exam_questions
  WHERE exam_id = p_exam_id;
  
  -- Limit to total_questions if needed
  IF array_length(v_questions, 1) > v_exam.total_questions THEN
    v_questions := v_questions[1:v_exam.total_questions];
  END IF;
  
  -- Convert to text array for storage
  v_shuffled_order := ARRAY(SELECT unnest(v_questions)::TEXT);
  
  -- If shuffle is disabled, sort by creation order
  IF NOT COALESCE(v_exam.shuffle_questions, TRUE) THEN
    SELECT ARRAY_AGG(id::TEXT ORDER BY created_at) INTO v_shuffled_order
    FROM public.exam_questions
    WHERE id = ANY(v_questions);
  END IF;
  
  -- Create new attempt
  INSERT INTO public.exam_attempts (
    exam_id,
    user_id,
    student_name,
    total_questions,
    status,
    remaining_time_seconds,
    shuffled_question_order,
    integrity_pledge_accepted
  ) VALUES (
    p_exam_id,
    p_user_id,
    p_student_name,
    v_exam.total_questions,
    'NOT_STARTED',
    v_exam.duration_minutes * 60,
    v_shuffled_order,
    FALSE
  )
  RETURNING id INTO v_attempt_id;
  
  RETURN v_attempt_id;
END;
$$;

-- 11. Create function to reset exam attempt (for admin reattempt feature)
CREATE OR REPLACE FUNCTION public.reset_exam_attempt(
  p_admin_user_id UUID,
  p_attempt_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_admin_user_id
    AND role IN ('admin', 'sub_admin')
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reset exam attempts';
  END IF;
  
  -- Delete existing answers
  DELETE FROM public.exam_answers WHERE attempt_id = p_attempt_id;
  
  -- Reset attempt
  UPDATE public.exam_attempts
  SET 
    status = 'NOT_STARTED',
    can_reattempt = TRUE,
    score = NULL,
    correct_answers = NULL,
    wrong_answers = NULL,
    unanswered = NULL,
    end_time = NULL,
    start_time = NOW(),
    remaining_time_seconds = (
      SELECT duration_minutes * 60 
      FROM public.exams 
      WHERE id = exam_attempts.exam_id
    ),
    shuffled_question_order = NULL
  WHERE id = p_attempt_id;
  
  RETURN TRUE;
END;
$$;

-- 12. Create function to save individual answer with auto-save
CREATE OR REPLACE FUNCTION public.save_exam_answer(
  p_attempt_id UUID,
  p_question_id UUID,
  p_selected_option TEXT,
  p_time_taken_seconds INTEGER DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_option TEXT;
  v_is_correct BOOLEAN;
BEGIN
  -- Get correct answer
  SELECT correct_option INTO v_correct_option
  FROM public.exam_questions
  WHERE id = p_question_id;
  
  v_is_correct := (p_selected_option = v_correct_option);
  
  -- Upsert answer
  INSERT INTO public.exam_answers (
    attempt_id,
    question_id,
    selected_option,
    is_correct,
    time_taken_seconds,
    answered_at
  ) VALUES (
    p_attempt_id,
    p_question_id,
    p_selected_option,
    v_is_correct,
    p_time_taken_seconds,
    NOW()
  )
  ON CONFLICT (attempt_id, question_id) 
  DO UPDATE SET
    selected_option = p_selected_option,
    is_correct = v_is_correct,
    time_taken_seconds = p_time_taken_seconds,
    answered_at = NOW();
  
  -- Update attempt last activity
  UPDATE public.exam_attempts
  SET last_activity_at = NOW()
  WHERE id = p_attempt_id;
  
  RETURN TRUE;
END;
$$;

-- 13. Add unique constraint for answer per question per attempt
ALTER TABLE public.exam_answers 
DROP CONSTRAINT IF EXISTS exam_answers_attempt_question_unique;

ALTER TABLE public.exam_answers 
ADD CONSTRAINT exam_answers_attempt_question_unique 
UNIQUE (attempt_id, question_id);

-- 14. Create RLS policies for new columns
-- Profiles: Allow admins to update standard and school_name
DROP POLICY IF EXISTS "Admins can update student info" ON public.profiles;
CREATE POLICY "Admins can update student info"
ON public.profiles
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'sub_admin'::app_role) OR
  has_role(auth.uid(), 'gramsevak'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'sub_admin'::app_role) OR
  has_role(auth.uid(), 'gramsevak'::app_role)
);