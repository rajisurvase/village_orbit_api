import { useState, useContext, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageSquare, Instagram, Facebook, Share2, Copy, MessageCircle, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

interface SocialConfig {
  instagram?: string;
  facebook?: string;
  shareUrl?: string;
  enabled?: {
    instagram?: boolean;
    facebook?: boolean;
    share?: boolean;
  };
}

interface FeedbackFormWithShareProps {
  socialConfig?: SocialConfig;
  pageTitle?: string;
  onShare?: (info: { method: string; url: string }) => void;
}

const FeedbackFormWithShare = ({ socialConfig: propSocialConfig, pageTitle: propTitle, onShare }: FeedbackFormWithShareProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareFallback, setShowShareFallback] = useState(false);
  const [iconsVisible, setIconsVisible] = useState(false);
  const { config } = useContext(VillageContext);
  const { t } = useTranslation();
  const isFooterVisible = useFooterVisibility();

  // Get social config from props or village config
  const socialConfig: SocialConfig = propSocialConfig || (config?.social as SocialConfig) || {};
  const pageTitle = propTitle || (config as any)?.villageName || document.title;

  // Debug logging
  console.log('FeedbackFormWithShare - config:', config);
  console.log('FeedbackFormWithShare - socialConfig:', socialConfig);

  // Determine enabled state for each icon
  const isInstagramEnabled = socialConfig.enabled?.instagram !== false && !!socialConfig.instagram;
  const isFacebookEnabled = socialConfig.enabled?.facebook !== false && !!socialConfig.facebook;
  const isShareEnabled = socialConfig.enabled?.share !== false && !!socialConfig.shareUrl;
  const showAnyIcon = isInstagramEnabled || isFacebookEnabled || isShareEnabled;

  const shareUrl = socialConfig.shareUrl || window.location.href;

  // Dynamic colors based on footer visibility
  const bgColor = isFooterVisible ? "#32D26C" : "#0B5C38";
  const iconBgClass = isFooterVisible ? 'bg-[#32D26C] hover:bg-[#2BC060]' : 'bg-[#0F5C3D] hover:bg-[#0D4F34]';

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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setTimeout(() => setIconsVisible(true), 150);
    } else {
      setIconsVisible(false);
    }
  };

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
        title: t('submittedSuccessfully', 'Submitted Successfully!'),
        description: t('feedbackSubmitDesc', `Your ${data.type} has been submitted. We'll review it soon.`),
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: t('submissionFailed', 'Submission Failed'),
        description: t('tryAgainLater', 'Please try again later.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle external link click - direct function with event handling
  const handleExternalLink = (e: React.MouseEvent, url: string | undefined, platform: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('handleExternalLink called:', { url, platform });
    
    const trimmedUrl = url?.trim();
    if (!trimmedUrl || trimmedUrl === '') {
      toast({
        title: t('pageNotAvailable', 'Page not available'),
        description: t('linkNotConfigured', 'This link is not configured yet.'),
        variant: 'destructive',
      });
      return;
    }
    
    const sanitizedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    console.log('Opening URL:', sanitizedUrl);
    
    // Use direct window.open
    const newWindow = window.open(sanitizedUrl, '_blank');
    if (!newWindow) {
      // Fallback: create anchor and click
      const a = document.createElement('a');
      a.href = sanitizedUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    onShare?.({ method: platform, url: sanitizedUrl });
  };

  // Handle share click
  const handleShare = useCallback(async () => {
    const shareData = {
      title: pageTitle,
      text: t('checkOutVillage', 'Check out our village website!'),
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        onShare?.({ method: 'native', url: shareUrl });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowShareFallback(true);
        }
      }
    } else {
      setShowShareFallback(true);
    }
  }, [pageTitle, shareUrl, t, onShare]);

  // Copy to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: t('linkCopied', 'Link copied!'),
        description: t('linkCopiedDesc', 'The link has been copied to your clipboard.'),
      });
      onShare?.({ method: 'copy', url: shareUrl });
      setShowShareFallback(false);
    } catch {
      toast({
        title: t('copyFailed', 'Copy failed'),
        variant: 'destructive',
      });
    }
  }, [shareUrl, t, onShare]);

  // Share via WhatsApp
  const handleWhatsAppShare = useCallback(() => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${pageTitle} - ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onShare?.({ method: 'whatsapp', url: shareUrl });
    setShowShareFallback(false);
  }, [pageTitle, shareUrl, onShare]);

  // Share via Facebook
  const handleFacebookShare = useCallback(() => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
    onShare?.({ method: 'facebook-share', url: shareUrl });
    setShowShareFallback(false);
  }, [shareUrl, onShare]);

  return (
    <>
      {/* Main Feedback Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {/* Floating Trigger Button */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all duration-500 z-40"
          style={{ backgroundColor: bgColor }}
          size="icon"
          onClick={() => handleOpenChange(true)}
          aria-label={t('openFeedback', 'Open feedback form')}
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>

        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('shareFeedback', 'Share Your Feedback')}</DialogTitle>
            <DialogDescription>
              {t('feedbackDescription', "We value your input! Share your feedback, suggestions, or complaints to help us improve.")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('name', 'Name')} *</Label>
              <Input
                id="name"
                placeholder={t('yourFullName', 'Your full name')}
                {...register('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile">{t('mobileNumber', 'Mobile Number')} *</Label>
              <Input
                id="mobile"
                placeholder={t('tenDigitMobile', '10-digit mobile number')}
                maxLength={10}
                {...register('mobile')}
                aria-invalid={errors.mobile ? 'true' : 'false'}
              />
              {errors.mobile && (
                <p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>
              )}
            </div>

            <div>
              <Label>{t('type', 'Type')} *</Label>
              <RadioGroup
                value={selectedType}
                onValueChange={(value) => setValue('type', value as any)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feedback" id="feedback" />
                  <Label htmlFor="feedback" className="cursor-pointer font-normal">
                    {t('feedback', 'Feedback')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suggestion" id="suggestion" />
                  <Label htmlFor="suggestion" className="cursor-pointer font-normal">
                    {t('suggestion', 'Suggestion')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="complaint" id="complaint" />
                  <Label htmlFor="complaint" className="cursor-pointer font-normal">
                    {t('complaint', 'Complaint')}
                  </Label>
                </div>
              </RadioGroup>
              {errors.type && (
                <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message">{t('message', 'Message')} *</Label>
              <Textarea
                id="message"
                placeholder={t('shareThoughts', 'Share your thoughts in detail...')}
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
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? t('submitting', 'Submitting...') : t('submit', 'Submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Social Icons - Rendered via Portal above dialog */}
      {open && iconsVisible && showAnyIcon && createPortal(
        <div 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center gap-4 pointer-events-auto"
          role="group"
          aria-label={t('socialLinks', 'Social media links')}
          style={{ zIndex: 9999 }}
        >
          {isInstagramEnabled && (
            <button
              type="button"
              onClick={(e) => handleExternalLink(e, socialConfig.instagram, 'instagram')}
              aria-label={t('openInstagram', 'Open Instagram')}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full ${iconBgClass} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary animate-fade-in pointer-events-auto cursor-pointer`}
              style={{ animationDelay: '0ms', pointerEvents: 'auto' }}
            >
              <Instagram className="h-5 w-5 text-white pointer-events-none" />
            </button>
          )}

          {isFacebookEnabled && (
            <button
              type="button"
              onClick={(e) => handleExternalLink(e, socialConfig.facebook, 'facebook')}
              aria-label={t('openFacebook', 'Open Facebook')}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full ${iconBgClass} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary animate-fade-in pointer-events-auto cursor-pointer`}
              style={{ animationDelay: '50ms', pointerEvents: 'auto' }}
            >
              <Facebook className="h-5 w-5 text-white pointer-events-none" />
            </button>
          )}

          {isShareEnabled && (
            <button
              type="button"
              onClick={(e) => handleExternalLink(e, socialConfig.shareUrl, 'share')}
              aria-label={t('shareProfile', 'Share this profile')}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full ${iconBgClass} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary animate-fade-in pointer-events-auto cursor-pointer`}
              style={{ animationDelay: '100ms', pointerEvents: 'auto' }}
            >
              <Share2 className="h-5 w-5 text-white pointer-events-none" />
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Share Fallback Modal */}
      <Dialog open={showShareFallback} onOpenChange={setShowShareFallback}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('share', 'Share')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={handleCopyLink}>
              <Copy className="h-5 w-5" />
              {t('copyLink', 'Copy Link')}
            </Button>

            <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={handleWhatsAppShare}>
              <MessageCircle className="h-5 w-5 text-green-600" />
              {t('shareWhatsApp', 'Share via WhatsApp')}
            </Button>

            <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={handleFacebookShare}>
              <Facebook className="h-5 w-5 text-blue-600" />
              {t('shareFacebook', 'Share on Facebook')}
            </Button>

            <div className="border rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <QrCode className="h-5 w-5" />
                <span className="font-medium">{t('scanQR', 'Scan QR Code')}</span>
              </div>
              <div className="bg-white p-3 rounded-lg inline-block">
                <img 
                  src={`https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(shareUrl)}&choe=UTF-8`}
                  alt="QR Code" 
                  className="w-[150px] h-[150px]"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 break-all">{shareUrl}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackFormWithShare;
