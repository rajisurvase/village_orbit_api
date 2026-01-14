import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExamAnswer {
  question_id: string;
  selected_option: string;
  is_correct: boolean;
}

interface ExamQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'sub_admin']);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get attempt ID from request
    const { attemptId } = await req.json();
    
    if (!attemptId) {
      return new Response(JSON.stringify({ error: 'Attempt ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating PDF for attempt: ${attemptId}`);

    // Fetch attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        exams (
          id,
          title,
          subject,
          total_questions,
          pass_marks,
          scheduled_at,
          ends_at
        )
      `)
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      console.error('Error fetching attempt:', attemptError);
      return new Response(JSON.stringify({ error: 'Attempt not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, standard, school_name')
      .eq('id', attempt.user_id)
      .single();

    // Fetch answers for this attempt
    const { data: answers, error: answersError } = await supabase
      .from('exam_answers')
      .select('question_id, selected_option, is_correct')
      .eq('attempt_id', attemptId);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch answers' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch questions for the exam
    const questionIds = attempt.shuffled_question_order || [];
    let questions: ExamQuestion[] = [];
    
    if (questionIds.length > 0) {
      const { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions')
        .select('id, question, option_a, option_b, option_c, option_d, correct_option')
        .in('id', questionIds);

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        return new Response(JSON.stringify({ error: 'Failed to fetch questions' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Sort by shuffled order
      questions = questionIds
        .map((id: string) => questionsData?.find(q => q.id === id))
        .filter(Boolean) as ExamQuestion[];
    }

    // Create answers map
    const answersMap: Record<string, ExamAnswer> = {};
    answers?.forEach(a => {
      answersMap[a.question_id] = a;
    });

    // Generate HTML for PDF
    const getOptionLabel = (option: string) => {
      switch (option) {
        case 'A': return 'अ';
        case 'B': return 'ब';
        case 'C': return 'क';
        case 'D': return 'ड';
        default: return option;
      }
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('mr-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const passMarks = attempt.exams?.pass_marks || 40;
    const isPassed = (attempt.score || 0) >= passMarks;

    let questionsHtml = '';
    questions.forEach((q, index) => {
      const answer = answersMap[q.id];
      const studentAnswer = answer?.selected_option || 'उत्तर दिले नाही';
      const isCorrect = answer?.is_correct || false;
      const isUnanswered = !answer?.selected_option;

      questionsHtml += `
        <div class="question-block ${isCorrect ? 'correct' : isUnanswered ? 'unanswered' : 'wrong'}">
          <div class="question-header">
            <span class="question-number">प्रश्न ${index + 1}</span>
            <span class="question-status ${isCorrect ? 'correct' : isUnanswered ? 'unanswered' : 'wrong'}">
              ${isCorrect ? '✓ बरोबर' : isUnanswered ? '○ उत्तर नाही' : '✗ चुकीचे'}
            </span>
          </div>
          <div class="question-text">${q.question}</div>
          <div class="options">
            <div class="option ${q.correct_option === 'A' ? 'correct-answer' : ''} ${studentAnswer === 'A' && !isCorrect ? 'wrong-answer' : ''}">
              <span class="option-label">अ)</span> ${q.option_a}
            </div>
            <div class="option ${q.correct_option === 'B' ? 'correct-answer' : ''} ${studentAnswer === 'B' && !isCorrect ? 'wrong-answer' : ''}">
              <span class="option-label">ब)</span> ${q.option_b}
            </div>
            <div class="option ${q.correct_option === 'C' ? 'correct-answer' : ''} ${studentAnswer === 'C' && !isCorrect ? 'wrong-answer' : ''}">
              <span class="option-label">क)</span> ${q.option_c}
            </div>
            <div class="option ${q.correct_option === 'D' ? 'correct-answer' : ''} ${studentAnswer === 'D' && !isCorrect ? 'wrong-answer' : ''}">
              <span class="option-label">ड)</span> ${q.option_d}
            </div>
          </div>
          <div class="answer-summary">
            <span>विद्यार्थ्याचे उत्तर: <strong>${isUnanswered ? 'दिले नाही' : getOptionLabel(studentAnswer)}</strong></span>
            <span>बरोबर उत्तर: <strong>${getOptionLabel(q.correct_option)}</strong></span>
          </div>
        </div>
      `;
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>परीक्षा निकाल - ${attempt.student_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans Devanagari', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .header p {
      opacity: 0.9;
    }
    
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 25px 30px;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .info-box {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    
    .info-box h3 {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    
    .info-box p {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .score-section {
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 20px;
      background: ${isPassed ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
      color: white;
    }
    
    .score-circle small {
      font-size: 14px;
      font-weight: 400;
      opacity: 0.9;
    }
    
    .result-badge {
      display: inline-block;
      padding: 8px 24px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      background: ${isPassed ? '#dcfce7' : '#fef2f2'};
      color: ${isPassed ? '#166534' : '#991b1b'};
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      padding: 25px 30px;
      background: #fafafa;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .stat-item {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .stat-item .number {
      font-size: 28px;
      font-weight: 700;
    }
    
    .stat-item .label {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
    }
    
    .stat-item.correct .number { color: #22c55e; }
    .stat-item.wrong .number { color: #ef4444; }
    .stat-item.unanswered .number { color: #f59e0b; }
    .stat-item.total .number { color: #3b82f6; }
    
    .questions-section {
      padding: 30px;
    }
    
    .questions-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .question-block {
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .question-block.correct {
      border-left: 4px solid #22c55e;
      background: #f0fdf4;
    }
    
    .question-block.wrong {
      border-left: 4px solid #ef4444;
      background: #fef2f2;
    }
    
    .question-block.unanswered {
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .question-number {
      font-weight: 700;
      color: #3b82f6;
    }
    
    .question-status {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 600;
    }
    
    .question-status.correct {
      background: #dcfce7;
      color: #166534;
    }
    
    .question-status.wrong {
      background: #fef2f2;
      color: #991b1b;
    }
    
    .question-status.unanswered {
      background: #fef3c7;
      color: #92400e;
    }
    
    .question-text {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 15px;
      line-height: 1.7;
    }
    
    .options {
      display: grid;
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .option {
      padding: 10px 15px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-size: 14px;
    }
    
    .option.correct-answer {
      background: #dcfce7;
      border-color: #22c55e;
      font-weight: 600;
    }
    
    .option.wrong-answer {
      background: #fef2f2;
      border-color: #ef4444;
      text-decoration: line-through;
    }
    
    .option-label {
      font-weight: 700;
      margin-right: 8px;
      color: #64748b;
    }
    
    .answer-summary {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
      padding-top: 10px;
      border-top: 1px dashed #e2e8f0;
    }
    
    .footer {
      padding: 20px 30px;
      background: #f8fafc;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    
    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; }
      .question-block { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>परीक्षा निकाल पत्रक</h1>
      <p>${attempt.exams?.title || 'परीक्षा'}</p>
    </div>
    
    <div class="info-section">
      <div class="info-box">
        <h3>विद्यार्थ्याचे नाव</h3>
        <p>${profile?.full_name || attempt.student_name}</p>
      </div>
      <div class="info-box">
        <h3>इयत्ता</h3>
        <p>${profile?.standard || 'N/A'}</p>
      </div>
      <div class="info-box">
        <h3>शाळेचे नाव</h3>
        <p>${profile?.school_name || 'N/A'}</p>
      </div>
      <div class="info-box">
        <h3>परीक्षा तारीख</h3>
        <p>${attempt.start_time ? formatDate(attempt.start_time) : 'N/A'}</p>
      </div>
      <div class="info-box">
        <h3>विषय</h3>
        <p>${attempt.exams?.subject || 'N/A'}</p>
      </div>
      <div class="info-box">
        <h3>एकूण प्रश्न</h3>
        <p>${attempt.total_questions}</p>
      </div>
    </div>
    
    <div class="score-section">
      <div class="score-circle">
        ${attempt.score || 0}%
        <small>टक्केवारी</small>
      </div>
      <div class="result-badge">
        ${isPassed ? '🎉 उत्तीर्ण' : '❌ अनुत्तीर्ण'}
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-item total">
        <div class="number">${attempt.total_questions}</div>
        <div class="label">एकूण प्रश्न</div>
      </div>
      <div class="stat-item correct">
        <div class="number">${attempt.correct_answers || 0}</div>
        <div class="label">बरोबर उत्तरे</div>
      </div>
      <div class="stat-item wrong">
        <div class="number">${attempt.wrong_answers || 0}</div>
        <div class="label">चुकीची उत्तरे</div>
      </div>
      <div class="stat-item unanswered">
        <div class="number">${attempt.unanswered || 0}</div>
        <div class="label">न दिलेली उत्तरे</div>
      </div>
    </div>
    
    <div class="questions-section">
      <h2 class="questions-title">प्रश्नांचे तपशीलवार उत्तरपत्रिका</h2>
      ${questionsHtml}
    </div>
    
    <div class="footer">
      <p>हे निकाल पत्रक VillageOrbit परीक्षा प्रणालीद्वारे तयार केले आहे</p>
      <p>तयार केलेली तारीख: ${formatDate(new Date().toISOString())}</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log('PDF HTML generated successfully');

    // Return HTML for client-side PDF generation
    return new Response(JSON.stringify({ 
      success: true,
      html: htmlContent,
      studentName: profile?.full_name || attempt.student_name,
      examTitle: attempt.exams?.title || 'Exam'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate PDF', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
