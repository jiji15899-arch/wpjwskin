<?php
/**
 * Footer Template
 */
?>
    </div><footer class="footer">
        <div class="footer-content">
            <div class="footer-left">
                <div class="footer-brand"><?php echo esc_html(get_bloginfo('name')); ?></div>
                <ul class="footer-info">
                    <li>📍 대한민국 서울특별시</li>
                    <li>🏢 정부지원금 알리미 서비스</li>
                </ul>
            </div>
            <div class="footer-right">
                <p>제작자 : 아로스</p>
                <p>홈페이지 : <a href="https://aros100.com" target="_blank">바로가기</a></p>
                <p class="footer-copyright">Copyrights © <?php echo date('Y'); ?> All Rights Reserved.</p>
            </div>
        </div>
    </footer>

    <?php wp_footer(); ?>
</body>
</html>
