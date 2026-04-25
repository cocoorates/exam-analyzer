-- ═══════════════════════════════════════════════════
-- WonderBridge 모의고사 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요
-- ═══════════════════════════════════════════════════

-- 1) 모의고사 시험 정보 테이블
CREATE TABLE IF NOT EXISTS mock_exams (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade         TEXT NOT NULL CHECK (grade IN ('고1','고2','고3')),
  year          INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month         INTEGER NOT NULL CHECK (month IN (3,4,6,7,9,10,11)),
  total_questions INTEGER NOT NULL DEFAULT 45,
  description   TEXT,               -- e.g. "2025학년도 6월 모의고사"
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),

  UNIQUE (grade, year, month)       -- 같은 학년-연도-월 중복 방지
);

-- 2) 모의고사 문항 테이블
CREATE TABLE IF NOT EXISTS mock_questions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id         UUID NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 45),
  question_type   TEXT NOT NULL DEFAULT '객관식',  -- 객관식, 서술형, 듣기 등
  category        TEXT,               -- 대의파악, 빈칸추론, 어법, 어휘, 순서, 삽입 등
  score           INTEGER NOT NULL DEFAULT 2,  -- 배점 (2점 or 3점)
  passage         TEXT,               -- 영어 원문 (지문)
  question_text   TEXT,               -- 문제 텍스트 (질문 부분)
  choice_1        TEXT,               -- 선지 ①
  choice_2        TEXT,               -- 선지 ②
  choice_3        TEXT,               -- 선지 ③
  choice_4        TEXT,               -- 선지 ④
  choice_5        TEXT,               -- 선지 ⑤
  answer          TEXT NOT NULL,      -- 정답 (e.g. "3" 또는 서술형 답)
  explanation_ko  TEXT,               -- 한글 해설
  translation_ko  TEXT,               -- 지문 한글 번역
  passage_group   TEXT,               -- 같은 지문 공유 문항 그룹 (e.g. "41-42")
  is_listening    BOOLEAN DEFAULT false,  -- 듣기 문항 여부
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE (exam_id, question_number)  -- 같은 시험 내 문항번호 중복 방지
);

-- 3) 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_mock_exams_grade_year ON mock_exams(grade, year);
CREATE INDEX IF NOT EXISTS idx_mock_exams_year_month ON mock_exams(year, month);
CREATE INDEX IF NOT EXISTS idx_mock_questions_exam_id ON mock_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_mock_questions_category ON mock_questions(category);
CREATE INDEX IF NOT EXISTS idx_mock_questions_passage_group ON mock_questions(passage_group);

-- 4) updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_mock_exams_updated
  BEFORE UPDATE ON mock_exams
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_mock_questions_updated
  BEFORE UPDATE ON mock_questions
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 5) Row Level Security (RLS) 설정
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_questions ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 인증된 사용자 허용
CREATE POLICY "mock_exams_read" ON mock_exams
  FOR SELECT USING (true);

CREATE POLICY "mock_questions_read" ON mock_questions
  FOR SELECT USING (true);

-- 쓰기: 관리자만 (service_role key 사용 시 bypass)
-- 나중에 관리자 role 추가 시 정책 수정 가능
CREATE POLICY "mock_exams_admin_insert" ON mock_exams
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "mock_exams_admin_update" ON mock_exams
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "mock_exams_admin_delete" ON mock_exams
  FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "mock_questions_admin_insert" ON mock_questions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "mock_questions_admin_update" ON mock_questions
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "mock_questions_admin_delete" ON mock_questions
  FOR DELETE USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════
-- 실행 완료 확인
-- ═══════════════════════════════════════════════════
SELECT 'mock_exams 테이블 생성 완료' AS result
UNION ALL
SELECT 'mock_questions 테이블 생성 완료';
