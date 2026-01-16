/**
 * Cloudflare Workers WP Clone with AI Plugin
 * Framework: Hono
 */
import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { basicAuth } from 'hono/basic-auth';

const app = new Hono();

// ========== 1. 헬퍼 함수 (PHP 테마 포팅) ========== //

async function getThemeConfig(env) {
  const cards = await env.BLOG_DB.get('sup_final_cards_data', 'json') || [];
  const adCode = await env.BLOG_DB.get('sup_final_ad_code') || '';
  const tabs = await env.BLOG_DB.get('sup_final_tabs_data', 'json') || [];
  return { cards, adCode, tabs };
}

// CSS 제공 (업로드해주신 style.css 내용)
const cssContent = `
/* Theme Name: 지원금 테마 */
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
html { height: 100%; }
body { min-height: 100%; display: flex; flex-direction: column; margin: 0; background-color: white; padding-top: 120px; }
.main-wrapper { flex: 1 0 auto; }
.container { max-width: 768px; margin: 0 auto; padding: 8px; }
/* ... (제공해주신 전체 CSS를 여기에 압축해서 넣거나 별도 파일로 서빙) ... */
#header { position: fixed !important; top: 0; left: 0; width: 100%; height: 60px; background: white; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; }
.tab-wrapper { position: fixed; top: 60px; left: 0; width: 100%; background: white; z-index: 999; padding: 10px 0; }
.intro-section { text-align: center; padding: 32px 20px 24px; }
.info-card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.info-card { background: #fff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; display: block; text-decoration: none; color: inherit; }
.info-card-highlight { background: linear-gradient(135deg, #3182F6 0%, #1E6AD4 100%); padding: 20px; color: white; }
.info-card-content { padding: 20px; }
.footer { background: #E3F2FD; padding: 20px 0; margin-top: 30px; text-align: center; }
/* 관리자용 간단 스타일 */
.admin-wrap { max-width: 1200px; margin: 0 auto; padding: 20px; }
.admin-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
input, textarea, select { border: 1px solid #ddd; padding: 8px; border-radius: 4px; width: 100%; margin-bottom: 10px; }
.button { background: #2271b1; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }
.sidebar-box { background: white; border: 1px solid #ccd0d4; padding: 15px; margin-bottom: 20px; }
`;

// HTML 템플릿 (PHP의 get_header, get_footer 역할)
const renderLayout = (content, config, title = "지원금 알리미") => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="main-wrapper">
        <header id="header">
            <div class="container">
                <h1 style="font-size:20px; font-weight:bold;">${config.site_title || '정부지원금 알리미'}</h1>
            </div>
        </header>
        <div class="tab-wrapper">
             <div class="container" style="text-align:center;">
                ${config.tabs.map(tab => `<a href="${tab.link}" style="margin:0 10px; text-decoration:none; color:#333;">${tab.name}</a>`).join('')}
             </div>
        </div>
        ${content}
    </div>
    <footer class="footer">
        <div class="container">
            <p>© ${new Date().getFullYear()} All Rights Reserved.</p>
        </div>
    </footer>
