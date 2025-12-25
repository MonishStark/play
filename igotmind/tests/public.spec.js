/** @format */

const { test, expect } = require("@playwright/test");

// 1. HELPER: Safe Scroll + Universal Visibility (Fixes Missing Sections & Black Videos)
async function performSafeScroll(page) {
	// A. Hide Cookie Bar
	await page.addStyleTag({
		content: "#moove_gdpr_cookie_info_bar { display: none !important; }",
	});

	// B. Scroll logic (Trigger standard lazy loading)
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		const totalHeight = document.body.scrollHeight;

		// Scroll down in chunks
		for (let i = 0; i < totalHeight; i += 200) {
			window.scrollTo(0, i);
			await delay(100);
		}
		// Scroll back to top
		window.scrollTo(0, 0);
	});

	// C. UNIVERSAL VISIBILITY FIX (The "Sledgehammer")
	// Instead of guessing class names, we force ALL hidden content to appear.
	await page.evaluate(() => {
		// 1. Force Iframes (Videos) to load
		document.querySelectorAll("iframe").forEach((frame) => {
			frame.loading = "eager";
			frame.style.opacity = "1";
		});

		// 2. Find ANY element with opacity 0 and force it to 1
		const allElements = document.querySelectorAll("*");
		allElements.forEach((el) => {
			const style = window.getComputedStyle(el);
			// Check if element is effectively hidden
			if (style.opacity === "0" || style.visibility === "hidden") {
				el.style.opacity = "1";
				el.style.visibility = "visible";
				el.style.animation = "none"; // Stop moving
				el.style.transition = "none"; // Stop fading
			}

			// Also remove common hiding classes just in case
			if (el.classList.contains("elementor-invisible")) {
				el.classList.remove("elementor-invisible");
			}
		});
	});

	// D. Final Buffer: 5 Seconds for the forced content to paint
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

			// Run Safe Scroll with Universal Visibility Fix
			await performSafeScroll(page);

			await expect(page).toHaveScreenshot({ fullPage: true });
		});
	}
});
