// Static-render overflow scanner: loads each signed-in route with mocked API responses
// (deliberately including long/edge-case values, since a short string never reveals a wrapping
// bug) and, at several real phone widths, reports whether the page scrolls horizontally and
// which elements are responsible. Doesn't need the backend - all /api/v1/* calls are intercepted
// and answered with fixture data via Playwright's page routing.
//
// Usage: run `npm run dev` in one terminal (defaults to http://localhost:5173), then in another:
//   npm run check:mobile
// Override the dev server URL with SCAN_BASE_URL if it's running on a different port.
import { chromium } from 'playwright';

const BASE = process.env.SCAN_BASE_URL || 'http://localhost:5173';
const WIDTHS = [320, 375, 390, 430, 768];

const ok = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });

// Deliberately UNBREAKABLE strings (no spaces or hyphens for the browser's line-breaker
// to use as break opportunities) - a realistic worst case for emails, tokens and IDs,
// and the only kind of long value that actually needs explicit word-wrap CSS to survive.
const LONG_EMAIL = 'alexandriamontgomeryworthington@internationalfinancialservicesgroupmail.com';
const LONG_NAME = 'Alexandria Montgomery-Worthington'; // real names do have natural break points; kept breakable on purpose
const LONG_DESC = 'Payment for the quarterly consulting retainer invoice covering advisory services rendered';
const LONG_REF = 'TXN9f8e7d6c5b4a392817263544VERIFYb2c1a09f8e7d6c5b4a3928';
const LONG_STOCK_NAME = 'InternationalBusinessMachinesGlobalHoldingsCorporation';

const user = {
  _id: 'u1', firstName: 'Alexandria', lastName: 'Montgomery-Worthington', userName: 'alexandria.mw',
  email: LONG_EMAIL, accountNumber: '1234567890', balance: 1234567.89, hasTransactionPin: true,
  roles: 'user', role: 'user', isAdmin: false,
};

const notification = (over = {}) => ({
  _id: 'n1', title: 'Large transfer flagged for review', category: 'security', read: false,
  message: `A transfer of ₦500,000.00 to account 9876543210 (${LONG_NAME}) was flagged: ${LONG_DESC}`,
  createdAt: new Date().toISOString(), ...over,
});

const txn = (over = {}) => ({
  _id: 't1', type: 'transfer', amount: 500000, description: LONG_DESC, status: 'completed',
  createdAt: new Date().toISOString(), accountType: 'user_main', reference: LONG_REF,
  recipientName: LONG_NAME, senderName: LONG_NAME, ...over,
});

const beneficiary = (over = {}) => ({
  _id: 'b1', firstName: 'Alexandria', lastName: 'Montgomery-Worthington', userName: LONG_EMAIL.split('@')[0],
  accountNumber: '9876543210', ...over,
});

const stock = (over = {}) => ({
  symbol: 'IBM', name: LONG_STOCK_NAME, description: 'A long-established technology and consulting conglomerate offering cloud, AI and enterprise services',
  currentPrice: 123456.78, priceChange: 12.34, priceChangePercent: 1.23, risk: 'Medium', category: 'balanced',
  duration: 'Simulated Trading', features: ['Simulated price updates', 'Buy/Sell flexibility', 'Portfolio tracking', 'Profit/Loss calculations'],
  ...over,
});

const routeHandlers = [
  [/\/users\/profile$/, () => ok(user)],
  [/\/notifications\/unread-count/, () => ok({ unreadCount: 3 })],
  [/\/notifications(\?|$)/, () => ok({ notifications: [notification(), notification({ _id: 'n2', read: true, category: 'transaction', title: 'Deposit received' })], total: 2, page: 1, pages: 1 })],
  [/\/ledger\/history/, () => ok({ transactions: [txn()], total: 1, page: 1, pages: 1 })],
  [/\/ledger\/statement/, () => ok({ accountType: 'user_main', openingBalance: 100000, closingBalance: 600000, totalIn: 500000, totalOut: 0 })],
  [/\/beneficiaries$/, () => ok([beneficiary()])],
  [/\/investments\/stocks/, () => ok([stock()])],
  [/\/investments\/portfolio/, () => ok([{ _id: 'i1', stockSymbol: 'IBM', stockName: LONG_STOCK_NAME, quantity: 12, averagePrice: 100000, currentPrice: 123456.78, currentValue: 1481481, totalPaid: 1200000, profitLoss: 281481, profitLossPercent: 23.5 }])],
  [/\/investments\/history/, () => ok([{ _id: 'h1', purchaseDate: new Date().toISOString(), stockSymbol: 'IBM', quantity: 12, totalInvested: 1200000, status: 'active' }])],
  [/\/savings\/overview/, () => ok({ balances: { mainBalance: 1234567.89, savingsBalance: 987654.32, totalBalance: 2222222.21 }, statistics: { totalDeposited: 2000000, totalWithdrawn: 500000, netSavings: 1500000 }, accountInfo: {} })],
  [/\/savings\/history/, () => ok({ transactions: [txn({ type: 'deposit', description: LONG_DESC })] })],
  [/\/savings\/insights/, () => ok({ currentStatus: { savingsPercentage: 42, savingsHealthStatus: 'Excellent, above target for your income bracket' }, recommendations: [] })],
  [/\/transactions\/limits/, () => ok({ tier: 'tier2-verified-business', operations: { withdraw: { daily: { limit: 500000, used: 100000, remaining: 400000 }, monthly: { limit: 5000000, used: 1000000, remaining: 4000000 } }, transfer: { daily: { limit: 500000, used: 100000, remaining: 400000 }, monthly: { limit: 5000000, used: 1000000, remaining: 4000000 } } } })],
  [/\/transactions\/history\/summary/, () => ok({ totalIn: 500000, totalOut: 100000 })],
  [/\/transactions\/history/, () => ok({ transactions: [txn()], total: 1, page: 1, pages: 1 })],
];

