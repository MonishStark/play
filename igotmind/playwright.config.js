/** @format */

const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 1 : undefined, // Lower workers for headed mode safety
	reporter: [["html"], ["json", { outputFile: "results.json" }]],
	timeout: 3600000,

	use: {
		baseURL: "https://igotmind.ca",
		trace: "on-first-retry",
		screenshot: "on",

		// 🚀 CRITICAL CHANGE: Run with a Visible Browser (Headed)
		// This bypasses strict "Anti-Bot" checks that block invisible browsers.
		headless: false,

		/* Anti-Bot Launch Args (Keep these for extra safety) */
		launchOptions: {
			args: [
				"--disable-blink-features=AutomationControlled",
				"--start-maximized",
			],
			ignoreDefaultArgs: ["--enable-automation"],
		},

		// Match browser window size to view
		viewport: null,
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
		{
			name: "Desktop Chrome",
			use: {
				...devices["Desktop Chrome"],
				// Ensure viewport matches window for consistent screenshots
				viewport: { width: 1920, height: 1080 },
			},
		},
	],
});
