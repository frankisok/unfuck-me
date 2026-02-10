# Angular Modernizer Playbook

## Overview

This playbook defines the modernization passes for this Angular codebase. The agent must execute passes in order, one at a time, and generate a report after each pass.

---

## Pass 1: Standalone Components Migration

### Objective
Convert all NgModule-based components, directives, and pipes to standalone.

### Instructions

1. Run the Angular standalone migration:
   ```bash
   ng generate @angular/core:migrate-to-standalone
   ```

2. If trivial compile errors occur, fix them.

3. Run the build command:
   ```bash
   npm run build
   ```

4. Run the test command:
   ```bash
   npm test -- --watch=false
   ```

5. Generate `modernizer-report.md` with:
   - Commands run
   - Files changed summary
   - Build/test result
   - Any manual follow-ups needed

6. Commit and push changes to a new branch.

### Success Criteria
- All components converted to standalone
- Build completes (success or documented failures)
- Tests run (pass or fail documented)
- Report generated with clear status

### Constraints
- Do NOT proceed to additional passes
- Do NOT make changes beyond what's required for standalone migration
- Do NOT modify test files unless absolutely necessary for compilation

---

## Report Format

After completing Pass 1, generate `modernizer-report.md` following this template:

```markdown
# Modernizer Pass Report

## Pass: Standalone Components Migration

### Commands Run
- `ng generate @angular/core:migrate-to-standalone`
- `npm run build`
- `npm test -- --watch=false`

### Files Changed Summary
| File | Change Type |
|------|-------------|
| src/app/app.module.ts | Removed |
| src/app/app.component.ts | Updated (standalone: true) |

### Build/Test Result
- **Build:** ✅ Success / ❌ Failed
- **Tests:** ✅ X/X passed / ❌ X/X failed

### Manual Follow-ups
- [ ] List any items requiring manual review

### Next Steps
Merge this PR and proceed to Pass 2: Control Flow Syntax
```

---

## Notes

- This playbook is intentionally minimal to prevent scope creep
- Each pass is self-contained and produces a verifiable artifact
- The agent should stop after completing the assigned pass
