import { useState, useContext, useMemo } from 'react';
import { Calendar, FileText, Tag, ExternalLink, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useTranslation } from 'react-i18next';

const NoticesPage = () => {
  const { t } = useTranslation();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { config, loading } = useContext(VillageContext);

  usePageSEO({
    title: `${t("notices.title")} - ${config?.village?.name || 'Village'} Gram Panchayat`,
    description: t("notices.metaDescription"),
    keywords: ['notices','panchayat','announcements','village'],
  });

  const notices = config?.notices || [];
  const activeNotices = notices.filter(n => n.isActive !== false);

  const categories = ['all','general','urgent','meeting','tender','scheme','election'];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN',{
      year:'numeric',
      month:'long',
      day:'numeric'
    });

  const getCategoryColor = (category: string) => {
    const map: Record<string,string> = {
      general:'bg-primary/10 text-primary',
      urgent:'bg-red-100 text-red-600',
      meeting:'bg-green-100 text-green-700',
      tender:'bg-amber-100 text-amber-700',
      scheme:'bg-blue-100 text-blue-700',
      election:'bg-purple-100 text-purple-700',
    };
    return map[category?.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  const filteredNotices = useMemo(
    () =>
      activeNotices
        .filter(n =>
          categoryFilter === 'all'
            ? true
            : n.category?.toLowerCase() === categoryFilter
        )
        .filter(n =>
          search
            ? n.title.toLowerCase().includes(search.toLowerCase()) ||
              n.description.toLowerCase().includes(search.toLowerCase())
            : true
        )
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [activeNotices, search, categoryFilter]
  );

  const isNew = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / (1000 * 3600 * 24);
    return diff <= 7;
  };

  if (loading) return <SectionSkeleton />;

  return (
    <section className="py-20 bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4">

        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-gradient">
            {t("notices.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("notices.subtitle")}
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 justify-between">

          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                onClick={() => setCategoryFilter(cat)}
              >
                {t(`notices.${cat}`)}
              </Button>
            ))}
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute top-3 left-3 text-muted-foreground" />
            <Input
              placeholder={t("notices.search")}
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Notices */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">{t("notices.none")}</h3>
            <p className="text-muted-foreground">{t("notices.checkBack")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((notice,index) => (
              <Card
                key={notice.id}
                className="card-elegant hover-lift cursor-pointer"
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={() => setSelectedNotice(notice)}
              >
                <CardHeader>

                  <div className="flex justify-between mb-2">
                    <Badge className={getCategoryColor(notice.category)}>
                      <Tag className="h-3 w-3 mr-1" />
                      {t(`notices.${notice.category}`)}
                    </Badge>

                    <span className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(notice.date)}
                    </span>
                  </div>

                  <CardTitle className="text-lg line-clamp-2">
                    {notice.title}
                    {isNew(notice.date) && (
                      <Badge className="ml-2 bg-green-600 text-white">
                        NEW
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {notice.description}
                  </p>

                  {notice.attachmentUrl && (
                    <div className="text-xs text-primary mt-3 flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {t("notices.attachment")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNotice?.title}</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {selectedNotice?.description}
          </DialogDescription>

          {selectedNotice?.attachmentUrl && (
            <Button
              className="mt-5"
              onClick={() => window.open(selectedNotice.attachmentUrl!, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("notices.viewAttachment")}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default NoticesPage;
