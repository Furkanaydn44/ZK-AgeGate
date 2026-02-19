import React, { useState } from 'react';
import AgeForm from './components/AgeForm';
import ProofResult from './components/ProofResult';
import { generateProof } from './utils/generateProof';

export default function App() {
    const [state, setState] = useState('form'); // form | loading | result | error
    const [proof, setProof] = useState(null);
    const [publicSignals, setPublicSignals] = useState(null);
    const [error, setError] = useState('');
    const [loadingStep, setLoadingStep] = useState('');

    const handleProve = async (birthYear, currentYear, minAge) => {
        setState('loading');
        setLoadingStep('Devre yükleniyor...');

        try {
            setLoadingStep('Witness hesaplanıyor...');
            await new Promise((r) => setTimeout(r, 300)); // brief pause for UI update

            setLoadingStep('Groth16 kanıtı oluşturuluyor...');
            const { proof, publicSignals } = await generateProof(birthYear, currentYear, minAge);

            setProof(proof);
            setPublicSignals(publicSignals);
            setState('result');
        } catch (err) {
            console.error('Proof generation failed:', err);

            // If the circuit constraint fails (age < minAge), snarkjs throws
            if (err.message && err.message.includes('Assert Failed')) {
                setError('Yaş doğrulaması başarısız — minimum yaş gereksinimini karşılamıyorsunuz.');
            } else {
                setError(`Kanıt oluşturma hatası: ${err.message}`);
            }
            setState('error');
        }
    };

    const handleReset = () => {
        setState('form');
        setProof(null);
        setPublicSignals(null);
        setError('');
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <span className="header__icon">🛡️</span>
                <h1 className="header__title">ZK-AgeGate</h1>
                <p className="header__subtitle">
                    Zero-Knowledge Proof ile gizliliği koruyarak yaşınızı doğrulayın
                </p>
            </header>

            {/* Main Card */}
            <main className="card">
                {state === 'form' && <AgeForm onProve={handleProve} />}

                {state === 'loading' && (
                    <div className="spinner-container">
                        {/* Step Indicator */}
                        <div className="steps">
                            <div className="step">
                                <div className="step__dot step__dot--completed">✓</div>
                            </div>
                            <div className="step__line step__line--active"></div>
                            <div className="step">
                                <div className="step__dot step__dot--active">2</div>
                            </div>
                            <div className="step__line"></div>
                            <div className="step">
                                <div className="step__dot step__dot--pending">3</div>
                            </div>
                        </div>

                        <div className="spinner"></div>
                        <div className="spinner-text">{loadingStep}</div>
                        <div className="spinner-text__detail">
                            ZK-SNARK kanıtı tarayıcınızda üretiliyor. Bu işlem birkaç saniye sürebilir.
                        </div>
                    </div>
                )}

                {state === 'result' && (
                    <ProofResult
                        proof={proof}
                        publicSignals={publicSignals}
                        onReset={handleReset}
                    />
                )}

                {state === 'error' && (
                    <div className="result">
                        <div className="result__status result__status--fail">
                            <span className="result__icon">⚠️</span>
                            <h2 className="result__title result__title--fail">Hata</h2>
                            <p className="result__desc">{error}</p>
                        </div>
                        <button className="btn btn--secondary" onClick={handleReset}>
                            ← Tekrar Dene
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="footer">
                <p className="footer__text">
                    Powered by <a className="footer__link" href="https://iden3.io/circom" target="_blank" rel="noopener">Circom</a>
                    {' '}&{' '}
                    <a className="footer__link" href="https://github.com/iden3/snarkjs" target="_blank" rel="noopener">SnarkJS</a>
                    {' '}— Groth16 zk-SNARK
                </p>
            </footer>
        </div>
    );
}
