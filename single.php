<?php
/**
 * Single Post Template
 * 개별 블로그 포스트를 표시하는 템플릿
 */
get_header();
?>

<div class="container">
    <?php
    while (have_posts()) :
        the_post();
    ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('post-content'); ?>>
            <?php
            $content = get_the_content();
            
            // 광고 코드 가져오기
            $raw_ad_code = stripslashes(get_option('sup_final_ad_code', ''));
            
            // 광고 삽입 위치 계산 (본문의 1/3 지점)
            if (!empty($raw_ad_code)) {
                $paragraphs = explode('</p>', $content);
                $insert_position = max(1, floor(count($paragraphs) / 3));
                
                // 광고를 삽입
                if (count($paragraphs) > 2) {
                    array_splice($paragraphs, $insert_position, 0, '<div class="apply-container" style="margin: 30px 0;">' . $raw_ad_code . '</div>');
                    $content = implode('</p>', $paragraphs);
                }
            }
            
            echo apply_filters('the_content', $content);
            ?>

            <?php if (!empty($raw_ad_code)) : ?>
                <div class="apply-container" style="margin-top: 40px;">
                    <?php echo $raw_ad_code; ?>
                </div>
            <?php endif; ?>

            <?php
            // 관련 포스트
            $related_args = array(
                'post__not_in' => array(get_the_ID()),
                'posts_per_page' => 3,
                'orderby' => 'rand'
            );
            
            $related_posts = new WP_Query($related_args);
            
            if ($related_posts->have_posts()) :
            ?>
                <div class="benefit-card">
                    <div class="benefit-title">
                        <span class="icon">📌</span>
                        관련 글
                    </div>
                    <div class="benefit-list">
                        <?php while ($related_posts->have_posts()) : $related_posts->the_post(); ?>
                            <a href="<?php the_permalink(); ?>">
                                <div class="benefit-item">
                                    <span class="benefit-text"><?php the_title(); ?></span>
                                    <span>→</span>
                                </div>
                            </a>
                        <?php endwhile; ?>
                    </div>
                </div>
            <?php
                wp_reset_postdata();
            endif;
            ?>
        </article>
    <?php
    endwhile;
    ?>
</div>

<?php get_footer(); ?>
