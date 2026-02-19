# 🛡️ ZK-AgeGate

**Privacy-Preserving Age Verification using Zero-Knowledge Proofs**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Circom](https://img.shields.io/badge/Circom-2.0-orange)](https://docs.circom.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![SnarkJS](https://img.shields.io/badge/SnarkJS-Groth16-blue)](https://github.com/iden3/snarkjs)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

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
