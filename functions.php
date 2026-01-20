<?php
/**
 * 지원금 테마 핵심 기능 파일
 * Puter.js AI 기반 버전 - 블로그 포스트 완벽 지원
 */

if (!defined('ABSPATH')) exit;

/**
 * 테마 초기화 및 스타일 로드
 */
function sup_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
}
add_action('after_setup_theme', 'sup_theme_setup');

function sup_enqueue_scripts() {
    wp_enqueue_style('sup-main-style', get_stylesheet_uri(), [], '2.0.0');
    wp_enqueue_style('sup-google-fonts', 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap', [], null);
    
    // 관리자 페이지에서만 jQuery 로드
    if (is_admin()) {
        wp_enqueue_script('jquery');
    }
}
add_action('wp_enqueue_scripts', 'sup_enqueue_scripts');

/**
 * 관리자 메뉴 및 설정 페이지
 */
function sup_admin_menu() {
    add_menu_page('지원금 관리', '지원금 관리', 'manage_options', 'sup-manager', 'sup_page_cards', 'dashicons-money-alt', 30);
    add_submenu_page('sup-manager', '탭 메뉴 설정', '탭 메뉴 설정', 'manage_options', 'sup-tabs', 'sup_page_tabs');
    add_submenu_page('sup-manager', '광고 설정', '광고 설정', 'manage_options', 'sup-ads', 'sup_page_ads');
}
add_action('admin_menu', 'sup_admin_menu');

/**
 * 카드 관리 페이지
 */
function sup_page_cards() {
    if (isset($_POST['save_cards']) && check_admin_referer('sup_save_cards_action', 'sup_nonce')) {
        $cards = isset($_POST['cards']) ? $_POST['cards'] : [];
        $sanitized_cards = [];
        foreach ($cards as $card) {
            $sanitized_cards[] = [
                'keyword'     => sanitize_text_field($card['keyword']),
                'amount'      => sanitize_text_field($card['amount']),
                'amountSub'   => sanitize_text_field($card['amountSub']),
                'target'      => sanitize_text_field($card['target']),
                'period'      => sanitize_text_field($card['period']),
                'description' => sanitize_textarea_field($card['description']),
                'link'        => esc_url_raw($card['link']),
                'featured'    => isset($card['featured']) ? 1 : 0 
            ];
        }
        update_option('sup_final_cards_data', $sanitized_cards);
        echo '<div class="notice notice-success"><p>카드가 저장되었습니다.</p></div>';
    }
    $cards = get_option('sup_final_cards_data', []);
    ?>
    <script src="https://js.puter.com/v2/"></script>

    <div class="wrap">
        <h1>지원금 카드 관리 (Puter.js AI - 개선된 분석)</h1>
        <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <strong>ℹ️ AI 분석 개선사항:</strong><br>
            • 최대 지원금액을 정확하게 조사하여 표시합니다<br>
            • 신청시기와 대상을 깊이 있게 분석합니다<br>
            • 모든 정보를 상세하고 정성스럽게 작성합니다
        </p>
        <form method="post">
            <?php wp_nonce_field('sup_save_cards_action', 'sup_nonce'); ?>
            <div id="sup-card-list">
                <?php if (empty($cards)) : sup_render_card_item(0, [], true); 
                      else : foreach ($cards as $index => $card) : sup_render_card_item($index, $card); endforeach; 
                      endif; ?>
            </div>
            <div style="margin-top:20px;">
                <button type="button" id="add-card-btn" class="button">➕ 카드 추가</button>
                <input type="submit" name="save_cards" class="button button-primary" value="변경사항 저장">
            </div>
        </form>
    </div>
    <script>
    jQuery(document).ready(function($) {
        // 카드 추가 로직
        $('#add-card-btn').on('click', function() {
            var count = new Date().getTime();
            var template = $('.sup-card-item').first().clone();
            template.find('input, textarea').val('').prop('checked', false);
            template.find('input, textarea').each(function() {
                var name = $(this).attr('name');
                if(name) $(this).attr('name', name.replace(/\[\d+\]/, '[' + count + ']'));
            });
            $('#sup-card-list').append(template);
        });

        // 카드 삭제 로직
        $(document).on('click', '.remove-card', function() {
            if ($('.sup-card-item').length > 1) $(this).closest('.sup-card-item').remove();
        });

        // 개선된 Puter.js AI 자동입력 로직
        $(document).on('click', '.ai-fetch-btn', function() {
            var btn = $(this);
            var container = btn.closest('.sup-card-item');
            var keyword = container.find('.input-keyword').val();
            
            if (!keyword) return alert('정책명을 입력하세요.');
            
            btn.text('🤖 AI 심층분석 중...').prop('disabled', true);

            // 개선된 프롬프트 - 더 상세하고 정확한 분석 요청
            var prompt = `대한민국 정부 지원정책 "${keyword}"에 대해 다음 사항을 철저히 조사하여 JSON 형식으로만 답변해주세요.

중요 지침:
1. 금액: 정확한 금액을 찾을 수 없다면, 반드시 "최대 [금액]"으로 표기하세요
2. 신청시기: 정기/상시/특정 기간 등을 명확히 조사하세요
3. 지원대상: 나이, 소득, 가구 조건 등을 구체적으로 작성하세요
4. 설명: 정책의 핵심 내용을 80자 이내로 간결하되 중요한 정보는 빠뜨리지 마세요

마크다운 없이 순수 JSON만 출력:
{
  "amount": "지원금액 (예: 최대 300만원, 월 50만원 등)",
  "amountSub": "금액 부연설명 (예: 가구당 연간, 1인당 월 등)",
  "target": "상세한 지원대상 (나이, 소득 기준 포함)",
  "period": "신청시기 (예: 연중 상시, 매년 5월, 분기별 등)",
  "description": "정책 핵심 설명 (80자 이내, 구체적이고 명확하게)"
}`;

            // Puter.js 호출
            puter.ai.chat(prompt)
                .then(function(response) {
                    var content = response.message.content;
                    
                    try {
                        // JSON 파싱 (마크다운 코드 블록 제거)
                        var jsonStr = content.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
                        var data = JSON.parse(jsonStr);

                        container.find('.input-amount').val(data.amount);
                        container.find('.input-amountSub').val(data.amountSub);
                        container.find('.input-target').val(data.target);
                        container.find('.input-period').val(data.period);
                        container.find('.input-desc').val(data.description);
                        
                        alert('✅ AI 분석 완료!\n\n상세한 정보가 입력되었습니다.');
                    } catch (e) {
                        console.error('파싱 오류:', e);
                        console.log("원본 응답:", content);
                        alert('⚠️ 데이터 파싱 실패\n\n콘솔을 확인하여 응답 내용을 검토하세요.');
                    }
                })
                .catch(function(err) {
                    console.error('AI 오류:', err);
                    alert('❌ Puter AI 오류: ' + err);
                })
                .finally(function() {
                    btn.text('🤖 AI 자동입력').prop('disabled', false);
                });
        });
    });
    </script>
    <style>
        .sup-card-item { 
            background: #fff; 
            border: 1px solid #ccd0d4; 
            padding: 20px; 
            margin-bottom: 15px; 
            border-radius: 4px; 
        }
        .sup-card-header { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            margin-bottom: 15px; 
        }
        .sup-input-row { 
            display: grid; 
            grid-template-columns: 100px 1fr; 
            gap: 10px; 
            margin-bottom: 8px; 
        }
        .ai-fetch-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
        }
        .ai-fetch-btn:hover {
            background: #45a049;
        }
    </style>
    <?php
}

