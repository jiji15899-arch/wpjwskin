/**
 * Cloudflare Workers Integrated WP System
 * (Theme + All Plugins + AI Writer + Admin Panel)
 */
import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';

const app = new Hono();

// ==========================================
// 1. 통합 CSS (테마 + 어드민 + 플러그인)
// ==========================================
const CSS = `
/* [RESET & COMMON] */
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; }
body { margin: 0; padding: 0; background: #f0f0f1; color: #3c434a; }
a { text-decoration: none; color: #2271b1; }
ul { list-style: none; padding: 0; margin: 0; }

/* [THEME FRONTEND STYLES] */
.theme-body { background: white; padding-top: 60px; display: flex; flex-direction: column; min-height: 100vh; }
.theme-header { position: fixed; top: 0; left: 0; width: 100%; height: 50px; background: white; z-index: 1000; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
.theme-container { max-width: 768px; margin: 0 auto; padding: 20px; width: 100%; }
.info-card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.info-card { background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; display: block; color: inherit; transition: transform 0.2s; border: 1px solid #eee; }
.info-card:hover { transform: translateY(-5px); }
.info-card-highlight { background: linear-gradient(135deg, #3182F6 0%, #1E6AD4 100%); padding: 20px; color: white; }
.info-card-content { padding: 20px; }
.hero-section { background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%); border-radius: 20px; padding: 40px; color: white; text-align: center; margin-bottom: 30px; }
.tab-nav { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 10px; }
.tab-btn { padding: 8px 16px; border-radius: 20px; background: #f5f5f5; color: #666; font-size: 14px; white-space: nowrap; }
.tab-btn.active { background: #3182F6; color: white; font-weight: bold; }

/* [ADMIN LAYOUT] */
.admin-wrap { display: flex; min-height: 100vh; }
.admin-sidebar { width: 160px; background: #1d2327; color: #fff; flex-shrink: 0; position: fixed; height: 100%; overflow-y: auto; }
.admin-sidebar a { color: #f0f0f1; display: block; padding: 10px 12px; font-size: 14px; transition: 0.1s; }
.admin-sidebar a:hover, .admin-sidebar a.active { background: #2271b1; color: white; }
.admin-sidebar .wp-logo { padding: 15px; text-align: center; background: #000; font-weight: bold; }
.admin-content { flex: 1; margin-left: 160px; padding: 20px 30px; }

/* [ADMIN UI COMPONENTS] */
h1 { font-size: 23px; font-weight: 400; padding: 9px 0 4px 0; line-height: 1.3; }
.card { background: #fff; border: 1px solid #c3c4c7; padding: 0; margin-top: 20px; box-shadow: 0 1px 1px rgba(0,0,0,.04); }
.presslearn-header { background: white; padding: 20px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
.presslearn-header-logo { display: flex; align-items: center; gap: 10px; }
.presslearn-header-logo img { height: 30px; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.status-badge.active { background: #e6f6e6; color: #008a20; }
.status-badge.inactive { background: #f6e6e6; color: #d63638; }

/* [SETTINGS GRID] */
.pl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 20px; }
.pl-grid-item { background: #fff; border: 1px solid #dcdcde; padding: 20px; border-radius: 4px; display: flex; flex-direction: column; justify-content: space-between; }
.pl-grid-item h3 { margin: 10px 0; }
.pl-grid-item-footer { margin-top: 15px; display: flex; gap: 10px; }

/* [BUTTONS & FORMS] */
.button, .point-btn, .secondary-btn { display: inline-flex; align-items: center; justify-content: center; padding: 6px 12px; border-radius: 3px; font-size: 13px; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-weight: 500; }
.button-primary, .point-btn { background: #2271b1; color: #fff; border-color: #2271b1; }
.button-primary:hover, .point-btn:hover { background: #135e96; color: #fff; }
.button-secondary, .secondary-btn { background: #f6f7f7; color: #2271b1; border-color: #2271b1; }
.button-secondary:hover, .secondary-btn:hover { background: #f0f0f1; border-color: #0a4b78; color: #0a4b78; }
input[type="text"], input[type="number"], input[type="date"], select, textarea { width: 100%; padding: 0 8px; line-height: 2; min-height: 30px; box-shadow: 0 0 0 transparent; border-radius: 4px; border: 1px solid #8c8f94; background-color: #fff; color: #2c3338; margin-bottom: 10px; }

/* [TOGGLE SWITCH] */
.switch { position: relative; display: inline-block; width: 40px; height: 20px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #2196F3; }
input:checked + .slider:before { transform: translateX(20px); }

/* [AI WRITER & SIDEBAR] */
.editor-layout { display: flex; gap: 20px; }
.main-editor-area { flex: 3; }
.sidebar-area { flex: 1; max-width: 300px; }
.postbox { background: #fff; border: 1px solid #c3c4c7; margin-bottom: 20px; }
.postbox-header { padding: 10px 15px; border-bottom: 1px solid #c3c4c7; font-weight: 600; display: flex; justify-content: space-between; align-items: center; background: #f6f7f7; }
.postbox-content { padding: 15px; }

/* [ANALYTICS] */
.chart-container { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #c3c4c7; margin-bottom: 20px; }
.stats-summary { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.stat-item { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #c3c4c7; flex: 1; min-width: 200px; text-align: center; }
.stat-value { font-size: 24px; font-weight: bold; color: #2271b1; margin: 10px 0; }

/* [TABLES] */
.widefat { width: 100%; border-spacing: 0; background: #fff; border: 1px solid #c3c4c7; }
.widefat th { text-align: left; padding: 10px; border-bottom: 1px solid #c3c4c7; font-weight: 600; }
.widefat td { padding: 10px; border-bottom: 1px solid #f0f0f1; color: #50575e; }
.widefat tr:last-child td { border-bottom: none; }
`;

