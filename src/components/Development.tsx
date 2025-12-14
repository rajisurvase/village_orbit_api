import { Calendar, IndianRupee, CheckCircle, Clock, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import i18n from "@/i18n"; // ✅ correct


interface DevelopmentProps {
  developmentWorks: any[];
}

const Development = ({ developmentWorks }: DevelopmentProps) => {
   const { t } = i18n; 
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "Ongoing":
        return <Clock className="h-5 w-5 text-warning" />;
      case "Planned":
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Calendar className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "Ongoing":
        return "bg-warning text-warning-foreground";
      case "Planned":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    // Extract numeric value and format it
    const numericAmount = amount.replace(/[^\d]/g, '');
    const formatted = parseInt(numericAmount).toLocaleString('en-IN');
    return `₹${formatted}`;
  };

  return (
    <section id="development" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
 <h2 className="text-4xl font-bold mb-4 text-gradient">
  {t("developmentWorks.title")}
</h2>

<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
  {t("developmentWorks.description")}
</p>

</div>


        {/* Development Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {developmentWorks.map((project, index) => (
            <Card 
              key={project.title} 
              className="card-elegant hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <CardTitle className="text-xl flex-1 pr-4">
                    {project.title}
                  </CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                    <span className="ml-2">{project.status}</span>
                  </Badge>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Budget */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <IndianRupee className="h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Project Budget</p>
                    <p className="text-lg font-bold text-accent">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Timeline
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {project.startDate ? formatDate(project.startDate) : 
                         project.expectedStart ? formatDate(project.expectedStart) : 'TBD'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground">
                        {project.status === "Completed" ? "Completed" : "Expected Completion"}
                      </p>
                      <p className="font-medium">
                        {project.completionDate ? formatDate(project.completionDate) : 
                         project.expectedCompletion ? formatDate(project.expectedCompletion) : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Progress</h4>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  
                  <Progress 
                    value={project.progress} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Status Message */}
                {project.status === "Ongoing" && (
                  <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <p className="text-sm text-warning-foreground">
                      🚧 Work in progress - Regular updates available at Panchayat office
                    </p>
                  </div>
                )}

                {project.status === "Completed" && (
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-sm text-success-foreground">
                      ✅ Project successfully completed on schedule
                    </p>
                  </div>
                )}

                {project.status === "Planned" && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-primary-foreground">
                      📋 Project approved - Implementation starting soon
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Statistics 
        <Card className="card-elegant animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Development Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-success-foreground" />
                </div>
                <p className="text-2xl font-bold text-success">
                  {developmentWorks.filter(p => p.status === "Completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed Projects</p>
              </div>

              <div className="p-4">
                <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-8 w-8 text-warning-foreground" />
                </div>
                <p className="text-2xl font-bold text-warning">
                  {developmentWorks.filter(p => p.status === "Ongoing").length}
                </p>
                <p className="text-sm text-muted-foreground">Ongoing Projects</p>
              </div>

              <div className="p-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-2xl font-bold text-primary">
                  {developmentWorks.filter(p => p.status === "Planned").length}
                </p>
                <p className="text-sm text-muted-foreground">Planned Projects</p>
              </div>

              <div className="p-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <IndianRupee className="h-8 w-8 text-accent-foreground" />
                </div>
                <p className="text-2xl font-bold text-accent">
                  ₹{(developmentWorks.reduce((total, project) => {
                    const amount = parseInt(project.budget.replace(/[^\d]/g, ''));
                    return total + amount;
                  }, 0) / 100000).toFixed(1)}L
                </p>
                <p className="text-sm text-muted-foreground">Total Investment</p>
              </div>
            </div>
          </CardContent>
        </Card>*/}
      </div>
    </section>
  );
};

export default Development;