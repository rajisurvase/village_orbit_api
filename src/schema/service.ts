import z from "zod";

export const AddServiceSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number")
    .optional(),
  description: z.string().max(1000).optional(),
  name: z.string().min(3, "Service name must be at least 3 characters").max(100),
  owner: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  hours: z.string().max(100).optional(),
  speciality: z.string().max(100).optional(),
});

export type AddServiceFormData = z.infer<typeof AddServiceSchema>;
