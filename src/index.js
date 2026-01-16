import { Hono } from 'hono';

var app = new Hono();

// [1] CSS (상수로 분리)
var MY_CSS = "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap'); * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; } body { background-color: #fff; padding-top: 50px; color: #333; line-height: 1.6; } .container { max-width: 768px; margin: 0 auto; padding: 15px; } #header { position: fixed; top: 0; left: 0; width: 100%; height: 50px; background: white; z-index: 1000; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: center; } .logo-text { font-size: 18px; font-weight: 800; color: #1a73e8; } .hero-section { background: #F0F9FF; border-radius: 20px; padding: 30px 20px; text-align: center; margin-bottom: 25px; border: 1px solid #e0f2fe; } .hero-urgent { background: #ff4d4d; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; } .hero-title { font-size: 26px; font-weight: 800; margin: 15px 0; color: #1e293b; } .hero-cta { background: #1a73e8; color: white; display: inline-block; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; } .info-card-grid { display: grid; gap: 15px; } .info-card { display: block; border: 1px solid #e2e8f0; border-radius: 15px; padding: 20px; text-decoration: none; color: inherit; background: white; } .card-badge { color: #ff4d4d; font-size: 13px; font-weight: bold; margin-bottom: 5px; display: block; } .card-amount { font-size: 22px; font-weight: 800; color: #1a73e8; margin: 10px 0; } .card-btn { background: #f1f5f9; text-align: center; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: bold; color: #475569; } .post-content { padding: 10px; font-size: 16px; } .post-content h2 { margin: 25px 0 10px; color: #1e293b; border-left: 4px solid #1a73e8; padding-left: 12px; } .ad-slot { margin: 20px 0; background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; color: #94a3b8; border: 1px dashed #cbd5e1; } .footer { padding: 40px 0; background: #f8fafc; color: #64748b; text-align: center; font-size: 13px; margin-top: 50px; }";

// [2] 레이아웃 (백틱(``) 대신 문자열 합치기(+) 사용 - 구버전 호환용)
function buildPage(title, bodyContent) {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += '<title>' + title + '</title>';
  html += '<style>' + MY_CSS + '</style></head><body>';
  html += '<header id="header"><div class="container"><span class="logo-text">정부지원금 알리미</span></div></header>';
  html += bodyContent;
  html += '<footer class="footer"><p>© 2026 정부지원금 알리미</p></footer></body></html>';
  return html;
}

// [3] 메인 페이지
app.get('/', function (c) {
  return c.env.DB.prepare("SELECT * FROM posts WHERE status='publish' ORDER BY created_at DESC").all()
    .then(function (res) {
      var posts = res.results || [];
      var body = '<div class="container">';
      body += '<div class="hero-section"><span class="hero-urgent">🔥 신청마감 D-3일</span><h2 class="hero-title">나의 <span style="color:#1a73e8">숨은 지원금</span> 찾기</h2><p style="color:#64748b; margin-bottom:15px;">1인 평균 127만원 수령</p><a href="#" class="hero-cta">내 지원금 확인하기 →</a></div>';
      body += '<div class="info-card-grid">';
      
      for (var i = 0; i < posts.length; i++) {
        var p = posts[i];
        var card = JSON.parse(p.card_data || '{}');
        body += '<a class="info-card" href="/post/' + p.id + '">';
        body += '<span class="card-badge">공고중</span><h3 style="font-weight:bold;">' + p.title + '</h3>';
        body += '<div class="card-amount">' + (card.amount || '상세확인') + '</div>';
        body += '<div class="card-btn">신청방법 보기 →</div></a>';
      }
      
      body += '</div></div>';
      return c.html(buildPage('정부지원금 알리미', body));
    })
    .catch(function (e) { return c.text("Error: " + e.message); });
});

// [4] 상세 페이지
app.get('/post/:id', function (c) {
  var id = c.req.param('id');
  return c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first()
    .then(function (post) {
      if (!post) return c.text('Not Found', 404);
      var card = JSON.parse(post.card_data || '{}');
      var body = '<div class="container">';
      body += '<h1 style="font-size:24px; font-weight:800; margin:20px 0;">' + post.title + '</h1>';
      body += '<div class="hero-section" style="text-align:left; padding:20px;">';
      body += '<div style="color:#64748b; font-size:14px;">지원 금액</div>';
      body += '<div style="font-size:24px; font-weight:800; color:#1a73e8;">' + (card.amount || '상세내용 참고') + '</div>';
      body += '</div>';
      body += '<div class="post-content">' + post.content + '</div>';
      body += '</div>';
      return c.html(buildPage(post.title, body));
    })
    .catch(function (e) { return c.text("Error: " + e.message); });
});

// [5] 관리자 및 기타
app.get('/admin-login', function (c) {
  var form = '<div style="padding:100px 20px; text-align:center;"><form method="post" action="/api/login"><input type="password" name="pw" placeholder="비밀번호" style="padding:12px; border:1px solid #ddd; border-radius:8px;"><button type="submit" style="padding:12px 20px; background:#1a73e8; color:white; border:none; border-radius:8px; margin-left:5px;">로그인</button></form></div>';
  return c.html(buildPage('로그인', form));
});

export default app;
