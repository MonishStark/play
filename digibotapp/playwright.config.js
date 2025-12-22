/** @format */
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: [["html"], ["json", { outputFile: "results.json" }]],
	timeout: 3600000, // 1 Hour Max

	use: {
		// 🔴 TARGET URL FOR THIS SITE
		baseURL: "https://digibotapp.com",
		trace: "on-first-retry",
		screenshot: "on",
	},

	expect: {
		timeout: 30000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.05,
			threshold: 0.3,
			timeout: 60000,
			animations: "disabled",
		},
	},

	projects: [
		{ name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
		// Linux-Safe Safari Config
		{
			name: "Desktop Safari",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 1280, height: 720 },
				userAgent:
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		},
		// Mobile Devices (Chromium Fixed)
		{
			name: "iPhone 17 Pro",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 393, height: 852 },
				isMobile: true,
				hasTouch: true,
				userAgent:
					"Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1",
			},
		},
		{
			name: "Samsung S25 Ultra",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 412, height: 915 },
				isMobile: true,
				hasTouch: true,
			},
		},
	],
});
