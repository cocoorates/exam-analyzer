require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AnthropicModule = require('@anthropic-ai/sdk');
const Anthropic = AnthropicModule.default || AnthropicModule;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

// uploads 디렉토리 확보
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer 설정 - 파일 크기 제한 100MB
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF 파일만 업로드 가능합니다.'));
    }
  }
});

app.use(cors());
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// Claude API 클라이언트
function getClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

// PDF를 base64로 읽기
function pdfToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

// PDF 파일 크기 체크 (MB)
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

// 분석 프롬프트 생성
function buildAnalysisPrompt() {
  return `당신은 영어 시험지 분석 전문가입니다. 교재 PDF와 시험지 PDF를 비교 분석하여 정확한 분석 결과를 JSON으로 반환해야 합니다.

## 분석 규칙

### 유형 분류 (시험지에 있는 문항만 분류, 임의 추가 금지)
- 주제, 목적, 요지, 제목 → "대의파악"
- 심경 → "심경변화"
- 일치불일치 → "내용일치"
- 무관한 문장 → "무관한문장"
- 밑줄 의미추론 → "함축의미"
- 문법 → "어법판단"
- 어휘 → "문맥어휘"
- 빈칸 → "빈칸추론"
- 순서 → "순서배열"
- 삽입 → "문장삽입"
- 요약 → "내용요약"

### 출처 표기 규칙
1. 교재에 있는 지문과 90% 이상 동일하면: 원본 출처 표기 (예: "고1 24년 6월 29번")
2. 교과서 지문이면: "교과서 2과" 형태로 표기
3. 교재에 없는 내용이면: "외부지문"
4. 외부지문이지만 교재의 어떤 지문과 "똑같은" 소재인 경우에만: "외부지문(고1 24년 6월 29번 간접연계)" 형태로 표기

### 배점
- 시험지에 표기된 배점을 그대로 사용 (숫자만)

## 출력 형식 (반드시 아래 JSON 형식으로만 응답. 다른 텍스트 일절 금지)

\`\`\`json
{
  "questions": [
    {
      "number": 1,
      "score": 3,
      "type": "대의파악",
      "source": "고1 24년 6월 18번"
    }
  ],
  "typeSummary": [
    {
      "type": "대의파악",
      "count": 7,
      "totalScore": 23.6
    }
  ]
}
\`\`\`

중요 주의사항:
- 객관식에 이어서 서술형도 포함할 것
- 시험지에 실제로 있는 문항만 분석할 것 (임의 추가 금지)
- 배점은 시험지에 적힌 숫자를 정확히 읽을 것
- 출처는 교재 내용과 매우 꼼꼼하게 대조하여 판별할 것
- JSON 코드블록만 반환하고 그 외 텍스트는 절대 포함하지 말 것
- typeSummary의 totalScore는 해당 유형의 모든 문항 배점을 합산한 값`;
}

// 교재 요약 프롬프트
function buildSummaryPrompt(startPage, endPage) {
  return `이 교재 페이지들(${startPage}~${endPage}페이지)에 수록된 모든 영어 지문의 정보를 빠짐없이 정리해주세요.

각 지문에 대해 반드시 다음 정보를 포함:
1. 출처 (페이지에 표기된 정보 그대로. 예: "고1 24년 6월 29번", "교과서 2과" 등)
2. 지문의 주제/소재 키워드 3~5개
3. 지문의 시작 2문장 (정확히 복사)
4. 지문의 끝 1문장 (정확히 복사)
5. 해당 페이지 번호

JSON 배열로만 반환 (다른 텍스트 금지):
\`\`\`json
[{"source": "고1 24년 6월 29번", "topic": "소재 키워드", "opening": "시작 2문장", "closing": "끝 1문장", "page": 1}]
\`\`\``;
}

