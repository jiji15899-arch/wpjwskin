<?php
/**
 * Header Template
 * 관리자 페이지의 탭 설정과 연동된 버전입니다.
 */
// functions.php에서 정의한 설정값을 가져옵니다. (없을 경우 기본값 반환)
$config = get_option('sup_site_config', [
    'site_title' => get_bloginfo('name'),
    'default_link' => home_url()
]);
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<div class="main-wrapper">
    <header id="header">
        <div class="header">
            <div class="container">
                <div class="logo">
                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhwxd_YGfZiM_d9LPozylA_vt2w36-eanzKSgvMQm2zkh-s41pKzT2FDyyqB9cz713Tm3nRFVbtRR8GGXlEQh7UDr4BDteEwfQ_JDV0Yl_xYA5uBGWrqyhDLH_PNEa9cJmNLOhhFc7XKAJChRiR9_6KZbraUo8FpA2IGMxbgMNGAtnoi-WlBnWYpnm0FKw/w945-h600-p-k-no-nu/img.png" alt="로고">
                </div>
                <h1 class="logo-text"><?php echo esc_html($config['site_title']); ?></h1>
            </div>
        </div>
    </header>

    <div class="tab-wrapper">
        <div class="container">
            <nav class="tab-container">
                <ul class="tabs">
                    <?php
                    // functions.php에서 저장한 탭 데이터를 가져옵니다.
                    $tabs = get_option('sup_final_tabs_data', []);
                    $has_active_tab = false;

                    if (!empty($tabs) && is_array($tabs)) {
                        foreach ($tabs as $index => $tab) {
                            // 1. 탭 이름이 있고 2. 활성화(is_active) 상태가 1인 경우에만 출력
                            $name = isset($tab['name']) ? $tab['name'] : '';
                            $link = isset($tab['link']) ? $tab['link'] : '#';
                            $is_active = (!isset($tab['is_active']) || $tab['is_active'] == 1);

                            if (!empty($name) && $is_active) {
                                $has_active_tab = true;
                                // 첫 번째 활성 탭에 active 클래스 부여
                                $active_class = ($index === 0) ? ' active' : '';
                                ?>
                                <li class="tab-item">
                                    <a class="tab-link<?php echo $active_class; ?>" href="<?php echo esc_url($link); ?>">
                                        <?php echo esc_html($name); ?>
                                    </a>
                                </li>
                                <?php
                            }
                        }
                    }

                    // 활성화된 탭이 하나도 없으면 '홈' 메뉴를 기본으로 보여줍니다.
                    if (!$has_active_tab) {
                        echo '<li class="tab-item"><a class="tab-link active" href="' . esc_url(home_url()) . '">홈</a></li>';
                    }
                    ?>
                </ul>
            </nav>
        </div>
    </div>
