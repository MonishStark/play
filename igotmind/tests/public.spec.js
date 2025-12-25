/** @format */

const { test, expect } = require("@playwright/test");

// 1. HELPER: Safe Scroll + Elementor Motion Fix (Fixes Hidden Sections & Black Videos)
async function performSafeScroll(page) {
	// A. Hide Cookie Bar
	await page.addStyleTag({
		content: "#moove_gdpr_cookie_info_bar { display: none !important; }",
	});

	// B. Scroll logic (Triggers standard lazy loading)
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		const totalHeight = document.body.scrollHeight;

		// Scroll down in chunks to trigger basic events
		for (let i = 0; i < totalHeight; i += 200) {
			window.scrollTo(0, i);
			await delay(100);
		}
		// Scroll back to top
		window.scrollTo(0, 0);
	});

	// C. TARGETED ELEMENTOR FIX (The "Anti-Motion" Script)
	// This disables the math that keeps elements hidden while scrolling
	await page.evaluate(() => {
		// 1. Force Iframes (Videos) to load immediately
		document.querySelectorAll("iframe").forEach((frame) => {
			frame.loading = "eager";
			frame.style.opacity = "1";
		});

		// 2. KILL ELEMENTOR MOTION EFFECTS
		// Targeted specifically at the class from your HTML inspection
		const motionElements = document.querySelectorAll(
			".elementor-motion-effects-element, .elementor-motion-effects-parent"
		);

		motionElements.forEach((el) => {
			// Forcefully override Elementor's inline opacity math
			el.style.setProperty("opacity", "1", "important");
			el.style.setProperty("transform", "none", "important");
			el.style.setProperty("transition", "none", "important");

			// Remove the class so Elementor stops trying to calculate it
			el.classList.remove("elementor-motion-effects-element");
		});

		// 3. Universal Backup (For anything else hidden)
		document.querySelectorAll("*").forEach((el) => {
			const style = window.getComputedStyle(el);
			// If it's invisible or transparent, force it to show
			if (style.opacity === "0" || style.visibility === "hidden") {
				el.style.setProperty("opacity", "1", "important");
				el.style.setProperty("visibility", "visible", "important");
			}

			// Clean up common hiding classes
			if (el.classList.contains("elementor-invisible")) {
				el.classList.remove("elementor-invisible");
			}
		});
	});

	// D. Final Buffer: 5 Seconds for the "forced" layout to settle
	console.log("⏳ Waiting 5s for forced layout to settle...");
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

			// Run Safe Scroll with Elementor Motion Fix
			await performSafeScroll(page);

			await expect(page).toHaveScreenshot({ fullPage: true });
		});
	}
});