function sup_render_card_item($index, $card, $is_empty = false) {
    ?>
    <div class="sup-card-item">
        <div class="sup-card-header">
            <input type="text" name="cards[<?php echo $index; ?>][keyword]" class="input-keyword regular-text" value="<?php echo $is_empty ? '' : esc_attr($card['keyword']); ?>" placeholder="정책명 입력 (예: 근로장려금)">
            <button type="button" class="button ai-fetch-btn">🤖 AI 자동입력</button>
            <label><input type="checkbox" name="cards[<?php echo $index; ?>][featured]" value="1" <?php echo (!$is_empty && !empty($card['featured'])) ? 'checked' : ''; ?>> ⭐ 인기배지</label>
            <button type="button" class="button remove-card" style="color:red">❌ 삭제</button>
        </div>
        <div class="sup-input-row">
            <label>💰 금액</label>
            <input type="text" name="cards[<?php echo $index; ?>][amount]" class="input-amount" value="<?php echo $is_empty ? '' : esc_attr($card['amount']); ?>" placeholder="예: 최대 300만원">
        </div>
        <div class="sup-input-row">
            <label>📝 부연설명</label>
            <input type="text" name="cards[<?php echo $index; ?>][amountSub]" class="input-amountSub" value="<?php echo $is_empty ? '' : esc_attr($card['amountSub']); ?>" placeholder="예: 가구당 연간">
        </div>
        <div class="sup-input-row">
            <label>👥 대상</label>
            <input type="text" name="cards[<?php echo $index; ?>][target]" class="input-target" placeholder="예: 근로소득자, 만 18세 이상" value="<?php echo $is_empty ? '' : esc_attr($card['target']); ?>">
        </div>
        <div class="sup-input-row">
            <label>📅 시기</label>
            <input type="text" name="cards[<?php echo $index; ?>][period]" class="input-period" placeholder="예: 매년 5월 정기신청" value="<?php echo $is_empty ? '' : esc_attr($card['period']); ?>">
        </div>
        <div class="sup-input-row">
            <label>💬 한줄설명</label>
            <textarea name="cards[<?php echo $index; ?>][description]" class="input-desc" rows="2" placeholder="정책의 핵심 내용을 80자 이내로 간결하게 작성"><?php echo $is_empty ? '' : esc_textarea($card['description']); ?></textarea>
        </div>
        <div class="sup-input-row">
            <label>🔗 링크</label>
            <input type="url" name="cards[<?php echo $index; ?>][link]" value="<?php echo $is_empty ? '' : esc_url($card['link']); ?>" placeholder="https://example.com">
        </div>
    </div>
    <?php
}