const pages = [
  { path: '/', name: 'Landing', auth: false },
  { path: '/login', name: 'Login', auth: false },
  { path: '/register', name: 'Register', auth: false },
  { path: '/forgot-password', name: 'ForgotPassword', auth: false },
  { path: '/dashboard', name: 'Dashboard', auth: true },
  { path: '/notifications', name: 'Notifications', auth: true },
  { path: '/ledger', name: 'Ledger', auth: true },
  { path: '/savings', name: 'Savings', auth: true },
  { path: '/beneficiaries', name: 'Beneficiaries', auth: true },
  { path: '/investments', name: 'Investments', auth: true },
  { path: '/profile', name: 'Profile', auth: true },
];

const run = async () => {
  const browser = await chromium.launch();
  const results = [];

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    await context.route('**/api/v1/**', (route) => {
      const url = route.request().url();
      for (const [pattern, handler] of routeHandlers) {
        if (pattern.test(url)) return route.fulfill(handler());
      }
      return route.fulfill(ok({}));
    });
    await context.addCookies([{ name: 'token', value: 'fake-test-token', url: BASE }]);

    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200)); });
    page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${String(err.message || err).slice(0, 200)}`));

    for (const { path, name, auth } of pages) {
      try {
        consoleErrors.length = 0;
        await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(1500);

        const report = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const viewWidth = window.innerWidth;
          const overflowAmount = docWidth - viewWidth;

          // Two independent checks, since a nested `overflow:hidden` ancestor can suppress
          // scrollWidth growth at the page level while still visually clipping a card's own content:
          //   1) elements whose right edge pokes past the viewport itself
          //   2) elements whose right edge pokes past their own direct parent's box (local overflow)
          // True if el sits inside a container that intentionally scrolls horizontally
          // (e.g. Bootstrap's .table-responsive) between itself and <body> — overflow there is by design.
          const withinIntentionalScroll = (el) => {
            let node = el.parentElement;
            while (node && node !== document.body) {
              const s = window.getComputedStyle(node);
              if (s.overflowX === 'auto' || s.overflowX === 'scroll') return true;
              node = node.parentElement;
            }
            return false;
          };

          const offenders = [];
          const all = document.body.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) continue;

            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' || style.position === 'absolute') continue; // decorative/overlay, expected to be positioned outside flow
            if (withinIntentionalScroll(el)) continue;
            if (el.classList.contains('row')) continue; // Bootstrap grid rows use negative margins by design
            if (el.parentElement && el.parentElement.classList.contains('row')) continue;

            const parent = el.parentElement;
            const parentRect = parent ? parent.getBoundingClientRect() : null;
            const pokesViewport = rect.right > viewWidth + 1;
            const pokesParent = parentRect && rect.right > parentRect.right + 2 && parentRect.width > 0;

            // The check that actually matters: overflowing TEXT inside a box does not enlarge the
            // box's own layout size (that is the definition of overflow), so a long unbreakable
            // string silently clipped by an ancestor's `overflow: hidden` never shows up as a rect
            // that "pokes" past anything - only el.scrollWidth vs el.clientWidth catches it directly.
            const clipsOwnContent = el.scrollWidth > el.clientWidth + 1;

            if (pokesViewport || pokesParent || clipsOwnContent) {
              offenders.push({
                tag: el.tagName,
                cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 90) : '',
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                parentRight: parentRect ? Math.round(parentRect.right) : null,
                pokesViewport,
                pokesParent,
                clipsOwnContent,
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                text: (el.textContent || '').trim().slice(0, 70),
              });
            }
          }
          // Most specific (smallest / deepest) elements first
          offenders.sort((a, b) => a.width - b.width);

          // Walk from <body>, following the child with the largest scrollWidth at each level,
          // to show the exact ancestor chain responsible for any page-level overflow.
          let chain = [];
          let node = document.body;
          while (node) {
            chain.push({ tag: node.tagName, cls: (node.className || '').toString().slice(0, 70), scrollWidth: node.scrollWidth, clientWidth: node.clientWidth });
            let next = null, best = -1;
            for (const child of node.children) {
              if (child.scrollWidth > best) { best = child.scrollWidth; next = child; }
            }
            if (!next || next.scrollWidth <= viewWidth + 1 || chain.length > 25) break;
            node = next;
          }
          // Only keep the chain when it actually reaches an overflowing leaf
          if (!chain.length || chain[chain.length - 1].scrollWidth <= viewWidth + 1) chain = [];

          return { docWidth, viewWidth, overflowAmount, offenders: offenders.slice(0, 10), chain };
        });

        results.push({ width, path: name, ...report, consoleErrors: [...consoleErrors] });
      } catch (err) {
        results.push({ width, path: name, error: String(err.message || err).slice(0, 150) });
      }
    }
    await context.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
};

run();
