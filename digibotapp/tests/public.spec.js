/** @format */

const { test, expect } = require("@playwright/test");

// 1. HELPER: SUPER SLOW SCROLLER (Forces animations to finish)
async function loadAllLazyImages(page) {
	// A. Wait for fonts to be ready (Critical for icons)
	await page.evaluate(() => document.fonts.ready);

	await page.evaluate(async () => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

		// B. Scroll down SLOWLY (100px steps) to trigger "fade-in" animations
		const totalHeight = document.body.scrollHeight;
		for (let i = 0; i < totalHeight; i += 100) {
			// Smaller steps
			window.scrollTo(0, i);
			await delay(100); // Longer wait (gives time for opacity: 0 -> 1)
		}

		// C. Scroll back to top
		window.scrollTo(0, 0);
	});

	// D. Final wait to ensure the top-of-page animations settle
	await page.waitForTimeout(3000);
}

// 2. COMPLETE URL LIST
const pagesToTest = [
	// --- Main Pages ---
	{ path: "/", name: "Home" },
	{ path: "/home-2/", name: "Home_Variant_2" },
	{ path: "/about-us/", name: "About_Us" },
	{ path: "/contact-us/", name: "Contact_Us" },
	{ path: "/faq/", name: "FAQ" },
	{ path: "/pricing-plan/", name: "Pricing_Plan" },
	{ path: "/service/", name: "Service" },
	{ path: "/terms-of-use/", name: "Terms_Use" },
	{ path: "/privacy-policy/", name: "Privacy_Policy" },

	// --- Industries / Solutions ---
	{ path: "/fintech/", name: "Sol_Fintech" },
	{ path: "/healthcare/", name: "Sol_Healthcare" },
	{ path: "/legal/", name: "Sol_Legal" },
	{ path: "/technology/", name: "Sol_Technology" },
	{ path: "/hr/", name: "Sol_HR" },
	{ path: "/retail/", name: "Sol_Retail" },
	{ path: "/internal-virtual-agent/", name: "Sol_Virtual_Agent" },

	// --- Blog Formats ---
	{ path: "/right-sidebar-blog-1/", name: "Blog_Right_Sidebar_1" },
	{ path: "/right-sidebar-blog-2/", name: "Blog_Right_Sidebar_2" },
	{ path: "/left-sidebar-blog-1/", name: "Blog_Left_Sidebar_1" },
	{ path: "/left-sidebar-blog-2/", name: "Blog_Left_Sidebar_2" },
	{ path: "/two-column-blog/", name: "Blog_Two_Col" },
	{ path: "/three-column-blog/", name: "Blog_Three_Col" },
	{ path: "/four-column-blog/", name: "Blog_Four_Col" },
	{ path: "/four-column-full-width/", name: "Blog_Four_Col_Full" },

	// --- Blog Content ---
	{ path: "/blog/", name: "Blog_Index" },
	{ path: "/blog/category/technology/", name: "Blog_Cat_Tech" },
	{ path: "/blog/how-to-set-up-a-chatbot/", name: "Post_Setup_Chatbot" },
	{ path: "/blog/instant-patient-data-access/", name: "Post_Patient_Data" },
	{ path: "/blog/artificial-inteligence-applied/", name: "Post_AI_Applied" },
	{ path: "/blog/advantages-of-chatbots/", name: "Post_Chatbot_Advantages" },
	{ path: "/blog/what-are-chatbots/", name: "Post_What_Are_Chatbots" },
];

test.describe("DigiBot - Full Site Visual Audit", () => {
	for (const pageInfo of pagesToTest) {
		test(`Verify Layout: ${pageInfo.name}`, async ({ page }) => {
			// 1. Navigate
			await page.goto(pageInfo.path);

			// 2. Wait for Network Idle (Images downloaded)
			await page.waitForLoadState("networkidle");

			// 3. RUN SLOW SCROLL (Forces animations to appear)
			await loadAllLazyImages(page);

			// 4. SCREENSHOT
			await expect(page).toHaveScreenshot({
				fullPage: true,
				// 🔴 IMPORTANT: Removed 'animations: disabled'
				// We WANT the animations to be visible in their final state.
				timeout: 60000,
				maxDiffPixelRatio: 0.05,
			});
		});
	}
});
