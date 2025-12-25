/** @format */

const { test, expect } = require("@playwright/test");

// 1. CONFIG: Stealth User Agent
test.use({
	userAgent:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	locale: "en-US",
	permissions: ["geolocation"],
	bypassCSP: true,
	ignoreHTTPSErrors: true,
});

// 2. HELPER: Safe Scroll + Fonts + PayPal Fix
async function performSafeScroll(page) {
	// A.1 STEALTH INJECTION
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "webdriver", {
			get: () => undefined,
		});
	});

	// A.2 WAIT FOR FONTS
	console.log("🎨 Waiting for custom fonts...");
	await page.evaluate(async () => {
		await document.fonts.ready;
	});

	// B. PRE-EMPTIVE CSS: Force Layout (Calendly + PayPal)
	await page.addStyleTag({
		content: `
      /* 1. Kill Cookie Bar */
      #moove_gdpr_cookie_info_bar { display: none !important; }

      /* 2. Force Elementor Content Visible */
      .elementor-invisible,
      .elementor-motion-effects-element,
      .elementor-motion-effects-parent,
      .elementor-widget-container {
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }

      /* 3. Force Iframes Visible */
      iframe {
        opacity: 1 !important;
        visibility: visible !important;
      }

      /* 4. CALENDLY FIXES */
      .calendly-spinner { display: none !important; }
      .calendly-inline-widget, 
      iframe[src*="calendly"] {
        min-height: 1000px !important; 
        height: 1000px !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        background-color: transparent !important;
      }

      /* 5. PAYPAL WIDGET FIX (New) */
      /* Targets the class from your code snippet */
      div[class*="styles-module_campaigns_widget"],
      div[class*="campaigns_widget"] {
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        min-height: 500px !important; /* Forces the card to have height */
      }
    `,
	});

	// C. WAKE UP VIDEOS
	await page.evaluate(() => {
		document.querySelectorAll("iframe").forEach((frame) => {
			frame.loading = "eager";
			frame.style.opacity = "1";
		});
	});

	// D. SCROLL LOGIC
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		const totalHeight = document.body.scrollHeight;

		for (let i = 0; i < totalHeight; i += 200) {
			window.scrollTo(0, i);
			await delay(100);
		}
		window.scrollTo(0, 0);
	});

	// E. Final Buffer: Wait for Widgets (PayPal + Calendly)
	console.log("⏳ Waiting 15s for external widgets...");
	await page.waitForTimeout(15000);
}

// 3. PUBLIC URL LIST
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

			await page.waitForLoadState("domcontentloaded");

			// Run Safe Scroll
			await performSafeScroll(page);

			await expect(page).toHaveScreenshot({ fullPage: true });
		});
	}
});
