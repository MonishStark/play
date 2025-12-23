/** @format */

const { test, expect } = require("@playwright/test");

// Helper to scroll down so images/listings load
async function loadAllLazyImages(page) {
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		for (let i = 0; i < document.body.scrollHeight; i += 500) {
			window.scrollTo(0, i);
			await delay(50);
		}
		window.scrollTo(0, 0);
	});
	await page.waitForTimeout(1000);
}

// 🔴 URL LIST FROM SITEMAP
const pagesToTest = [
	// Core Pages
	{ path: "/", name: "Home" },
	{ path: "/about-us/", name: "About_Us" },
	{ path: "/contact-us/", name: "Contact_Us" },
	{ path: "/privacy-policy/", name: "Privacy_Policy" },

	// Services & Listings
	{ path: "/add-listing/", name: "Add_Listing_Page" },
	{ path: "/patent-services/", name: "Patent_Services" },
	{ path: "/iump-subscription-plan/", name: "Subscription_Plans" },

	// Categories
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
			await page.goto(pageInfo.path);
			await page.waitForLoadState("domcontentloaded");

			// Load Listing Images
			await loadAllLazyImages(page);

			await expect(page).toHaveScreenshot({
				fullPage: true,
				animations: "disabled",
				timeout: 60000,
			});
		});
	}
});
