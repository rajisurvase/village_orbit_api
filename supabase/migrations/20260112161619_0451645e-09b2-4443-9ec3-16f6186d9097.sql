-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "students_update_own_attempts" ON public.exam_attempts;

-- Create a new policy that allows students to:
-- 1. Update while status is NOT_STARTED or IN_PROGRESS (normal flow)
-- 2. Submit exam (transition from IN_PROGRESS to SUBMITTED)
CREATE POLICY "students_update_own_attempts" 
ON public.exam_attempts 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  AND is_student(auth.uid()) 
  AND status IN ('NOT_STARTED', 'IN_PROGRESS')
)
WITH CHECK (
  user_id = auth.uid() 
  AND is_student(auth.uid()) 
  AND status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED')
);