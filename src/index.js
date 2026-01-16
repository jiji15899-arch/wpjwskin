import { Hono } from 'hono';

const app = new Hono();

// [1] CSS 디자인 - 사용자 요구사항 100% 반영 (워드프레스 테마 스타일)
const styleCss = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
body { background-color: #fff; padding-top: 50px; color: #333; line-height: 1.6; }
.container { max-width: 768px; margin: 0 auto; padding: 15px; }
#header { position: fixed; top: 0; left: 0; width: 100%; height: 50px; background: white; z-index: 1000; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: center; }
.logo-text { font-size: 18px; font-weight: 800; color: #1a73e8; }
.hero-section { background: #F0F9FF; border-radius: 20px; padding: 30px 20px; text-align: center; margin-bottom: 25px; border: 1px solid #e0f2fe; }
.hero-urgent { background: #ff4d4d; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
.hero-title { font-size: 26px; font-weight: 800; margin: 15px 0; color: #1e293b; }
.hero-cta { background: #1a73e8; color: white; display: inline-block; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; }
.info-card-grid { display: grid; gap: 15px; }
.info-card { display: block; border: 1px solid #e2e8f0; border-radius: 15px; padding: 20px; text-decoration: none; color: inherit; background: white; }
.card-badge { color: #ff4d4d; font-size: 13px; font-weight: bold; margin-bottom: 5px; display: block; }
.card-amount { font-size: 22px; font-weight: 800; color: #1a73e8; margin: 10px 0; }
.card-btn { background: #f1f5f9; text-align: center; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: bold; color: #475569; }
.post-content { padding: 10px; font-size: 16px; }
.post-content h2 { margin: 25px 0 10px; color: #1e293b; border-left: 4px solid #1a73e8; padding-left: 12px; }
.ad-slot { margin: 20px 0; background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; color: #94a3b8; border: 1px dashed #cbd5e1; }
.footer { padding: 40px 0; background: #f8fafc; color: #64748b; text-align: center; font-size: 13px; margin-top: 50px; }
`;

app.get('/style.css', (c) => c.text(styleCss, 200, { 'Content-Type': 'text/css' }));

// [2] 헬퍼 함수
const render = (title, body) => `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="stylesheet" href="/style.css"></head><body><header id="header"><div class="container"><span class="logo-text">정부지원금 알리미</span></div></header>${body}<footer class="footer"><p>© ${new Date().getFullYear()} 정부지원금 알리미</p></footer></body></html>`;

// [3] 메인 페이지
app.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare("SELECT * FROM posts WHERE status='publish' ORDER BY created_at DESC").all();
        let hero = '<div class="hero-section"><span class="hero-urgent">🔥 신청마감 D-3일</span><h2 class="hero-title">나의 <span style="color:#1a73e8">숨은 지원금</span> 찾기</h2><p style="color:#64748b; margin-bottom:15px;">1인 평균 127만원 수령</p><a href="#" class="hero-cta">내 지원금 확인하기 →</a></div>';
        let cards = results.map(p => {
            const d = JSON.parse(p.card_data || '{}');
            return `<a class="info-card" href="/post/${p.id}"><span class="card-badge">공고중</span><h3 style="font-weight:bold;">${p.title}</h3><div class="card-amount">${d.amount || '상세확인'}</div><div class="card-btn">신청방법 보기 →</div></a>`;
        }).join('');
        return c.html(render('지원금 알리미', `<div class="container">${hero}<div class="info-card-grid">${cards || '글이 없습니다.'}</div></div>`));
    } catch(e) { return c.text(e.message); }
});

// [4] 상세 페이지 (에러 원인인 중첩 구조 제거)
app.get('/post/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
        if (!post) return c.text('Not Found', 404);
        const ads = await c.env.DB.prepare("SELECT value FROM settings WHERE key='pl_ads_code'").first('value') || '광고 영역';
        const card = JSON.parse(post.card_data || '{}');
        const content = post.content.replace(//g, `<div class="ad-slot">${ads}</div>`);
        
        const html = `<div class="container"><h1 style="font-size:24px; font-weight:800; margin:20px 0;">${post.title}</h1><div class="hero-section" style="text-align:left; padding:20px;"><div style="color:#64748b; font-size:14px;">지원 금액</div><div style="font-size:24px; font-weight:800; color:#1a73e8;">${card.amount || '상세내용 참고'}</div></div><div class="post-content">${content}</div></div>`;
        return c.html(render(post.title, html));
    } catch(e) { return c.text(e.message); }
});

// [5] 관리자 및 AI
app.get('/admin-login', (c) => c.html('<div style="padding:100px 20px; text-align:center;"><form method="post" action="/api/login"><input type="password" name="password" placeholder="비번" style="padding:12px; border:1px solid #ddd; border-radius:8px;"><button type="submit" style="padding:12px 20px; background:#1a73e8; color:white; border:none; border-radius:8px; margin-left:5px;">로그인</button></form></div>'));

app.post('/api/login', async (c) => {
    const b = await c.req.parseBody();
    const p = await c.env.DB.prepare("SELECT value FROM settings WHERE key='admin_password'").first('value');
    return b.password === p ? c.redirect('/admin-post') : c.text('실패');
});

app.get('/admin-post', (c) => c.html(render('AI 글쓰기', `<div class="container"><h2>AI 자동 포스팅</h2><input type="text" id="topic" placeholder="주제" style="width:100%; padding:12px; margin:10px 0;"><button id="btn" onclick="runAI()" style="width:100%; padding:15px; background:#1a73e8; color:white; border:none; border-radius:8px; font-weight:bold;">AI 글 생성</button><div id="res" style="display:none; margin-top:20px;"><input type="text" id="t" style="width:100%; padding:12px; margin-bottom:10px;"><div id="ed" contenteditable="true" style="min-height:400px; border:1px solid #ddd; padding:20px; background:white;"></div><button onclick="save()" style="width:100%; padding:15px; background:black; color:white; border:none; border-radius:8px; margin-top:10px;">발행</button></div></div><script>async function runAI(){const b=document.getElementById('btn');b.innerText='생성중...'; const r=await fetch('/api/generate',{method:'POST',body:JSON.stringify({topic:document.getElementById('topic').value})});const d=await r.json();document.getElementById('t').value=d.title;document.getElementById('ed').innerHTML=d.content;window.c=d.card;document.getElementById('res').style.display='block';b.innerText='완료';} async function save(){await fetch('/api/save-post',{method:'POST',body:JSON.stringify({title:document.getElementById('t').value,content:document.getElementById('ed').innerHTML,card_data:JSON.stringify(window.c||{})})});alert('완료');location.href='/';}</script>`)));

app.post('/api/generate', async (c) => {
    const { topic } = await c.req.json();
    const prompt = `주제: ${topic}. 정부지원정책 블로그 글 작성. JSON으로만 답해: {"title":"제목","card":{"amount":"최대 00만원"},"content":"본문 HTML(h2, p)"}`;
    const res = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { messages: [{ role: 'user', content: prompt }] });
    const match = res.response.match(/\{[\s\S]*\}/);
    return c.json(JSON.parse(match[0]));
});

app.post('/api/save-post', async (c) => {
    const { title, content, card_data } = await c.req.json();
    await c.env.DB.prepare("INSERT INTO posts (title, content, card_data, status) VALUES (?, ?, ?, 'publish')").bind(title, content, card_data).run();
    return c.json({ success: true });
});

export default app;
