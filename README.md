# 🛡️ ZK-AgeGate

**Privacy-Preserving Age Verification using Zero-Knowledge Proofs**
**Zero-Knowledge Proofs ile Gizlilik Odaklı Yaş Doğrulama**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Circom](https://img.shields.io/badge/Circom-2.0-orange)](https://docs.circom.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![SnarkJS](https://img.shields.io/badge/SnarkJS-Groth16-blue)](https://github.com/iden3/snarkjs)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

<p align="center">
  <a href="#-english">🇬🇧 English</a> &nbsp;|&nbsp;
  <a href="#-türkçe">🇹🇷 Türkçe</a>
</p>

---

<div id="-english"></div>

# 🇬🇧 English

## 📖 Overview

ZK-AgeGate allows users to **prove they meet a minimum age requirement without revealing their birth year**. It uses **zk-SNARKs (Groth16)** — a cryptographic protocol that generates a mathematical proof verifiable by anyone, yet reveals zero information about the user's actual age.

### How It Works

```
User (Prover)                           Verifier
─────────────                           ────────
 birthYear = 2000 (SECRET)
 currentYear = 2026 (PUBLIC)
 minAge = 18 (PUBLIC)
         │
         ▼
 ┌─────────────────────┐
 │  Circom Circuit      │
 │  age = 2026 - 2000   │
 │  assert(26 >= 18) ✓  │
 └────────┬────────────┘
          │
          ▼
 ┌─────────────────────┐
 │  Groth16 ZK Proof    │──────────────► Verify proof ✓
 │  (birthYear hidden)  │               (knows: age ≥ 18)
 └─────────────────────┘               (doesn't know: birthYear)
```

### Key Privacy Guarantee

| Data              | Visible to Verifier? |
| ----------------- | -------------------- |
| Birth Year        | ❌ Never revealed    |
| Exact Age         | ❌ Never revealed    |
| Age ≥ Threshold   | ✅ Proven true       |
| Current Year      | ✅ Public input      |
| Minimum Age       | ✅ Public input      |

---

## ✨ Features

- 🔐 **Zero-Knowledge Proof** — Prove age without revealing birth year
- 🎯 **Dynamic Age Thresholds** — Select 18+, 21+, 25+, or 65+
- 🌐 **In-Browser Proof Generation** — All ZK computation happens locally via WASM
- ⛓️ **On-Chain Verification** — Verify proofs on Ethereum (Sepolia)
- 🦊 **MetaMask Integration** — Connect wallet for blockchain verification
- 🧪 **Full Test Suite** — Circuit tests + Solidity contract tests
- 🎨 **Premium UI** — Glassmorphism dark theme with animations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                                                          │
│  ┌──────────┐   ┌────────────┐   ┌───────────────────┐  │
│  │ AgeForm  │──►│ SnarkJS    │──►│ ProofResult       │  │
│  │          │   │ fullProve()│   │ - Off-chain verify │  │
│  │ birthYear│   │ (in WASM)  │   │ - On-chain verify  │  │
│  │ minAge   │   └────────────┘   └─────────┬─────────┘  │
│  └──────────┘                               │            │
└─────────────────────────────────────────────┼────────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │   Ethereum (Sepolia) │
                                   │                      │
                                   │  Verifier.sol        │
                                   │  AgeGate.sol         │
                                   └──────────────────────┘
```

| Layer      | Technology  | Purpose                            |
| ---------- | ----------- | ---------------------------------- |
| Circuit    | Circom 2.0  | Define age ≥ threshold constraint  |
| Proof      | SnarkJS     | Generate Groth16 proof in browser  |
| Contract   | Solidity    | On-chain proof verification        |
| Frontend   | React + Vite| User interface                     |
| Blockchain | Ethereum    | Immutable verification records     |

---

## 🚀 Getting Started

### Prerequisites

| Tool     | Version | Install                                              |
| -------- | ------- | ---------------------------------------------------- |
| Node.js  | ≥ 18    | [nodejs.org](https://nodejs.org/)                    |
| Circom   | 2.x     | [Circom Install](https://docs.circom.io/getting-started/installation/) |

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ZK-AgeGate.git
cd ZK-AgeGate

# Install dependencies
npm install
```

### Trusted Setup (Required once)

```powershell
# Run the automated setup script
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

This will:
1. ✅ Compile the Circom circuit → WASM + R1CS
2. ✅ Run Powers of Tau ceremony (Groth16)
3. ✅ Generate proving/verification keys
4. ✅ Export Solidity verifier contract
5. ✅ Copy artifacts to `public/zkproof/` for the frontend

### Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

### Circuit Tests

Tests the ZKP circuit with valid and invalid age scenarios:

```bash
npm run test:circuit
```

| Scenario                              | Expected |
| ------------------------------------- | -------- |
| Adult (born 2000, age 26, min 18)     | ✅ Pass  |
| Senior (born 1960, age 66, min 65)    | ✅ Pass  |
| Edge case (born 2008, age 18, min 18) | ✅ Pass  |
| Underage (born 2015, age 11, min 18)  | ❌ Reject|
| Below threshold (born 1970, min 65)   | ❌ Reject|

### Solidity Contract Tests

```bash
npm run compile
npm run test:contracts
```

Tests deployment, signal validation, proof rejection, and state management.

---

## ⛓️ Blockchain Deployment

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
```

### 2. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

### 3. Update Frontend

Add the deployed contract addresses to your `.env`:

```env
VITE_AGEGATE_ADDRESS=0x...deployed_address
```

---

## 📁 Project Structure

```
ZK-AgeGate/
├── circuits/
│   ├── ageCheck.circom         # ZKP circuit (Circom)
│   └── input.json              # Test input
├── contracts/
│   ├── AgeGate.sol             # Wrapper contract
│   └── Verifier.sol            # Auto-generated Groth16 verifier
├── scripts/
│   ├── setup.ps1               # Trusted setup automation
│   └── deploy.cjs              # Hardhat deploy script
├── src/
│   ├── components/
│   │   ├── AgeForm.jsx         # Birth year + threshold selector
│   │   └── ProofResult.jsx     # Proof result + verification
│   ├── utils/
│   │   ├── generateProof.js    # SnarkJS proof generation
│   │   ├── verifyProof.js      # Off-chain verification
│   │   └── contractInteraction.js # MetaMask + on-chain verify
│   ├── App.jsx                 # Main application
│   ├── index.css               # Design system
│   └── main.jsx                # React entry
├── test/
│   ├── circuit.test.mjs        # Circuit test suite
│   └── agegate.test.cjs        # Solidity test suite
├── hardhat.config.cjs          # Hardhat configuration
├── vite.config.js              # Vite configuration
├── package.json
└── README.md
```

---

## 🔧 Tech Stack

| Component          | Technology                |
| ------------------ | ------------------------- |
| ZKP Circuit        | Circom 2.0 + circomlib    |
| Proof System       | Groth16 (via SnarkJS)     |
| Smart Contracts    | Solidity 0.8.24           |
| Contract Framework | Hardhat                   |
| Frontend           | React 18 + Vite           |
| Wallet             | MetaMask (ethers.js v6)   |
| Blockchain         | Ethereum (Sepolia testnet)|

---

## 📜 How ZK-SNARKs Work (Simplified)

1. **Circuit**: Mathematical constraints that define the computation (age ≥ threshold)
2. **Witness**: All intermediate values calculated from inputs (includes secret birth year)
3. **Proof**: A compact cryptographic object proving the witness satisfies the circuit
4. **Verification**: Anyone can verify the proof without knowing the witness

The magic: the proof is **succinct** (~128 bytes) and verification is **fast** (~milliseconds), yet it reveals **zero knowledge** about the private inputs.

---

## ⚠️ Important Notes

> **Development Setup**: The trusted setup uses a simplified ceremony suitable for development. Production applications require a multi-party computation (MPC) ceremony.

> **Circuit Security**: The circuit uses 8-bit comparators (values 0-255), sufficient for age calculations. For production, additional range checks and input validation should be added.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ using Circom, SnarkJS, Solidity, and React
</p>

---
---

<div id="-türkçe"></div>

# 🇹🇷 Türkçe

## 📖 Genel Bakış

ZK-AgeGate, kullanıcıların **doğum yıllarını ifşa etmeden belirli bir yaş sınırını karşıladıklarını kanıtlamalarını** sağlar. Herkes tarafından doğrulanabilir matematiksel kanıtlar üreten, ancak kullanıcının gerçek yaşı hakkında sıfır bilgi açıklayan kriptografik bir protokol olan **zk-SNARKs (Groth16)** teknolojisini kullanır.

### Nasıl Çalışır?

```
Kullanıcı (Kanıtlayan)                  Doğrulayan
──────────────────────                  ──────────
 doğumYılı = 2000 (GİZLİ)
 mevcutYıl = 2026 (AÇIK)
 minYaş = 18 (AÇIK)
         │
         ▼
 ┌─────────────────────┐
 │  Circom Devresi      │
 │  yaş = 2026 - 2000   │
 │  assert(26 >= 18) ✓  │
 └────────┬────────────┘
          │
          ▼
 ┌─────────────────────┐
 │  Groth16 ZK Kanıtı   │──────────────► Kanıtı doğrula ✓
 │  (doğumYılı gizli)   │               (biliyor: yaş ≥ 18)
 └─────────────────────┘               (bilmiyor: doğumYılı)
```

### Temel Gizlilik Garantisi

| Veri               | Doğrulayanda Görünür mü? |
| ------------------ | ------------------------- |
| Doğum Yılı         | ❌ Asla açıklanmaz       |
| Kesin Yaş          | ❌ Asla açıklanmaz       |
| Yaş ≥ Eşik Değeri  | ✅ Kanıtlanmış doğru     |
| Mevcut Yıl         | ✅ Açık girdi            |
| Minimum Yaş        | ✅ Açık girdi            |

---

## ✨ Özellikler

- 🔐 **Zero-Knowledge Kanıt** — Doğum yılını açıklamadan yaşı kanıtla
- 🎯 **Dinamik Yaş Eşikleri** — 18+, 21+, 25+ veya 65+ seç
- 🌐 **Tarayıcıda Kanıt Üretimi** — Tüm ZK hesaplaması WASM ile yerel olarak yapılır
- ⛓️ **On-Chain Doğrulama** — Ethereum (Sepolia) üzerinde kanıtları doğrula
- 🦊 **MetaMask Entegrasyonu** — Blockchain doğrulaması için cüzdan bağla
- 🧪 **Kapsamlı Test Paketi** — Devre testleri + Solidity kontrat testleri
- 🎨 **Premium Arayüz** — Glassmorphism karanlık tema ve animasyonlar

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                                                          │
│  ┌──────────┐   ┌────────────┐   ┌───────────────────┐  │
│  │ AgeForm  │──►│ SnarkJS    │──►│ ProofResult       │  │
│  │          │   │ fullProve()│   │ - Off-chain doğr. │  │
│  │ dogumYılı│   │ (WASM ile) │   │ - On-chain doğr.  │  │
│  │ minYaş   │   └────────────┘   └─────────┬─────────┘  │
│  └──────────┘                               │            │
└─────────────────────────────────────────────┼────────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │   Ethereum (Sepolia) │
                                   │                      │
                                   │  Verifier.sol        │
                                   │  AgeGate.sol         │
                                   └──────────────────────┘
```

| Katman      | Teknoloji    | Amaç                                      |
| ----------- | ------------ | ----------------------------------------- |
| Devre       | Circom 2.0   | Yaş ≥ eşik kısıtlamasını tanımla         |
| Kanıt       | SnarkJS      | Tarayıcıda Groth16 kanıtı üret           |
| Kontrat     | Solidity     | On-chain kanıt doğrulama                  |
| Frontend    | React + Vite | Kullanıcı arayüzü                         |
| Blockchain  | Ethereum     | Değiştirilemez doğrulama kayıtları        |

---

## 🚀 Başlarken

### Gereksinimler

| Araç     | Sürüm | Kurulum                                              |
| -------- | ----- | ---------------------------------------------------- |
| Node.js  | ≥ 18  | [nodejs.org](https://nodejs.org/)                    |
| Circom   | 2.x   | [Circom Kurulum](https://docs.circom.io/getting-started/installation/) |

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/yourusername/ZK-AgeGate.git
cd ZK-AgeGate

# Bağımlılıkları yükle
npm install
```

### Güvenilir Kurulum (Bir kez yapılır)

```powershell
# Otomatik kurulum scriptini çalıştır
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

Bu işlem:
1. ✅ Circom devresini derler → WASM + R1CS
2. ✅ Powers of Tau törenini çalıştırır (Groth16)
3. ✅ İspat/doğrulama anahtarlarını üretir
4. ✅ Solidity doğrulayıcı kontratını dışa aktarır
5. ✅ Yapıtları frontend için `public/zkproof/` klasörüne kopyalar

### Uygulamayı Çalıştır

```bash
npm run dev
```

Tarayıcında [http://localhost:5173](http://localhost:5173) adresini aç.

---

## 🧪 Testler

### Devre Testleri

ZKP devresini geçerli ve geçersiz yaş senaryolarıyla test eder:

```bash
npm run test:circuit
```

| Senaryo                                    | Beklenen  |
| ------------------------------------------ | --------- |
| Yetişkin (d.1960 2000, yaş 26, min 18)     | ✅ Geçer  |
| Yaşlı (d.1960, yaş 66, min 65)             | ✅ Geçer  |
| Sınır durumu (d.2008, yaş 18, min 18)      | ✅ Geçer  |
| Reşit değil (d.2015, yaş 11, min 18)       | ❌ Reddedilir |
| Eşiğin altında (d.1970, min 65)            | ❌ Reddedilir |

### Solidity Kontrat Testleri

```bash
npm run compile
npm run test:contracts
```

Deploy, sinyal doğrulama, kanıt reddi ve durum yönetimini test eder.

---

## ⛓️ Blockchain Deployment

### 1. Ortam Değişkenlerini Yapılandır

```bash
cp .env.example .env
```

`.env` dosyasını kimlik bilgilerinizle düzenle:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/API_ANAHTARINIZ
PRIVATE_KEY=cüzdan_private_key
```

### 2. Sepolia'ya Deploy Et

```bash
npm run deploy:sepolia
```

### 3. Frontend'i Güncelle

Deploy edilen kontrat adreslerini `.env` dosyasına ekle:

```env
VITE_AGEGATE_ADDRESS=0x...deploy_adresi
```

---

## 📁 Proje Yapısı

```
ZK-AgeGate/
├── circuits/
│   ├── ageCheck.circom         # ZKP devresi (Circom)
│   └── input.json              # Test girdisi
├── contracts/
│   ├── AgeGate.sol             # Sarmalayıcı kontrat
│   └── Verifier.sol            # Otomatik oluşturulan Groth16 doğrulayıcı
├── scripts/
│   ├── setup.ps1               # Güvenilir kurulum otomasyonu
│   └── deploy.cjs              # Hardhat deploy scripti
├── src/
│   ├── components/
│   │   ├── AgeForm.jsx         # Doğum yılı + eşik seçici
│   │   └── ProofResult.jsx     # Kanıt sonucu + doğrulama
│   ├── utils/
│   │   ├── generateProof.js    # SnarkJS kanıt üretimi
│   │   ├── verifyProof.js      # Off-chain doğrulama
│   │   └── contractInteraction.js # MetaMask + on-chain doğrulama
│   ├── App.jsx                 # Ana uygulama
│   ├── index.css               # Tasarım sistemi
│   └── main.jsx                # React giriş noktası
├── test/
│   ├── circuit.test.mjs        # Devre test paketi
│   └── agegate.test.cjs        # Solidity test paketi
├── hardhat.config.cjs          # Hardhat yapılandırması
├── vite.config.js              # Vite yapılandırması
├── package.json
└── README.md
```

---

## 🔧 Teknoloji Yığını

| Bileşen             | Teknoloji                 |
| ------------------- | ------------------------- |
| ZKP Devresi         | Circom 2.0 + circomlib    |
| Kanıt Sistemi       | Groth16 (SnarkJS ile)     |
| Akıllı Kontratlar   | Solidity 0.8.24           |
| Kontrat Framework   | Hardhat                   |
| Frontend            | React 18 + Vite           |
| Cüzdan              | MetaMask (ethers.js v6)   |
| Blockchain          | Ethereum (Sepolia testnet)|

---

## 📜 ZK-SNARK'lar Nasıl Çalışır? (Basitleştirilmiş)

1. **Devre (Circuit)**: Hesaplamayı tanımlayan matematiksel kısıtlamalar (yaş ≥ eşik)
2. **Tanık (Witness)**: Girdilerden hesaplanan tüm ara değerler (gizli doğum yılı dahil)
3. **Kanıt (Proof)**: Tanığın devreyi karşıladığını ispatlayan kompakt kriptografik nesne
4. **Doğrulama (Verification)**: Herkes, tanığı bilmeden kanıtı doğrulayabilir

Sihir şu: kanıt **kısa** (~128 byte) ve doğrulama **hızlı** (~milisaniyeler), ancak özel girdiler hakkında **sıfır bilgi** açıklar.

---

## ⚠️ Önemli Notlar

> **Geliştirme Kurulumu**: Güvenilir kurulum, geliştirme için uygun basitleştirilmiş bir tören kullanır. Üretim uygulamaları çok taraflı hesaplama (MPC) töreni gerektirir.

> **Devre Güvenliği**: Devre, yaş hesaplamaları için yeterli olan 8-bit karşılaştırıcılar (0-255 arası değerler) kullanır. Üretim için ek aralık kontrolleri ve girdi doğrulamaları eklenmelidir.

---

## 📄 Lisans

MIT Lisansı — ayrıntılar için [LICENSE](./LICENSE) dosyasına bakın.

---

<p align="center">
  Circom, SnarkJS, Solidity ve React ile ❤️ ile yapıldı
</p>