// ==========================================
// 2. 관리자 레이아웃 템플릿
// ==========================================
const renderAdminLayout = (content, activeMenu = 'dashboard') => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>WP-Cloudflare Admin</title>
    <style>${CSS}</style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="admin-wrap">
        <div class="admin-sidebar">
            <div class="wp-logo">WordPress CF</div>
            <a href="/wp-admin" class="${activeMenu === 'dashboard' ? 'active' : ''}">대시보드</a>
            <a href="/wp-admin/post-new" class="${activeMenu === 'posts' ? 'active' : ''}">글 쓰기 (AI)</a>
            <div style="margin: 10px 12px; color: #999; font-size: 11px; font-weight: bold;">PRESSLEARN</div>
            <a href="/wp-admin/settings" class="${activeMenu === 'settings' ? 'active' : ''}">플러그인 설정</a>
            <a href="/wp-admin/analytics" class="${activeMenu === 'analytics' ? 'active' : ''}">씬 애널리틱스</a>
            <a href="/wp-admin/adclicker" class="${activeMenu === 'adclicker' ? 'active' : ''}">애드클리커</a>
            <a href="/wp-admin/protection" class="${activeMenu === 'protection' ? 'active' : ''}">애드 프로텍터</a>
            <a href="/wp-admin/dynamic" class="${activeMenu === 'dynamic' ? 'active' : ''}">다이나믹 배너</a>
            <a href="/" target="_blank" style="margin-top: 20px;">🏠 사이트 보기</a>
        </div>
        <div class="admin-content">
            ${content}
        </div>
    </div>
