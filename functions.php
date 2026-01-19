<?php
/**
 * 지원금 테마 핵심 기능 파일
 * API 키 및 탭 활성화 기능 포함 버전
 */

if (!defined('ABSPATH')) exit;

// 1. OpenRouter API 키 설정
if (!defined('SUPPORT_AI_API_KEY')) {
    define('SUPPORT_AI_API_KEY', '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');
}

/**
 * 2. 테마 초기화 및 스타일 로드
 */
function sup_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'sup_theme_setup');

function sup_enqueue_scripts() {
    wp_enqueue_style('sup-main-style', get_stylesheet_uri(), [], '1.3.0');
    wp_enqueue_style('sup-google-fonts', 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap', [], null);
}
add_action('wp_enqueue_scripts', 'sup_enqueue_scripts');

/**
 * 3. 관리자 메뉴 및 설정 페이지
 */
function sup_admin_menu() {
    add_menu_page('지원금 관리', '지원금 관리', 'manage_options', 'sup-manager', 'sup_page_cards', 'dashicons-money-alt', 30);
    add_submenu_page('sup-manager', '탭 메뉴 설정', '탭 메뉴 설정', 'manage_options', 'sup-tabs', 'sup_page_tabs');
    add_submenu_page('sup-manager', '광고 설정', '광고 설정', 'manage_options', 'sup-ads', 'sup_page_ads');
}
add_action('admin_menu', 'sup_admin_menu');

// [카드 관리 페이지]
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
    <div class="wrap">
        <h1>지원금 카드 관리</h1>
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
        $(document).on('click', '.remove-card', function() {
            if ($('.sup-card-item').length > 1) $(this).closest('.sup-card-item').remove();
        });
        $(document).on('click', '.ai-fetch-btn', function() {
            var btn = $(this);
            var container = btn.closest('.sup-card-item');
            var keyword = container.find('.input-keyword').val();
            if (!keyword) return alert('정책명을 입력하세요.');
            btn.text('AI 분석중...').prop('disabled', true);
            $.post(ajaxurl, { action: 'sup_ai_fetch', keyword: keyword, security: '<?php echo wp_create_nonce("sup_ai_nonce"); ?>' }, function(res) {
                if (res.success) {
                    container.find('.input-amount').val(res.data.amount);
                    container.find('.input-amountSub').val(res.data.amountSub);
                    container.find('.input-target').val(res.data.target);
                    container.find('.input-period').val(res.data.period);
                    container.find('.input-desc').val(res.data.description);
                } else { alert('AI 오류: ' + res.data); }
                btn.text('AI 자동입력').prop('disabled', false);
            });
        });
    });
    </script>
    <style>
        .sup-card-item { background: #fff; border: 1px solid #ccd0d4; padding: 20px; margin-bottom: 15px; border-radius: 4px; }
        .sup-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        .sup-input-row { display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 8px; }
    </style>
    <?php
}

function sup_render_card_item($index, $card, $is_empty = false) {
    ?>
    <div class="sup-card-item">
        <div class="sup-card-header">
            <input type="text" name="cards[<?php echo $index; ?>][keyword]" class="input-keyword regular-text" value="<?php echo $is_empty ? '' : esc_attr($card['keyword']); ?>" placeholder="정책명 입력">
            <button type="button" class="button ai-fetch-btn">AI 자동입력</button>
            <label><input type="checkbox" name="cards[<?php echo $index; ?>][featured]" value="1" <?php echo (!$is_empty && !empty($card['featured'])) ? 'checked' : ''; ?>> 인기배지</label>
            <button type="button" class="button remove-card" style="color:red">삭제</button>
        </div>
        <div class="sup-input-row"><label>금액</label><input type="text" name="cards[<?php echo $index; ?>][amount]" class="input-amount" value="<?php echo $is_empty ? '' : esc_attr($card['amount']); ?>"></div>
        <div class="sup-input-row"><label>부연설명</label><input type="text" name="cards[<?php echo $index; ?>][amountSub]" class="input-amountSub" value="<?php echo $is_empty ? '' : esc_attr($card['amountSub']); ?>"></div>
        <div class="sup-input-row"><label>대상/시기</label>
            <input type="text" name="cards[<?php echo $index; ?>][target]" class="input-target" placeholder="대상" value="<?php echo $is_empty ? '' : esc_attr($card['target']); ?>">
            <input type="text" name="cards[<?php echo $index; ?>][period]" class="input-period" placeholder="시기" value="<?php echo $is_empty ? '' : esc_attr($card['period']); ?>">
        </div>
        <div class="sup-input-row"><label>한줄설명</label><textarea name="cards[<?php echo $index; ?>][description]" class="input-desc" rows="2"><?php echo $is_empty ? '' : esc_textarea($card['description']); ?></textarea></div>
        <div class="sup-input-row"><label>링크</label><input type="url" name="cards[<?php echo $index; ?>][link]" value="<?php echo $is_empty ? '' : esc_url($card['link']); ?>"></div>
    </div>
    <?php
}

