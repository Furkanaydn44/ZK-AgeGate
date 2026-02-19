import React, { useState } from 'react';
import { verifyProof } from '../utils/verifyProof';
import { verifyOnChain } from '../utils/contractInteraction';

export default function ProofResult({ proof, publicSignals, onReset }) {
    const [verifyStatus, setVerifyStatus] = useState('pending'); // pending | success | fail
    const [verifying, setVerifying] = useState(false);
    const [onChainStatus, setOnChainStatus] = useState('idle'); // idle | connecting | sending | success | fail
    const [txHash, setTxHash] = useState('');
    const [onChainError, setOnChainError] = useState('');

    // Public signals: [ageVerified, currentYear, minAge]
    const ageVerified = publicSignals[0] === '1';
    const currentYear = publicSignals[1];
    const minAge = publicSignals[2];

    const handleVerify = async () => {
        setVerifying(true);
        try {
            const isValid = await verifyProof(proof, publicSignals);
            setVerifyStatus(isValid ? 'success' : 'fail');
        } catch (err) {
            console.error('Verification error:', err);
            setVerifyStatus('fail');
        } finally {
            setVerifying(false);
        }
    };

    const handleOnChainVerify = async () => {
        setOnChainStatus('connecting');
        setOnChainError('');
        try {
            setOnChainStatus('sending');
            const result = await verifyOnChain(proof, publicSignals);
            setTxHash(result.txHash);
            setOnChainStatus(result.verified ? 'success' : 'fail');
        } catch (err) {
            console.error('On-chain verification error:', err);
            if (err.message.includes('MetaMask')) {
                setOnChainError(err.message);
            } else if (err.message.includes('VITE_AGEGATE_ADDRESS')) {
                setOnChainError('Kontrat adresi tanımlı değil. Önce deploy edin.');
            } else {
                setOnChainError(`İşlem başarısız: ${err.reason || err.message}`);
            }
            setOnChainStatus('fail');
        }
    };

    return (
        <div className="result">
            {/* Step Indicator */}
            <div className="steps">
                <div className="step">
                    <div className="step__dot step__dot--completed">✓</div>
                </div>
                <div className="step__line step__line--active"></div>
                <div className="step">
                    <div className="step__dot step__dot--completed">✓</div>
                </div>
                <div className="step__line step__line--active"></div>
                <div className="step">
                    <div className="step__dot step__dot--active">3</div>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`result__status result__status--${ageVerified ? 'success' : 'fail'}`}>
                <span className="result__icon">{ageVerified ? '✅' : '❌'}</span>
                <h2 className={`result__title result__title--${ageVerified ? 'success' : 'fail'}`}>
                    {ageVerified ? 'Yaş Doğrulandı!' : 'Doğrulama Başarısız'}
                </h2>
                <p className="result__desc">
                    {ageVerified
                        ? 'Zero-Knowledge kanıtı başarıyla oluşturuldu. Doğum yılınız gizli kaldı.'
                        : 'Minimum yaş gereksinimini karşılamıyorsunuz.'}
                </p>
            </div>

            {/* Public Signals — birth year is NOT here */}
            <div className="proof-section">
                <div className="proof-section__title">
                    📊 Açık Sinyaller (Public Signals)
                </div>
                <div className="proof-signals">
                    <div className="proof-signal">
                        <span className="proof-signal__name">Yaş Doğrulandı</span>
                        <span className="proof-signal__value">{ageVerified ? 'Evet ✓' : 'Hayır ✗'}</span>
                    </div>
                    <div className="proof-signal">
                        <span className="proof-signal__name">Mevcut Yıl</span>
                        <span className="proof-signal__value">{currentYear}</span>
                    </div>
                    <div className="proof-signal">
                        <span className="proof-signal__name">Minimum Yaş</span>
                        <span className="proof-signal__value">{minAge}</span>
                    </div>
                </div>
            </div>

            {/* Proof Data */}
            <div className="proof-section">
                <div className="proof-section__title">
                    🔑 ZK Kanıt Verisi
                </div>
                <div className="proof-data">
                    {JSON.stringify(proof, null, 2)}
                </div>
            </div>

            {/* Off-chain Verification */}
            {verifyStatus === 'pending' && (
                <button
                    id="verify-button"
                    className="btn btn--primary"
                    onClick={handleVerify}
                    disabled={verifying}
                >
                    {verifying ? '⏳ Doğrulanıyor...' : '🔍 Kanıtı Doğrula (Off-chain)'}
                </button>
            )}

            {verifyStatus === 'success' && (
                <div className="verify-badge verify-badge--success">
                    ✅ Off-chain doğrulandı — Matematiksel olarak geçerli
                </div>
            )}

            {verifyStatus === 'fail' && (
                <div className="verify-badge verify-badge--fail">
                    ❌ Off-chain doğrulama başarısız
                </div>
            )}

            {/* On-chain Verification */}
            {ageVerified && (
                <div className="proof-section">
                    <div className="proof-section__title">
                        ⛓️ Blockchain Doğrulama
                    </div>

                    {onChainStatus === 'idle' && (
                        <button
                            id="onchain-verify-button"
                            className="btn btn--onchain"
                            onClick={handleOnChainVerify}
                        >
                            🦊 MetaMask ile On-Chain Doğrula
                        </button>
                    )}

                    {onChainStatus === 'connecting' && (
                        <div className="verify-badge verify-badge--pending">
                            🦊 MetaMask'a bağlanılıyor...
                        </div>
                    )}

                    {onChainStatus === 'sending' && (
                        <div className="verify-badge verify-badge--pending">
                            ⏳ İşlem gönderiliyor...
                        </div>
                    )}

                    {onChainStatus === 'success' && (
                        <div className="onchain-success">
                            <div className="verify-badge verify-badge--success">
                                ✅ On-chain doğrulandı!
                            </div>
                            {txHash && (
                                <a
                                    className="tx-link"
                                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    İşlemi Etherscan'da görüntüle ↗
                                </a>
                            )}
                        </div>
                    )}

                    {onChainStatus === 'fail' && (
                        <div>
                            <div className="verify-badge verify-badge--fail">
                                ❌ {onChainError || 'On-chain doğrulama başarısız'}
                            </div>
                            <button
                                className="btn btn--secondary"
                                onClick={() => { setOnChainStatus('idle'); setOnChainError(''); }}
                                style={{ marginTop: '0.5rem' }}
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button id="reset-button" className="btn btn--secondary" onClick={onReset}>
                ← Yeni Kanıt Oluştur
            </button>

            <div className="privacy-notice">
                <span className="privacy-notice__icon">🔒</span>
                <span>
                    <strong>Dikkat:</strong> Yukarıdaki açık sinyallerde doğum yılınız yer almıyor.
                    Kanıt, yalnızca yaş koşulunun sağlandığını ispatlar — kişisel bilginizi ifşa etmez.
                </span>
            </div>
        </div>
    );
}
