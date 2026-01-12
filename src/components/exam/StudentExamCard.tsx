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
  status?: string;
  canTake?: boolean;
  onStartExam?: (examId: string) => void;
  onResumeExam?: (examId: string, attemptId: string) => void;
  onStart?: () => void;
  onResume?: () => void;
}

const StudentExamCard = ({
  exam,
  studentStandard,
  attemptInfo,
  status,
  canTake,
  onStartExam,
  onResumeExam,
  onStart,
  onResume,
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

  // Check if attempt is completed (has score OR status is SUBMITTED)
  const isAttemptCompleted = attemptInfo?.score !== undefined || attemptInfo?.status === "SUBMITTED";

  const getStatusBadge = () => {
    // PRIORITY 1: Check if attempt has score or is submitted - this means completed
    if (isAttemptCompleted || status === "completed") {
      return (
        <Badge className="bg-green-700">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          पूर्ण
        </Badge>
      );
    }
    
    // PRIORITY 2: Show in-progress badge only if NOT completed
    if (attemptInfo?.status === "IN_PROGRESS" || status === "resume") {
      return (
        <Badge className="bg-orange-500">
          <Clock className="h-3 w-3 mr-1" />
          सुरू
        </Badge>
      );
    }
    
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
    // FIRST: Check user attempt status - if completed, never allow
    if (isAttemptCompleted) {
      return false;
    }

    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);

    const isWithinTimeWindow = now >= scheduled && now <= ends;
    const isStatusValid = exam.status === "scheduled" || exam.status === "active";

    return isWithinTimeWindow && isStatusValid && isEligible();
  };

  const renderActionButton = () => {
    // Support both old and new prop patterns
    const handleStart = () => {
      if (onStart) onStart();
      else if (onStartExam) onStartExam(exam.id);
    };
    
    const handleResume = () => {
      if (onResume) onResume();
      else if (onResumeExam && attemptInfo) onResumeExam(exam.id, attemptInfo.id);
    };

    // PRIORITY 1: Check user attempt completion FIRST (score or SUBMITTED status)
    if (isAttemptCompleted || status === "completed") {
      return (
        <Button className="w-full mt-4" variant="secondary" disabled>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          पूर्ण झाली {attemptInfo?.score !== undefined ? `(${attemptInfo.score}%)` : ""}
        </Button>
      );
    }

    // PRIORITY 2: Check eligibility
    if (!isEligible()) {
      return (
        <Button className="w-full mt-4" variant="outline" disabled>
          <Lock className="h-4 w-4 mr-2" />
          तुमच्या वर्गासाठी नाही
        </Button>
      );
    }

    // PRIORITY 3: Check for in-progress attempt
    if (attemptInfo?.status === "IN_PROGRESS" || status === "resume") {
      const canResume = canTake !== undefined ? canTake : canTakeExam();
      if (canResume) {
        return (
          <Button
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
            onClick={handleResume}
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

    const canStart = canTake !== undefined ? canTake : canTakeExam();
    if (canStart) {
      return (
        <Button className="w-full mt-4" onClick={handleStart}>
          <Play className="h-4 w-4 mr-2" />
          परीक्षा सुरू करा
        </Button>
      );
    }

    const now = new Date();
    const scheduled = new Date(exam.scheduled_at);
    const ends = new Date(exam.ends_at);

    if (status === "upcoming" || isFuture(scheduled)) {
      return (
        <Button className="w-full mt-4" variant="outline" disabled>
          <Clock className="h-4 w-4 mr-2" />
          अजून सुरू झाली नाही
        </Button>
      );
    }

    if (status === "ended" || isPast(ends)) {
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