</body>
</html>
`;

// ========== 2. 라우트 정의 ========== //

// 2.1 CSS 서빙
app.get('/style.css', (c) => c.body(cssContent, 200, { 'Content-Type': 'text/css' }));

// 2.2 메인 페이지 (index.php 포팅)
app.get('/', async (c) => {
    const config = await getThemeConfig(c.env);
    const html = `
    <div class="container">
        <div class="intro-section">
            <span style="background:#cfdefa; color:#2f42d4; padding:5px 10px; border-radius:20px;">신청마감 D-3일</span>
            <h2 style="font-size:35px; color:#2f42d4; margin:10px 0;">숨은 지원금 찾기</h2>
        </div>
        
        ${config.adCode ? `<div style="text-align:center; margin:20px 0;">${config.adCode}</div>` : ''}

        <div class="info-card-grid">
            ${config.cards.map(card => `
                <a class="info-card" href="${card.link}" target="_blank">
                    <div class="info-card-highlight">
                        <div style="font-size:24px; font-weight:bold;">${card.amount}</div>
                        <div>${card.amountSub}</div>
                    </div>
                    <div class="info-card-content">
                        <h3>${card.keyword}</h3>
                        <p>${card.description}</p>
                    </div>
                </a>
            `).join('')}
        </div>
    </div>
    `;
    return c.html(renderLayout(html, config));
});

// ========== 3. 관리자 페이지 (Admin) ========== //

// 미들웨어: 관리자 인증 (간단한 Basic Auth 사용, 실제 서비스시 쿠키/세션 권장)
app.use('/admin*', basicAuth({
  username: 'admin',
  password: 'password123' // 실제 사용 시 변경 필수
}));

// 3.1 관리자 대시보드 (/admin-cf)
app.get('/admin-cf', (c) => {
    return c.html(`
        <html>
        <head><link rel="stylesheet" href="/style.css"></head>
        <body style="background:#f0f0f1; padding-top:20px;">
            <div class="admin-wrap">
                <div class="admin-header">
                    <h1>☁️ Cloudflare WP Admin</h1>
                    <div>
                        <a href="/admin-post" class="button">글쓰기</a>
                        <a href="/admin-plugin-alpack" class="button" style="background:#2271b1;">ALPACK 설정</a>
                        <a href="/" class="button" target="_blank">사이트 보기</a>
                    </div>
                </div>
                <div style="background:white; padding:20px; border-radius:8px;">
                    <h3>환영합니다.</h3>
                    <p>이곳은 클라우드플레어 엣지에서 작동하는 워드프레스 클론 관리자입니다.</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 3.2 플러그인 설정 페이지 (/admin-plugin-alpack)
app.get('/admin-plugin-alpack', async (c) => {
    const settings = await c.env.BLOG_DB.get('pl_plugin_settings', 'json') || { apiKey: '' };
    return c.html(`
        <html>
        <head><link rel="stylesheet" href="/style.css"></head>
        <body style="background:#f0f0f1; padding-top:20px;">
            <div class="admin-wrap">
                <h1>🔌 ALPACK 플러그인 설정</h1>
                <form method="POST" action="/api/save-plugin">
                    <div class="sidebar-box">
                        <label>OpenRouter / AI API Key (Optional if using CF AI)</label>
                        <input type="password" name="apiKey" value="${settings.apiKey}">
                        <button type="submit" class="button">저장</button>
                    </div>
                </form>
            </div>
        </body>
        </html>
    `);
});

