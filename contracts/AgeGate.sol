// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IAgeVerifier
 * @dev Interface for the auto-generated Groth16 verifier
 */
interface IAgeVerifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool);
}

/**
 * @title AgeGate
 * @dev Privacy-preserving age verification using ZK-SNARKs (Groth16).
 *      Users submit a zero-knowledge proof that they meet the minimum age
 *      requirement WITHOUT revealing their actual birth year.
 *
 * Public Signals Layout:
 *   [0] = ageVerified (1 = passed, 0 = failed)
 *   [1] = currentYear
 *   [2] = minAge
 */
contract AgeGate {
    IAgeVerifier public immutable verifier;
    uint256 public immutable minAge;

    // Mapping from user address to verification status
    mapping(address => bool) public isVerified;
    mapping(address => uint256) public verifiedAt;

    // Events
    event AgeVerified(address indexed user, uint256 timestamp);
    event VerificationRevoked(address indexed user, uint256 timestamp);

    constructor(address _verifierAddress, uint256 _minAge) {
        verifier = IAgeVerifier(_verifierAddress);
        minAge = _minAge;
    }

    /**
     * @dev Verify a user's age using a ZK proof.
     * @param _pA Proof element A
     * @param _pB Proof element B
     * @param _pC Proof element C
     * @param _pubSignals Public signals [ageVerified, currentYear, minAge]
     */
    function verifyAge(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external {
        // Ensure the public minAge signal matches the contract's minAge
        require(_pubSignals[2] == minAge, "AgeGate: minAge mismatch");

        // Ensure the ageVerified signal is 1 (passed)
        require(_pubSignals[0] == 1, "AgeGate: age check did not pass");

        // Verify the ZK proof on-chain
        bool proofValid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        require(proofValid, "AgeGate: invalid proof");

        // Record verification
        isVerified[msg.sender] = true;
        verifiedAt[msg.sender] = block.timestamp;

        emit AgeVerified(msg.sender, block.timestamp);
    }

    /**
     * @dev Check if a user is verified.
     */
    function checkVerification(address _user) external view returns (bool) {
        return isVerified[_user];
    }
}