// [탭 설정 페이지]
function sup_page_tabs() {
    if (isset($_POST['save_tabs'])) {
        update_option('sup_final_tabs_data', $_POST['tabs']);
        echo '<div class="notice notice-success"><p>탭 설정이 저장되었습니다.</p></div>';
    }
    $tabs = get_option('sup_final_tabs_data', array_fill(0, 3, ['name' => '', 'link' => '', 'is_active' => 1]));
    ?>
    <div class="wrap">
        <h1>탭 메뉴 설정</h1>
        <form method="post">
            <table class="form-table">
                <?php foreach ($tabs as $i => $tab): ?>
                <tr>
                    <td><input type="checkbox" name="tabs[<?php echo $i; ?>][is_active]" value="1" <?php checked($tab['is_active'], 1); ?>> 활성화</td>
                    <td><input type="text" name="tabs[<?php echo $i; ?>][name]" value="<?php echo esc_attr($tab['name']); ?>" placeholder="탭 이름"></td>
                    <td><input type="url" name="tabs[<?php echo $i; ?>][link]" value="<?php echo esc_url($tab['link']); ?>" placeholder="링크"></td>
                </tr>
                <?php endforeach; ?>
            </table>
            <input type="submit" name="save_tabs" class="button button-primary" value="저장">
        </form>
    </div>
    <?php
}

// [광고 설정 페이지]
function sup_page_ads() {
    if (isset($_POST['save_ads'])) {
        update_option('sup_final_ad_code', stripslashes($_POST['ad_code']));
        echo '<div class="notice notice-success"><p>광고 저장 완료</p></div>';
    }
    ?>
    <div class="wrap">
        <h1>광고 설정</h1>
        <form method="post">
            <textarea name="ad_code" rows="10" class="large-text"><?php echo esc_textarea(get_option('sup_final_ad_code')); ?></textarea>
            <input type="submit" name="save_ads" class="button button-primary" value="광고 코드 저장">
        </form>
    </div>
    <?php
}

/**
 * 4. AI AJAX 엔진 (OpenRouter)
 */
function sup_ajax_ai_fetch() {
    check_ajax_referer('sup_ai_nonce', 'security');
    $keyword = sanitize_text_field($_POST['keyword']);
    
    $response = wp_remote_post('https://openrouter.ai/api/v1/chat/completions', [
        'headers' => [
            'Authorization' => 'Bearer ' . SUPPORT_AI_API_KEY,
            'Content-Type'  => 'application/json',
            'HTTP-Referer'  => home_url(),
        ],
        'body' => json_encode([
            'model' => 'openai/gpt-4o-mini',
            'messages' => [['role' => 'user', 'content' => "정부정책 '{$keyword}' 정보를 다음 JSON으로만 답해줘: {amount, amountSub, description, target, period}"]]
        ]),
        'timeout' => 20
    ]);

    if (is_wp_error($response)) wp_send_json_error('API 연결 실패');
    $body = json_decode(wp_remote_retrieve_body($response), true);
    $content = $body['choices'][0]['message']['content'] ?? '';
    $json = json_decode(preg_replace('/```json\s*|\s*```/', '', $content), true);
    
    if ($json) wp_send_json_success($json);
    else wp_send_json_error('데이터 추출 실패');
}
add_action('wp_ajax_sup_ai_fetch', 'sup_ajax_ai_fetch');
