const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying ZK-AgeGate contracts...\n");

    // ===========================
    // 1. Deploy Verifier contract
    // ===========================
    console.log("[1/2] Deploying Groth16 Verifier...");
    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddr = await verifier.getAddress();
    console.log(`  ✅ Verifier deployed: ${verifierAddr}\n`);

    // ===========================
    // 2. Deploy AgeGate contract
    // ===========================
    const MIN_AGE = 18;
    console.log(`[2/2] Deploying AgeGate (minAge=${MIN_AGE})...`);
    const AgeGate = await hre.ethers.getContractFactory("AgeGate");
    const ageGate = await AgeGate.deploy(verifierAddr, MIN_AGE);
    await ageGate.waitForDeployment();
    const ageGateAddr = await ageGate.getAddress();
    console.log(`  ✅ AgeGate deployed: ${ageGateAddr}\n`);

    // ===========================
    // Summary
    // ===========================
    console.log("========================================");
    console.log("  Deployment Complete!");
    console.log("========================================");
    console.log(`  Verifier: ${verifierAddr}`);
    console.log(`  AgeGate:  ${ageGateAddr}`);
    console.log(`  Network:  ${hre.network.name}`);
    console.log("========================================\n");

    console.log("📋 Add these to your .env file:");
    console.log(`VITE_AGEGATE_ADDRESS=${ageGateAddr}`);
    console.log(`VITE_VERIFIER_ADDRESS=${verifierAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
