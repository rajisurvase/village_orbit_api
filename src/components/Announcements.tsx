import { Calendar, Clock, AlertCircle, Users, FileText, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useTranslation } from 'react-i18next';

const Announcements = ({announcements}) => {
  const { t } = useTranslation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Users className="h-5 w-5" />;
      case "development":
        return <FileText className="h-5 w-5" />;
      case "scheme":
        return <Megaphone className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "text-primary";
      case "development":
        return "text-success";
      case "scheme":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays === -1) return "Yesterday";
    return `${Math.abs(diffDays)} days ago`;
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gradient">
            {t('announcements.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            {t('announcements.description')}
          </p>
        </div>

        {/* Announcements Carousel */}
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <Carousel className="w-full" opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4">
              {announcements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((announcement, index) => (
                  <CarouselItem key={announcement.id} className="pl-2 sm:pl-3 md:pl-4">
                    <Card className="card-elegant hover-lift">
                      <CardContent className="p-4 sm:p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-3 sm:gap-4">
                          {/* Icon and Priority */}
                          <div className="flex items-center gap-2 sm:gap-3 md:flex-col md:items-center md:min-w-[70px] sm:md:min-w-[80px]">
                            <div className={`p-2 sm:p-3 rounded-full bg-primary/10 ${getTypeColor(announcement.type)}`}>
                              {getTypeIcon(announcement.type)}
                            </div>
                            <Badge className={`text-[10px] sm:text-xs ${getPriorityColor(announcement.priority)}`}>
                              {announcement.priority}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2 sm:mb-3">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight">
                                {announcement.title}
                              </h3>
                              
                              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{formatDate(announcement.date)}</span>
                              </div>
                            </div>

                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                              {announcement.content}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{t('announcements.published')}: {formatFullDate(announcement.date)}</span>
                              </div>

                              {announcement.type === "meeting" && (
                                <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                                  {t('announcements.addToCalendar')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-1/2 h-8 w-8 sm:h-10 sm:w-10" />
            <CarouselNext className="right-0 translate-x-1/2 h-8 w-8 sm:h-10 sm:w-10" />
          </Carousel>
        </div>

        {/* Subscribe to Updates */}
        {/* <Card className="card-elegant max-w-2xl mx-auto mt-12 animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <Megaphone className="h-6 w-6 text-primary" />
              {t('announcements.stayUpdated')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              {t('announcements.neverMiss')}
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">{t('announcements.whatsapp')}</p>
                <p className="text-xs text-muted-foreground">{t('announcements.joinGroup')}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <FileText className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">{t('announcements.noticeBoard')}</p>
                <p className="text-xs text-muted-foreground">{t('announcements.visitOffice')}</p>
              </div>
            </div>

            <Button className="w-full sm:w-auto">
              {t('announcements.contactUpdates')}
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </section>
  );
};

export default Announcements;