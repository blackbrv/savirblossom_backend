---
name: api-docs-updater
description: Explores API routes, compares against the Postman collection, and updates the API documentation following the documented workflow
---

## Workflow

When the user asks to update API documentation or sync API docs:

### Phase 1: Explore Routes & Controllers

1. **Read `routes/api.php`** to extract ALL routes with:
   - HTTP method (GET/POST/PUT/PATCH/DELETE)
   - URI pattern
   - Controller class and method
   - Middleware (especially `auth:sanctum`, `customer.own`)
   - Route constraints (`whereNumber`)

2. **For each unique controller** referenced in routes, read the controller file at `app/Http/Controllers/Api/{Controller}.php` and extract:
   - Method signature (parameters, type-hints)
   - **Validation rules**: look for `$request->validate([...])` or FormRequest type-hints
   - **Response shape**: `return response()->json([...])` structure
   - **Path parameters**: which params are passed directly (e.g., `int $id`)
   - **Query parameters**: from `$request->input(...)` or `$request->get(...)` calls
   - **Auth/middleware requirements**

3. **For each Model** used in the controllers, note relationships loaded via `->load()` or `->with()` for response data context.

### Phase 2: Compare Against Postman Collection

1. **Read the root collection**: `SavirBlossom API.postman_collection.json`
2. **Build a comparison table** with columns:
   - Method | URI | In Postman? | In Routes? | Status

3. **Categorize differences**:
   - **NEW**: In routes but NOT in Postman → needs to be added
   - **MODIFIED**: In both but payload/params differ → needs to be updated
   - **REMOVED**: In Postman but NOT in routes → flag for user to confirm deletion
   - **MATCH**: In both and consistent → skip

### Phase 3: Build Postman Request Objects

For each NEW endpoint, construct a Postman `item` object:

```json
{
  "name": "<Human-readable name>",
  "request": {
    "method": "<GET|POST|PUT|PATCH|DELETE>",
    "header": [
      {"key": "Accept", "value": "application/json", "type": "text"}
    ],
    "body": {
      "mode": "raw",
      "raw": "<JSON body with example values>"
    },
    "url": {
      "raw": "{{baseUrl}}/api/<path>",
      "host": ["{{baseUrl}}"],
      "path": ["api", "<path-parts>"],
      "variable": [
        {"key": "<paramName>", "value": "<default-value>"}
      ],
      "query": [
        {"key": "<queryParam>", "value": "<default-value>"}
      ]
    },
    "description": "<Short description>"
  },
  "response": []
}
```

**Rules for building**:
- **GET/DELETE** requests: no `body`, may have `query` params
- **POST/PUT/PATCH** requests: include `body` with `mode: "raw"` and example JSON
- **Path variables**: use `:paramName` in path, add entry to `variable` array with default value
- **Query params**: add to `query` array
- **Auth-protected routes**: include `{"key": "Accept", "value": "application/json", "type": "text"}` in headers. Do NOT add Authorization header (Postman handles auth via collection-level auth). Add `"auth": {}` only if the collection uses per-request auth.
- **Pagination** (index/list methods): add `page` and `per_page` query params with defaults `1` and `10`
- **Search**: if controller has `$request->input('search')`, add `search` query param

### Phase 4: Insert/Update Collection

1. **Insert new endpoints** into the correct folder by matching the route prefix to a folder name:
   - `/api/auth/*` → `Authentication` folder
   - `/api/customers/*` → `Customers` folder
   - `/api/addresses/*` → `Addresses` folder
   - `/api/orders/*` (admin) → `Orders` folder
   - `/api/customers/{id}/orders/*` → `Customer Orders (Auth Required)` folder
   - `/api/invoices/*` → `Invoices` folder
   - `/api/bouquet/*` (excluding categories) → `Bouquets` folder
   - `/api/bouquet/categories/*` → `Categories` folder
   - `/api/dashboard/*` → `Dashboard` folder
   - `/api/cart/*` → `Cart (Auth Required)` folder
   - `/api/feedback-questions-templates/*` → `Feedback Questions Templates` folder
   - `/api/feedback/*` → `Feedback` folder
   - `/api/forms/*` → `Forms` folder
   - `/api/submissions/*` → `Submissions` folder
   - `/api/coupons/*` → `Coupons` folder
   - `/api/newsletter/subscribe`, `/api/newsletter/unsubscribe`, `/api/newsletter/unsubscribe/email` → `Newsletter` folder **(create if missing)**
   - `/api/newsletter/subscribers/*` → `Newsletter Subscribers` folder **(create if missing)**
   - `/api/promos/*` → `Promos` folder **(create if missing)**
   - `/api/campaigns/*` → `Campaigns` folder **(create if missing)**
   - `/api/ping` → `System` folder

   **When creating a new folder**, structure it as:
   ```json
   {
     "name": "<Folder Name>",
     "item": [],
     "description": "<Folder description>"
   }
   ```
   Insert it alphabetically among existing folders.

2. **Sort endpoints within a folder** logically:
   - List/index endpoints first
   - Create/store endpoints next
   - Get/show endpoints next
   - Update endpoints next
   - Delete/destroy endpoints last
   - Special actions (toggle, publish, queue, etc.) at the end

3. **Update existing endpoints** if their payload or params changed.

4. **For removed endpoints**: Ask the user before deleting.

5. **Read the collection back** and verify counts match `routes/api.php`.

### Phase 5: Documentation Workflow

After the collection is updated:

