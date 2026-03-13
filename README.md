# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Backend API setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` as your primary backend API root.
3. (Optional) Set `VITE_API_FALLBACK_URL` as secondary backend root.

Example:

`VITE_API_BASE_URL=https://zurickh-bank.vercel.app/api/v1`

`VITE_API_FALLBACK_URL=http://localhost:4040/api/v1`

When a request fails with a network error or `5xx` response, the client automatically retries once against the fallback URL.

The `BeneficiaryManagement` page now uses a dedicated service layer in `src/services/beneficiaryService.js`, which calls:

- `GET /beneficiaries`
- `POST /beneficiaries/add`
- `DELETE /beneficiaries/:beneficiaryId`
- `POST /transactions/transfer`

## Quick QA Checklist

- Login as a regular user and confirm `Reports` is not visible in sidebars.
- Login as an admin and confirm `Reports` is visible and routes to `/admin`.
- In admin reports, verify transaction search works for account number, name, type, status, and amount text.
- In admin reports, verify type/status filters and `Reset` return expected rows/count.
- On Savings page, perform `Deposit`, `Withdraw`, and `Quick Transfer`, then confirm:
	- `Total Deposited`, `Total Withdrawn`, and `Net Savings` update correctly.
	- Recent savings history shows the new transactions.
	- `Last updated` timestamp refreshes after each successful action.
