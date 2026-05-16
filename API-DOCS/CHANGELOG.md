# API Changelog

## 2026-05-16 — Newsletter, Promos & Campaigns Modules (v1.2.0)

- Added **Newsletter** module: subscribe, unsubscribe, unsubscribeByEmail (3 endpoints)
- Added **Newsletter Subscribers** module: list, show, toggle, delete (4 endpoints)
- Added **Promos** module: list, create, show, update, delete, publish (6 endpoints)
- Added **Campaigns** module: list, create, show, update, delete, queue (6 endpoints)
- Collection grew from 97 to 116 endpoints across 20 folders

## 2026-05-16 — API Body Corrections & Missing Endpoints (v1.1.0)

- Fixed ~30 inaccurate request bodies across all modules (Register, Google Callback, Addresses, Orders, Cart, Feedback, Forms, Coupons, etc.)
- Added missing endpoints: `GET /api/submissions`, `DELETE /api/submissions/{id}`
- Standardized path variable naming with Postman `:paramName` convention

## 2026-05-15 — Initial Full Collection (v1.0.0)

- Complete coverage of all 95 API routes
- 16 folders organized by domain
- Postman path variables (`:customerId`, `:orderId`, etc.) with default values
