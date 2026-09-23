const BASE_URL = "http://localhost:5001/api";

// Paste your actual JWT token here
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYjM4M2RjMDFjNTJkZWVmMmQwZmZjMSIsImVtYWlsIjoiZG9uZGFraHVzaGlAZ21haWwuY29tIiwiaWF0IjoxNzkwMTY3MDg1LCJleHAiOjE3OTAxNzA2ODV9.8Jf3GUdEhqxqNdMjANlBatunoMhT_x0rvq3zWMne9Ck";

const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

async function measureRequest(url) {
  const start = performance.now();

  const response = await fetch(url, {
    headers,
  });

  await response.text();

  const end = performance.now();

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return end - start;
}

async function main() {
  console.log("\n===== CACHE PERFORMANCE TEST =====\n");

  // --------------------------------------------------
  // WARM UP CACHE
  // --------------------------------------------------

  console.log("Warming up cache...");

  await measureRequest(`${BASE_URL}/tasks`);

  // --------------------------------------------------
  // CACHED READINGS
  // --------------------------------------------------

  console.log("\n--- CACHED READINGS ---");

  const cachedTimes = [];

  for (let i = 1; i <= 4; i++) {
    const time = await measureRequest(`${BASE_URL}/tasks`);

    cachedTimes.push(time);

    console.log(`Cached ${i}: ${time.toFixed(2)} ms`);
  }

  // --------------------------------------------------
  // UNCACHED READINGS
  // --------------------------------------------------

  console.log("\n--- UNCACHED READINGS ---");

  const uncachedTimes = [];

  for (let i = 1; i <= 4; i++) {
    const time = await measureRequest(`${BASE_URL}/tasks-uncached`);

    uncachedTimes.push(time);

    console.log(`Uncached ${i}: ${time.toFixed(2)} ms`);
  }

  // --------------------------------------------------
  // AVERAGES
  // --------------------------------------------------

  const cachedAverage =
    cachedTimes.reduce((sum, time) => sum + time, 0) /
    cachedTimes.length;

  const uncachedAverage =
    uncachedTimes.reduce((sum, time) => sum + time, 0) /
    uncachedTimes.length;

  console.log("\n===== RESULTS =====");

  console.log(`Cached Average:   ${cachedAverage.toFixed(2)} ms`);
  console.log(`Uncached Average: ${uncachedAverage.toFixed(2)} ms`);

  const improvement =
    ((uncachedAverage - cachedAverage) / uncachedAverage) * 100;

  console.log(`Performance Improvement: ${improvement.toFixed(2)}%`);
}

main().catch((error) => {
  console.error("\nERROR:", error.message);
});