-- Create a security definer function to check if user has student role
CREATE OR REPLACE FUNCTION public.is_student(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'student'
  )
$$;

-- Create a function to check if a student can attempt a specific exam (combines role and standard check)
CREATE OR REPLACE FUNCTION public.can_attempt_exam(p_user_id uuid, p_exam_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
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
  
  RETURN v_is_eligible;
END;
$$;

-- Drop existing permissive policies on exam_attempts if they exist
DROP POLICY IF EXISTS "Students can view their own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Students can create their own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Students can update their own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Allow user to read own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Allow user to insert own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Allow user to update own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Users can view own exam attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Users can insert own exam attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Users can update own exam attempts" ON public.exam_attempts;

-- Create strict RLS policies for exam_attempts
-- Only students can view their own attempts
CREATE POLICY "students_view_own_attempts" ON public.exam_attempts
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() AND public.is_student(auth.uid())
);

-- Only students can create attempts for exams they are eligible for
CREATE POLICY "students_create_attempts" ON public.exam_attempts
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND public.can_attempt_exam(auth.uid(), exam_id)
);

-- Only students can update their own in-progress attempts
CREATE POLICY "students_update_own_attempts" ON public.exam_attempts
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() 
  AND public.is_student(auth.uid())
  AND status IN ('NOT_STARTED', 'IN_PROGRESS')
);

-- Admin can view all attempts
CREATE POLICY "admins_view_all_attempts" ON public.exam_attempts
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'sub_admin')
);

-- Admin can update any attempt (for reset functionality)
CREATE POLICY "admins_update_attempts" ON public.exam_attempts
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'sub_admin')
);

-- Drop existing policies on exam_answers
DROP POLICY IF EXISTS "Students can view their own answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Students can insert their own answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Students can update their own answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Users can view own exam answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Users can insert own exam answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Users can update own exam answers" ON public.exam_answers;

-- Create strict RLS policies for exam_answers
-- Only students can view their own answers
CREATE POLICY "students_view_own_answers" ON public.exam_answers
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts ea
    WHERE ea.id = attempt_id 
    AND ea.user_id = auth.uid()
    AND public.is_student(auth.uid())
  )
);

-- Only students can insert answers for their own attempts
CREATE POLICY "students_insert_answers" ON public.exam_answers
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exam_attempts ea
    WHERE ea.id = attempt_id 
    AND ea.user_id = auth.uid()
    AND ea.status IN ('NOT_STARTED', 'IN_PROGRESS')
    AND public.is_student(auth.uid())
  )
);

-- Only students can update their own answers
CREATE POLICY "students_update_answers" ON public.exam_answers
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts ea
    WHERE ea.id = attempt_id 
    AND ea.user_id = auth.uid()
    AND ea.status IN ('NOT_STARTED', 'IN_PROGRESS')
    AND public.is_student(auth.uid())
  )
);

-- Admin can view all answers
CREATE POLICY "admins_view_all_answers" ON public.exam_answers
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'sub_admin')
);

-- Admin can delete answers (for reset)
CREATE POLICY "admins_delete_answers" ON public.exam_answers
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'sub_admin')
);