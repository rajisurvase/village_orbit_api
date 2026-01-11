import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Save, Wifi, CheckCircle2 } from "lucide-react";

interface ExamInstructionsMarathiProps {
  examTitle?: string;
  duration?: number;
  totalQuestions?: number;
  onAccept?: () => void;
  onCancel?: () => void;
}

const ExamInstructionsMarathi = ({ 
  examTitle, 
  duration, 
  totalQuestions, 
  onAccept, 
  onCancel 
}: ExamInstructionsMarathiProps) => {
  return (
    <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
          <AlertTriangle className="h-5 w-5" />
          परीक्षेचे महत्त्वाचे नियम
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-orange-800 dark:text-orange-200">
        {/* Time Rules */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">वेळेची मर्यादा</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>परीक्षा सुरू केल्यानंतर वेळ थांबवता येणार नाही.</li>
              <li>वेळ संपल्यावर परीक्षा आपोआप सबमिट होईल.</li>
              <li>उरलेला वेळ स्क्रीनवर दिसेल.</li>
            </ul>
          </div>
        </div>

        {/* Auto-save Rules */}
        <div className="flex items-start gap-3">
          <Save className="h-5 w-5 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">उत्तरे आपोआप सेव्ह</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>प्रत्येक उत्तर निवडल्यानंतर ते लगेच सेव्ह होईल.</li>
              <li>पेज रिफ्रेश केल्यास किंवा इंटरनेट गेल्यास उत्तरे सुरक्षित राहतील.</li>
              <li>तुम्ही परत लॉगिन केल्यास परीक्षा जिथून थांबली तिथून सुरू होईल.</li>
            </ul>
          </div>
        </div>

        {/* Network Rules */}
        <div className="flex items-start gap-3">
          <Wifi className="h-5 w-5 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">इंटरनेट आणि रिफ्रेश</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>इंटरनेट कनेक्शन तात्पुरते गेल्यास घाबरू नका.</li>
              <li>कनेक्शन आल्यावर परीक्षा सुरू ठेवता येईल.</li>
              <li>ब्राउझर बंद केल्यास किंवा क्रॅश झाल्यास, परत लॉगिन करून परीक्षा चालू ठेवा.</li>
            </ul>
          </div>
        </div>

        {/* Submission Rules */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">अंतिम सबमिशन</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>शेवटच्या प्रश्नानंतर "परीक्षा सबमिट करा" बटण दिसेल.</li>
              <li>सबमिट करण्यापूर्वी सर्व प्रश्नांची उत्तरे तपासा.</li>
              <li>एकदा सबमिट केल्यानंतर बदल करता येणार नाही.</li>
              <li><strong>सबमिट केल्यानंतर परीक्षा लॉक होईल.</strong></li>
            </ul>
          </div>
        </div>

        {/* Final Warning */}
        <div className="bg-red-100 dark:bg-red-950/30 p-4 rounded-lg border border-red-300 dark:border-red-800 mt-4">
          <p className="font-bold text-red-900 dark:text-red-100">
            ⚠️ महत्त्वाची सूचना:
          </p>
          <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 mt-2">
            <li>फसवणूक केल्यास परीक्षा रद्द होईल.</li>
            <li>टॅब बदलू नका किंवा स्क्रीनशॉट घेऊ नका.</li>
            <li>कोणाशीही बोलू नका किंवा मदत घेऊ नका.</li>
          </ul>
        </div>

        {/* Exam Info */}
        {(examTitle || duration || totalQuestions) && (
          <div className="bg-blue-100 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-300 dark:border-blue-800 mt-4">
            <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">परीक्षा माहिती:</p>
            {examTitle && <p className="text-sm text-blue-800 dark:text-blue-200">परीक्षा: {examTitle}</p>}
            {duration && <p className="text-sm text-blue-800 dark:text-blue-200">कालावधी: {duration} मिनिटे</p>}
            {totalQuestions && <p className="text-sm text-blue-800 dark:text-blue-200">एकूण प्रश्न: {totalQuestions}</p>}
          </div>
        )}

        {/* Action Buttons */}
        {(onAccept || onCancel) && (
          <div className="flex gap-4 mt-6">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                रद्द करा
              </Button>
            )}
            {onAccept && (
              <Button onClick={onAccept} className="flex-1">
                मी समजलो, पुढे चला
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamInstructionsMarathi;
