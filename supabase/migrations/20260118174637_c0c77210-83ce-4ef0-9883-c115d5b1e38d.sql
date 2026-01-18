-- Allow both admin and sub_admin roles to create/update/delete exams while keeping public read policy intact.

DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;

CREATE POLICY "Admins and sub_admins can manage exams"
ON public.exams
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'admin'::public.app_role)
  OR has_role(auth.uid(), 'sub_admin'::public.app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::public.app_role)
  OR has_role(auth.uid(), 'sub_admin'::public.app_role)
);
