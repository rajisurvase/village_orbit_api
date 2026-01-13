import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageSquare } from 'lucide-react';
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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all duration-500 z-40 touch-target"
          style={{ backgroundColor: bgColor }}
          size="icon"
          aria-label="Open feedback form"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="w-[calc(100%-2rem)] max-w-[500px] mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-lg"
      >
        <DialogHeader className="space-y-2 pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground">
            Share Your Feedback
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            We value your input! Share your feedback, suggestions, or complaints to help us improve.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm sm:text-base font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-xs sm:text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Mobile Field */}
          <div className="space-y-1.5">
            <Label htmlFor="mobile" className="text-sm sm:text-base font-medium">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobile"
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              {...register('mobile')}
              aria-invalid={errors.mobile ? 'true' : 'false'}
            />
            {errors.mobile && (
              <p className="text-xs sm:text-sm text-destructive">{errors.mobile.message}</p>
            )}
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">
              Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(value) => setValue('type', value as any)}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <div className="flex items-center space-x-2 min-w-fit">
                <RadioGroupItem 
                  value="feedback" 
                  id="feedback" 
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <Label 
                  htmlFor="feedback" 
                  className="cursor-pointer font-normal text-sm sm:text-base whitespace-nowrap"
                >
                  Feedback
                </Label>
              </div>
              <div className="flex items-center space-x-2 min-w-fit">
                <RadioGroupItem 
                  value="suggestion" 
                  id="suggestion"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <Label 
                  htmlFor="suggestion" 
                  className="cursor-pointer font-normal text-sm sm:text-base whitespace-nowrap"
                >
                  Suggestion
                </Label>
              </div>
              <div className="flex items-center space-x-2 min-w-fit">
                <RadioGroupItem 
                  value="complaint" 
                  id="complaint"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <Label 
                  htmlFor="complaint" 
                  className="cursor-pointer font-normal text-sm sm:text-base whitespace-nowrap"
                >
                  Complaint
                </Label>
              </div>
            </RadioGroup>
            {errors.type && (
              <p className="text-xs sm:text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm sm:text-base font-medium">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Share your thoughts in detail..."
              rows={4}
              maxLength={1000}
              className="w-full min-h-[100px] sm:min-h-[120px] text-sm sm:text-base resize-y"
              {...register('message')}
              aria-invalid={errors.message ? 'true' : 'false'}
            />
            {errors.message && (
              <p className="text-xs sm:text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:flex-1 h-10 sm:h-11 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full sm:flex-1 h-10 sm:h-11 text-sm sm:text-base"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
