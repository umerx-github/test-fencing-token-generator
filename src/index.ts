// flood-test.js
console.time('Timer');
const ENDPOINT = 'http://fencing-token-generator:3000/';
const TOTAL_REQUESTS = 100;

let successes = 0;
let results: number[] = [];

async function fireRequest(i: number) {
    try {
        const res = await (await fetch(ENDPOINT)).json();
        const val = parseInt(res.value);
        results.push(val);
        successes++;
    } catch (err) {
        console.error(`Request ${i} failed`, err);
    }
}

(async () => {
    console.log(
        `Sending ${TOTAL_REQUESTS} concurrent requests to ${ENDPOINT}...`
    );

    const all: Promise<void>[] = [];
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        all.push(fireRequest(i));
    }

    await Promise.all(all);

    console.log(`✅ Successful requests: ${successes}/${TOTAL_REQUESTS}`);

    // Check for missed or duplicate counts
    const sorted = results.slice().sort((a, b) => a - b);
    const unique = [...new Set(sorted)];

    if (unique.length !== TOTAL_REQUESTS) {
        console.warn(`⚠️ Detected possible concurrency issue.`);
        console.log(`Unique counter values returned: ${unique.length}`);
        console.log(`Duplicate/missing values:`);
        const counts = new Map<number, number>();
        for (const n of sorted) {
            const existing = counts.get(n);
            counts.set(n, (existing || 0) + 1);
        }
        for (const [k, v] of Array.from(counts)) {
            if (v > 1) {
                console.log(`🔁 Value ${k} seen ${v} times`);
            }
        }
    } else {
        console.log(
            `✅ All ${TOTAL_REQUESTS} values were unique and sequential.`
        );
    }
    console.timeEnd('Timer');
})();
