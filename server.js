require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const AnthropicModule = require('@anthropic-ai/sdk');
const Anthropic = AnthropicModule.default || AnthropicModule;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

// API 요청 당 base64 한도 (안전하게 20MB로)
const MAX_BASE64_MB = 20;

// uploads 디렉토리 확보
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer 설정 - 파일 크기 제한 200MB
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 200 * 1024 * 1024 },
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
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// PDF를 base64로 읽기
function pdfToBase64(filePath) {
  return fs.readFileSync(filePath).toString('base64');
}

// 파일 크기 (MB)
function getFileSizeMB(filePath) {
  return fs.statSync(filePath).size / (1024 * 1024);
}

// base64 크기 (MB)
function getBase64SizeMB(base64str) {
  return Buffer.byteLength(base64str, 'utf8') / (1024 * 1024);
}

// Ghostscript로 PDF 압축 (이미지 해상도 낮춤, 텍스트는 보존)
function compressPdf(inputPath, quality = '/ebook') {
  const outputPath = inputPath + '_compressed.pdf';
  try {
    execSync(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`, {
      timeout: 60000
    });
    // 압축 결과가 원본보다 작으면 사용
    if (fs.existsSync(outputPath) && getFileSizeMB(outputPath) < getFileSizeMB(inputPath)) {
      return outputPath;
    }
    // 아니면 원본 반환
    try { fs.unlinkSync(outputPath); } catch(e) {}
    return inputPath;
  } catch (e) {
    console.error('Ghostscript 압축 실패:', e.message);
    try { fs.unlinkSync(outputPath); } catch(e2) {}
    return inputPath;
  }
}

// 분석 프롬프트
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

// SSE 엔드포인트
app.post('/api/analyze', upload.fields([
  { name: 'textbook', maxCount: 1 },
  { name: 'exam', maxCount: 1 }
]), async (req, res) => {
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

    const textbookSizeMB = getFileSizeMB(textbookFile.path);
    const examSizeMB = getFileSizeMB(examFile.path);

    sendEvent('progress', {
      message: `PDF 확인 완료 (교재: ${textbookSizeMB.toFixed(1)}MB, 시험지: ${examSizeMB.toFixed(1)}MB)`,
      step: 1, total: 5
    });

    // === 1단계: PDF 압축 (필요 시) ===
    sendEvent('progress', { message: 'PDF 최적화 중...', step: 2, total: 5 });

    let textbookPath = textbookFile.path;
    let examPath = examFile.path;

    // 교재 압축
    if (textbookSizeMB > 15) {
      sendEvent('progress', { message: '교재 PDF 압축 중...', step: 2, total: 5 });
      textbookPath = compressPdf(textbookFile.path);
      if (textbookPath !== textbookFile.path) filesToClean.push(textbookPath);
      console.log(`교재 압축: ${textbookSizeMB.toFixed(1)}MB → ${getFileSizeMB(textbookPath).toFixed(1)}MB`);
    }

    // 시험지 압축
    if (examSizeMB > 15) {
      sendEvent('progress', { message: '시험지 PDF 압축 중...', step: 2, total: 5 });
      examPath = compressPdf(examFile.path);
      if (examPath !== examFile.path) filesToClean.push(examPath);
      console.log(`시험지 압축: ${examSizeMB.toFixed(1)}MB → ${getFileSizeMB(examPath).toFixed(1)}MB`);
    }

    // === 2단계: base64 변환 ===
    const textbookBase64 = pdfToBase64(textbookPath);
    const examBase64 = pdfToBase64(examPath);

    const textbookB64MB = getBase64SizeMB(textbookBase64);
    const examB64MB = getBase64SizeMB(examBase64);
    const totalB64MB = textbookB64MB + examB64MB;

    console.log(`Base64 크기 - 교재: ${textbookB64MB.toFixed(1)}MB, 시험지: ${examB64MB.toFixed(1)}MB, 합계: ${totalB64MB.toFixed(1)}MB`);

    // 압축 후에도 너무 크면 더 강하게 압축
    if (totalB64MB > 40) {
      sendEvent('progress', { message: '추가 압축 진행 중...', step: 2, total: 5 });

      if (examB64MB > MAX_BASE64_MB) {
        const examPath2 = compressPdf(examFile.path, '/screen');
        if (examPath2 !== examFile.path) {
          filesToClean.push(examPath2);
          examPath = examPath2;
        }
      }
      if (textbookB64MB > MAX_BASE64_MB) {
        const tbPath2 = compressPdf(textbookFile.path, '/screen');
        if (tbPath2 !== textbookFile.path) {
          filesToClean.push(tbPath2);
          textbookPath = tbPath2;
        }
      }

      // 재변환
      const tb64_2 = pdfToBase64(textbookPath);
      const ex64_2 = pdfToBase64(examPath);
      const total2 = getBase64SizeMB(tb64_2) + getBase64SizeMB(ex64_2);
      console.log(`추가 압축 후 합계: ${total2.toFixed(1)}MB`);

      if (total2 > 45) {
        sendEvent('error', {
          message: `압축 후에도 PDF 합산 크기(${total2.toFixed(1)}MB)가 API 한도를 초과합니다. 교재나 시험지를 분할해서 업로드해주세요.`
        });
        res.end();
        return;
      }

      // 재할당
      Object.assign(textbookBase64, {});  // dummy
    }

    // === 3단계: Claude API 호출 ===
    sendEvent('progress', {
      message: 'Claude AI가 교재와 시험지를 분석 중... (1~3분 소요)',
      step: 3, total: 5
    });

    // 최종 base64 (압축 적용된 것)
    const finalTextbookB64 = pdfToBase64(textbookPath);
    const finalExamB64 = pdfToBase64(examPath);

    const content = [
      { type: 'text', text: '=== 교재 PDF ===' },
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: finalTextbookB64 }
      },
      { type: 'text', text: '=== 시험지 PDF ===' },
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: finalExamB64 }
      },
      { type: 'text', text: buildAnalysisPrompt() }
    ];

    sendEvent('progress', {
      message: 'Claude API 응답 대기 중... (1~3분 소요)',
      step: 4, total: 5
    });

    const analysisResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: 'user', content }]
    });

    // === 4단계: 결과 파싱 ===
    sendEvent('progress', { message: '분석 결과 처리 중...', step: 5, total: 5 });

    const resultText = analysisResponse.content[0].text;
    let analysisResult;

    try {
      const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1]);
      } else {
        const jsonStart = resultText.indexOf('{');
        const jsonEnd = resultText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          analysisResult = JSON.parse(resultText.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('JSON을 찾을 수 없음');
        }
      }

      if (!analysisResult.questions || !Array.isArray(analysisResult.questions)) {
        throw new Error('응답에 questions 배열이 없습니다');
      }

      analysisResult.questions = analysisResult.questions.map(q => ({
        number: q.number || 0,
        score: Number(q.score) || 0,
        type: q.type || '미분류',
        source: q.source || '미확인'
      }));

      if (!analysisResult.typeSummary || !Array.isArray(analysisResult.typeSummary)) {
        const typeMap = {};
        analysisResult.questions.forEach(q => {
          if (!typeMap[q.type]) typeMap[q.type] = { type: q.type, count: 0, totalScore: 0 };
          typeMap[q.type].count++;
          typeMap[q.type].totalScore += Number(q.score) || 0;
        });
        analysisResult.typeSummary = Object.values(typeMap);
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
    let errorMsg = '분석 중 오류가 발생했습니다.';
    const rawMsg = error.message || '';
    const statusCode = error.status || '';

    if (error.status === 413 || rawMsg.includes('too large') || rawMsg.includes('size') || rawMsg.includes('maximum')) {
      errorMsg = 'PDF 파일이 API 전송 한도를 초과했습니다. 교재/시험지 PDF를 줄여서 다시 시도해주세요.';
    } else if (error.status === 401) {
      errorMsg = 'API 키가 유효하지 않습니다.';
    } else if (error.status === 429) {
      errorMsg = 'API 요청 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.status === 400) {
      errorMsg = `API 요청 오류: ${rawMsg.substring(0, 300)}`;
    } else if (error.status === 529 || error.status === 503) {
      errorMsg = 'Claude API 서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.';
    } else {
      errorMsg = `분석 중 오류 (${statusCode}): ${rawMsg.substring(0, 300)}`;
    }
    sendEvent('error', { message: errorMsg });
    res.end();
  } finally {
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
    model: MODEL,
    version: '2.0.0'
  });
});

const server = app.listen(PORT, () => {
  console.log(`시험지 분석기 서버 시작: http://localhost:${PORT}`);
  console.log(`사용 모델: ${MODEL}`);
  console.log(`API 키 설정: ${process.env.ANTHROPIC_API_KEY ? '확인됨' : '⚠️ 미설정'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM 수신, 서버 종료 중...');
  server.close(() => {
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
