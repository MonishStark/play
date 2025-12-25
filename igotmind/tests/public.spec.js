/** @format */

const { test, expect } = require("@playwright/test");

// 1. CONFIG: Basic User Agent (Good practice, even with mocking)
test.use({
	userAgent:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	locale: "en-US",
	bypassCSP: true,
	ignoreHTTPSErrors: true,
});

// 2. HELPER: Safe Scroll + Visual Mocking
async function performSafeScroll(page) {
	// A. PRE-EMPTIVE CSS: Clean up the page
	await page.addStyleTag({
		content: `
      /* Kill Cookie Bar */
      #moove_gdpr_cookie_info_bar { display: none !important; }

      /* Force Elementor Content Visible */
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
      
      /* Hide the real spinner since we are mocking */
      .calendly-spinner { display: none !important; }
    `,
	});

	// B. WAKE UP VIDEOS (Eager Load)
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

	// D. 🚀 THE VISUAL MOCK (Fixes White Box Permanently)
	// We replace the blocked Calendly iframe with a stable "Mock Widget"
	await page.evaluate(() => {
		const frames = document.querySelectorAll('iframe[src*="calendly"]');

		frames.forEach((frame) => {
			// Create a fake widget that matches the size
			const mock = document.createElement("div");
			mock.style.width = "100%";
			mock.style.height = "1030px"; // Matches your live site height
			mock.style.backgroundColor = "#ffffff";
			mock.style.display = "flex";
			mock.style.flexDirection = "column";
			mock.style.alignItems = "center";
			mock.style.justifyContent = "center";
			mock.style.border = "1px solid #e0e0e0";
			mock.style.borderRadius = "8px";
			mock.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";

			// Add content so it looks like a calendar
			mock.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">📅</div>
        <h2 style="font-family: sans-serif; color: #333; margin: 0 0 10px 0;">Booking Calendar</h2>
        <p style="font-family: sans-serif; color: #666;">(Mocked for Visual Stability)</p>
        <button style="background: #0069ff; color: white; padding: 12px 24px; border: none; border-radius: 40px; font-size: 16px; margin-top: 20px;">Select a Date</button>
      `;

			// Swap the blocked iframe with our nice mock
			if (frame.parentNode) {
				frame.parentNode.replaceChild(mock, frame);
			}
		});
	});

	// E. Final Buffer
	console.log("⏳ Layout stable. Taking screenshot...");
	await page.waitForTimeout(3000);
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

			// Run Safe Scroll with Mocking
			await performSafeScroll(page);

			await expect(page).toHaveScreenshot({ fullPage: true });
		});
	}
});
