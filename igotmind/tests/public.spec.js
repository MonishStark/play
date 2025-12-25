/** @format */

const { test, expect } = require("@playwright/test");

// 1. HELPER: Safe Scroll & Video Loader
async function performSafeScroll(page) {
	// A. Hide Cookie Bar only
	await page.addStyleTag({
		content: "#moove_gdpr_cookie_info_bar { display: none !important; }",
	});

	// B. Scroll logic (Triggers lazy loading animations)
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		const totalHeight = document.body.scrollHeight;

		// 100ms delay allows "fade-in" animations to trigger
		for (let i = 0; i < totalHeight; i += 100) {
			window.scrollTo(0, i);
			await delay(100);
		}
		window.scrollTo(0, 0);
	});

	// C. CRITICAL: Wait for "load" event (For Video Thumbnails)
	// We use a try/catch so if it takes >10s, it doesn't kill the test.
	try {
		console.log("⏳ Waiting for video thumbnails to load...");
		await page.waitForLoadState("load", { timeout: 10000 });
	} catch (e) {
		console.log("⚠️ Page load took too long (10s), proceeding to screenshot.");
	}

	// D. Final Buffer: Give the video player 5s to render the image
	await page.waitForTimeout(5000);
}

// 2. PUBLIC URL LIST (12 Pages)
const pagesToTest = [
	{ path: "/", name: "01_Home" },
	{ path: "/about/", name: "02_About_Us" },
	{ path: "/sports/", name: "03_Sports_Programs" },
	{ path: "/business/", name: "04_Corporate_Programs" },
	{ path: "/4-the-boys/", name: "05_Scholarship" },
	{ path: "/book-now/", name: "06_Contact_Us" },
	{ path: "/forsportsandeducation/", name: "07_Non_Profit" },
	{ path: "/my-courses/", name: "08_Login_Page" },
	{ path: "/my-courses/lost-password/", name: "09_Password_Reset" },
	{ path: "/tlw/", name: "10_The_Little_Warriors" },
	{ path: "/membership/front-of-line-membership/", name: "11_Membership_Flow" },
	{ path: "/purchase/", name: "12_Purchase_Flow" },
];

test.describe("I Got Mind - Public Visual Audit", () => {
	for (const pageInfo of pagesToTest) {
		test(`Verify: ${pageInfo.name}`, async ({ page }) => {
			await page.goto(pageInfo.path);

			// Fast initial wait for text/layout
			await page.waitForLoadState("domcontentloaded");

			// Run Safe Scroll (Handles videos & animations)
			await performSafeScroll(page);

			await expect(page).toHaveScreenshot({ fullPage: true });
		});
	}
});
