/** @format */
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: [["html"], ["json", { outputFile: "results.json" }]],
	timeout: 3600000,

	use: {
		baseURL: "https://www.inventor.market",
		trace: "on-first-retry",
		screenshot: "on",
		// 🔴 NEW: Pretend to be a real user to bypass Cloudflare
		userAgent:
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		viewport: { width: 1280, height: 720 },
		locale: "en-US",
		timezoneId: "America/New_York",
		permissions: ["geolocation"],
		ignoreHTTPSErrors: true,

		// Add headers that real browsers send
		extraHTTPHeaders: {
			Accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
			"Accept-Language": "en-US,en;q=0.9",
			"Sec-Ch-Ua":
				'"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
			"Sec-Ch-Ua-Mobile": "?0",
			"Sec-Ch-Ua-Platform": '"Windows"',
		},
	},

	expect: {
		timeout: 30000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.05,
			threshold: 0.3,
			animations: "disabled",
		},
	},

	projects: [
		{ name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
		{
			name: "Desktop Safari",
			use: {
				...devices["Desktop Safari"],
				userAgent:
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
			},
		},
		{
			name: "iPhone 17 Pro",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 393, height: 852 },
				isMobile: true,
				hasTouch: true,
				// Mobile specific user agent
				userAgent:
					"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1",
			},
		},
	],
});
