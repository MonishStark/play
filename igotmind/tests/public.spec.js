/** @format */

const { test, expect } = require("@playwright/test");

// 1. HUMAN DISGUISE: Trick Calendly into thinking we are a real Desktop Chrome browser
// This bypasses the "Headless" security block that causes the white iframe.
test.use({
	userAgent:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	locale: "en-US",
	permissions: ["geolocation"],
});

// 2. HELPER: Safe Scroll + Widget Fix + Spinner Killer
async function performSafeScroll(page) {
	// A. PRE-EMPTIVE CSS: Force Layout & Hide Spinner
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

      /* 3. Force Iframes/Videos Visible */
      iframe {
        opacity: 1 !important;
        visibility: visible !important;
      }

      /* 4. CALENDLY FIXES */
      /* Kill the spinner so it doesn't block the view */
      .calendly-spinner { display: none !important; }
      
      /* Force widget size */
      .calendly-inline-widget, 
      iframe[src*="calendly"] {
        min-height: 900px !important; 
        height: 900px !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        background-color: transparent !important; /* Prevent white overlay */
      }
      
      /* 5. Catch-all for opacity 0 */
      [style*="opacity: 0"] {
        opacity: 1 !important;
      }
    `,
	});

	// B. WAKE UP VIDEOS
	await page.evaluate(() => {
		document.querySelectorAll("iframe").forEach((frame) => {
			frame.loading = "eager";
			frame.style.opacity = "1";
		});
	});

	// C. SCROLL LOGIC
	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		const totalHeight = document.body.scrollHeight;

		for (let i = 0; i < totalHeight; i += 200) {
			window.scrollTo(0, i);
			await delay(100);
		}
		window.scrollTo(0, 0);
	});

	// D. THE KICKSTART: Force Calendly to Reload
	console.log("⚡ Kickstarting Calendly Widget...");

	await page.evaluate(() => {
		const widgets = document.querySelectorAll('iframe[src*="calendly"]');
		widgets.forEach((iframe) => {
			// 1. Force a clean src refresh
			const currentSrc = iframe.src;
			iframe.src = currentSrc;
		});
	});

	// E. Final Buffer: Extended wait for the "Real Browser" to load the iframe
	console.log("⏳ Waiting 10s for external widgets...");
	await page.waitForTimeout(10000);
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

			// Run Safe Scroll with Human Disguise
			await performSafeScroll(page);

			await expect(page).toHaveScreenshot({ fullPage: true });
		});
	}
});
