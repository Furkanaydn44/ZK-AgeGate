import React, { useState } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

const AGE_THRESHOLDS = [
    { value: 18, label: '18+', desc: 'Yetişkin' },
    { value: 21, label: '21+', desc: 'ABD Alkol' },
    { value: 25, label: '25+', desc: 'Araç Kiralama' },
    { value: 65, label: '65+', desc: 'Emekli' },
];

export default function AgeForm({ onProve }) {
    const [birthYear, setBirthYear] = useState('');
    const [selectedAge, setSelectedAge] = useState(18);

    const handleSubmit = (e) => {
        e.preventDefault();
        const year = parseInt(birthYear, 10);
        if (!year || year < 1900 || year > CURRENT_YEAR) return;
        onProve(year, CURRENT_YEAR, selectedAge);
    };

    const isValid = (() => {
        const y = parseInt(birthYear, 10);
        return y && y >= 1900 && y <= CURRENT_YEAR;
    })();

    return (
        <>
            {/* Step Indicator */}
            <div className="steps">
                <div className="step">
                    <div className="step__dot step__dot--active">1</div>
                </div>
                <div className="step__line"></div>
                <div className="step">
                    <div className="step__dot step__dot--pending">2</div>
                </div>
                <div className="step__line"></div>
                <div className="step">
                    <div className="step__dot step__dot--pending">3</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Age Threshold Selector */}
                <div className="form__group">
                    <label className="form__label">Yaş Eşiği</label>
                    <div className="threshold-selector">
                        {AGE_THRESHOLDS.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                className={`threshold-pill${selectedAge === t.value ? ' threshold-pill--active' : ''}`}
                                onClick={() => setSelectedAge(t.value)}
                            >
                                <span className="threshold-pill__value">{t.label}</span>
                                <span className="threshold-pill__desc">{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Birth Year Input */}
                <div className="form__group">
                    <label className="form__label" htmlFor="birth-year-input">
                        Doğum Yılınız
                    </label>
                    <input
                        id="birth-year-input"
                        className="form__input"
                        type="number"
                        placeholder="örn. 2000"
                        min="1900"
                        max={CURRENT_YEAR}
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        autoFocus
                    />
                    <div className="form__hint">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 6.5a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                        </svg>
                        Bu bilgi cihazınızdan asla çıkmaz — ZK kanıtı tarayıcıda üretilir
                    </div>
                </div>

                {/* Info Badges */}
                <div className="info-row">
                    <div className="info-badge">
                        <span className="info-badge__label">Yıl</span>
                        <span className="info-badge__value">{CURRENT_YEAR}</span>
                    </div>
                    <div className="info-badge">
                        <span className="info-badge__label">Min Yaş</span>
                        <span className="info-badge__value">{selectedAge}+</span>
                    </div>
                    <div className="info-badge">
                        <span className="info-badge__label">Protokol</span>
                        <span className="info-badge__value">Groth16</span>
                    </div>
                </div>

                <button
                    id="prove-button"
                    type="submit"
                    className="btn btn--primary"
                    disabled={!isValid}
                >
                    🔐 Yaşımı Kanıtla ({selectedAge}+)
                </button>
            </form>

            <div className="privacy-notice">
                <span className="privacy-notice__icon">🛡️</span>
                <span>
                    <strong>Gizlilik Garantisi:</strong> Doğum yılınız hiçbir zaman paylaşılmaz.
                    Yalnızca "{selectedAge} yaşından büyüksünüz" bilgisi matematiksel olarak kanıtlanır.
                    Zero-Knowledge Proof teknolojisi sayesinde doğrulamacı, yaşınızı bilmeden
                    bu kanıtı doğrulayabilir.
                </span>
            </div>
        </>
    );
}
