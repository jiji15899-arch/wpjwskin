/**
 * CLOUDFLARE BLOG SYSTEM - GITHUB EDITION
 * Admin, Theme, AI Plugin All-in-One
 */
import { Hono } from 'hono';

const app = new Hono();

// ==========================================
// [1] STYLE & ASSETS
// ==========================================
const THEME_CSS = `
/* Theme: 지원금 테마 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
body { background-color: #f9f9f9; padding-top: 60px; color: #333; }
a { text-decoration: none; color: inherit; }
.container { max-width: 768px; margin: 0 auto; padding: 16px; }
#header { position: fixed; top: 0; left: 0; width: 100%; height: 50px; background: white; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center;}
.logo-text { font-size: 18px; font-weight: 700; color: #2c3e50; }
.intro-section { text-align: center; margin: 20px 0; }
.intro-badge { background: #ffebee; color: #d32f2f; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.intro-title { font-size: 24px; margin-top: 10px; font-weight: 800; }
.info-card-grid { display: grid; gap: 15px; margin-top: 20px; }
.info-card { display: block; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s; border: 1px solid #eee; }
.info-card:hover { transform: translateY(-3px); }
.info-card-highlight { background: #e3f2fd; padding: 15px; text-align: center; }
.info-card-amount { font-size: 20px; font-weight: 800; color: #1565c0; }
.info-card-content { padding: 15px; }
.info-card-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
.info-card-desc { font-size: 14px; color: #666; line-height: 1.5; margin-bottom: 15px; }
.info-card-btn { background: #29b6f6; color: white; text-align: center; padding: 10px; border-radius: 8px; font-weight: bold; }
.post-content { background: white; padding: 20px; border-radius: 12px; margin-top: 20px; line-height: 1.8; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.post-content h2 { font-size: 20px; margin: 30px 0 15px; border-left: 5px solid #29b6f6; padding-left: 10px; color: #333; }
.post-content h3 { font-size: 18px; margin: 25px 0 10px; color: #444; }
.post-content p { margin-bottom: 15px; word-break: keep-all; }
.post-content ul { padding-left: 20px; margin-bottom: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
.post-content li { margin-bottom: 8px; }
.post-content table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
.post-content th { background: #f1f3f5; font-weight: bold; padding: 10px; border: 1px solid #ddd; }
.post-content td { padding: 10px; border: 1px solid #ddd; }
.ad-slot { margin: 25px 0; text-align: center; background: #eee; padding: 10px; border-radius: 8px; min-height: 100px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px; }
.footer { margin-top: 50px; padding: 30px 0; background: #2c3e50; color: #ecf0f1; text-align: center; font-size: 13px; }
`;

app.get('/style.css', (c) => c.text(THEME_CSS, 200, { 'Content-Type': 'text/css' }));

// ==========================================
// [2] THEME ENGINE
// ==========================================
const renderPage = (title, content) => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="main-wrapper">
        <header id="header">
            <div class="container"><div class="logo"><span class="logo-text">정부지원금 알리미</span></div></div>
        </header>
        ${content}
        <footer class="footer">
            <div class="container">
                <p>Cloudflare Workers Blog System</p>
                <p class="copyright">Copyright © ${new Date().getFullYear()}</p>
            </div>
        </footer>
    </div>