</body>
</html>
`;

// ==========================================
// 3. 라우트 및 기능 구현
// ==========================================

// 기본 인증 (데모용)
app.use('/wp-admin*', basicAuth({ username: 'admin', password: 'password' }));

// 3.1 CSS 서빙
app.get('/style.css', (c) => c.text(CSS, 200, { 'Content-Type': 'text/css' }));

// 3.2 프론트엔드 (테마)
app.get('/', async (c) => {
    const cards = await c.env.BLOG_DB.get('cards', 'json') || [];
    const siteTitle = await c.env.BLOG_DB.get('site_title') || '지원금 알리미';
    
    // 가짜 애널리틱스 카운트 증가 (KV 기반 단순 카운터)
    let views = parseInt(await c.env.BLOG_DB.get('analytics_total_views') || '0');
    c.executionCtx.waitUntil(c.env.BLOG_DB.put('analytics_total_views', (views + 1).toString()));

    return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${siteTitle}</title>
        <style>${CSS}</style>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="theme-body">
        <div class="theme-header">
            <div class="theme-container" style="display:flex; align-items:center; justify-content:center;">
                <h1 style="margin:0; font-size:18px;">${siteTitle}</h1>
            </div>
        </div>
        
        <div class="theme-container">
            <div class="tab-nav">
                <a href="#" class="tab-btn active">전체</a>
                <a href="#" class="tab-btn">지원금</a>
                <a href="#" class="tab-btn">환급금</a>
            </div>

            <div class="hero-section">
                <span style="background:rgba(255,255,255,0.2); padding:5px 10px; border-radius:15px; font-size:12px;">🔥 신청마감 임박</span>
                <h2 style="margin:10px 0; font-size:28px;">숨은 정부지원금 찾기</h2>
                <p>1인 평균 127만원 환급, 지금 조회하세요</p>
                <a href="#" style="display:inline-block; background:white; color:#2563EB; padding:10px 20px; border-radius:8px; margin-top:10px; font-weight:bold;">내 지원금 조회하기</a>
            </div>

            <div class="info-card-grid">
                ${cards.length > 0 ? cards.map(card => `
                <a href="${card.link || '#'}" class="info-card">
                    <div class="info-card-highlight">
                        <div style="font-size:20px; font-weight:bold;">${card.amount || '금액 미정'}</div>
                        <div style="font-size:12px; opacity:0.9;">${card.sub || ''}</div>
                    </div>
                    <div class="info-card-content">
                        <h3 style="margin:0 0 10px 0; font-size:16px;">${card.title}</h3>
                        <p style="font-size:13px; color:#666; margin:0;">${card.desc || ''}</p>
                    </div>
                </a>
                `).join('') : '<p style="grid-column: 1/-1; text-align:center;">등록된 카드가 없습니다. 관리자에서 추가해주세요.</p>'}
            </div>
        </div>
    </body>
    </html>
    `);
});

// 3.3 관리자 대시보드
app.get('/wp-admin', (c) => {
    return c.html(renderAdminLayout(`
        <h1>대시보드</h1>
        <div class="card" style="padding: 20px;">
            <h2>환영합니다!</h2>
            <p>클라우드플레어 기반 워드프레스 클론 관리자입니다. 왼쪽 메뉴를 통해 플러그인 기능을 설정하세요.</p>
        </div>
        <div class="pl-grid">
            <div class="pl-grid-item">
                <h3>빠른 실행</h3>
                <a href="/wp-admin/post-new" class="button-primary">새 글 쓰기 (AI)</a>
            </div>
            <div class="pl-grid-item">
                <h3>통계 요약</h3>
                <p>오늘 방문자: 집계 중...</p>
            </div>
        </div>
    `, 'dashboard'));
});

