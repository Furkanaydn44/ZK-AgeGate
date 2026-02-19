/**
 * ZK-AgeGate Solidity Contract Test Suite
 * ========================================
 * Tests for AgeGate.sol contract deployment and verification logic.
 * 
 * Prerequisites: 
 *   - Verifier.sol must exist (run trusted setup first)
 *   - npm run compile
 * 
 * Run: npm run test:contracts
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgeGate Contract", function () {
    let verifier;
    let ageGate;
    let owner;
    let user1;
    let user2;
    const MIN_AGE = 18;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy Verifier
        // Note: The contract name depends on what snarkjs generates.
        // It could be "Groth16Verifier" or "Verifier"
        let Verifier;
        try {
            Verifier = await ethers.getContractFactory("Groth16Verifier");
        } catch {
            try {
                Verifier = await ethers.getContractFactory("Verifier");
            } catch {
                console.log("⚠  Verifier contract not found. Run trusted setup first.");
                this.skip();
                return;
            }
        }
        verifier = await Verifier.deploy();
        await verifier.waitForDeployment();

        // Deploy AgeGate
        const AgeGate = await ethers.getContractFactory("AgeGate");
        ageGate = await AgeGate.deploy(await verifier.getAddress(), MIN_AGE);
        await ageGate.waitForDeployment();
    });

    describe("Deployment", function () {
        it("should set the correct verifier address", async function () {
            expect(await ageGate.verifier()).to.equal(await verifier.getAddress());
        });

        it("should set the correct minAge", async function () {
            expect(await ageGate.minAge()).to.equal(MIN_AGE);
        });

        it("should start with no verified users", async function () {
            expect(await ageGate.isVerified(user1.address)).to.equal(false);
            expect(await ageGate.checkVerification(user1.address)).to.equal(false);
        });
    });

    describe("verifyAge", function () {
        it("should revert with invalid ageVerified signal (signal[0] != 1)", async function () {
            // Fake proof data — will fail at signal check before reaching verifier
            const pA = [0, 0];
            const pB = [[0, 0], [0, 0]];
            const pC = [0, 0];
            const pubSignals = [0, 2026, MIN_AGE]; // ageVerified = 0

            await expect(
                ageGate.connect(user1).verifyAge(pA, pB, pC, pubSignals)
            ).to.be.revertedWith("AgeGate: age check did not pass");
        });

        it("should revert with mismatched minAge", async function () {
            const pA = [0, 0];
            const pB = [[0, 0], [0, 0]];
            const pC = [0, 0];
            const pubSignals = [1, 2026, 21]; // minAge = 21, but contract expects 18

            await expect(
                ageGate.connect(user1).verifyAge(pA, pB, pC, pubSignals)
            ).to.be.revertedWith("AgeGate: minAge mismatch");
        });

        it("should revert with invalid proof (correct signals but fake proof)", async function () {
            const pA = [1, 1];
            const pB = [[1, 1], [1, 1]];
            const pC = [1, 1];
            const pubSignals = [1, 2026, MIN_AGE]; // correct signals

            // This will pass signal checks but fail at the verifier
            await expect(
                ageGate.connect(user1).verifyAge(pA, pB, pC, pubSignals)
            ).to.be.reverted; // The verifier will reject the fake proof
        });
    });

    describe("checkVerification", function () {
        it("should return false for unverified address", async function () {
            expect(await ageGate.checkVerification(user2.address)).to.equal(false);
        });

        it("should return false for zero address", async function () {
            expect(await ageGate.checkVerification(ethers.ZeroAddress)).to.equal(false);
        });
    });

    describe("State Variables", function () {
        it("verifiedAt should be 0 for unverified user", async function () {
            expect(await ageGate.verifiedAt(user1.address)).to.equal(0);
        });

        it("minAge should be immutable", async function () {
            expect(await ageGate.minAge()).to.equal(MIN_AGE);
        });
    });
});
