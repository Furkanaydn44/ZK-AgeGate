/**
 * ZK-AgeGate Circuit Test Suite
 * ==============================
 * Tests the ageCheck circuit with various valid and invalid scenarios.
 * 
 * Prerequisites: Run trusted setup first (npm run setup) to get WASM + zkey files.
 * Run: node test/circuit.test.mjs
 */

import * as snarkjs from 'snarkjs';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Paths to compiled circuit artifacts
const WASM_PATH = resolve(projectRoot, 'build/ageCheck_js/ageCheck.wasm');
const ZKEY_PATH = resolve(projectRoot, 'build/ageCheck_final.zkey');
const VKEY_PATH = resolve(projectRoot, 'build/verification_key.json');

// Test state
let passed = 0;
let failed = 0;
let skipped = 0;

// Colors for terminal output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(color, symbol, msg) {
    console.log(`  ${color}${symbol}${RESET} ${msg}`);
}

/**
 * Test helper: attempt to generate and verify a proof.
 * Returns { success, proof, publicSignals, error }
 */
async function tryProve(input) {
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input, WASM_PATH, ZKEY_PATH
        );

        const vkey = JSON.parse(readFileSync(VKEY_PATH, 'utf8'));
        const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

        return { success: true, proof, publicSignals, verified: isValid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Test that proof generation succeeds for valid inputs
 */
async function testValidProof(name, input, expectedSignals) {
    const result = await tryProve(input);
    if (result.success && result.verified) {
        // Optionally check public signals
        if (expectedSignals) {
            const [ageVerified, currentYear, minAge] = result.publicSignals;
            if (ageVerified !== '1') {
                log(RED, '✗', `${name} — ageVerified should be 1, got ${ageVerified}`);
                failed++;
                return;
            }
        }
        log(GREEN, '✓', name);
        passed++;
    } else {
        log(RED, '✗', `${name} — ${result.error || 'verification failed'}`);
        failed++;
    }
}

/**
 * Test that proof generation fails for invalid inputs (circuit assertion failure)
 */
async function testInvalidProof(name, input) {
    const result = await tryProve(input);
    if (!result.success) {
        log(GREEN, '✓', `${name} (correctly rejected)`);
        passed++;
    } else {
        log(RED, '✗', `${name} — should have failed but proof was generated!`);
        failed++;
    }
}

// ==============================
// Main Test Runner
// ==============================
async function main() {
    console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║   ZK-AgeGate Circuit Test Suite      ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}\n`);

    // Check prerequisites
    if (!existsSync(WASM_PATH) || !existsSync(ZKEY_PATH) || !existsSync(VKEY_PATH)) {
        console.log(`${YELLOW}⚠ Circuit artifacts not found. Run trusted setup first:${RESET}`);
        console.log(`  ${CYAN}npm run setup${RESET}\n`);
        console.log(`  Expected files:`);
        console.log(`    - ${WASM_PATH}`);
        console.log(`    - ${ZKEY_PATH}`);
        console.log(`    - ${VKEY_PATH}\n`);
        skipped = 5;
        printSummary();
        return;
    }

    console.log(`${BOLD}Valid Proof Tests:${RESET}`);

    // Test 1: Standard adult (age 26, minAge 18)
    await testValidProof(
        'Adult (born 2000, age 26, minAge 18)',
        { birthYear: '2000', currentYear: '2026', minAge: '18' },
        true
    );

    // Test 2: Senior citizen (age 66, minAge 65)
    await testValidProof(
        'Senior (born 1960, age 66, minAge 65)',
        { birthYear: '1960', currentYear: '2026', minAge: '65' },
        true
    );

    // Test 3: Exact threshold (age 18, minAge 18 — edge case)
    await testValidProof(
        'Edge case: exactly at threshold (born 2008, age 18, minAge 18)',
        { birthYear: '2008', currentYear: '2026', minAge: '18' },
        true
    );

    console.log(`\n${BOLD}Invalid Proof Tests (should fail):${RESET}`);

    // Test 4: Underage (age 11, minAge 18)
    await testInvalidProof(
        'Underage (born 2015, age 11, minAge 18)',
        { birthYear: '2015', currentYear: '2026', minAge: '18' }
    );

    // Test 5: Below senior threshold (age 56, minAge 65)
    await testInvalidProof(
        'Below senior threshold (born 1970, age 56, minAge 65)',
        { birthYear: '1970', currentYear: '2026', minAge: '65' }
    );

    printSummary();
}

function printSummary() {
    console.log(`\n${BOLD}─────────────────────────────────────────${RESET}`);
    const total = passed + failed + skipped;
    console.log(`  Total: ${total}  |  ${GREEN}Passed: ${passed}${RESET}  |  ${RED}Failed: ${failed}${RESET}  |  ${YELLOW}Skipped: ${skipped}${RESET}`);
    console.log(`${BOLD}─────────────────────────────────────────${RESET}\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(`\n${RED}Fatal error:${RESET}`, err);
    process.exit(1);
});
