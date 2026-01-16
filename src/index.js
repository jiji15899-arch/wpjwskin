import { Hono } from 'hono';

const app = new Hono();

// [1] CSS 디자인
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
body { background-color: #f9f9f9; padding-top: 60px; color: #333; }
.container { max-width: 768px; margin: 0 auto; padding: 16px; }
#header { position: fixed; top: 0; left: 0; width: 100%; height: 50px; background: white; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center;}
.logo-text { font-size: 18px; font-weight: 700; color: #2c3e50; }
.info-card-grid { display: grid; gap: 15px; margin-top: 20px; }
.info-card { display: block; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #eee; text-decoration: none; color: inherit; }
.info-card-highlight { background: #e3f2fd; padding: 15px; text-align: center; }
.info-card-amount { font-size: 20px; font-weight: 800; color: #1565c0; }
.info-card-content { padding: 15px; }
.info-card-btn { background: #29b6f6; color: white; text-align: center; padding: 10px; border-radius: 8px; font-weight: bold; }
.post-content { background: white; padding: 20px; border-radius: 12px; line-height: 1.8; }
.ad-slot { margin: 25px 0; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px; color: #999; }
.footer { margin-top: 50px; padding: 30px 0; background: #2c3e50; color: white; text-align: center; font-size: 13px; }
`;

app.get('/style.css', (c) => c.text(THEME_CSS, 200, { 'Content-Type': 'text/css' }));

// [2] 페이지 렌더링 엔진
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
    ${content}
    <footer class="footer"><p>© ${new Date().getFullYear()} AI Blog System</p></footer>
</body>
</html>
`;

// [3] 메인 페이지
app.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare("SELECT * FROM posts WHERE status='publish' ORDER BY created_at DESC").all();
        let cardsHtml = results.length > 0 ? results.map(post => {
            let card = JSON.parse(post.card_data || '{}');
            return `
            <a class="info-card" href="/post/${post.id}">
                <div class="info-card-highlight"><div class="info-card-amount">${card.amount || '상세내용 확인'}</div></div>
                <div class="info-card-content">
                    <h3 style="font-weight:bold; margin-bottom:10px;">${post.title}</h3>
                    <div class="info-card-btn">자세히 보기 →</div>
                </div>
            </a>`;
        }).join('') : '<p style="text-align:center;">작성된 글이 없습니다.</p>';

        return c.html(renderPage('지원금 알리미', `<div class="container"><div class="info-card-grid">${cardsHtml}</div></div>`));
    } catch (e) {
        return c.html(`<h1>설정 필요</h1><p>D1 데이터베이스 바인딩을 확인하세요. 오류: ${e.message}</p>`);
    }
});

// [4] 상세 페이지 (오류 발생 지점 수정 완료)
app.get('/post/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
        if (!post) return c.text('Not Found', 404);

        const adsCode = await c.env.DB.prepare("SELECT value FROM settings WHERE key='pl_ads_code'").first('value') || '';
        const contentWithAds = post.content.replace(//g, `<div class="ad-slot">${adsCode || '광고 영역'}</div>`);
        
        let cardHtml = '';
        const card = JSON.parse(post.card_data || '{}');
        if(card.amount) {
            cardHtml = `<div class="info-card" style="margin-bottom:30px;"><div class="info-card-highlight"><div class="info-card-amount">${card.amount}</div></div></div>`;
        }

        return c.html(renderPage(post.title, `
            <div class="container">
                <h1 style="font-size:24px; margin-bottom:20px;">${post.title}</h1>
                ${cardHtml}
                <div class="post-content">${contentWithAds}</div>
            </div>
        `));
    } catch (e) {
        return c.text('Error: ' + e.message);
    }
});

// [5] 관리자 및 API
app.get('/admin-login', (c) => c.html(`
    <div style="padding:50px; text-align:center;">
        <form method="post" action="/api/login">
            <input type="password" name="password" placeholder="비밀번호">
            <button type="submit">로그인</button>
        </form>
    </div>
`));

app.post('/api/login', async (c) => {
    const body = await c.req.parseBody();
    const dbPass = await c.env.DB.prepare("SELECT value FROM settings WHERE key='admin_password'").first('value');
    return body.password === dbPass ? c.redirect('/admin-post') : c.text('실패');
});

app.get('/admin-post', (c) => c.html(renderPage('글쓰기', `
    <div class="container">
        <input type="text" id="t" placeholder="제목" style="width:100%; padding:10px; margin-bottom:10px;">
        <textarea id="topic" placeholder="AI 주제" style="width:100%; height:50px;"></textarea>
        <button onclick="runAI()" id="btn">AI 글 생성</button>
        <div id="editor" contenteditable="true" style="background:white; min-height:300px; border:1px solid #ddd; margin-top:20px; padding:15px;"></div>
        <button onclick="save()" style="margin-top:20px; width:100%; padding:15px; background:black; color:white;">발행하기</button>
    </div>
    <script>
        async function runAI() {
            const btn = document.getElementById('btn');
            btn.innerText = '생성 중...';
            const res = await fetch('/api/generate', { method:'POST', body: JSON.stringify({ topic: document.getElementById('topic').value }) });
            const data = await res.json();
            document.getElementById('t').value = data.title;
            document.getElementById('editor').innerHTML = data.content;
            window.cardData = data.card;
            btn.innerText = 'AI 글 생성 완료';
        }
        async function save() {
            await fetch('/api/save-post', { method:'POST', body: JSON.stringify({ 
                title: document.getElementById('t').value, 
                content: document.getElementById('editor').innerHTML,
                card_data: JSON.stringify(window.cardData || {})
            }) });
            alert('저장되었습니다.'); location.href='/';
        }
    </script>
`)));

app.post('/api/generate', async (c) => {
    const { topic } = await c.req.json();
    const prompt = `Korean Blog. JSON ONLY: {"title":"...","card":{"amount":"..."},"content":"...HTML..."}. Topic: ${topic}`;
    const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { messages: [{ role: 'user', content: prompt }] });
    const result = JSON.parse(response.response.match(/\{[\s\S]*\}/)[0]);
    return c.json(result);
});

app.post('/api/save-post', async (c) => {
    const { title, content, card_data } = await c.req.json();
    await c.env.DB.prepare("INSERT INTO posts (title, content, card_data, status) VALUES (?, ?, ?, 'publish')").bind(title, content, card_data).run();
    return c.json({ success: true });
});

export default app;
