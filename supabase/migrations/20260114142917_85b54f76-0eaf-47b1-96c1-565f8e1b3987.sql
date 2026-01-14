-- Add allow_reattempt_till_end_date column to exams table
-- When TRUE, students can reattempt until the exam end date (latest attempt is final)
-- When FALSE (default), students can only attempt once (existing behavior)
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS allow_reattempt_till_end_date BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.exams.allow_reattempt_till_end_date IS 'When TRUE, allows students to reattempt the exam multiple times until ends_at. Latest attempt overwrites previous. When FALSE, only one attempt is allowed.';

-- Create or replace function to check if student can attempt exam with reattempt logic
CREATE OR REPLACE FUNCTION public.can_student_reattempt_exam(p_user_id uuid, p_exam_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exam RECORD;
  v_existing_attempt RECORD;
  v_is_student BOOLEAN;
  v_is_eligible BOOLEAN;
BEGIN
  -- Check if user has student role
  SELECT public.is_student(p_user_id) INTO v_is_student;
  IF NOT v_is_student THEN
    RETURN FALSE;
  END IF;
  
  -- Check if student is eligible based on standard
  SELECT public.is_student_eligible_for_exam(p_user_id, p_exam_id) INTO v_is_eligible;
  IF NOT v_is_eligible THEN
    RETURN FALSE;
  END IF;
  
  -- Get exam details
  SELECT * INTO v_exam
  FROM public.exams
  WHERE id = p_exam_id;
  
  IF v_exam IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if exam is within schedule
  IF NOW() < v_exam.scheduled_at OR NOW() > v_exam.ends_at THEN
    RETURN FALSE;
  END IF;
  
  -- Check if exam status allows attempts
  IF v_exam.status NOT IN ('scheduled', 'active') THEN
    RETURN FALSE;
  END IF;
  
  -- Get latest attempt for this user and exam
  SELECT * INTO v_existing_attempt
  FROM public.exam_attempts
  WHERE exam_id = p_exam_id AND user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- No previous attempt - can attempt
  IF v_existing_attempt IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- If attempt is in progress, can continue
  IF v_existing_attempt.status = 'IN_PROGRESS' THEN
    RETURN TRUE;
  END IF;
  
  -- If not submitted yet, can continue
  IF v_existing_attempt.status = 'NOT_STARTED' THEN
    RETURN TRUE;
  END IF;
  
  -- If submitted and reattempt is allowed by admin (can_reattempt flag), allow
  IF v_existing_attempt.status = 'SUBMITTED' AND v_existing_attempt.can_reattempt = TRUE THEN
    RETURN TRUE;
  END IF;
  
  -- If submitted and exam allows reattempt till end date
  IF v_existing_attempt.status = 'SUBMITTED' AND v_exam.allow_reattempt_till_end_date = TRUE THEN
    RETURN TRUE;
  END IF;
  
  -- Otherwise, cannot attempt
  RETURN FALSE;
END;
$$;