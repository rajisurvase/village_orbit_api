import { useState, useContext } from 'react';
import { Calendar, FileText, Tag, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePageSEO } from '@/hooks/usePageSEO';
import SectionSkeleton from '@/components/ui/skeletons/SectionSkeleton';
import { VillageContext } from '@/context/VillageContextConfig';
import { Notice } from '@/hooks/useVillageConfig';

const NoticesPage = () => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const { config, loading } = useContext(VillageContext);

  usePageSEO({
    title: `Notice Board - ${config?.village.name || 'Village'} Gram Panchayat`,
    description: `Official notices and announcements from ${config?.village.name || 'Village'} Gram Panchayat. Stay updated with important information.`,
    keywords: ['notices', 'announcements', 'official notices', 'panchayat notices', 'village updates'],
  });

  // Get notices from village config JSON
  const notices = config?.notices || [];
  const activeNotices = notices.filter((notice) => notice.isActive !== false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      general: 'bg-primary/10 text-primary',
      urgent: 'bg-destructive/10 text-destructive',
      meeting: 'bg-success/10 text-success',
      tender: 'bg-warning/10 text-warning',
      election: 'bg-accent/10 text-accent',
      scheme: 'bg-secondary text-secondary-foreground',
    };
    return categoryColors[category?.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  if (loading) return <SectionSkeleton />;

  return (
    <section className="py-20 bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Notice Board
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay informed with the latest official notices and announcements
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Managed through JSON Configuration Manager
          </p>
        </header>

        {/* Notices Grid */}
        {activeNotices.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Notices Available</h3>
            <p className="text-muted-foreground">
              There are currently no active notices to display.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Add notices in the JSON Configuration Manager under the "notices" section.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeNotices
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((notice, index) => (
                <Card
                  key={notice.id}
                  className="card-elegant hover-lift cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedNotice(notice)}
                  role="article"
                  aria-label={`Notice: ${notice.title}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getCategoryColor(notice.category)}>
                        <Tag className="h-3 w-3 mr-1" />
                        {notice.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(notice.date)}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {notice.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {notice.description}
                    </p>
                    {notice.attachmentUrl && (
                      <div className="flex items-center text-xs text-primary">
                        <FileText className="h-3 w-3 mr-1" />
                        Attachment Available
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 mb-4">
              <DialogTitle className="text-2xl">{selectedNotice?.title}</DialogTitle>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getCategoryColor(selectedNotice?.category || '')}>
                <Tag className="h-3 w-3 mr-1" />
                {selectedNotice?.category}
              </Badge>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedNotice && formatDate(selectedNotice.date)}
              </Badge>
            </div>
          </DialogHeader>
          <DialogDescription className="text-base text-foreground whitespace-pre-wrap">
            {selectedNotice?.description}
          </DialogDescription>
          {selectedNotice?.attachmentUrl && (
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(selectedNotice.attachmentUrl!, '_blank')}
                aria-label="View attachment in new tab"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Attachment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default NoticesPage;
