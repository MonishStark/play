/** @format */

const { test, expect } = require("@playwright/test");

// 1. HELPER: Human-like behavior
async function performHumanChecks(page) {
	// A. Random Mouse Movements (Jiggle)
	// This tricks Cloudflare into thinking a human is moving the mouse
	for (let i = 0; i < 5; i++) {
		const x = 100 + Math.random() * 500;
		const y = 100 + Math.random() * 500;
		await page.mouse.move(x, y, { steps: 10 });
		await page.waitForTimeout(200);
	}

	// B. Scroll slowly
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		for (let i = 0; i < document.body.scrollHeight; i += 400) {
			window.scrollTo(0, i);
			await delay(100 + Math.random() * 100); // Random delay
		}
		window.scrollTo(0, 0);
	});

	// C. Wait for the "Verify" challenge to potentially disappear
	await page.waitForTimeout(3000);
}

// 2. URL LIST
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
];

test.describe("Inventor Market - Visual Audit", () => {
	for (const pageInfo of pagesToTest) {
		test(`Verify Layout: ${pageInfo.name}`, async ({ page }) => {
			// 1. Navigate
			await page.goto(pageInfo.path);

			// 2. Act Human (Bypass Protection)
			await performHumanChecks(page);

			// 3. Ensure we are NOT on the challenge page
			// If we see the specific Cloudflare title, wait longer
			const title = await page.title();
			if (title.includes("Just a moment") || title.includes("Security")) {
				console.log("⚠️ Still stuck on Challenge page, waiting 5s more...");
				await page.waitForTimeout(5000);
			}

			await page.waitForLoadState("domcontentloaded");

			// 4. SCREENSHOT
			await expect(page).toHaveScreenshot({
				fullPage: true,
				animations: "disabled",
				timeout: 60000,
			});
		});
	}
});
