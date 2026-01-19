<?php
/**
 * Main Template
 */
get_header();

// 데이터 가져오기 (functions.php 연동)
$cards = get_option('sup_final_cards_data', []);
$raw_ad_code = stripslashes(get_option('sup_final_ad_code', ''));

// 광고 파싱 (규칙 2: 파싱 로직)
$pub_id = '';
$ad_slot = '';

if (!empty($raw_ad_code)) {
    preg_match('/data-ad-client=["\']([^"\']+)["\']/', $raw_ad_code, $matches_pub);
    preg_match('/data-ad-slot=["\']([^"\']+)["\']/', $raw_ad_code, $matches_slot);
    
    if (isset($matches_pub[1])) $pub_id = $matches_pub[1];
    if (isset($matches_slot[1])) $ad_slot = $matches_slot[1];
}
?>

<div class="container">
    <div class="intro-section">
        <span class="intro-badge">신청마감 D-3일</span>
        <p class="intro-sub">숨은 보험금 1분만에 찾기!</p>
        <h2 class="intro-title">숨은 지원금 찾기</h2>
    </div>

    <div class="info-box">
        <div class="info-box-header">
            <span class="info-box-icon">🏷️</span>
            <span class="info-box-title">신청 안하면 절대 못 받아요</span>
        </div>
        <div class="info-box-amount">1인 평균 127만원 환급</div>
        <p class="info-box-desc">대한민국 92%가 놓치고 있는 정부 지원금! 지금 확인하고 혜택 놓치지 마세요.</p>
    </div>

    <?php if (!empty($raw_ad_code)): ?>
        <div class="ad-container-top" style="margin-bottom: 30px; text-align: center;">
            <?php echo $raw_ad_code; ?>
        </div>
    <?php else: ?>
        <?php endif; ?>
    <div class="info-card-grid">
        <?php
        if (!empty($cards)) {
            foreach ($cards as $index => $card) {
                // 데이터 안전성 검사
                $keyword = isset($card['keyword']) ? $card['keyword'] : '';
                $amount = isset($card['amount']) ? $card['amount'] : '';
                $amountSub = isset($card['amountSub']) ? $card['amountSub'] : '';
                $desc = isset($card['description']) ? $card['description'] : '';
                $target = isset($card['target']) ? $card['target'] : '';
                $period = isset($card['period']) ? $card['period'] : '';
                $link = isset($card['link']) ? $card['link'] : '#';
                $is_featured = false; // 기본값 false, 필요시 로직 추가

                // ========== 광고 삽입 로직 (규칙 3: 카드 사이 광고) ==========
                // 0, 3, 6번째 카드 앞에 광고 삽입
                if ($pub_id && $ad_slot && in_array($index, array(0, 3, 6))) {
                    ?>
                    <div class="ad-card">
                        <div style="display:flex; justify-content:center; width:100%;">
                            <ins class="adsbygoogle"
                                 style="display:inline-block;width:336px;height:280px;"
                                 data-ad-client="<?php echo esc_attr($pub_id); ?>"
                                 data-ad-slot="<?php echo esc_attr($ad_slot); ?>"></ins>
                            <script>
                                (adsbygoogle = window.adsbygoogle || []).push({});
                            </script>
                        </div>
                    </div>
                    <?php
                }
                // ========================================================

                $featured_class = $is_featured ? ' featured' : '';
                ?>
                <a class="info-card<?php echo $featured_class; ?>" href="<?php echo esc_url($link); ?>" target="_blank">
                    <div class="info-card-highlight">
                        <?php if ($is_featured): ?>
                            <span class="info-card-badge">🔥 인기</span>
                        <?php endif; ?>
                        <div class="info-card-amount"><?php echo esc_html($amount); ?></div>
                        <div class="info-card-amount-sub"><?php echo esc_html($amountSub); ?></div>
                    </div>
                    <div class="info-card-content">
                        <h3 class="info-card-title"><?php echo esc_html($keyword); ?></h3>
                        <p class="info-card-desc"><?php echo esc_html(mb_strimwidth($desc, 0, 80, '...')); ?></p>
                        <div class="info-card-details">
                            <div class="info-card-row">
                                <span class="info-card-label">지원대상</span>
                                <span class="info-card-value"><?php echo esc_html($target); ?></span>
                            </div>
                            <div class="info-card-row">
                                <span class="info-card-label">신청시기</span>
                                <span class="info-card-value"><?php echo esc_html($period); ?></span>
                            </div>
                        </div>
                        <div class="info-card-btn">
                            지금 바로 신청하기 <span class="btn-arrow">→</span>
                        </div>
                    </div>
                </a>
                <?php
            }
        } else {
            echo '<p style="text-align:center; width:100%; grid-column: 1 / -1;">등록된 지원금 카드가 없습니다. 관리자 페이지에서 추가해주세요.</p>';
        }
        ?>
    </div>

    <div class="hero-section">
        <div class="hero-content">
            <span class="hero-urgent">🔥 신청마감 D-3일</span>
            <p class="hero-sub">숨은 지원금 1분만에 찾기!</p>
            <h2 class="hero-title">
                나의 <span class="hero-highlight">숨은 지원금</span> 찾기
            </h2>
            <p class="hero-amount">신청자 <strong>1인 평균 127만원</strong> 수령</p>
            <a class="hero-cta" href="#">
                30초만에 내 지원금 확인 <span>→</span>
            </a>
            <div class="hero-trust">
                <span class="trust-item">✓ 무료 조회</span>
                <span class="trust-item">✓ 30초 완료</span>
                <span class="trust-item">✓ 개인정보 보호</span>
            </div>
            <div class="hero-notice">
                <div class="notice-title">💡 신청 안하면 못 받아요</div>
                <p class="notice-desc">대한민국 92%가 놓치고 있는 정부 지원금, 지금 확인하고 혜택 놓치지 마세요!</p>
            </div>
        </div>
    </div>
</div>

<?php get_footer(); ?>
