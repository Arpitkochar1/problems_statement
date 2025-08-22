const fs = require('fs');

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

function interpolate(points, x) {
    let sumNumerator = 0n;
    let commonDenominator = 1n;

   

    let p_x = 0n;

    for (let j = 0; j < points.length; j++) {
        const yj = points[j].y;
        const { numerator, denominator } = lagrangeBasis(points, j, x);
        

        const termNumerator = yj * numerator;
        if (termNumerator % denominator !== 0n) {
          
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
        
        const pointsToUse = points.slice(0, k);

        const secret = interpolate(pointsToUse, 0n);

        console.log("The calculated secret (C) is:");
        console.log(secret.toString());

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();

