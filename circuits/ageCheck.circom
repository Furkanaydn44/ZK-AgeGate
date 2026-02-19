pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * AgeCheck Circuit
 * ================
 * Proves that a user is at least `minAge` years old without revealing their birth year.
 *
 * Private Input:  birthYear  (user's birth year — kept secret)
 * Public Inputs:  currentYear, minAge
 * Output:         ageVerified (1 = valid, 0 = invalid)
 *
 * The circuit computes:  age = currentYear - birthYear
 * Then checks:           age >= minAge
 */
template AgeCheck() {
    // --- Signals ---
    signal input birthYear;      // PRIVATE: user's birth year
    signal input currentYear;    // PUBLIC: current calendar year
    signal input minAge;         // PUBLIC: minimum age required

    signal output ageVerified;   // 1 if age >= minAge, 0 otherwise

    // --- Compute age ---
    signal age;
    age <== currentYear - birthYear;

    // --- Range check: age >= minAge ---
    // GreaterEqThan(n) checks if in[0] >= in[1] for n-bit numbers
    // 8 bits supports values 0-255, more than enough for ages
    component geq = GreaterEqThan(8);
    geq.in[0] <== age;
    geq.in[1] <== minAge;

    ageVerified <== geq.out;

    // --- Enforce that verification must pass ---
    // This constraint ensures the proof can ONLY be generated if age >= minAge
    geq.out === 1;
}

component main {public [currentYear, minAge]} = AgeCheck();
