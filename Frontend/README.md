# Kindred Exchange

Built the full React frontend based on your donation/receiver concept. Here's what's inside:

Pages: Browse (Home), Login, Register, Item Details (with request button + rating), Donate an Item, My Requests (renamed from "cart" — split into "things I've requested" and "requests on my items"), My Donations, User Dashboard, Admin Dashboard.

Structure:

src/services/api.js — every backend call, grouped by your actual route files (userRoutes, productsRoutes, cartRoutes, ratingRoutes, dashboardRoutes, adminRoutes)

src/context/AuthContext.jsx — login/register/logout, stores JWT

src/components/ — Navbar, ItemCard, RatingStars, ProtectedRoute, EmptyState

Styled with Tailwind, warm moss-green/cream palette — deliberately avoids typical shopping-cart visuals since there's no money involved

Important: I had to guess your exact API endpoint paths and response shapes from your file/folder names (productController.js → /products, cartController.js → /cart, etc.). Open src/services/api.js — it's all in one file — and adjust the paths/fields to match what your controllers actually expect and return. The README inside the zip walks through setup (npm install, set your API URL in .env, npm run dev).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b0e227ad-62fa-4614-bd6c-6f428ff6016f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
