<?php
/**
 * Archive Template
 * 블로그 포스트 목록을 표시하는 템플릿
 */
get_header();
?>

<div class="container">
    <?php if (have_posts()) : ?>
        <?php
        $post_count = 0;
        $raw_ad_code = stripslashes(get_option('sup_final_ad_code', ''));
        
        while (have_posts()) :
            the_post();
            $post_count++;
            
            // 3번째, 6번째 포스트 앞에 광고 삽입
            if ($raw_ad_code && in_array($post_count, array(3, 6))) :
        ?>
                <div class="apply-container" style="margin: 30px 0;">
                    <?php echo $raw_ad_code; ?>
                </div>
        <?php
            endif;
        ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class('post-content'); ?>>
                <a href="<?php the_permalink(); ?>" style="text-decoration: none; color: inherit;">
                    <?php
                    $content = get_the_content();
                    echo apply_filters('the_content', $content);
                    ?>
                </a>
            </article>
        <?php
        endwhile;
        ?>

    <?php else : ?>
        <div class="post-content" style="text-align: center; padding: 60px 20px;">
            <p>아직 포스트가 없습니다.</p>
        </div>
    <?php endif; ?>
</div>

<?php get_footer(); ?>
