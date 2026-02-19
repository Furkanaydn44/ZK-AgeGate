import * as snarkjs from 'snarkjs';

/**
 * Generate a Groth16 ZK proof for age verification.
 *
 * @param {number} birthYear - User's birth year (PRIVATE — never leaves the browser)
 * @param {number} currentYear - Current calendar year (PUBLIC)
 * @param {number} minAge - Minimum age threshold (PUBLIC)
 * @returns {Promise<{proof: object, publicSignals: string[]}>}
 */
export async function generateProof(birthYear, currentYear, minAge) {
    const input = {
        birthYear: birthYear,
        currentYear: currentYear,
        minAge: minAge,
    };

    // snarkjs.groth16.fullProve loads the WASM circuit and zkey,
    // computes the witness, and generates the proof — all in the browser.
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        '/zkproof/ageCheck.wasm',
        '/zkproof/ageCheck_final.zkey'
    );

    return { proof, publicSignals };
}

/**
 * Format proof for Solidity verifier calldata.
 *
 * @param {object} proof - The Groth16 proof object
 * @param {string[]} publicSignals - Public signals array
 * @returns {Promise<string>} - Solidity calldata string
 */
export async function generateCalldata(proof, publicSignals) {
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    return calldata;
}
