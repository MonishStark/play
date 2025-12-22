/** @format */

const { test, expect } = require("@playwright/test");

async function loadAllLazyImages(page) {
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		for (let i = 0; i < document.body.scrollHeight; i += 500) {
			window.scrollTo(0, i);
			await delay(20);
		}
		window.scrollTo(0, 0);
	});
	await page.waitForTimeout(1000);
}

const pagesToTest = [
	{ path: "/", name: "Home" },
	{ path: "/forsportsandeducation/", name: "Sports_Education" },
	{ path: "/business/", name: "Business" },
];

test.describe("Public Page Visual Regression", () => {
	for (const pageInfo of pagesToTest) {
		test(`Verify Layout: ${pageInfo.name}`, async ({ page }) => {
			await page.goto(pageInfo.path);
			await page.waitForLoadState("domcontentloaded");

			await loadAllLazyImages(page);

			await expect(page).toHaveScreenshot({
				fullPage: true,
				animations: "disabled",
				timeout: 450000,
			});
		});
	}
});
