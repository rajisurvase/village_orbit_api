import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageSquare, X } from 'lucide-react';
import { useFooterVisibility } from '@/hooks/useFooterVisibility';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VillageContext } from '@/context/VillageContextConfig';

const feedbackSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
  type: z.enum(['feedback', 'suggestion', 'complaint'], {
    required_error: 'Please select a type',
  }),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackForm = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { config } = useContext(VillageContext);
  const isFooterVisible = useFooterVisibility();

  // Dynamic colors based on footer visibility
  const bgColor = isFooterVisible ? "#32D26C" : "#0B5C38";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'feedback',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('feedback_submissions').insert({
        name: data.name,
        mobile: data.mobile,
        type: data.type,
        message: data.message,
        village_id: null,
        status: 'new',
      });

      if (error) throw error;

      toast({
        title: 'Submitted Successfully!',
        description: `Your ${data.type} has been submitted. We'll review it soon.`,
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all duration-500 z-40"
          style={{ backgroundColor: bgColor }}
          size="icon"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Feedback</DialogTitle>
          <DialogDescription>
            We value your input! Share your feedback, suggestions, or complaints to help us improve.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Your full name"
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              placeholder="10-digit mobile number"
              maxLength={10}
              {...register('mobile')}
              aria-invalid={errors.mobile ? 'true' : 'false'}
            />
            {errors.mobile && (
              <p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>
            )}
          </div>

          <div>
            <Label>Type *</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(value) => setValue('type', value as any)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feedback" id="feedback" />
                <Label htmlFor="feedback" className="cursor-pointer font-normal">
                  Feedback
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suggestion" id="suggestion" />
                <Label htmlFor="suggestion" className="cursor-pointer font-normal">
                  Suggestion
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complaint" id="complaint" />
                <Label htmlFor="complaint" className="cursor-pointer font-normal">
                  Complaint
                </Label>
              </div>
            </RadioGroup>
            {errors.type && (
              <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Share your thoughts in detail..."
              rows={5}
              maxLength={1000}
              {...register('message')}
              aria-invalid={errors.message ? 'true' : 'false'}
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
