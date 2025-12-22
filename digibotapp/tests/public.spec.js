/** @format */

const { test, expect } = require("@playwright/test");

// 1. HELPER: Force all lazy images to load
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

// 2. URL LIST (From Sitemap)
const pagesToTest = [
	{ path: "/", name: "Home" },
	{ path: "/retail/", name: "Retail" },
	{ path: "/hr/", name: "HR" },
	{ path: "/technology/", name: "Technology" },
	{ path: "/legal/", name: "Legal" },
	{ path: "/healthcare/", name: "Healthcare" },
	{ path: "/fintech/", name: "Fintech" },
	{ path: "/faq/", name: "FAQ" },
	{ path: "/blog/", name: "Blog_Index" },
	{ path: "/contact-us/", name: "Contact_Us" },
	{ path: "/terms-of-use/", name: "Terms_Use" },
	{ path: "/privacy-policy/", name: "Privacy_Policy" },
];

test.describe("DigiBot - Public Page Visual Audit", () => {
	for (const pageInfo of pagesToTest) {
		test(`Verify Layout: ${pageInfo.name}`, async ({ page }) => {
			// 1. Navigate
			await page.goto(pageInfo.path);
			await page.waitForLoadState("domcontentloaded");

			// 2. STABILIZE: Load images
			await loadAllLazyImages(page);

			// 3. SCREENSHOT
			await expect(page).toHaveScreenshot({
				fullPage: true,
				animations: "disabled",
				timeout: 60000,
			});
		});
	}
});
