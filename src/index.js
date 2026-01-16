import { Hono } from 'hono';

const app = new Hono();

// [1] 제공해주신 테마의 CSS 디자인 (100% 반영)
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
body { background-color: #fff; padding-top: 60px; color: #333; }
.container { max-width: 768px; margin: 0 auto; padding: 16px; }

/* 헤더 디자인 */
#header { position: fixed; top: 0; left: 0; width: 100%; height: 50px; background: white; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; border-bottom: 1px solid #eee; }
.logo-text { font-size: 18px; font-weight: 800; color: #1a73e8; }

/* 히어로 섹션 (요구사항) */
.hero-section { background: #F0F9FF; border-radius: 20px; padding: 32px 20px; text-align: center; margin-bottom: 24px; border: 1px solid #e0f2fe; }
.hero-urgent { background: #ff4d4d; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
.hero-title { font-size: 28px; font-weight: 800; margin: 15px 0; color: #1e293b; }
.hero-cta { background: #1a73e8; color: white; display: inline-block; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 10px; }

/* 카드 리스트 */
.info-card-grid { display: grid; gap: 16px; }
.info-card { display: block; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-decoration: none; color: inherit; transition: 0.2s; background: white; }
.info-card:hover { border-color: #1a73e8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.card-badge { color: #ff4d4d; font-size: 13px; font-weight: bold; margin-bottom: 8px; display: block; }
.card-amount { font-size: 22px; font-weight: 800; color: #1a73e8; margin: 10px 0; }
.card-btn { background: #f1f5f9; text-align: center; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: bold; color: #475569; margin-top: 10px; }

/* 포스트 본문 */
.post-content { line-height: 1.8; font-size: 16px; color: #444; }
.post-content h2 { margin: 30px 0 15px; color: #1e293b; border-left: 4px solid #1a73e8; padding-left: 12px; }
.ad-slot { margin: 20px 0; background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; color: #94a3b8; border: 1px dashed #cbd5e1; }
.footer { padding: 40px 0; background: #f8fafc; color: #64748b; text-align: center; font-size: 13px; margin-top: 60px; }
`;

app.get('/style.css', (c) => c.text(THEME_CSS, 200, { 'Content-Type': 'text/css' }));

// [2] 페이지 레이아웃 엔진
const renderPage = (title, content) => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header id="header"><div class="container"><span class="logo-text">정부지원금 알리미</span></div></header>
    <div class="main-wrapper">${content}</div>
    <footer class="footer"><p>© ${new Date().getFullYear()} 정부지원금 알리미 서비스</p></footer>
</body>
</html>
`;

// [3] 메인 페이지 (히어로 섹션 추가)
app.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare("SELECT * FROM posts WHERE status='publish' ORDER BY created_at DESC").all();
        
        const heroHtml = `
            <div class="hero-section">
                <span class="hero-urgent">🔥 신청마감 D-3일</span>
                <h2 class="hero-title">나의 <span style="color:#1a73e8">숨은 지원금</span> 찾기</h2>
                <p style="color:#64748b; margin-bottom:20px;">신청자 1인 평균 127만원 수령</p>
                <a href="#" class="hero-cta">30초만에 내 지원금 확인 →</a>
            </div>
        `;

        const cardsHtml = results.length > 0 ? results.map(post => {
            const card = JSON.parse(post.card_data || '{}');
            return `
            <a class="info-card" href="/post/${post.id}">
                <span class="card-badge">신청마감 D-3일</span>
                <h3 style="font-weight:bold; font-size:18px;">${post.title}</h3>
                <div class="card-amount">${card.amount || '상세내용 확인'}</div>
                <div class="card-btn">지금 바로 신청하기 →</div>
            </a>`;
        }).join('') : '<p style="text-align:center;">작성된 글이 없습니다.</p>';

        return c.html(renderPage('지원금 알리미', `<div class="container">${heroHtml}<div class="info-card-grid">${cardsHtml}</div></div>`));
    } catch (e) {
        return c.html(`<h1>DB 연결 필요</h1><p>에러: ${e.message}</p>`);
    }
});

// [4] 상세 페이지 (오류 발생 지점 수정 완료)
app.get('/post/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
        if (!post) return c.text('Not Found', 404);

        const ads = await c.env.DB.prepare("SELECT value FROM settings WHERE key='pl_ads_code'").first('value') || '';
        const card = JSON.parse(post.card_data || '{}');
        
        const contentWithAds = post.content.replace(//g, `<div class="ad-slot">${ads || '광고 영역'}</div>`);
        
        const bodyContent = `
            <div class="container">
                <div style="margin: 20px 0;">
                    <span class="hero-urgent">공고소식</span>
                    <h1 style="font-size:26px; font-weight:800; margin:15px 0;">${post.title}</h1>
                </div>
                <div class="hero-section" style="padding:20px; text-align:left;">
                    <div style="color:#64748b; font-size:14px;">지원 금액</div>
                    <div style="font-size:24px; font-weight:800; color:#1a73e8;">${card.amount || '상세내용 참고'}</div>
                </div>
                <div class="post-content">${contentWithAds}</div>
            </div>
        `;
        return c.html(renderPage(post.title, bodyContent));
    } catch (e) {
        return c.text('Error: ' + e.message);
    }
});

// [5] 관리자 및 AI API
app.get('/admin-login', (c) => c.html(`
    <div style="padding:100px 20px; text-align:center; max-width:400px; margin:0 auto;">
        <h2 style="margin-bottom:20px;">관리자 로그인</h2>
        <form method="post" action="/api/login">
            <input type="password" name="password" placeholder="비밀번호" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <button type="submit" style="width:100%; padding:12px; background:#1a73e8; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">로그인</button>
        </form>
    </div>
`));

app.post('/api/login', async (c) => {
    const body = await c.req.parseBody();
    const dbPass = await c.env.DB.prepare("SELECT value FROM settings WHERE key='admin_password'").first('value');
    return body.password === dbPass ? c.redirect('/admin-post') : c.text('비밀번호가 틀렸습니다.');
});

app.get('/admin-post', (c) => c.html(renderPage('AI 글쓰기', `
    <div class="container">
        <h2 style="margin-bottom:20px;">AI 자동 글쓰기</h2>
        <input type="text" id="topic" placeholder="주제 입력 (예: 소상공인 전기요금 지원)" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
        <button onclick="runAI()" id="btn" style="width:100%; padding:15px; background:#1a73e8; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">AI 글 생성 시작</button>
        
        <div id="result-area" style="display:none; margin-top:30px;">
            <input type="text" id="t" style="width:100%; padding:12px; margin-bottom:10px; font-weight:bold;">
            <div id="editor" contenteditable="true" style="background:white; min-height:400px; border:1px solid #ddd; padding:20px; border-radius:8px; margin-bottom:20px;"></div>
            <button onclick="save()" style="width:100%; padding:15px; background:black; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">최종 발행하기</button>
        </div>
    </div>
    <script>
        async function runAI() {
            const btn = document.getElementById('btn');
            btn.innerText = 'AI가 정보를 분석하고 글을 쓰는 중... (약 10초)';
            btn.disabled = true;
            try {
                const res = await fetch('/api/generate', { method:'POST', body: JSON.stringify({ topic: document.getElementById('topic').value }) });
                const data = await res.json();
                document.getElementById('t').value = data.title;
                document.getElementById('editor').innerHTML = data.content;
                window.cardData = data.card;
                document.getElementById('result-area').style.display = 'block';
                btn.innerText = '생성 완료!';
            } catch(e) { alert('AI 생성 중 오류 발생'); btn.disabled = false; }
        }
        async function save() {
            await fetch('/api/save-post', { method:'POST', body: JSON.stringify({ 
                title: document.getElementById('t').value, 
                content: document.getElementById('editor').innerHTML,
                card_data: JSON.stringify(window.cardData || {})
            }) });
            alert('성공적으로 발행되었습니다.'); location.href='/';
        }
    </script>
`)));

app.post('/api/generate', async (c) => {
    const { topic } = await c.req.json();
    const prompt = `주제: ${topic}. 
    정부 지원 정책 블로그 글을 작성해줘. 
    반드시 다음 JSON 형식으로만 응답해: {"title":"제목","card":{"amount":"지원금액(예: 최대 20만원)"},"content":"본문 HTML (h2, p 태그 사용)"}`;
    
    const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { messages: [{ role: 'user', content: prompt }] });
    const match = response.response.match(/\{[\s\S]*\}/);
    return c.json(JSON.parse(match[0]));
});

app.post('/api/save-post', async (c) => {
    const { title, content, card_data } = await c.req.json();
    await c.env.DB.prepare("INSERT INTO posts (title, content, card_data, status) VALUES (?, ?, ?, 'publish')").bind(title, content, card_data).run();
    return c.json({ success: true });
});

export default app;