// 3.4 플러그인 설정 (admin-settings.php)
app.get('/wp-admin/settings', async (c) => {
    const settings = await c.env.BLOG_DB.get('pl_settings', 'json') || {};
    
    // 헬퍼: 활성 상태 뱃지
    const badge = (key) => settings[key] === 'yes' 
        ? '<span class="status-badge active">활성화됨</span>' 
        : '<span class="status-badge inactive">비활성화됨</span>';

    return c.html(renderAdminLayout(`
        <div class="presslearn-header">
            <div class="presslearn-header-logo">
                <h1>AL Pack 플러그인 설정</h1>
            </div>
            <div class="presslearn-header-status">
                <div class="status-badge active" style="font-size:14px;">플러그인 동작 중</div>
            </div>
        </div>

        <div class="pl-grid">
            ${[
                {key: 'ai_contents', name: 'AI 블로그 포스팅', desc: 'Gemini/Llama 모델을 활용한 자동 글쓰기', link: '/wp-admin/post-new'},
                {key: 'analytics', name: '씬 애널리틱스', desc: '경량화된 방문자 통계 시스템', link: '/wp-admin/analytics'},
                {key: 'adclicker', name: '애드클리커', desc: '전면 광고 및 클릭 유도 설정', link: '/wp-admin/adclicker'},
                {key: 'protection', name: '애드 프로텍터', desc: '부정 클릭 방지 및 IP 차단', link: '/wp-admin/protection'},
                {key: 'dynamic', name: '다이나믹 배너', desc: '숏코드를 통한 배너 관리', link: '/wp-admin/dynamic'}
            ].map(item => `
                <div class="pl-grid-item">
                    <header>
                        <p>${badge(item.key)}</p>
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                    </header>
                    <div class="pl-grid-item-footer">
                        <a href="${item.link}" class="button-primary">설정 / 사용</a>
                        <button class="button-secondary toggle-btn" data-key="${item.key}">
                            ${settings[item.key] === 'yes' ? '끄기' : '켜기'}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>

        <script>
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const key = btn.dataset.key;
                const res = await fetch('/api/toggle-setting', {
                    method: 'POST',
                    body: JSON.stringify({ key }),
                    headers: {'Content-Type': 'application/json'}
                });
                if(res.ok) location.reload();
            });
        });
        </script>
    `, 'settings'));
});

// 3.5 AI 글쓰기 (admin.php + AI Meta Box)
app.get('/wp-admin/post-new', async (c) => {
    // 저장된 AI 설정 로드
    const aiTopic = await c.env.BLOG_DB.get('pl_v23_topic') || '';
    const aiMode = await c.env.BLOG_DB.get('pl_v23_mode') || 'adsense_approval';
    const aiAds = await c.env.BLOG_DB.get('pl_v23_ads_code') || '';

    return c.html(renderAdminLayout(`
        <h1>새 글 쓰기</h1>
        <div class="editor-layout">
            <div class="main-editor-area">
                <input type="text" id="post_title" placeholder="제목을 입력하세요" style="font-size: 20px; font-weight: bold; margin-bottom: 20px; padding: 10px;">
                <div id="editor-toolbar" style="background:#f0f0f1; padding:10px; border:1px solid #c3c4c7; border-bottom:none;">
                    <button type="button" class="button">B</button>
                    <button type="button" class="button">I</button>
                    <button type="button" class="button">LINK</button>
                </div>
                <textarea id="post_content" style="height: 500px; border-top:none; border-radius:0 0 4px 4px;" placeholder="내용을 입력하세요..."></textarea>
            </div>

            <div class="sidebar-area">
                <div class="postbox">
                    <div class="postbox-header">공개</div>
                    <div class="postbox-content">
                        <button class="button-primary" style="width:100%;">공개하기</button>
                    </div>
                </div>

                <div class="postbox">
                    <div class="postbox-header">☁️ PressLearn V23 (CF Workers AI)</div>
                    <div class="postbox-content">
                        <div id="pl-v23-wrapper">
                            <label style="font-weight:bold; font-size:12px;">🎯 주제</label>
                            <input type="text" id="pl_topic" value="${aiTopic}" placeholder="예: 국민연금 수령액" style="width:100%; margin-bottom:8px;">
                            
                            <label style="font-weight:bold; font-size:12px;">📝 엔진 모드</label>
                            <select id="pl_write_mode" style="width:100%; margin-bottom:8px;">
                                <option value="adsense_approval" ${aiMode === 'adsense_approval' ? 'selected' : ''}>💎 애드센스 승인용</option>
                                <option value="subsidy" ${aiMode === 'subsidy' ? 'selected' : ''}>💰 정부 지원금 정보</option>
                                <option value="pasona" ${aiMode === 'pasona' ? 'selected' : ''}>🔥 PASONA 수익형</option>
                            </select>
                            
                            <div id="ads_area" style="display:${aiMode === 'pasona' ? 'block' : 'none'};">
                                <label style="font-weight:bold; font-size:12px;">💰 애드센스 코드</label>
                                <textarea id="pl_ads_code" style="height:50px; font-size:11px;">${aiAds}</textarea>
                            </div>
                            
                            <button type="button" id="btn_save_v23" class="button-secondary" style="width:100%; margin-top:5px; font-size:11px;">설정 저장</button>
                            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                            
                            <button type="button" id="pl_btn_master" class="button-primary" style="width:100%; height:45px; font-weight:bold;">🚀 AI 마스터피스 생성</button>

                            <div id="pl_status_area" style="display:none; margin-top:15px; background:#f9f9f9; padding:10px; border-radius:4px; border:1px solid #eee;">
                                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold;">
                                    <span>진행률</span>
                                    <span id="pl_timer_text" style="color:#d63638;">0.0s</span>
                                </div>
                                <div style="width:100%; height:6px; background:#ddd; margin:5px 0; border-radius:3px; overflow:hidden;">
                                    <div id="pl_progress_bar" style="width:0%; height:100%; background:#2271b1; transition:width 0.2s;"></div>
                                </div>
                                <div id="pl_detail_status" style="font-size:11px; text-align:center;">대기 중...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
        $(document).ready(function() {
            // 모드 변경시 광고창 토글
            $('#pl_write_mode').change(function() {
                if($(this).val() === 'pasona') $('#ads_area').show();
                else $('#ads_area').hide();
            });

            // 설정 저장
            $('#btn_save_v23').click(async function() {
                await fetch('/api/save-ai-settings', {
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

            // AI 생성 로직
            $('#pl_btn_master').click(async function() {
                const topic = $('#pl_topic').val();
                if(!topic) return alert('주제를 입력하세요.');

                $('#pl_btn_master').prop('disabled', true);
                $('#pl_status_area').show();
                
                let progress = 0;
                let timer = setInterval(() => {
                    progress += 1;
                    if(progress > 95) progress = 95;
                    $('#pl_progress_bar').css('width', progress + '%');
                    $('#pl_timer_text').text((progress/2).toFixed(1) + 's');
                    
                    if(progress < 30) $('#pl_detail_status').text('🔍 주제 분석 중...');
                    else if(progress < 60) $('#pl_detail_status').text('✍️ 초안 작성 중...');
                    else $('#pl_detail_status').text('🎨 HTML 포맷팅 중...');
                }, 100);

                try {
                    const res = await fetch('/api/ai-generate', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ 
                            topic: topic, 
                            mode: $('#pl_write_mode').val(),
                            ads: $('#pl_ads_code').val() 
                        })
                    });
                    
                    const data = await res.json();
                    
                    clearInterval(timer);
                    $('#pl_progress_bar').css('width', '100%');
                    $('#pl_detail_status').text('✅ 완료!');
                    
                    // 결과 반영
                    if(data.title) $('#post_title').val(data.title);
                    if(data.body) $('#post_content').val(data.body);

                } catch(e) {
                    alert('생성 실패: ' + e);
                } finally {
                    $('#pl_btn_master').prop('disabled', false);
                }
            });
        });
        </script>
    `, 'posts'));
});

// 3.6 씬 애널리틱스 (admin-analytics.php)
app.get('/wp-admin/analytics', async (c) => {
    // 가짜 데이터 생성 (KV에 실제 데이터가 없으므로 차트 데모용)
    const labels = ['월', '화', '수', '목', '금', '토', '일'];
    const dataViews = [120, 190, 30, 50, 20, 300, 400];
    
    return c.html(renderAdminLayout(`
        <div class="presslearn-header">
            <div class="presslearn-header-logo"><h1>씬 애널리틱스</h1></div>
            <div class="status-badge active">활성화됨</div>
        </div>

        <div class="chart-container">
            <h3 style="margin-bottom:20px;">주간 방문자 추이</h3>
            <canvas id="analyticsChart"></canvas>
        </div>

        <div class="stats-summary">
            <div class="stat-item">
                <h3>오늘 페이지뷰</h3>
                <div class="stat-value">1,245</div>
            </div>
            <div class="stat-item">
                <h3>이번 주 방문자</h3>
                <div class="stat-value">5,890</div>
            </div>
            <div class="stat-item">
                <h3>평균 체류시간</h3>
                <div class="stat-value">03:12</div>
            </div>
        </div>

        <div class="card" style="padding:0;">
            <table class="widefat">
                <thead>
                    <tr><th>페이지</th><th>조회수</th><th>유입경로</th></tr>
                </thead>
                <tbody>
                    <tr><td>/support-fund-2024</td><td>450</td><td>Google</td></tr>
                    <tr><td>/hidden-money</td><td>320</td><td>Naver</td></tr>
                    <tr><td>/refund-apply</td><td>120</td><td>Direct</td></tr>
                </tbody>
            </table>
        </div>

        <script>
        const ctx = document.getElementById('analyticsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                    label: '페이지뷰',
                    data: ${JSON.stringify(dataViews)},
                    borderColor: '#2271b1',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
        </script>
    `, 'analytics'));
});

// 3.7 애드 프로텍터 (admin-click-protection.php)
app.get('/wp-admin/protection', async (c) => {
    const blockedIPs = await c.env.BLOG_DB.get('blocked_ips', 'json') || [];
    
    return c.html(renderAdminLayout(`
        <div class="presslearn-header">
            <div class="presslearn-header-logo"><h1>애드 프로텍터</h1></div>
            <div class="status-badge active">보호 중</div>
        </div>

        <div class="pl-grid" style="grid-template-columns: 1fr;">
            <div class="pl-grid-item">
                <h3>설정</h3>
                <div style="margin-bottom:15px;">
                    <label>최대 허용 클릭 수</label>
                    <input type="number" value="3" style="width:100px;">
                </div>
                <div>
                    <label>차단 시간 (시간)</label>
                    <input type="number" value="24" style="width:100px;">
                </div>
                <div class="pl-grid-item-footer">
                    <button class="button-primary">저장</button>
                </div>
            </div>
            
            <div class="pl-grid-item">
                <h3>차단된 IP 목록</h3>
                <table class="widefat">
                    <thead><tr><th>IP 주소</th><th>차단 사유</th><th>해제</th></tr></thead>
                    <tbody id="ip-list">
                        ${blockedIPs.length ? blockedIPs.map(ip => `<tr><td>${ip}</td><td>부정 클릭</td><td><button>해제</button></td></tr>`).join('') : '<tr><td colspan="3">차단된 IP가 없습니다.</td></tr>'}
                    </tbody>
                </table>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <input type="text" id="new-ip" placeholder="차단할 IP 입력">
                    <button class="button-secondary" id="btn-block-ip">IP 추가 차단</button>
                </div>
            </div>
        </div>

        <script>
        $('#btn-block-ip').click(async () => {
            const ip = $('#new-ip').val();
            if(!ip) return;
            // API call logic would go here
            alert(ip + ' 차단 목록에 추가됨 (데모)');
            location.reload();
        });
        </script>
    `, 'protection'));
});

// 3.8 다이나믹 배너 & 애드클리커 (통합 화면)
app.get('/wp-admin/adclicker', (c) => c.redirect('/wp-admin/dynamic'));
app.get('/wp-admin/dynamic', async (c) => {
    return c.html(renderAdminLayout(`
        <div class="presslearn-header">
            <div class="presslearn-header-logo"><h1>다이나믹 배너 & 애드클리커</h1></div>
        </div>
        <div class="pl-grid">
            <div class="pl-grid-item">
                <h3>배너 캠페인 목록</h3>
                <table class="widefat">
                    <thead><tr><th>캠페인명</th><th>숏코드</th><th>상태</th></tr></thead>
                    <tbody>
                        <tr><td>쿠팡 파트너스 A</td><td>[banner id="1"]</td><td><span style="color:green">●</span></td></tr>
                        <tr><td>알리 익스프레스 B</td><td>[banner id="2"]</td><td><span style="color:gray">●</span></td></tr>
                    </tbody>
                </table>
                <div class="pl-grid-item-footer">
                    <button class="button-primary">새 캠페인 추가</button>
                </div>
            </div>
            
            <div class="pl-grid-item">
                <h3>애드클리커 설정 (전면 광고)</h3>
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
                <p>활성화 시 페이지 이동 전 전면 배너를 표시합니다.</p>
                <div style="margin-top:10px;">
                    <label>표시 확률 (%)</label>
                    <input type="number" value="100">
                </div>
                <div class="pl-grid-item-footer">
                    <button class="button-primary">저장</button>
                </div>
            </div>
        </div>
    `, 'dynamic'));
});

// ==========================================
// 4. API 엔드포인트
// ==========================================

// 4.1 설정 토글
app.post('/api/toggle-setting', async (c) => {
    const { key } = await c.req.json();
    const settings = await c.env.BLOG_DB.get('pl_settings', 'json') || {};
    settings[key] = settings[key] === 'yes' ? 'no' : 'yes';
    await c.env.BLOG_DB.put('pl_settings', JSON.stringify(settings));
    return c.json({ success: true });
});

// 4.2 AI 설정 저장
app.post('/api/save-ai-settings', async (c) => {
    const body = await c.req.json();
    await c.env.BLOG_DB.put('pl_v23_topic', body.topic);
    await c.env.BLOG_DB.put('pl_v23_mode', body.mode);
    await c.env.BLOG_DB.put('pl_v23_ads_code', body.ads);
    return c.json({ success: true });
});

// 4.3 **AI 글 생성 (Workers AI)**
app.post('/api/ai-generate', async (c) => {
    const { topic, mode, ads } = await c.req.json();
    
    let sysPrompt = "당신은 전문 블로그 작가입니다. JSON 형식 {'title': '...', 'body': '...'}으로만 응답하세요. HTML 태그(h2, p, ul)를 사용하세요.";
    let userPrompt = `주제: ${topic}. `;
    
    if(mode === 'adsense_approval') userPrompt += "스타일: 전문적이고 신뢰감 있게, 1500자 이상.";
    else if(mode === 'subsidy') userPrompt += "스타일: 정부 지원금 정보, 신청 방법, 자격 요건을 명확하게.";
    else if(mode === 'pasona') userPrompt += `스타일: PASONA 마케팅 공식 적용. 중간에 광고 코드 삽입: ${ads}`;

    try {
        const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: "system", content: sysPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        // 결과 파싱 (마크다운 제거 등)
        let raw = response.response;
        // JSON 추출 시도
        const match = raw.match(/\{[\s\S]*\}/);
        const jsonStr = match ? match[0] : raw;
        
        let result;
        try {
            result = JSON.parse(jsonStr);
        } catch(e) {
            result = { title: topic, body: raw }; // 파싱 실패시 원문 반환
        }

        return c.json(result);
    } catch (e) {
        return c.json({ title: "Error", body: e.message });
    }
});

export default app;