// 3.3 글쓰기 페이지 (/admin-post) - 핵심: AI 메타박스 포함
app.get('/admin-post', async (c) => {
    // 저장된 AI 설정 불러오기
    const aiTopic = await c.env.BLOG_DB.get('pl_v23_topic') || '';
    const aiMode = await c.env.BLOG_DB.get('pl_v23_mode') || 'adsense_approval';
    const aiAds = await c.env.BLOG_DB.get('pl_v23_ads_code') || '';

    return c.html(`
    <html>
    <head>
        <link rel="stylesheet" href="/style.css">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <style>
            .editor-container { display: flex; gap: 20px; }
            .main-editor { flex: 3; }
            .sidebar { flex: 1; }
            /* 제공해주신 AI Snippet 스타일 */
            #pl-v23-wrapper { font-family: 'Apple SD Gothic Neo', sans-serif; color: #333; }
        </style>
    </head>
    <body style="background:#f0f0f1; padding-top:20px;">
        <div class="admin-wrap">
            <h1>✍️ 새 글 작성</h1>
            <form id="post-form">
                <div class="editor-container">
                    <div class="main-editor">
                        <input type="text" id="post_title" name="title" placeholder="제목을 입력하세요" style="font-size:20px; padding:15px;">
                        <textarea id="post_content" name="content" style="height:500px;" placeholder="내용을 입력하세요..."></textarea>
                    </div>
                    
                    <div class="sidebar">
                        <div class="sidebar-box">
                            <h3>공개</h3>
                            <button type="button" class="button" onclick="savePost()">공개하기</button>
                        </div>

                        <div class="sidebar-box">
                            <h3>☁️ PressLearn V23 (CF Workers AI)</h3>
                            <div id="pl-v23-wrapper">
                                <div style="background: #fdfdfd; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 15px;">
                                    <label style="font-weight:bold; font-size:12px;">🎯 주제</label>
                                    <input type="text" id="pl_topic" value="${aiTopic}" placeholder="예: 국민연금 수령액" style="width:100%; height:32px; margin-bottom:8px;">
                                    
                                    <label style="font-weight:bold; font-size:12px;">📝 엔진 모드</label>
                                    <select id="pl_write_mode" style="width:100%; height:32px; margin-bottom:8px;">
                                        <option value="adsense_approval" ${aiMode === 'adsense_approval' ? 'selected' : ''}>💎 애드센스 승인용</option>
                                        <option value="subsidy" ${aiMode === 'subsidy' ? 'selected' : ''}>💰 정부 지원금 정보</option>
                                        <option value="pasona" ${aiMode === 'pasona' ? 'selected' : ''}>🔥 PASONA 수익형</option>
                                        <option value="seo_golden" ${aiMode === 'seo_golden' ? 'selected' : ''}>✨ SEO 황금 노출</option>
                                    </select>
                                    
                                    <div id="ads_area" style="${(aiMode == 'pasona' || aiMode == 'seo_golden') ? '' : 'display:none;'}">
                                        <label style="font-weight:bold; font-size:12px;">💰 애드센스 코드</label>
                                        <textarea id="pl_ads_code" style="width:100%; height:50px; font-size:11px;">${aiAds}</textarea>
                                    </div>
                                    
                                    <button type="button" id="btn_save_v23" class="button" style="width:100%; margin-top:5px; font-size:11px;">설정 저장</button>
                                </div>

                                <button type="button" id="pl_btn_master" class="button" style="width:100%; height:45px; background:#007cba; font-weight:bold;">🚀 CF AI 마스터피스 생성</button>

                                <div id="pl_status_area" style="display:none; margin-top:15px; background:#fff; border:1px solid #eee; padding:12px; border-radius:8px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                        <span style="font-size:11px; font-weight:bold; color:#666;">AI 생성 프로세스</span>
                                        <span id="pl_timer_text" style="font-family:monospace; font-size:14px; color:#d63638; font-weight:bold;">00.0s</span>
                                    </div>
                                    <div style="width:100%; height:8px; background:#f1f1f1; border-radius:4px; overflow:hidden; margin-bottom:10px;">
                                        <div id="pl_progress_bar" style="width:0%; height:100%; background:#007cba; transition: width 0.1s linear;"></div>
                                    </div>
                                    <div id="pl_detail_status" style="font-size:12px; color:#007cba; font-weight:bold; text-align:center;">연결 중...</div>
                                </div>
                            </div>
                        </div>
                        </div>
                </div>
            </form>
        </div>

        <script>
        // AI 생성기 스크립트 (User Provided logic adapted for Standalone)
        jQuery(document).ready(function($) {
            let startTime = 0;
            let timerInterval;

            // 모드 변경시 광고창 토글
            $('#pl_write_mode').change(function() {
                const val = $(this).val();
                if(val === 'pasona' || val === 'seo_golden') $('#ads_area').show();
                else $('#ads_area').hide();
            });

            function updateStatus(pct, msg) {
                $('#pl_status_area').show();
                $('#pl_progress_bar').css('width', pct + '%');
                $('#pl_detail_status').text(msg);
            }

            function startTimerUI() {
                startTime = Date.now();
                timerInterval = setInterval(() => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    $('#pl_timer_text').text(elapsed.toFixed(1) + "s");
                    if (elapsed < 50) {
                        const visualPct = (elapsed / 50) * 95;
                        $('#pl_progress_bar').css('width', visualPct + '%');
                    }
                }, 100);
            }

            function stopTimerUI() {
                clearInterval(timerInterval);
                $('#pl_progress_bar').css('width', '100%');
            }

            $('#pl_btn_master').click(async function() {
                const topic = $('#pl_topic').val();
                const mode = $('#pl_write_mode').val();
                const ads = $('#pl_ads_code').val();

                if(!topic) return alert("주제를 입력하세요.");

                $(this).prop('disabled', true);
                startTimerUI();
                updateStatus(10, "🔍 주제 분석 및 AI 연결 중...");

                try {
                    // 서버(Worker)로 AI 요청 전송
                    const response = await fetch('/api/ai-generate', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ topic, mode, ads })
                    });

                    if(!response.ok) throw new Error('AI Server Error');
                    
                    updateStatus(50, "✍️ 본문 작성 및 이미지 생성 중...");
                    const data = await response.json();

                    // 결과 반영 (워드프레스 에디터 대신 일반 input/textarea)
                    if(data.title) $('#post_title').val(data.title);
                    if(data.body) $('#post_content').val(data.body);
                    
                    // 이미지 처리 (이 예제에서는 HTML 상단에 img 태그 삽입으로 대체)
                    if(data.imageUrl) {
                        const imgHtml = '<img src="' + data.imageUrl + '" style="max-width:100%; margin-bottom:20px;">';
                        $('#post_content').val(imgHtml + "\\n" + $('#post_content').val());
                    }

                    stopTimerUI();
                    updateStatus(100, "✅ 생성 완료!");

                } catch(e) {
                    console.error(e);
                    alert("생성 실패: " + e.message);
                    stopTimerUI();
                } finally {
                    $('#pl_btn_master').prop('disabled', false);
                }
            });

            // 설정 저장
            $('#btn_save_v23').click(async function() {
                await fetch('/api/save-plugin', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        topic: $('#pl_topic').val(),
                        mode: $('#pl_write_mode').val(),
                        ads: $('#pl_ads_code').val()
                    })
                });
                alert('설정 저장됨');
            });
        });

        // 포스트 저장 기능
        async function savePost() {
            // 실제 구현 시 /api/save-post 로 데이터 전송
            alert('글이 저장되었습니다 (데모)');
        }
        </script>
    </body>
    </html>
    `);
});