</body>
</html>
`;

app.get('/', async (c) => {
    try {
        const posts = await c.env.DB.prepare("SELECT * FROM posts WHERE status='publish' ORDER BY created_at DESC").all();
        let cardsHtml = '';
        if (posts.results && posts.results.length > 0) {
            cardsHtml = posts.results.map(post => {
                let card = {};
                try { card = JSON.parse(post.card_data || '{}'); } catch(e){}
                if(!card.amount) return '';
                return `
                <a class="info-card" href="/post/${post.id}">
                    <div class="info-card-highlight">
                        <div class="info-card-amount">${card.amount}</div>
                    </div>
                    <div class="info-card-content">
                        <h3 class="info-card-title">${post.title}</h3>
                        <p class="info-card-desc">${card.target ? '대상: '+card.target : ''}</p>
                        <div class="info-card-btn">자세히 보기 →</div>
                    </div>
                </a>`;
            }).join('');
        } else {
            cardsHtml = '<p style="text-align:center; padding:20px;">발행된 글이 없습니다. 관리자 페이지에서 글을 작성하세요.</p>';
        }

        return c.html(renderPage('지원금 알리미', `
        <div class="container">
            <div class="intro-section">
                <span class="intro-badge">신청마감 D-3일</span>
                <h2 class="intro-title">숨은 지원금 찾기</h2>
            </div>
            <div class="info-card-grid">${cardsHtml}</div>
        </div>
        `));
    } catch (e) {
        return c.html(`<h1>시스템 설정 필요</h1><p>관리자님, Cloudflare 대시보드에서 D1 데이터베이스를 연결하고 테이블을 생성해주세요.</p><p>오류 내용: ${e.message}</p>`);
    }
});

app.get('/post/:id', async (c) => {
    const id = c.req.param('id');
    const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    const adsCode = await c.env.DB.prepare("SELECT value FROM settings WHERE key='pl_ads_code'").first('value') || '';

    if (!post) return c.text('Not Found', 404);

    const contentWithAds = post.content.replace(//g, `<div class="ad-slot">${adsCode || '광고 영역'}</div>`);
    let cardHtml = '';
    try {
        const card = JSON.parse(post.card_data || '{}');
        if(card.amount) {
            cardHtml = `<div class="info-card" style="margin-bottom:30px;"><div class="info-card-highlight"><div class="info-card-amount">${card.amount}</div></div></div>`;
        }
    } catch(e){}

    return c.html(renderPage(post.title, `
    <div class="container">
        <h1 style="font-size:26px; font-weight:bold; margin:20px 0;">${post.title}</h1>
        <p style="color:#888; font-size:13px; margin-bottom:20px;">${new Date(post.created_at).toLocaleDateString()}</p>
        ${cardHtml}
        <div class="post-content">${contentWithAds}</div>
        <div style="margin-top:30px; text-align:center;"><a href="/" class="info-card-btn" style="display:inline-block; padding:12px 30px;">목록으로</a></div>
    </div>
    `));
});

// ==========================================
// [3] ADMIN & AI PLUGIN
// ==========================================
const adminLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>관리자</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/wordpress-admin-interface/1.0.0/wp-admin.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        body { background: #f1f1f1; }
        .wp-admin-sidebar { width: 160px; background: #23282d; position: fixed; height: 100%; top:0; left:0; color: #fff; z-index:999; }
        .wp-admin-sidebar a { display: block; padding: 12px; color: #eee; text-decoration: none; border-bottom:1px solid #333; }
        .wp-admin-sidebar a:hover, .wp-admin-sidebar a.active { background: #0073aa; color: #fff; }
        .wp-content { margin-left: 160px; padding: 20px; }
        .wrap { background: #fff; padding: 20px; border: 1px solid #ccd0d4; max-width:1200px; margin:0 auto; }
        input[type="text"], textarea, select { border:1px solid #ddd; padding:8px; border-radius:4px; }
        .alpack-meta-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; }
        .alpack-header { background: #fdfdfd; padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; display:flex; justify-content:space-between; }
        .alpack-body { padding: 15px; }
        .alpack-btn { width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .alpack-btn:hover { background: #006ba1; }
        .loader { height: 4px; background: #f0f0f0; margin-top: 10px; display:none; }
        .loader-bar { height: 100%; background: #007cba; width: 0%; }
    </style>
</head>
<body>
    <div class="wp-admin-sidebar">
        <div style="padding:15px; font-weight:bold; background:#0073aa;">ALPACK Admin</div>
        <a href="/admin-cf">알림판</a>
        <a href="/admin-post">새 글 쓰기</a>
        <a href="/" target="_blank">사이트 보기</a>
    </div>
    <div class="wp-content">${content}</div>
</body>
</html>
`;

app.get('/admin-login', (c) => c.html(`
    <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f0f0f1;">
        <form method="post" action="/api/login" style="background:#fff; padding:30px; border:1px solid #c3c4c7; width:300px; text-align:center;">
            <h3>관리자 로그인</h3>
            <input type="password" name="password" placeholder="비밀번호" style="width:100%; padding:10px; margin-bottom:15px;">
            <button type="submit" style="width:100%; padding:10px; background:#2271b1; color:white; border:none; cursor:pointer;">로그인</button>
        </form>
    </div>
`));

app.get('/admin-cf', (c) => c.html(adminLayout(`
    <div class="wrap"><h1>관리자 알림판</h1><p>GitHub 연동 배포 완료! 글쓰기 메뉴에서 AI 생성을 시작하세요.</p></div>
`)));

