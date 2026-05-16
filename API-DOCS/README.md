# SavirBlossom API Documentation

## Structure

```
API-DOCS/
├── Latest/
│   └── SavirBlossom-API.postman_collection.json   # Current up-to-date collection
├── Updates/
│   └── YYYY-MM-DD-Feature-Name.json               # Immutable snapshots per feature
├── README.md                                      # This file
└── CHANGELOG.md                                   # Human-readable change summary
```

## When API Changes Happen

1. **Update** the root collection (`SavirBlossom API.postman_collection.json`)
2. **Sync** to Latest: `cp SavirBlossom\ API.postman_collection.json API-DOCS/Latest/SavirBlossom-API.postman_collection.json`
3. **Create snapshot** in `API-DOCS/Updates/YYYY-MM-DD-Feature-Name.json`
4. **Log** the change in `API-DOCS/CHANGELOG.md`

## Snapshot Format

Each update file is a full Postman collection (importable) wrapped with metadata:

```json
{
  "info": {
    "_postman_id": "<new-uuid>",
    "name": "SavirBlossom API",
    "description": "...",
    "_meta": {
      "version": "<semver>",
      "date": "YYYY-MM-DD",
      "feature": "Feature name",
      "change_notes": ["..."],
      "breaking_changes": false
    },
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [ ... ],
  "auth": { ... },
  "variable": [ ... ]
}
```

## Naming Conventions

| Pattern | Example |
|---|---|
| `YYYY-MM-DD-Feature-Name.json` | `2026-05-16-Form-Submissions-API.json` |
| Multiple same day | `...-a.json`, `...-b.json` |
| Breaking change | `YYYY-MM-DD-BREAKING-Change-Name.json` |
| Bug/patch (no new endpoints) | `YYYY-MM-DD-Fix-Description.json` |

## Versioning (SemVer)

- `1.0.0` — Initial full collection
- `1.1.0` — New endpoints (minor)
- `2.0.0` — Breaking changes (major)
- `1.1.1` — Body/response fixes (patch)

## Validation

Before committing, validate the JSON:

```bash
python3 -c "import json; json.load(open('path/to/file.json')); print('Valid')"
```

Each snapshot must have a **unique** `_postman_id` (generate with `uuidgen` or Python `uuid`).