// ========== 4. API 엔드포인트 (AI 및 데이터 처리) ========== //

// 4.1 플러그인 설정 저장
app.post('/api/save-plugin', async (c) => {
    const body = await c.req.json();
    if(body.topic) await c.env.BLOG_DB.put('pl_v23_topic', body.topic);
    if(body.mode) await c.env.BLOG_DB.put('pl_v23_mode', body.mode);
    if(body.ads) await c.env.BLOG_DB.put('pl_v23_ads_code', body.ads);
    return c.json({ success: true });
});

// 4.2 **핵심: AI 생성 로직 (/api/ai-generate)**
// 플러그인 코드의 로직을 Worker 내부에서 처리하도록 변환
app.post('/api/ai-generate', async (c) => {
    const { topic, mode, ads } = await c.req.json();
    
    // 프롬프트 엔지니어링 (PHP 코드의 로직 이식)
    let styleInstructions = "";
    if(mode === 'adsense_approval') styleInstructions = "신뢰성 있는 전문가 톤, 공백제외 1500자 이상 고품질 정보성. 서론/결론 단어 금지.";
    else if(mode === 'subsidy') styleInstructions = "정부 정책 정보. HTML 표(table) 포함. 명확한 절차 리스트화.";
    else if(mode === 'pasona') styleInstructions = `PASONA 마케팅 구조. 광고 코드 삽입: ${ads}`;
    else if(mode === 'seo_golden') styleInstructions = `구글 SEO 최적화. H2/H3 구조. 하단 광고 삽입: ${ads}`;

    const systemPrompt = `너는 전문 블로그 작가다. 다음 주제로 HTML 포맷의 블로그 글을 작성해라. JSON 형식으로만 답해라: {"title": "...", "body": "..."}`;
    const userPrompt = `주제: ${topic}\n스타일: ${styleInstructions}\n제약: 자연스러운 한국어. HTML 태그(h2, p, ul, table) 사용.`;

    try {
        // 1. 텍스트 생성 (Llama-3 사용)
        const textResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        // JSON 파싱 시도
        let jsonStr = textResponse.response;
        // 마크다운 코드블록 제거 (```json ... ```)
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let resultData;
        try {
            resultData = JSON.parse(jsonStr);
        } catch (e) {
            // 파싱 실패 시 원본 텍스트라도 반환
            resultData = { title: topic, body: textResponse.response };
        }

        // 2. 이미지 생성 (Stable Diffusion) - 비동기 병렬 처리는 복잡하므로 순차 처리
        // (실제 프로덕션에서는 Promise.all 사용 권장)
        const imageResponse = await c.env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
            prompt: `photorealistic, cinematic 4k image about ${topic}, no text, bright lighting`
        });

        // 이미지를 Base64로 변환하여 프론트엔드로 전송
        // (주의: KV 용량 제한으로 인해 실제로는 R2 스토리지 사용 권장, 여기선 Data URI로 바로 반환)
        const arrayBuffer = await new Response(imageResponse).arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const dataUri = `data:image/jpeg;base64,${base64Image}`;

        return c.json({
            success: true,
            title: resultData.title,
            body: resultData.body,
            imageUrl: dataUri
        });

    } catch (err) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

export default app;
