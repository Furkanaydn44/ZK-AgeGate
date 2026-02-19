# 🛡️ ZK-AgeGate

**Zero-Knowledge Proofs ile Gizlilik Odaklı Yaş Doğrulama Sistemi**
**Privacy-Preserving Age Verification using Zero-Knowledge Proofs**

<p align="center">
  <a href="#-türkçe">🇹🇷 Türkçe</a> &nbsp;|&nbsp;
  <a href="#-english">🇬🇧 English</a>
</p>

---

<div id="-türkçe"></div>

# 🇹🇷 Türkçe

## 📖 Genel Bakış

**ZK-AgeGate**, kullanıcıların doğum yıllarını ifşa etmeden belirli bir yaş sınırının üzerinde olduklarını kanıtlamalarını sağlayan bir Web3 uygulamasıdır. **zk-SNARKs (Groth16)** teknolojisi kullanarak üretilen matematiksel kanıt, kullanıcının gerçek yaşını gizli tutarken yaş şartını sağladığını %100 kesinlikle doğrular.

### Nasıl Çalışır?

1.  **Kullanıcı:** Doğum yılını girer (ör: 2000). Bu bilgi tarayıcınızdan asla çıkmaz.
2.  **Devre (Circuit):** `Mevcut Yıl - Doğum Yılı >= Min Yaş` işlemini yapar.
3.  **Kanıt (Proof):** Kullanıcının yaşının tuttuğuna dair bir "Zero-Knowledge Proof" üretilir.
4.  **Doğrulama:** Akıllı kontrat veya karşı taraf, bu kanıtı görerek yaş şartının sağlandığından emin olur ancak doğum yılını asla bilemez.

---

## ✨ Özellikler

- 🔐 **Tam Gizlilik** — Doğum tarihi asla paylaşılmaz.
- 🎯 **Dinamik Yaş Eşikleri** — 18+, 21+, 25+, 65+ seçenekleri.
- 🌐 **Tarayıcıda Kanıt Üretimi** — Tüm işlemler yerelde (WASM ile) yapılır.
- ⛓️ **On-Chain Doğrulama** — Ethereum (Sepolia) üzerinde şeffaf doğrulama.
- 🦊 **MetaMask Entegrasyonu** — Cüzdan ile blockchain etkileşimi.
- 🧪 **Kapsamlı Testler** — Circuit ve Smart Contract testleri.
- 🎨 **Modern Arayüz** — Glassmorphism tasarım ve animasyonlar.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- Circom (v2.0+)
- MetaMask Cüzdanı (Sepolia ETH ile)

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/KULLANICI_ADINIZ/ZK-AgeGate.git
cd ZK-AgeGate
npm install
```

### 2. Güvenilir Kurulum (Trusted Setup)
Bu işlem, ZK devresini derler ve gerekli anahtarları üretir:
```powershell
npm run setup
```

### 3. Uygulamayı Başlatın
```bash
npm run dev
```
Tarayıcıda `http://localhost:5173` adresine gidin.

### 4. (Opsiyonel) Blockchain Deploy
Eğer kendi kontratınızı Sepolia ağına yüklemek isterseniz:
1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. `SEPOLIA_RPC_URL` ve `PRIVATE_KEY` alanlarını doldurun.
3. Deploy edin:
   ```bash
   npm run deploy:sepolia
   ```
4. Oluşan kontrat adresini `.env` dosyasına ekleyin.

---

<div id="-english"></div>

# 🇬🇧 English

## 📖 Overview

**ZK-AgeGate** allows users to **prove they meet a minimum age requirement without revealing their birth year**. It uses **zk-SNARKs (Groth16)** — a cryptographic protocol that generates a mathematical proof verifiable by anyone, yet reveals zero information about the user's actual age.

### How It Works

1.  **User:** Inputs birth year (private input, never leaves browser).
2.  **Circuit:** Computes `Current Year - Birth Year >= Min Age`.
3.  **Proof:** Generates a Zero-Knowledge Proof confirming the condition.
4.  **Verification:** The verifier checks the proof mathematically without learning the birth year.

---

## ✨ Features

- 🔐 **Zero-Knowledge Proof** — Prove age without revealing birth year.
- 🎯 **Dynamic Age Thresholds** — Select 18+, 21+, 25+, or 65+.
- 🌐 **In-Browser Proof Generation** — All ZK computation happens locally via WASM.
- ⛓️ **On-Chain Verification** — Verify proofs on Ethereum (Sepolia).
- 🦊 **MetaMask Integration** — Connect wallet for blockchain verification.
- 🧪 **Full Test Suite** — Circuit tests + Solidity contract tests.
- 🎨 **Premium UI** — Glassmorphism dark theme with animations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Circom (v2.0+)
- MetaMask Wallet (with Sepolia ETH)

### 1. Installation
```bash
git clone https://github.com/YOUR_USERNAME/ZK-AgeGate.git
cd ZK-AgeGate
npm install
```

### 2. Trusted Setup
Compiles the circuit and generates proving keys:
```powershell
npm run setup
```

### 3. Run Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 4. (Optional) Deploy to Testnet
To deploy your own contracts to Sepolia:
1. Copy `.env.example` to `.env`.
2. Fill in `SEPOLIA_RPC_URL` and `PRIVATE_KEY`.
3. Deploy:
   ```bash
   npm run deploy:sepolia
   ```
4. Add the deployed address to your `.env` file.

---

## � Tech Stack / Teknolojiler

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

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ using Circom, SnarkJS, Solidity, and React
</p>