1. **Save** the root collection: `SavirBlossom API.postman_collection.json`

2. **Sync to Latest**:
   ```bash
   cp "SavirBlossom API.postman_collection.json" "API-DOCS/Latest/SavirBlossom-API.postman_collection.json"
   ```

3. **Bump version** based on changes:
   - New endpoints → minor bump (1.0.0 → 1.1.0)
   - Breaking changes → major bump (1.0.0 → 2.0.0)
   - Body/response fixes only → patch bump (1.0.0 → 1.0.1)

   Determine the next version by reading the latest CHANGELOG.md entry.

4. **Create snapshot** in `API-DOCS/Updates/`:
   - Generate a **new unique UUID** for `_postman_id` (use `python3 -c "import uuid; print(uuid.uuid4())"`)
   - Add `_meta` block inside `info`:
     ```json
     {
       "info": {
         "_postman_id": "<new-uuid>",
         "name": "SavirBlossom API",
         "_meta": {
           "version": "<semver>",
           "date": "<YYYY-MM-DD>",
           "feature": "<Feature name>",
           "change_notes": ["<change 1>", "<change 2>"],
           "breaking_changes": false
         },
         "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
       },
       "item": [ ... ],
       "auth": { ... },
       "variable": [ ... ]
     }
     ```
   - Snapshot file name: `API-DOCS/Updates/YYYY-MM-DD-Feature-Name.json`
   - If multiple same day: append `-a`, `-b` suffix
   - Breaking change: prefix with `BREAKING-`
   - **IMPORTANT**: The `item`, `auth`, and `variable` arrays must be copied from the latest collection. Do NOT copy the root collection's `info` directly — only use the new UUID and `_meta`.

5. **Update CHANGELOG.md**: Prepend a new entry at the top:
   ```markdown
   ## YYYY-MM-DD — Feature Name (vX.Y.Z)

   - Change note 1
   - Change note 2
   ```

### Phase 6: Validate

```bash
# Validate root collection
python3 -c "import json; json.load(open('SavirBlossom API.postman_collection.json')); print('Root: Valid')"

# Validate latest copy
python3 -c "import json; json.load(open('API-DOCS/Latest/SavirBlossom-API.postman_collection.json')); print('Latest: Valid')"

# Validate snapshot
python3 -c "import json; json.load(open('API-DOCS/Updates/<snapshot-file>.json')); print('Snapshot: Valid')"
```

Verify all 3 files parse correctly and have the expected endpoint count.

## Rules

- **ALWAYS** use Python to manipulate JSON files programmatically. Do NOT manually edit JSON files.
- **ALWAYS** generate unique UUIDs for snapshots using `python3 -c "import uuid; print(uuid.uuid4())"`
- **ALWAYS** read the controller source to extract real validation rules — never guess payloads
- **NEVER** delete endpoints from Postman without asking the user first
- **NEVER** modify the `_postman_id` of the root or Latest collections (they must stay in sync with each other)
- Each snapshot MUST have a unique `_postman_id` (different from root/Latest)
- Follow existing Postman naming conventions: PascalCase for endpoint names, `:paramName` for path variables
- **ALWAYS** validate all 3 JSON files after making changes
- **ALWAYS** update CHANGELOG.md with human-readable change notes
- Endpoint count in root == Latest == snapshot should all match

## Common Endpoint Patterns

| Pattern | Postman Name | Method | Body |
|---------|-------------|--------|------|
| `GET /api/{resource}` | List {Resource}s | GET | None, has query params `page`, `per_page`, `search` |
| `POST /api/{resource}/create` | Create {Resource} | POST | JSON with all required fields |
| `GET /api/{resource}/{id}` | Get {Resource} | GET | None, has path variable |
| `POST /api/{resource}/update/{id}` | Update {Resource} | POST | JSON with updatable fields |
| `POST /api/{resource}/{id}/delete` | Delete {Resource} | POST | None, has path variable |
| `POST /api/{resource}/{id}/toggle` | Toggle {Resource} | POST | None, has path variable |

## Path Variable Naming Convention

| Route Param | Postman Variable | Default |
|------------|-----------------|---------|
| `{id}`, `{customer_id}` | `:customerId` | `1` |
| `{order_id}` | `:orderId` | `1` |
| `{bouquet}` | `:bouquetId` | `1` |
| `{questionId}` | `:questionId` | `1` |
| `{id}` (addresses/coupons/feedback/etc.) | `:id` | `1` |

## Folder Mapping Reference

| Route Prefix | Folder Name |
|-------------|-------------|
| `/api` (ping) | System |
| `/api/auth` | Authentication |
| `/api/customers` | Customers |
| `/api/customers/{id}/orders` | Customer Orders (Auth Required) |
| `/api/addresses` | Addresses |
| `/api/orders` | Orders |
| `/api/invoices` | Invoices |
| `/api/bouquet` (excluding categories) | Bouquets |
| `/api/bouquet/categories` | Categories |
| `/api/dashboard` | Dashboard |
| `/api/cart` | Cart (Auth Required) |
| `/api/feedback-questions-templates` | Feedback Questions Templates |
| `/api/feedback` | Feedback |
| `/api/forms` | Forms |
| `/api/submissions` | Submissions |
| `/api/coupons` | Coupons |
| `/api/newsletter` (subscribe/unsubscribe) | Newsletter |
| `/api/newsletter/subscribers` | Newsletter Subscribers |
| `/api/promos` | Promos |
| `/api/campaigns` | Campaigns |
