const fs = require('fs');

// Function to convert a number from any base to a BigInt in base 10
function convertToBase10(value, base) {
    const digits = '0123456789abcdef';
    let result = 0n;
    const bigBase = BigInt(base);
    for (let i = 0; i < value.length; i++) {
        const digit = digits.indexOf(value[i].toLowerCase());
        if (digit === -1) {
            throw new Error(`Invalid character in value: ${value[i]}`);
        }
        result = result * bigBase + BigInt(digit);
    }
    return result;
}

// Function to calculate Lagrange basis polynomial L_j(x)
function lagrangeBasis(points, j, x) {
    let numerator = 1n;
    let denominator = 1n;
    const xj = points[j].x;

    for (let i = 0; i < points.length; i++) {
        if (i === j) continue;
        const xi = points[i].x;
        numerator *= (x - xi);
        denominator *= (xj - xi);
    }
    return { numerator, denominator };
}

// Function to interpolate the polynomial at a given x
function interpolate(points, x) {
    let sumNumerator = 0n;
    let commonDenominator = 1n;

    // To avoid floating point issues with large numbers, we find a common denominator
    // for the sum of fractions. However, a simpler approach for P(0) is to calculate
    // each term (y_j * L_j(0)) and sum them up. The division should be exact.

    let p_x = 0n;

    for (let j = 0; j < points.length; j++) {
        const yj = points[j].y;
        const { numerator, denominator } = lagrangeBasis(points, j, x);
        
        // The term is yj * (numerator / denominator)
        // Since we are dealing with BigInt, we must ensure division is exact.
        const termNumerator = yj * numerator;
        if (termNumerator % denominator !== 0n) {
             // This should not happen in Shamir's Secret Sharing if points are correct
             // But for general Lagrange interpolation, we might need to work with fractions
             // or a common denominator. Let's assume exact division for now.
             console.warn("Warning: Non-integer division encountered. Result might be imprecise.");
        }
        p_x += termNumerator / denominator;
    }

    return p_x;
}


function main() {
    try {
        const rawData = fs.readFileSync('input.json');
        const data = JSON.parse(rawData);

        const n = data.keys.n;
        const k = data.keys.k;

        const points = [];
        for (const key in data) {
            if (key !== 'keys') {
                const x = BigInt(key);
                const { base, value } = data[key];
                const y = convertToBase10(value, parseInt(base, 10));
                points.push({ x, y });
            }
        }
        
        // We only need k points to determine the polynomial of degree k-1
        const pointsToUse = points.slice(0, k);

        // The secret is the constant term of the polynomial, which is P(0)
        const secret = interpolate(pointsToUse, 0n);

        console.log("The calculated secret (C) is:");
        console.log(secret.toString());

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
