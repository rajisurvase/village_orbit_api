import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, Play, CheckCircle2, Lock, AlertTriangle } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";

interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  total_questions: number;
  duration_minutes: number;
  scheduled_at: string;
  ends_at: string;
  status: string;
  from_standard?: string | null;
  to_standard?: string | null;
}

interface AttemptInfo {
  id: string;
  status: string;
  score?: number;
}

interface StudentExamCardProps {
  exam: Exam;
  studentStandard?: string | null;
  attemptInfo?: AttemptInfo | null;
  onStartExam: (examId: string) => void;
  onResumeExam: (examId: string, attemptId: string) => void;
}

const StudentExamCard = ({
  exam,
  studentStandard,
  attemptInfo,
  onStartExam,
  onResumeExam,
}: StudentExamCardProps) => {
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      GK: "bg-blue-500",
      Science: "bg-green-500",
      Math: "bg-purple-500",
      English: "bg-orange-500",
    };
    return colors[subject] || "bg-gray-500";
  };

  const getStatusBadge = () => {
    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);

    if (isFuture(scheduled)) {
      return <Badge variant="secondary">आगामी</Badge>;
    } else if (isPast(ends)) {
      return <Badge variant="destructive">संपली</Badge>;
    } else {
      return <Badge className="bg-green-600">सुरू</Badge>;
    }
  };

  const isEligible = () => {
    if (!exam.from_standard && !exam.to_standard) return true;
    if (!studentStandard) return false;

    const extractNumber = (std: string) => {
      const match = std.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    const studentNum = extractNumber(studentStandard);
    const fromNum = exam.from_standard ? extractNumber(exam.from_standard) : 0;
    const toNum = exam.to_standard ? extractNumber(exam.to_standard) : 12;

    return studentNum >= fromNum && studentNum <= toNum;
  };

  const canTakeExam = () => {
    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);

    const isWithinTimeWindow = now >= scheduled && now <= ends;
    const isStatusValid = exam.status === "scheduled" || exam.status === "active";
    const hasNotCompleted = !attemptInfo || attemptInfo.status !== "SUBMITTED";

    return isWithinTimeWindow && isStatusValid && isEligible() && hasNotCompleted;
  };

  const renderActionButton = () => {
    if (!isEligible()) {
      return (
        <Button className="w-full mt-4" variant="outline" disabled>
          <Lock className="h-4 w-4 mr-2" />
          तुमच्या वर्गासाठी नाही
        </Button>
      );
    }

    if (attemptInfo?.status === "SUBMITTED") {
      return (
        <Button className="w-full mt-4" variant="secondary" disabled>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          पूर्ण झाली ({attemptInfo.score}%)
        </Button>
      );
    }

    if (attemptInfo?.status === "IN_PROGRESS") {
      if (canTakeExam()) {
        return (
          <Button
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
            onClick={() => onResumeExam(exam.id, attemptInfo.id)}
          >
            <Play className="h-4 w-4 mr-2" />
            परीक्षा चालू ठेवा
          </Button>
        );
      }
      return (
        <Button className="w-full mt-4" variant="outline" disabled>
          <AlertTriangle className="h-4 w-4 mr-2" />
          वेळ संपली
        </Button>
      );
    }

    if (canTakeExam()) {
      return (
        <Button className="w-full mt-4" onClick={() => onStartExam(exam.id)}>
          <Play className="h-4 w-4 mr-2" />
          परीक्षा सुरू करा
        </Button>
      );
    }

    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);

    if (isFuture(scheduled)) {
      return (
        <Button className="w-full mt-4" variant="outline" disabled>
          <Clock className="h-4 w-4 mr-2" />
          अजून सुरू झाली नाही
        </Button>
      );
    }

    if (isPast(ends)) {
      return (
        <Button className="w-full mt-4" variant="outline" disabled>
          परीक्षा संपली
        </Button>
      );
    }

    return (
      <Button className="w-full mt-4" variant="outline" disabled>
        उपलब्ध नाही
      </Button>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={getSubjectColor(exam.subject)}>{exam.subject}</Badge>
          {getStatusBadge()}
        </div>
        <CardTitle className="text-xl">{exam.title}</CardTitle>
        <CardDescription>{exam.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(exam.scheduled_at), "PPP")}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {exam.duration_minutes} मिनिटे
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            {exam.total_questions} प्रश्न
          </div>
          {exam.from_standard && exam.to_standard && (
            <div className="text-sm text-muted-foreground">
              वर्ग: {exam.from_standard} ते {exam.to_standard}
            </div>
          )}
          {renderActionButton()}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentExamCard;
