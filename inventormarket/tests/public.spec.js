/** @format */

const { test, expect } = require("@playwright/test");

async function performHumanChecks(page) {
	// 1. Cloudflare Bypass: Random Mouse Movements
	for (let i = 0; i < 5; i++) {
		const x = 100 + Math.random() * 500;
		const y = 100 + Math.random() * 500;
		await page.mouse.move(x, y, { steps: 10 });
		await page.waitForTimeout(200);
	}

	// 2. Image Loading: Slow Scroll
	// Changed step from 400 -> 100 to ensure every image triggers
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		const totalHeight = document.body.scrollHeight;
		for (let i = 0; i < totalHeight; i += 100) {
			window.scrollTo(0, i);
			await delay(100); // Consistent delay
		}
		window.scrollTo(0, 0);
	});

	// 3. Wait for Cloudflare to clear
	await page.waitForTimeout(3000);
}

const pagesToTest = [
	{ path: "/", name: "Home" },
	{ path: "/about-us/", name: "About_Us" },
	{ path: "/contact-us/", name: "Contact_Us" },
	{ path: "/privacy-policy/", name: "Privacy_Policy" },
	{ path: "/add-listing/", name: "Add_Listing_Page" },
	{ path: "/patent-services/", name: "Patent_Services" },
	{ path: "/iump-subscription-plan/", name: "Subscription_Plans" },
	{ path: "/category/aviation/", name: "Cat_Aviation" },
	{ path: "/category/consumer-products/", name: "Cat_Consumer_Products" },
	{ path: "/category/electronics/", name: "Cat_Electronics" },
	{ path: "/category/medical/", name: "Cat_Medical" },
	{ path: "/category/footwear/", name: "Cat_Footwear" },
	{ path: "/category/measuring/", name: "Cat_Measuring" },
	{ path: "/explore/", name: "Explore_Page" },
];

test.describe("Inventor Market - Visual Audit", () => {
	for (const pageInfo of pagesToTest) {
		test(`Verify Layout: ${pageInfo.name}`, async ({ page }) => {
			await page.goto(pageInfo.path);

			// 1. Run Human/Scroll Checks
			await performHumanChecks(page);

			// 2. Double check if stuck on Cloudflare
			const title = await page.title();
			if (title.includes("Just a moment") || title.includes("Security")) {
				console.log("⚠️ Still stuck on Challenge page, waiting 5s more...");
				await page.waitForTimeout(5000);
			}

			// 🔴 CRITICAL CHANGE: networkidle ensures images are downloaded
			await page.waitForLoadState("networkidle");

			await expect(page).toHaveScreenshot({
				fullPage: true,
				animations: "disabled",
				timeout: 60000,
			});
		});
	}
});
