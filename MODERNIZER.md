# Angular Modernizer Playbook

## Overview

This playbook defines the modernization passes for this Angular codebase. The agent must execute passes in order, one at a time, and generate a report after each pass.

---

## Pass 1: Standalone Components Migration

### Objective
Convert all NgModule-based components, directives, and pipes to standalone, and remove all NgModules.

### Instructions

**Important:** Do NOT use the Angular CLI migration schematic. The migration must be done manually as follows:

#### Step 1: Inventory All Modules
1. Find all `.module.ts` files in the project
2. For each module, document:
   - Module name and file path
   - All declarations (components, directives, pipes)
   - All imports (other modules)
   - All exports
   - All providers
   - Whether it's a routing module or feature module

#### Step 2: Migrate Declarations to Standalone
For each declaration in each module (components, directives, pipes):

1. Add `standalone: true` to the decorator metadata
2. Review the component's template file and identify all:
   - Other components used
   - Directives used (e.g., `*ngIf`, `*ngFor`, `routerLink`, etc.)
   - Pipes used
3. Add the `imports` array to the decorator with all required:
   - Standalone components
   - Standalone directives (e.g., `RouterLink`, `RouterLinkActive`)
   - Angular CommonModule directives/pipes if needed (import individually: `NgIf`, `NgFor`, `AsyncPipe`, etc.)
   - Angular modules that are still required (e.g., `FormsModule`, `ReactiveFormsModule`)
4. Remove the component/directive/pipe from the module's `declarations` array
5. If the component was exported, ensure it can still be accessed by importing it directly

**Note:** Migrate leaf components first (components that don't use other custom components), then work up to parent components.

#### Step 3: Handle Services and Providers
1. Review any providers in the module
2. Ensure services use `providedIn: 'root'` or are provided at the appropriate component level
3. Remove module-level providers and update services accordingly

#### Step 4: Delete Empty Modules
When all declarations have been removed from a module:

1. Delete the module file
2. Find all references to the deleted module:
   - Other module imports
   - Routing configurations (`loadChildren`, etc.)
   - Component imports
3. Fix all references - components should now be imported directly

#### Step 5: Convert Routing Modules to Routes Files
For each routing module:

1. Create a new `.routes.ts` file with the same base name (e.g., `app-routing.module.ts` → `app.routes.ts`)
2. Export a constant routes array:
   ```typescript
   import { Routes } from '@angular/router';
   
   export const ROUTES: Routes = [
     // route definitions
   ];
   ```
3. Update any lazy-loaded routes to use `loadComponent` instead of `loadChildren` where appropriate:
   ```typescript
   {
     path: 'feature',
     loadComponent: () => import('./feature/feature.component').then(m => m.FeatureComponent)
   }
   ```
4. Delete the old routing module file
5. Update `provideRouter` or `RouterModule.forRoot` calls to use the new routes constant

#### Step 6: Final Cleanup
1. Ensure all modules have been deleted
2. Run the build command:
   ```bash
   npm run build
   ```
3. Run the test command:
   ```bash
   npm test -- --watch=false
   ```
4. Fix any remaining compilation or test errors

#### Step 7: Generate Report
Generate `modernizer-report.md` with:
- Modules found and processed
- Components/directives/pipes migrated
- Files deleted
- Files changed summary
- Build/test result
- Any manual follow-ups needed

#### Step 8: Commit and Push
Commit and push changes to a new branch.

### Success Criteria
- All components, directives, and pipes converted to standalone
- All NgModule files deleted
- Routing converted to `.routes.ts` files with constants
- Build completes (success or documented failures)
- Tests run (pass or fail documented)
- Report generated with clear status

### Constraints
- Do NOT proceed to additional passes
- Do NOT use `ng generate @angular/core:migrate-to-standalone`
- Do NOT make changes beyond what's required for standalone migration
- Do NOT modify test files unless absolutely necessary for compilation
- Migrate leaf components first before parent components

---

## Report Format

After completing Pass 1, generate `modernizer-report.md` following this template:

```markdown
# Modernizer Pass Report

## Pass: Standalone Components Migration

## Modules Processed
| Module | File Path | Status |
|--------|-----------|--------|
| AppModule | src/app/app.module.ts | Deleted |
| AppRoutingModule | src/app/app-routing.module.ts | Converted to app.routes.ts |

## Components Migrated
| Component | File Path | Status |
|-----------|-----------|--------|
| AppComponent | src/app/app.component.ts | Standalone |

## Directives Migrated
| Directive | File Path | Status |
|-----------|-----------|--------|
| ExampleDirective | src/app/example.directive.ts | Standalone |

## Pipes Migrated
| Pipe | File Path | Status |
|------|-----------|--------|
| ExamplePipe | src/app/example.pipe.ts | Standalone |

## Files Changed Summary
| File | Change Type |
|------|-------------|
| src/app/app.module.ts | Deleted |
| src/app/app.component.ts | Updated (standalone: true, imports added) |
| src/app/app.routes.ts | Created |

## Build/Test Result
- **Build:** ✅ Success / ❌ Failed
- **Tests:** ✅ X/X passed / ❌ X/X failed

## Manual Follow-ups
- [ ] List any items requiring manual review

## Next Steps
Merge this PR and proceed to Pass 2: Control Flow Syntax
```

---

## Notes

- This playbook is intentionally minimal to prevent scope creep
- Each pass is self-contained and produces a verifiable artifact
- The agent should stop after completing the assigned pass
- Manual migration is preferred over schematics for more control and understanding of the codebase
