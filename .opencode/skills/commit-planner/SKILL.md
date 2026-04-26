---
name: commit-planner
description: Plans and organizes git commits by categorizing changes into logical commits, presents plan for review, then executes
---

## Workflow

When user asks to plan git commits or similar:

### Step 1: Analyze Changes

Run the following commands in parallel:

```
git status
git diff --stat
```

### Step 2: Categorize Changes

Group files by feature/scope:

- **Backend**: Controllers, Models, Middleware, Requests
- **Frontend**: React components, pages, hooks, services
- **Migrations**: Database migration files
- **Config/Infrastructure**: bootstrap, composer, routes, services config
- **UI Components**: Shared UI components
- **Shared/Utils**: Files used by multiple features

### Step 3: Create Commit Plan

Present the organized plan in this format:

```
## Commit Plan

### Commit 1: `Update: <feature description>`
| Category | Files |
|----------|-------|
| **Backend** | file1.php, file2.php |
| **Migrations** | migration files |
| **Frontend** | component files |

... and so on

### Excluded
- cache files (.php-cs-fixer.cache, etc.)
- node_modules
- .opencode/ (skills directory)
- postman/
- AGENTS.md

---

Total: X commits
```

### Step 4: Wait for Confirmation

Ask: "Ready to proceed when you say yes."

### Step 5: Execute Commits

After user confirms:

1. Create a todo list to track progress
2. For each commit:
    - Stage the relevant files
    - Run `git commit -m "Update: <description>"`
    - Update todo status
3. Final status check

## Rules

- **ALWAYS** present plan BEFORE committing
- Group by feature/scope (e.g., "Add customer management feature", "Fix bouquet page")
- **Exclude** cache files:
    - `.php-cs-fixer.cache`
    - `.phpunit.result.cache`
    - `node_modules/`
    - `vendor/`
    - `.env`
- **Exclude** project-specific files:
    - `.opencode/` (skills directory)
    - `postman/`
    - `AGENTS.md`
- **Exclude** files in `.gitignore`
- **Commit message format**: `Update: <description>`
- Group migrations with their related feature
- Group shared files (routes/api.php, root.tsx, etc.) with their primary feature
- **Wait for explicit confirmation** before executing commits
- Use `git add` with specific file paths, not blanket adds
- Track progress with todo list

## Common Categorization

| File Pattern                        | Category       |
| ----------------------------------- | -------------- |
| `app/Http/Controllers/*`            | Backend        |
| `app/Models/*`                      | Backend        |
| `app/Http/Middleware/*`             | Backend        |
| `app/Http/Requests/*`               | Backend        |
| `database/migrations/*`             | Migrations     |
| `resources/js/src/pages/*`          | Frontend       |
| `resources/js/components/*`         | UI Components  |
| `resources/js/services/*`           | Frontend       |
| `resources/js/lib/*`                | Shared         |
| `bootstrap/app.php`                 | Infrastructure |
| `composer.json`, `composer.lock`    | Infrastructure |
| `config/*`                          | Infrastructure |
| `routes/api.php`                    | Infrastructure |
| `package.json`, `package-lock.json` | Infrastructure |
| `tsconfig.json`, `vite.config.js`   | Infrastructure |
