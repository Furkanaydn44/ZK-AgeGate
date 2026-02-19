import * as snarkjs from 'snarkjs';

/**
 * Verify a Groth16 ZK proof locally (off-chain).
 *
 * @param {object} proof - The Groth16 proof object
 * @param {string[]} publicSignals - Public signals array
 * @returns {Promise<boolean>} - true if proof is valid
 */
export async function verifyProof(proof, publicSignals) {
    // Load verification key from public directory
    const vkeyResponse = await fetch('/zkproof/verification_key.json');
    const vkey = await vkeyResponse.json();

    const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    return isValid;
}
