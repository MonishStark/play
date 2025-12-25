/** @format */

const { test, expect } = require("@playwright/test");

// 1. HELPER: Safe Scroll + Nuclear CSS Injection
async function performSafeScroll(page) {
	// A. PRE-EMPTIVE CSS: Force everything to stay visible using !important
	// This prevents Elementor from hiding elements before we even start scrolling.
	await page.addStyleTag({
		content: `
      /* 1. Kill Cookie Bar */
      #moove_gdpr_cookie_info_bar { display: none !important; }

      /* 2. Force Elementor Content Visible */
      .elementor-invisible,
      .elementor-motion-effects-element,
      .elementor-motion-effects-parent,
      .elementor-motion-effects-layer,
      .elementor-widget-container {
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }

      /* 3. Force Iframes/Videos Visible */
      iframe {
        opacity: 1 !important;
        visibility: visible !important;
      }

      /* 4. Catch-all for any hidden opacity */
      [style*="opacity: 0"] {
        opacity: 1 !important;
      }
    `,
	});

	// B. WAKE UP VIDEOS (JS Injection)
	await page.evaluate(() => {
		document.querySelectorAll("iframe").forEach((frame) => {
			frame.loading = "eager";
			frame.style.opacity = "1";
		});
	});

	// C. SCROLL LOGIC (Triggers lazy loading images)
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

	// D. FINAL CLEANUP (The "Double Tap")
	// If anything is still hidden after scrolling, we force it open again.
	await page.evaluate(() => {
		const motionElements = document.querySelectorAll(
			".elementor-motion-effects-element, .elementor-motion-effects-parent, .elementor-invisible"
		);
		motionElements.forEach((el) => {
			el.style.setProperty("opacity", "1", "important");
			el.style.setProperty("transform", "none", "important");
			el.classList.remove("elementor-invisible");
		});
	});

	// E. Final Buffer: 5 Seconds for layout to settle
	console.log("⏳ Waiting 5s for final layout...");
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

			// Wait for basic structure
			await page.waitForLoadState("domcontentloaded");

			// Run the robust scroll & fix script
			await performSafeScroll(page);

			await expect(page).toHaveScreenshot({ fullPage: true });
		});
	}
});
