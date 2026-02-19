# ZK-AgeGate Trusted Setup Script (PowerShell)
# =============================================
# This script automates the full Groth16 trusted setup process.
# Prerequisites: circom, snarkjs (npm install -g snarkjs), Node.js

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ZK-AgeGate Trusted Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectRoot

# Create build directory
if (!(Test-Path "build")) { New-Item -ItemType Directory -Path "build" | Out-Null }

# ============================================
# Step 1: Compile the circuit
# ============================================
Write-Host "[1/6] Compiling circuit..." -ForegroundColor Yellow
circom circuits/ageCheck.circom --r1cs --wasm --sym -o build
Write-Host "  -> Circuit compiled successfully!" -ForegroundColor Green

# ============================================
# Step 2: Powers of Tau ceremony (Phase 1)
# ============================================
Write-Host "[2/6] Starting Powers of Tau ceremony..." -ForegroundColor Yellow
npx snarkjs powersoftau new bn128 12 build/pot12_0000.ptau -v
npx snarkjs powersoftau contribute build/pot12_0000.ptau build/pot12_0001.ptau --name="ZK-AgeGate Dev Contribution" -v -e="random entropy for dev setup"
npx snarkjs powersoftau prepare phase2 build/pot12_0001.ptau build/pot12_final.ptau -v
Write-Host "  -> Powers of Tau complete!" -ForegroundColor Green

# ============================================
# Step 3: Circuit-specific setup (Phase 2)
# ============================================
Write-Host "[3/6] Groth16 circuit-specific setup..." -ForegroundColor Yellow
npx snarkjs groth16 setup build/ageCheck.r1cs build/pot12_final.ptau build/ageCheck_0000.zkey
npx snarkjs zkey contribute build/ageCheck_0000.zkey build/ageCheck_final.zkey --name="ZK-AgeGate Dev" -v -e="more random entropy"
Write-Host "  -> Groth16 setup complete!" -ForegroundColor Green

# ============================================
# Step 4: Export verification key
# ============================================
Write-Host "[4/6] Exporting verification key..." -ForegroundColor Yellow
npx snarkjs zkey export verificationkey build/ageCheck_final.zkey build/verification_key.json
Write-Host "  -> Verification key exported!" -ForegroundColor Green

# ============================================
# Step 5: Export Solidity verifier
# ============================================
Write-Host "[5/6] Generating Solidity verifier..." -ForegroundColor Yellow
if (!(Test-Path "contracts")) { New-Item -ItemType Directory -Path "contracts" | Out-Null }
npx snarkjs zkey export solidityverifier build/ageCheck_final.zkey contracts/Verifier.sol
Write-Host "  -> Solidity verifier generated!" -ForegroundColor Green

# ============================================
# Step 6: Copy artifacts for frontend
# ============================================
Write-Host "[6/6] Copying artifacts to public/zkproof..." -ForegroundColor Yellow
$zkDir = "public/zkproof"
if (!(Test-Path $zkDir)) { New-Item -ItemType Directory -Path $zkDir -Force | Out-Null }

Copy-Item "build/ageCheck_js/ageCheck.wasm" "$zkDir/ageCheck.wasm" -Force
Copy-Item "build/ageCheck_final.zkey" "$zkDir/ageCheck_final.zkey" -Force
Copy-Item "build/verification_key.json" "$zkDir/verification_key.json" -Force
Write-Host "  -> Frontend artifacts ready!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "  Run 'npm run dev' to start the app" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
