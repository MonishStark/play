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
		baseURL: "https://igotmind.ca",
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

	projects: [{ name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } }],
});
