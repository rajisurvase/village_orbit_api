import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { ContactUs } from "@/services/feedbackService";

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, {
      message: "Please enter a valid 10-digit mobile number",
    }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, { message: "Subject must be at least 3 characters" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  villageId?: string;
}

const ContactForm = ({ villageId }: ContactFormProps) => {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ContactUs,
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    mutateAsync(data, {
      onSuccess: () => {
        toast({
          title: "Message sent successfully!",
          description: "We'll respond to your query within 2-3 business days.",
        });
        form.reset();
        setIsSuccess(true);
      },

      onError: () => {
        toast({
          title: "Failed to send message",
          description: "Please try again or contact us directly by phone.",
          variant: "destructive",
        });
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="bg-success/10 rounded-full p-6 mb-6 animate-scale-in">
          <CheckCircle2 className="h-16 w-16 text-success" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-success">
          Message Sent Successfully!
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Thank you for contacting us. We've received your message and will
          respond within 2-3 business days.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contact.name")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("contact.enterName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contact.phone")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("contact.enterPhone")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contact.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("contact.enterEmail")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contact.subject")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("contact.enterSubject")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contact.message")} *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("contact.enterMessage")}
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2" disabled={isPending}>
          {isPending ? (
            <>Sending...</>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t("contact.submit")}
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          {t("contact.urgentNote")}
        </p>
      </form>
    </Form>
  );
};

export default ContactForm;