app.get('/admin-post', async (c) => {
    const defaultTopic = await c.env.DB.prepare("SELECT value FROM settings WHERE key='pl_v23_topic'").first('value') || '';
    const defaultAds = await c.env.DB.prepare("SELECT value FROM settings WHERE key='pl_ads_code'").first('value') || '';

    return c.html(adminLayout(`
    <div class="wrap">
        <h1 style="font-size:24px; margin-bottom:20px;">글 쓰기</h1>
        <div style="display:flex; gap:20px;">
            <div style="flex:3;">
                <input type="text" id="post_title" placeholder="제목을 입력하세요" style="width:100%; padding:12px; font-size:1.5em; margin-bottom:20px;">
                <input type="hidden" id="card_data_json">
                <div id="editor_area" contenteditable="true" style="min-height:600px; background:#fff; border:1px solid #ddd; padding:20px; outline:none;">
                    <p style="color:#999;">오른쪽 AI 생성기를 사용하여 글을 자동으로 작성하세요.</p>
                </div>
                <button onclick="savePost()" class="button button-primary" style="margin-top:20px; padding:10px 20px; background:#2271b1; color:white; border:none; cursor:pointer;">발행하기</button>
            </div>
            <div style="flex:1; min-width:300px;">
                <div class="alpack-meta-box">
                    <div class="alpack-header"><span>☁️ ALPACK AI</span></div>
                    <div class="alpack-body">
                        <label style="font-weight:bold; font-size:12px;">🎯 주제</label>
                        <input type="text" id="pl_topic" value="${defaultTopic}" style="width:100%; margin-bottom:10px;">
                        <label style="font-weight:bold; font-size:12px;">💰 애드센스 코드</label>
                        <textarea id="pl_ads" style="width:100%; height:80px; font-size:11px;">${defaultAds}</textarea>
                        <button type="button" id="btn_generate" class="alpack-btn" onclick="runAI()">🚀 생성 시작</button>
                        <div id="ai_status" class="loader"><div class="loader-bar" id="progress_bar"></div></div>
                        <div id="status_msg" style="font-size:12px; margin-top:5px; text-align:center;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        async function runAI() {
            const topic = $('#pl_topic').val();
            const ads = $('#pl_ads').val();
            if(!topic) return alert('주제를 입력하세요.');
            $('#btn_generate').prop('disabled', true);
            $('#ai_status').show();
            $('#progress_bar').css('width', '10%'); $('#status_msg').text('AI 분석 중...');
            
            try {
                const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ topic, ads }) });
                $('#progress_bar').css('width', '60%'); $('#status_msg').text('콘텐츠 작성 중...');
                const data = await res.json();
                if(!data.success) throw new Error(data.error);

                $('#post_title').val(data.title);
                $('#editor_area').html(data.content);
                $('#card_data_json').val(JSON.stringify(data.card));
                $('#progress_bar').css('width', '100%'); $('#status_msg').text('완료!');
                $('#btn_generate').prop('disabled', false);
            } catch(e) {
                alert('오류: ' + e.message);
                $('#btn_generate').prop('disabled', false);
            }
        }
        async function savePost() {
            const title = $('#post_title').val();
            const content = $('#editor_area').html();
            const card_data = $('#card_data_json').val();
            if(!title) return alert('제목 입력 필요');
            await fetch('/api/save-post', { method: 'POST', body: JSON.stringify({ title, content, card_data }) });
            alert('발행 완료!'); window.location.href = '/';
        }
    </script>
    `));
});

// ==========================================
// [4] API (Backend)
// ==========================================
app.post('/api/generate', async (c) => {
    const { topic, ads } = await c.req.json();
    const systemPrompt = `You are a Korean blog expert. Output JSON ONLY: {"title":"...","card":{"amount":"...","target":"..."},"content":"...HTML..."}. Insert '' twice in content.`;
    const userPrompt = `Topic: ${topic}. Write a click-baity subsidy post.`;

    try {
        const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] });
        let raw = response.response;
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if(!jsonMatch) throw new Error("AI 응답 오류");
        const result = JSON.parse(jsonMatch[0]);
        if(ads) await c.env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('pl_ads_code', ?)").bind(ads).run();
        return c.json({ success: true, ...result });
    } catch (e) { return c.json({ success: false, error: e.message }); }
});

app.post('/api/save-post', async (c) => {
    const { title, content, card_data } = await c.req.json();
    await c.env.DB.prepare("INSERT INTO posts (title, content, card_data) VALUES (?, ?, ?)").bind(title, content, card_data).run();
    return c.json({ success: true });
});

app.post('/api/login', async (c) => {
    const body = await c.req.parseBody();
    const dbPass = await c.env.DB.prepare("SELECT value FROM settings WHERE key='admin_password'").first('value');
    if(body.password === dbPass) return c.redirect('/admin-cf');
    return c.text('비밀번호 오류', 403);
});

export default app;