/**
 * 탭 설정 페이지
 */
function sup_page_tabs() {
    if (isset($_POST['save_tabs']) && check_admin_referer('sup_tabs_nonce', 'sup_tabs_nonce_field')) {
        $tabs = isset($_POST['tabs']) ? $_POST['tabs'] : [];
        $sanitized_tabs = [];
        foreach ($tabs as $tab) {
            $sanitized_tabs[] = [
                'name' => sanitize_text_field($tab['name']),
                'link' => esc_url_raw($tab['link']),
                'is_active' => isset($tab['is_active']) ? 1 : 0
            ];
        }
        update_option('sup_final_tabs_data', $sanitized_tabs);
        echo '<div class="notice notice-success"><p>탭 설정이 저장되었습니다.</p></div>';
    }
    $tabs = get_option('sup_final_tabs_data', array_fill(0, 3, ['name' => '', 'link' => '', 'is_active' => 1]));
    ?>
    <div class="wrap">
        <h1>탭 메뉴 설정</h1>
        <form method="post">
            <?php wp_nonce_field('sup_tabs_nonce', 'sup_tabs_nonce_field'); ?>
            <table class="form-table">
                <thead>
                    <tr>
                        <th>활성화</th>
                        <th>탭 이름</th>
                        <th>링크 URL</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($tabs as $i => $tab): ?>
                <tr>
                    <td><input type="checkbox" name="tabs[<?php echo $i; ?>][is_active]" value="1" <?php checked($tab['is_active'], 1); ?>></td>
                    <td><input type="text" name="tabs[<?php echo $i; ?>][name]" value="<?php echo esc_attr($tab['name']); ?>" placeholder="탭 이름" class="regular-text"></td>
                    <td><input type="url" name="tabs[<?php echo $i; ?>][link]" value="<?php echo esc_url($tab['link']); ?>" placeholder="https://example.com" class="regular-text"></td>
                </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
            <p class="submit">
                <input type="submit" name="save_tabs" class="button button-primary" value="탭 설정 저장">
            </p>
        </form>
    </div>
    <?php
}

/**
 * 광고 설정 페이지
 */
function sup_page_ads() {
    if (isset($_POST['save_ads']) && check_admin_referer('sup_ads_nonce', 'sup_ads_nonce_field')) {
        update_option('sup_final_ad_code', wp_kses_post($_POST['ad_code']));
        echo '<div class="notice notice-success"><p>광고 코드가 저장되었습니다.</p></div>';
    }
    $ad_code = get_option('sup_final_ad_code', '');
    ?>
    <div class="wrap">
        <h1>광고 설정</h1>
        <p>애드센스 광고 코드 또는 기타 광고 스크립트를 입력하세요.</p>
        <form method="post">
            <?php wp_nonce_field('sup_ads_nonce', 'sup_ads_nonce_field'); ?>
            <textarea name="ad_code" rows="10" class="large-text code"><?php echo esc_textarea($ad_code); ?></textarea>
            <p class="submit">
                <input type="submit" name="save_ads" class="button button-primary" value="광고 코드 저장">
            </p>
        </form>
    </div>
    <?php
}

/**
 * 포스트 컨텐츠에 클래스 추가
 */
function sup_post_class($classes) {
    $classes[] = 'post-content';
    return $classes;
}
add_filter('post_class', 'sup_post_class');

/**
 * 본문 내용 래핑
 */
function sup_wrap_post_content($content) {
    if (is_singular('post')) {
        $content = '<div class="post-content">' . $content . '</div>';
    }
    return $content;
}
add_filter('the_content', 'sup_wrap_post_content');