// SSE 엔드포인트
app.post('/api/analyze', upload.fields([
  { name: 'textbook', maxCount: 1 },
  { name: 'exam', maxCount: 1 }
]), async (req, res) => {
  // SSE 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  let filesToClean = [];

  try {
    if (!req.files || !req.files.textbook || !req.files.exam) {
      sendEvent('error', { message: '교재 PDF와 시험지 PDF 모두 업로드해주세요.' });
      res.end();
      return;
    }

    const textbookFile = req.files.textbook[0];
    const examFile = req.files.exam[0];
    filesToClean = [textbookFile.path, examFile.path];

    const anthropic = getClient();

    // 파일 크기 확인
    const textbookSizeMB = getFileSizeMB(textbookFile.path);
    const examSizeMB = getFileSizeMB(examFile.path);

    sendEvent('progress', {
      message: `PDF 파일 확인 완료 (교재: ${textbookSizeMB.toFixed(1)}MB, 시험지: ${examSizeMB.toFixed(1)}MB)`,
      step: 1, total: 5
    });

    // PDF를 base64로 변환
    sendEvent('progress', { message: 'PDF 파일을 처리 중...', step: 2, total: 5 });

    const textbookBase64 = pdfToBase64(textbookFile.path);
    const examBase64 = pdfToBase64(examFile.path);

    // 전략 결정: 교재 base64 크기가 약 25MB 이상이면 2단계 전략
    const textbookBase64SizeMB = Buffer.byteLength(textbookBase64, 'utf8') / (1024 * 1024);
    const useTwoStep = textbookBase64SizeMB > 25;

    let finalContent = [];

    if (useTwoStep) {
      // === 2단계 전략: 교재가 큰 경우 ===
      sendEvent('progress', {
        message: `교재가 ${textbookSizeMB.toFixed(1)}MB로 커서 2단계 분석을 진행합니다...`,
        step: 3, total: 5
      });

      // 1단계: 교재 요약 추출
      const summaryResponse = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 16000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: textbookBase64 }
            },
            {
              type: 'text',
              text: buildSummaryPrompt(1, '마지막')
            }
          ]
        }]
      });

      const summaryText = summaryResponse.content[0].text;

      sendEvent('progress', {
        message: '교재 요약 완료. 시험지와 비교 분석 중... (1~3분 소요)',
        step: 4, total: 5
      });

      // 2단계: 요약 + 시험지로 최종 분석
      finalContent = [
        {
          type: 'text',
          text: '=== 교재에 수록된 지문 목록 ===\n' + summaryText
        },
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: examBase64 }
        },
        {
          type: 'text',
          text: buildAnalysisPrompt()
        }
      ];
    } else {
      // === 1단계 전략: 교재가 작은 경우 직접 비교 ===
      sendEvent('progress', {
        message: 'Claude API에 교재와 시험지를 전송하여 분석 중... (1~3분 소요)',
        step: 3, total: 5
      });

      finalContent = [
        { type: 'text', text: '=== 교재 PDF ===' },
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: textbookBase64 }
        },
        { type: 'text', text: '=== 시험지 PDF ===' },
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: examBase64 }
        },
        {
          type: 'text',
          text: buildAnalysisPrompt()
        }
      ];

      sendEvent('progress', {
        message: 'Claude API가 분석 중입니다... (1~3분 소요)',
        step: 4, total: 5
      });
    }

    // 최종 분석 API 호출
    const analysisResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: finalContent
      }]
    });

    sendEvent('progress', { message: '분석 결과 처리 중...', step: 5, total: 5 });

    // 결과 파싱
    let resultText = analysisResponse.content[0].text;

    let analysisResult;
    try {
      // ```json ... ``` 블록에서 추출
      const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1]);
      } else {
        // 직접 JSON 파싱 시도
        const jsonStart = resultText.indexOf('{');
        const jsonEnd = resultText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          analysisResult = JSON.parse(resultText.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('JSON을 찾을 수 없음');
        }
      }

      // questions 필드 검증
      if (!analysisResult.questions || !Array.isArray(analysisResult.questions)) {
        throw new Error('응답에 questions 배열이 없습니다');
      }
      // 각 문항 필드 검증 및 정규화
      analysisResult.questions = analysisResult.questions.map(q => ({
        number: q.number || 0,
        score: Number(q.score) || 0,
        type: q.type || '미분류',
        source: q.source || '미확인'
      }));

      // typeSummary가 없으면 자동 생성
      if (!analysisResult.typeSummary || !Array.isArray(analysisResult.typeSummary)) {
        const typeMap = {};
        analysisResult.questions.forEach(q => {
          if (!typeMap[q.type]) typeMap[q.type] = { type: q.type, count: 0, totalScore: 0 };
          typeMap[q.type].count++;
          typeMap[q.type].totalScore += Number(q.score) || 0;
        });
        analysisResult.typeSummary = Object.values(typeMap);
        // totalScore 소수점 처리
        analysisResult.typeSummary.forEach(s => {
          s.totalScore = Math.round(s.totalScore * 10) / 10;
        });
      }

    } catch (parseError) {
      sendEvent('result', {
        success: false,
        rawText: resultText,
        message: 'JSON 파싱에 실패했습니다. 원본 응답을 표시합니다.'
      });
      res.end();
      return;
    }

    sendEvent('result', { success: true, data: analysisResult });
    res.end();

  } catch (error) {
    console.error('분석 오류:', error);
    let errorMsg = '분석 중 오류가 발생했습니다. 다시 시도해주세요.';
    const rawMsg = error.message || '';
    if (error.status === 413 || rawMsg.includes('too large') || rawMsg.includes('size')) {
      errorMsg = 'PDF 파일이 너무 큽니다. 교재 PDF의 크기를 줄여주세요 (압축 또는 페이지 분할).';
    } else if (error.status === 401) {
      errorMsg = 'API 키가 유효하지 않습니다. 서버의 ANTHROPIC_API_KEY를 확인해주세요.';
    } else if (error.status === 429) {
      errorMsg = 'API 요청 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.status === 400) {
      errorMsg = 'API 요청 형식 오류입니다. PDF 파일이 손상되었을 수 있습니다.';
    } else if (error.status === 529 || error.status === 503) {
      errorMsg = 'Claude API 서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.';
    }
    sendEvent('error', { message: errorMsg });
    res.end();
  } finally {
    // 업로드된 파일 정리
    filesToClean.forEach(fp => {
      try { fs.unlinkSync(fp); } catch(e) {}
    });
  }
});

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    version: '1.0.0'
  });
});

const server = app.listen(PORT, () => {
  console.log(`시험지 분석기 서버 시작: http://localhost:${PORT}`);
  console.log(`사용 모델: ${MODEL}`);
  console.log(`API 키 설정: ${process.env.ANTHROPIC_API_KEY ? '확인됨' : '⚠️ 미설정 - .env 파일에 ANTHROPIC_API_KEY를 설정하세요'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM 수신, 서버 종료 중...');
  server.close(() => {
    // 남은 업로드 파일 정리
    try {
      const uploadsDir = path.join(__dirname, 'uploads');
      if (fs.existsSync(uploadsDir)) {
        fs.readdirSync(uploadsDir).forEach(f => {
          try { fs.unlinkSync(path.join(uploadsDir, f)); } catch(e) {}
        });
      }
    } catch(e) {}
    process.exit(0);
  });
});
