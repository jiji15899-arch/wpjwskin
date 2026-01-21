<?php
/**
 * Header Template
 * 관리자 페이지의 탭 설정과 연동된 버전입니다.
 */
// functions.php에서 정의한 설정값을 가져옵니다.
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
                    
                    // 탭 데이터가 있고 배열인 경우
                    if (!empty($tabs) && is_array($tabs)) {
                        foreach ($tabs as $index => $tab) {
                            // 데이터 가져오기
                            $name = isset($tab['name']) ? trim($tab['name']) : '';
                            $link = isset($tab['link']) ? $tab['link'] : '#';
                            
                            // 관리자 페이지에서 체크박스를 켰는지 확인 (켜면 1, 아니면 0)
                            // 이 값이 true면 해당 탭을 'active' 상태(강조)로 만듭니다.
                            $is_highlighted = (isset($tab['is_active']) && $tab['is_active'] == 1);

                            // 조건: 탭 이름이 있는 경우에만 화면에 표시
                            if (!empty($name)) {
                                // 체크되어 있다면 active 클래스 추가
                                $active_class = $is_highlighted ? ' active' : '';
                                ?>
                                <li class="tab-item">
                                    <a class="tab-link<?php echo $active_class; ?>" href="<?php echo esc_url($link); ?>">
                                        <?php echo esc_html($name); ?>
                                    </a>
                                </li>
                                <?php
                            }
                        }
                    } else {
                        // 탭 데이터가 아예 없을 때 기본 홈 버튼 표시 (선택사항)
                        echo '<li class="tab-item"><a class="tab-link active" href="' . esc_url(home_url()) . '">홈</a></li>';
                    }
                    ?>
                </ul>
            </nav>
        </div>
    </div>
