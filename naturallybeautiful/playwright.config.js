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
		// 🔴 TARGET URL
		baseURL: "https://naturallybeautifulhaircare.com",
		trace: "on-first-retry",
		screenshot: "on",
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
		{ name: "Desktop Safari", use: { ...devices["Desktop Safari"] } },
		{
			name: "iPhone 17 Pro",
			use: {
				browserName: "chromium",
				channel: "chrome",
				viewport: { width: 393, height: 852 },
				isMobile: true,
				hasTouch: true,
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
