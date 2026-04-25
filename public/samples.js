// ═══════════════════════════════════════
// 10 Sample UI designs for 교과서 문제은행
// ═══════════════════════════════════════

function buildSamplePages() {
  const container = document.getElementById('samplePagesContainer');
  if (!container) return;

  // ─── S1: Bento Grid ───
  const s1 = `
  <div class="sample-page" id="pageS1">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--blush-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--blush);color:var(--blush-ink)">시안 1 — Bento Grid</span>
        <h1>교과서 문제은행</h1>
        <p>벤토 그리드 레이아웃으로 교과서별 통계와 지문을 한눈에 조망합니다.</p>
      </div>
    </div></div>
    <div class="s1-bento">
      <div class="s1-cell span2" style="background:linear-gradient(135deg, oklch(0.96 0.03 25), oklch(0.98 0.01 80))">
        <span class="s1-tag" style="background:var(--blush);color:var(--blush-ink)">공통영어1</span>
        <div class="s1-count" style="color:var(--blush-ink)">10</div>
        <div class="s1-sub">교과서 수록 · 전 출판사 대응</div>
        <div class="s1-mini-grid">
          <div class="s1-mini-card" style="background:rgba(255,255,255,.7)">능률(민병천)</div>
          <div class="s1-mini-card" style="background:rgba(255,255,255,.7)">능률(오선영)</div>
          <div class="s1-mini-card" style="background:rgba(255,255,255,.7)">동아(이병민)</div>
          <div class="s1-mini-card" style="background:rgba(255,255,255,.7)">미래엔(김성연)</div>
        </div>
      </div>
      <div class="s1-cell tall" style="background:oklch(0.96 0.02 240)">
        <span class="s1-tag" style="background:var(--sky);color:var(--sky-ink)">인기 교재</span>
        <h3 style="margin-top:12px">능률(민병천) 22</h3>
        <div class="s1-sub" style="margin-top:4px">Lesson 1~6 + Special 1~2</div>
        <div style="margin-top:16px;font-size:13px;color:var(--ink-600)">
          <div style="padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06)">✓ Lesson 1 · 4 지문</div>
          <div style="padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06)">✓ Lesson 2 · 4 지문</div>
          <div style="padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06)">✓ Lesson 3 · 4 지문</div>
          <div style="padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06)">✓ Lesson 4 · 4 지문</div>
          <div style="padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06)">✓ Lesson 5 · 4 지문</div>
          <div style="padding:6px 0">✓ Lesson 6 · 4 지문</div>
        </div>
      </div>
      <div class="s1-cell" style="background:oklch(0.96 0.02 150)">
        <span class="s1-tag" style="background:var(--sage);color:var(--sage-ink)">공통영어2</span>
        <div class="s1-count" style="color:var(--sage-ink)">15</div>
        <div class="s1-sub">교과서 수록</div>
      </div>
      <div class="s1-cell" style="background:oklch(0.96 0.02 300)">
        <span class="s1-tag" style="background:var(--lilac);color:var(--lilac-ink)">총 지문 수</span>
        <div class="s1-count" style="color:var(--lilac-ink)">680+</div>
        <div class="s1-sub">전 교과서 합산</div>
      </div>
      <div class="s1-cell" style="background:oklch(0.96 0.02 80)">
        <span class="s1-tag" style="background:var(--honey);color:var(--honey-ink)">유형</span>
        <div class="s1-count" style="color:var(--honey-ink)">12</div>
        <div class="s1-sub">문제 유형 지원</div>
      </div>
      <div class="s1-cell span2" style="background:var(--white)">
        <h3>빠른 생성</h3>
        <div class="s1-sub" style="margin-bottom:12px">자주 쓰는 조합을 원클릭으로</div>
        <div class="s1-mini-grid" style="grid-template-columns:1fr 1fr 1fr 1fr">
          <div class="s1-mini-card" style="background:var(--blush);text-align:center">요지 · 상</div>
          <div class="s1-mini-card" style="background:var(--sky);text-align:center">빈칸 · 절</div>
          <div class="s1-mini-card" style="background:var(--sage);text-align:center">어법 · 밑줄</div>
          <div class="s1-mini-card" style="background:var(--lilac);text-align:center">순서 · 상</div>
        </div>
      </div>
    </div>
  </div>`;

  // ─── S2: Kanban Board ───
  const s2 = `
  <div class="sample-page" id="pageS2">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--sky-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--sky);color:var(--sky-ink)">시안 2 — Kanban Board</span>
        <h1>교과서 문제은행</h1>
        <p>칸반 보드 형태로 과목별 교과서를 한눈에 정리합니다.</p>
      </div>
    </div></div>
    <div class="s2-board">
      ${['공통영어1','공통영어2','영어','중등'].map((subj,si) => {
        const colors = [
          {border:'var(--blush-ink)',bg:'var(--blush)',color:'var(--blush-ink)'},
          {border:'var(--sage-ink)',bg:'var(--sage)',color:'var(--sage-ink)'},
          {border:'var(--sky-ink)',bg:'var(--sky)',color:'var(--sky-ink)'},
          {border:'var(--honey-ink)',bg:'var(--honey)',color:'var(--honey-ink)'}
        ][si];
        const pubs = si < 2 ? ['능률(민병천)','능률(오선영)','동아(이병민)','미래엔(김성연)','비상(홍민표)'] :
                    si === 2 ? ['YBM(김)','천재(이)','비상(박)'] : ['중2 능률','중3 동아','중2 천재'];
        return `<div class="s2-col">
          <div class="s2-col-head" style="border-color:${colors.border}">
            <h3>${subj}</h3>
            <span class="s2-badge" style="background:${colors.bg};color:${colors.color}">${pubs.length}</span>
          </div>
          ${pubs.map(p => `<div class="s2-item">
            <h4>${p}</h4>
            <p>22 지문 · 6 Lessons</p>
            <div class="s2-chips">
              <span class="s2-chip" style="background:var(--blush);color:var(--blush-ink)">요지</span>
              <span class="s2-chip" style="background:var(--sky);color:var(--sky-ink)">빈칸</span>
              <span class="s2-chip" style="background:var(--sage);color:var(--sage-ink)">어법</span>
            </div>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // ─── S3: Magazine Layout ───
  const s3 = `
  <div class="sample-page" id="pageS3">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--sage-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--sage);color:var(--sage-ink)">시안 3 — Magazine</span>
        <h1>교과서 문제은행</h1>
        <p>매거진 스타일의 시각적 레이아웃으로 교재를 탐색합니다.</p>
      </div>
    </div></div>
    <div class="s3-hero-card">
      <div class="s3-hero-visual" style="background:linear-gradient(135deg, oklch(0.96 0.03 25), oklch(0.97 0.02 80))">
        <span class="sample-label" style="background:rgba(255,255,255,.7);color:var(--ink-700)">FEATURED</span>
        <h2>공통영어1<br>능률(민병천)</h2>
        <p>전체 8개 Lesson, 32 지문 수록.<br>가장 많은 선생님이 선택한 교재입니다.</p>
      </div>
      <div class="s3-hero-right" style="background:var(--white)">
        <h3 style="font-size:13px;color:var(--ink-400);letter-spacing:0.06em;margin:0 0 8px;font-weight:600">LESSONS</h3>
        <ul class="s3-list">
          ${['Lesson 1','Lesson 2','Lesson 3','Lesson 4','Lesson 5','Lesson 6','Special 1','Special 2'].map((l,i) => {
            const cs = [
              {bg:'var(--blush)',c:'var(--blush-ink)'},{bg:'var(--sky)',c:'var(--sky-ink)'},
              {bg:'var(--sage)',c:'var(--sage-ink)'},{bg:'var(--honey)',c:'var(--honey-ink)'},
              {bg:'var(--lilac)',c:'var(--lilac-ink)'},{bg:'var(--mint)',c:'var(--mint-ink)'},
              {bg:'var(--rose)',c:'var(--rose-ink)'},{bg:'var(--blush)',c:'var(--blush-ink)'}
            ][i];
            return `<li>
              <span class="s3-num" style="background:${cs.bg};color:${cs.c}">${i+1}</span>
              <div class="s3-info"><h4>${l}</h4><span>4 지문</span></div>
            </li>`;
          }).join('')}
        </ul>
      </div>
    </div>
    <div class="s3-bottom-cards">
      <div class="s3-bcard" style="border-top:3px solid var(--blush-ink)">
        <h3>빈칸 추론</h3>
        <p>절 빈칸 · 구 빈칸 · 단어 빈칸 3가지 난이도로 자동 생성</p>
      </div>
      <div class="s3-bcard" style="border-top:3px solid var(--sage-ink)">
        <h3>어법 · 어휘</h3>
        <p>밑줄형과 양자택일형 중 선택하여 출제</p>
      </div>
      <div class="s3-bcard" style="border-top:3px solid var(--sky-ink)">
        <h3>대의파악</h3>
        <p>요지 · 주제 · 제목 · 요약 통합 유형 지원</p>
      </div>
    </div>
  </div>`;

  // ─── S4: Sidebar + Table ───
  const s4 = `
  <div class="sample-page" id="pageS4">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--honey-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--honey);color:var(--honey-ink)">시안 4 — Table View</span>
        <h1>교과서 문제은행</h1>
        <p>사이드바 내비게이션 + 테이블 뷰로 정밀하게 지문을 관리합니다.</p>
      </div>
    </div></div>
    <div class="s4-layout">
      <div class="s4-sidebar">
        <h3>과목</h3>
        ${['공통영어1','공통영어2','영어','중2','중3'].map((s,i) => {
          const cs = ['var(--blush-ink)','var(--sage-ink)','var(--sky-ink)','var(--honey-ink)','var(--lilac-ink)'];
          return `<div class="s4-nav-item${i===0?' active':''}">
            <span class="dot" style="background:${cs[i]}"></span> ${s}
          </div>`;
        }).join('')}
        <h3 style="margin-top:20px">출판사</h3>
        ${['능률','동아','미래엔','비상','천재','YBM'].map(p => `<div class="s4-nav-item">${p}</div>`).join('')}
      </div>
      <div class="s4-main-table">
        <table>
          <thead><tr>
            <th style="width:30px"><input type="checkbox"></th>
            <th>교과서</th><th>과목</th><th>출판사</th><th>Lessons</th><th>지문 수</th>
          </tr></thead>
          <tbody>
            ${[
              ['능률(민병천)','공통영어1','능률','8','32'],
              ['능률(오선영)','공통영어1','능률','6','24'],
              ['동아(이병민)','공통영어1','동아','6','24'],
              ['미래엔(김성연)','공통영어1','미래엔','6','24'],
              ['비상(홍민표)','공통영어1','비상','6','24'],
              ['지학사(신상근)','공통영어1','지학사','6','24'],
              ['천재(강상구)','공통영어1','천재','6','24'],
              ['천재(조수경)','공통영어1','천재','6','24'],
              ['YBM(김은형)','공통영어1','YBM','6','24'],
              ['YBM(박준언)','공통영어1','YBM','6','24'],
            ].map(r => `<tr>
              <td><input type="checkbox"></td>
              <td style="font-weight:550">${r[0]}</td>
              <td><span style="padding:3px 8px;border-radius:var(--r-pill);background:var(--sky);color:var(--sky-ink);font-size:12px">${r[1]}</span></td>
              <td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  // ─── S5: Spotlight Search ───
  const s5 = `
  <div class="sample-page" id="pageS5">
    <div class="page-head" style="justify-content:center;text-align:center"><div class="page-title-block" style="flex-direction:column;align-items:center">
      <span class="sample-label" style="background:var(--lilac);color:var(--lilac-ink)">시안 5 — Spotlight</span>
      <h1 style="text-align:center">교과서 문제은행</h1>
      <p style="text-align:center">검색 중심 인터페이스. 교재·단원·지문을 빠르게 찾아 선택합니다.</p>
    </div></div>
    <div class="s5-search-wrap">
      <div class="s5-search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="교재 · 단원 · 본문 검색">
        <span style="font-size:12px;color:var(--ink-300);padding:4px 10px;background:var(--paper-2);border-radius:6px">⌘K</span>
      </div>
      <div class="s5-chips">
        ${['공통영어1','공통영어2','능률','동아','미래엔','Lesson 1'].map(c =>
          `<button class="tb-chip">${c}</button>`
        ).join('')}
      </div>
    </div>
    <div class="s5-results">
      ${[
        {name:'공통영어1 능률(민병천)',sub:'22 지문 · 6 Lessons + Special 2',bg:'var(--blush)',c:'var(--blush-ink)'},
        {name:'공통영어1 능률(오선영)',sub:'24 지문 · 6 Lessons',bg:'var(--sky)',c:'var(--sky-ink)'},
        {name:'공통영어1 동아(이병민)',sub:'24 지문 · 6 Lessons',bg:'var(--sage)',c:'var(--sage-ink)'},
        {name:'공통영어1 미래엔(김성연)',sub:'24 지문 · 6 Lessons',bg:'var(--honey)',c:'var(--honey-ink)'},
        {name:'공통영어1 비상(홍민표)',sub:'24 지문 · 6 Lessons',bg:'var(--lilac)',c:'var(--lilac-ink)'},
        {name:'공통영어2 능률(민병천)',sub:'24 지문 · 6 Lessons',bg:'var(--mint)',c:'var(--mint-ink)'},
        {name:'공통영어2 동아(이병민)',sub:'24 지문 · 6 Lessons',bg:'var(--rose)',c:'var(--rose-ink)'},
      ].map((r,i) => `<div class="s5-result-item">
        <div class="s5-result-num" style="background:${r.bg};color:${r.c}">${String(i+1).padStart(2,'0')}</div>
        <div class="s5-result-info"><h4>${r.name}</h4><span>${r.sub}</span></div>
        <span class="s5-result-arrow">→</span>
      </div>`).join('')}
    </div>
  </div>`;

  // ─── S6: Accordion ───
  const s6Books = [
    {name:'공통영어1 능률(민병천)',lessons:8,bg:'var(--blush)',c:'var(--blush-ink)',icon:'📕'},
    {name:'공통영어1 능률(오선영)',lessons:6,bg:'var(--sky)',c:'var(--sky-ink)',icon:'📘'},
    {name:'공통영어1 동아(이병민)',lessons:6,bg:'var(--sage)',c:'var(--sage-ink)',icon:'📗'},
    {name:'공통영어1 미래엔(김성연)',lessons:6,bg:'var(--honey)',c:'var(--honey-ink)',icon:'📒'},
    {name:'공통영어1 비상(홍민표)',lessons:6,bg:'var(--lilac)',c:'var(--lilac-ink)',icon:'📓'},
    {name:'공통영어1 지학사(신상근)',lessons:6,bg:'var(--mint)',c:'var(--mint-ink)',icon:'📔'},
  ];
  const s6 = `
  <div class="sample-page" id="pageS6">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--mint-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--mint);color:var(--mint-ink)">시안 6 — Accordion</span>
        <h1>교과서 문제은행</h1>
        <p>아코디언 형태로 교과서를 펼쳐보며 Lesson별 지문을 선택합니다.</p>
      </div>
    </div></div>
    <div class="s6-accordion">
      ${s6Books.map((b,i) => `<div class="s6-group${i===0?' open':''}" onclick="this.classList.toggle('open')">
        <div class="s6-group-head">
          <div class="s6-icon" style="background:${b.bg};color:${b.c}">${b.icon}</div>
          <h3>${b.name}</h3>
          <span class="s6-meta">${b.lessons} Lessons · ${b.lessons*4} 지문</span>
          <svg class="s6-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="s6-group-body">
          <div class="s6-lesson-list">
            ${Array.from({length:b.lessons},(_, j) => `<div class="s6-lesson-item">
              <input type="checkbox" onclick="event.stopPropagation()"> Lesson ${j+1} · 4 지문
            </div>`).join('')}
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;

  // ─── S7: Dashboard Widgets ───
  const s7 = `
  <div class="sample-page" id="pageS7">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--rose-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--rose);color:var(--rose-ink)">시안 7 — Dashboard</span>
        <h1>교과서 문제은행</h1>
        <p>대시보드 위젯으로 교재 현황과 생성 통계를 한눈에 파악합니다.</p>
      </div>
    </div></div>
    <div class="s7-widgets">
      <div class="s7-widget">
        <h3>총 교과서</h3>
        <div class="s7-big-num" style="color:var(--blush-ink)">25</div>
        <div style="font-size:13px;color:var(--ink-400);margin-top:4px">전 출판사 대응</div>
      </div>
      <div class="s7-widget">
        <h3>총 지문</h3>
        <div class="s7-big-num" style="color:var(--sage-ink)">680</div>
        <div style="font-size:13px;color:var(--ink-400);margin-top:4px">문제 생성 가능</div>
      </div>
      <div class="s7-widget">
        <h3>이번 달 생성</h3>
        <div class="s7-big-num" style="color:var(--sky-ink)">142</div>
        <div style="font-size:13px;color:var(--ink-400);margin-top:4px">문제 생성됨</div>
      </div>
      <div class="s7-widget half">
        <h3>출판사별 교재 수</h3>
        <div class="s7-bar-chart">
          ${[{h:90,c:'var(--blush-ink)',l:'능률'},{h:50,c:'var(--sky-ink)',l:'동아'},{h:45,c:'var(--sage-ink)',l:'미래엔'},
            {h:45,c:'var(--honey-ink)',l:'비상'},{h:40,c:'var(--lilac-ink)',l:'지학사'},{h:60,c:'var(--mint-ink)',l:'천재'},
            {h:55,c:'var(--rose-ink)',l:'YBM'},{h:30,c:'var(--ink-400)',l:'금성'}
          ].map(b => `<div style="flex:1;text-align:center">
            <div class="s7-bar" style="height:${b.h}px;background:${b.c}"></div>
            <div style="font-size:11px;color:var(--ink-400);margin-top:6px">${b.l}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="s7-widget">
        <h3>유형 분포</h3>
        ${['요지','빈칸','어법','어휘','순서'].map((t,i) => {
          const cs = ['var(--blush-ink)','var(--sky-ink)','var(--sage-ink)','var(--honey-ink)','var(--lilac-ink)'];
          const vs = [85,72,68,55,40];
          return `<div class="s7-progress-row">
            <span class="s7-progress-label">${t}</span>
            <div class="s7-progress-track"><div class="s7-progress-fill" style="width:${vs[i]}%;background:${cs[i]}"></div></div>
            <span class="s7-progress-val" style="color:${cs[i]}">${vs[i]}%</span>
          </div>`;
        }).join('')}
      </div>
      <div class="s7-widget full">
        <h3>최근 생성 이력</h3>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:8px">
          ${['능률(민병천) L1~3','동아(이병민) L2','미래엔 L4~5','비상 L1','천재 L3'].map((t,i) => {
            const cs = ['var(--blush)','var(--sky)','var(--sage)','var(--honey)','var(--lilac)'];
            return `<div style="background:${cs[i]};padding:14px;border-radius:10px;font-size:13px;font-weight:500">${t}</div>`;
          }).join('')}
        </div>
      </div>
    </div>
  </div>`;

  // ─── S8: Masonry Cards ───
  const s8Cards = [
    {name:'능률(민병천)',subj:'공통영어1',n:32,color:'var(--blush-ink)',bg:'var(--blush)',h:''},
    {name:'능률(오선영)',subj:'공통영어1',n:24,color:'var(--sky-ink)',bg:'var(--sky)',h:'tall'},
    {name:'동아(이병민)',subj:'공통영어1',n:24,color:'var(--sage-ink)',bg:'var(--sage)',h:''},
    {name:'미래엔(김성연)',subj:'공통영어1',n:24,color:'var(--honey-ink)',bg:'var(--honey)',h:'tall'},
    {name:'비상(홍민표)',subj:'공통영어1',n:24,color:'var(--lilac-ink)',bg:'var(--lilac)',h:''},
    {name:'지학사(신상근)',subj:'공통영어1',n:24,color:'var(--mint-ink)',bg:'var(--mint)',h:'tall'},
    {name:'천재(강상구)',subj:'공통영어1',n:24,color:'var(--rose-ink)',bg:'var(--rose)',h:''},
    {name:'천재(조수경)',subj:'공통영어1',n:24,color:'var(--blush-ink)',bg:'var(--blush)',h:''},
    {name:'YBM(김은형)',subj:'공통영어1',n:24,color:'var(--sky-ink)',bg:'var(--sky)',h:'tall'},
    {name:'능률(민병천)',subj:'공통영어2',n:24,color:'var(--sage-ink)',bg:'var(--sage)',h:''},
    {name:'동아(이병민)',subj:'공통영어2',n:24,color:'var(--honey-ink)',bg:'var(--honey)',h:''},
    {name:'미래엔(김성연)',subj:'공통영어2',n:24,color:'var(--lilac-ink)',bg:'var(--lilac)',h:'tall'},
  ];
  const s8 = `
  <div class="sample-page" id="pageS8">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:oklch(0.50 0.12 50)"></div>
      <div>
        <span class="sample-label" style="background:oklch(0.92 0.04 50);color:oklch(0.50 0.12 50)">시안 8 — Masonry</span>
        <h1>교과서 문제은행</h1>
        <p>핀터레스트 스타일 메이슨리 카드로 교재를 시각적으로 탐색합니다.</p>
      </div>
    </div></div>
    <div class="s8-masonry">
      ${s8Cards.map(c => `<div class="s8-card" style="${c.h==='tall'?'padding-bottom:40px':''}">
        <div class="s8-top-bar" style="background:${c.color}"></div>
        <h3>${c.name}</h3>
        <p>${c.subj} · ${c.n} 지문<br>${c.h==='tall'?'Lesson 1~6 + Special Lessons 포함. 가장 많은 지문이 수록된 인기 교재입니다.':c.n/4+' Lessons'}</p>
        <div class="s8-tags">
          <span class="s8-tag" style="background:${c.bg};color:${c.color}">${c.subj}</span>
          <span class="s8-tag" style="background:var(--paper-2);color:var(--ink-600)">${c.n} 지문</span>
        </div>
      </div>`).join('')}
    </div>
  </div>`;

  // ─── S9: Split Pane (Notion-like) ───
  const s9Books = [
    {name:'능률(민병천)',subj:'공통영어1',n:32,dot:'var(--blush-ink)'},
    {name:'능률(오선영)',subj:'공통영어1',n:24,dot:'var(--sky-ink)'},
    {name:'동아(이병민)',subj:'공통영어1',n:24,dot:'var(--sage-ink)'},
    {name:'미래엔(김성연)',subj:'공통영어1',n:24,dot:'var(--honey-ink)'},
    {name:'비상(홍민표)',subj:'공통영어1',n:24,dot:'var(--lilac-ink)'},
    {name:'지학사(신상근)',subj:'공통영어1',n:24,dot:'var(--mint-ink)'},
    {name:'천재(강상구)',subj:'공통영어1',n:24,dot:'var(--rose-ink)'},
  ];
  const s9 = `
  <div class="sample-page" id="pageS9">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--sky-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--sky);color:var(--sky-ink)">시안 9 — Split Pane</span>
        <h1>교과서 문제은행</h1>
        <p>Notion 스타일 좌우 분할 패널로 교재와 Lesson 상세를 동시에 탐색합니다.</p>
      </div>
    </div></div>
    <div class="s9-split">
      <div class="s9-left">
        <div class="s9-left-head">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="교재 검색">
        </div>
        ${s9Books.map((b,i) => `<div class="s9-nav-item${i===0?' active':''}">
          <span class="s9-dot" style="background:${b.dot}"></span>
          <div class="s9-nav-info">
            <strong>${b.name}</strong>
            <span>${b.subj} · ${b.n} 지문</span>
          </div>
        </div>`).join('')}
      </div>
      <div class="s9-right">
        <div class="s9-detail-head">
          <h2>능률(민병천)</h2>
          <div class="s9-detail-meta">
            <span class="s9-dm-tag" style="background:var(--sky);color:var(--sky-ink)">공통영어1</span>
            <span>8 Lessons · 32 지문</span>
          </div>
        </div>
        <div class="s9-lesson-grid">
          ${['Lesson 1','Lesson 2','Lesson 3','Lesson 4','Lesson 5','Lesson 6','Special 1','Special 2'].map((l,i) => {
            const cs = ['var(--blush)','var(--sky)','var(--sage)','var(--honey)','var(--lilac)','var(--mint)','var(--rose)','var(--blush)'];
            return `<div class="s9-lesson-card" style="border-left:3px solid ${cs[i].replace('var(--','var(--').replace(')','')}-ink)">
              <h4>${l}</h4>
              <span>4 지문 · 본문_1 ~ 본문_4</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  </div>`;

  // ─── S10: Timeline + Cards Combo ───
  const s10 = `
  <div class="sample-page" id="pageS10">
    <div class="page-head"><div class="page-title-block">
      <div class="accent" style="background:var(--lilac-ink)"></div>
      <div>
        <span class="sample-label" style="background:var(--lilac);color:var(--lilac-ink)">시안 10 — Timeline</span>
        <h1>교과서 문제은행</h1>
        <p>좌측 타임라인 + 우측 카드 그리드로 과목별 교재를 탐색합니다.</p>
      </div>
    </div></div>
    <div class="s10-layout">
      <div class="s10-timeline">
        ${['공통영어1','공통영어2','영어','중2','중3'].map((s,i) => `<div class="s10-tl-item${i===0?' active':''}">
          <h4>${s}</h4>
          <span>${[10,5,3,4,3][i]}개 교과서</span>
        </div>`).join('')}
      </div>
      <div class="s10-content">
        ${[
          {n:'능률(민병천)',p:32,bg:'oklch(0.96 0.03 25)',c:'var(--blush-ink)'},
          {n:'능률(오선영)',p:24,bg:'oklch(0.96 0.03 80)',c:'var(--honey-ink)'},
          {n:'동아(이병민)',p:24,bg:'oklch(0.96 0.03 240)',c:'var(--sky-ink)'},
          {n:'미래엔(김성연)',p:24,bg:'oklch(0.96 0.03 150)',c:'var(--sage-ink)'},
          {n:'비상(홍민표)',p:24,bg:'oklch(0.96 0.03 300)',c:'var(--lilac-ink)'},
          {n:'지학사(신상근)',p:24,bg:'oklch(0.96 0.03 170)',c:'var(--mint-ink)'},
          {n:'천재(강상구)',p:24,bg:'oklch(0.96 0.03 0)',c:'var(--rose-ink)'},
          {n:'천재(조수경)',p:24,bg:'oklch(0.96 0.03 25)',c:'var(--blush-ink)'},
          {n:'YBM(김은형)',p:24,bg:'oklch(0.96 0.03 80)',c:'var(--honey-ink)'},
          {n:'YBM(박준언)',p:24,bg:'oklch(0.96 0.03 240)',c:'var(--sky-ink)'},
        ].map(c => `<div class="s10-card" style="background:${c.bg}">
          <h4 style="color:${c.c}">${c.n}</h4>
          <p>6 Lessons · ${c.p} 지문</p>
          <div class="s10-foot">
            <span>교과서</span>
            <span style="color:${c.c}">선택 →</span>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;

  container.innerHTML = s1 + s2 + s3 + s4 + s5 + s6 + s7 + s8 + s9 + s10;
}

// Build on load
document.addEventListener('DOMContentLoaded', buildSamplePages);
