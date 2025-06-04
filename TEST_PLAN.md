# CI/CD Setup Test Plan

## Overview
This test plan verifies the complete CI/CD pipeline setup for the RelaxBlock browser extension, including automated testing, linting, building, and deployment to Chrome Web Store and Edge Add-ons.

## Test Environment
- GitHub Actions runners (ubuntu-latest)
- Node.js 20.x
- Chrome/Chromium for E2E tests
- Local development environment for initial testing

## Test Cases

### 1. ESLint Configuration
**Objective**: Verify ESLint is properly configured and catches code issues

**Steps**:
1. Run `npm install` to install dependencies
2. Run `npm run lint` to check all JavaScript files
3. Introduce a linting error (e.g., unused variable)
4. Run `npm run lint` again and verify it catches the error
5. Run `npm run lint:fix` to auto-fix issues

**Expected Results**:
- ESLint runs without configuration errors
- Catches code style violations
- Auto-fixes simple issues

### 2. Unit Tests
**Objective**: Verify Jest unit tests run correctly

**Steps**:
1. Run `npm test`
2. Run `npm run coverage`
3. Check coverage report in `coverage/` directory

**Expected Results**:
- Tests pass (currently placeholder tests)
- Coverage report is generated
- No Jest configuration errors

### 3. E2E Tests
**Objective**: Verify Puppeteer E2E tests work with the extension

**Steps**:
1. Run `npm run test:e2e`
2. Observe browser automation
3. Check test results

**Expected Results**:
- Puppeteer launches browser with extension loaded
- Extension functionality is tested
- All E2E tests pass

### 4. Build Script
**Objective**: Verify the extension packages correctly

**Steps**:
1. Run `npm run build`
2. Check `build/relaxblock.zip` is created
3. Unzip and verify contents
4. Load unpacked extension in Chrome to verify it works

**Expected Results**:
- Zip file created successfully
- Contains all necessary files (manifest.json, *.js, *.html, *.css, icons/)
- Excludes unnecessary files (node_modules, test files, etc.)
- Extension loads and works when unpacked

### 5. CI Workflow (Pull Request)
**Objective**: Verify CI runs on pull requests

**Steps**:
1. Create a new branch
2. Make a small change
3. Create a pull request to main
4. Observe GitHub Actions

**Expected Results**:
- CI workflow triggers automatically
- Runs lint, test, e2e, and build jobs in parallel
- All checks pass
- Build artifact is uploaded

### 6. CD Workflow (Main Branch)
**Objective**: Verify deployment workflow on main branch

**Steps**:
1. Merge PR to main branch
2. Observe GitHub Actions deploy workflow
3. Check version bump in manifest.json and package.json
4. Verify GitHub Release is created

**Expected Results**:
- Deploy workflow triggers on main branch
- Version is automatically bumped
- Zip file is created
- GitHub Release is created with zip attachment
- If secrets are configured, deploys to stores

### 7. Store Deployment (Manual Verification)
**Objective**: Verify store deployment works when secrets are configured

**Prerequisites**:
- GitHub Secrets must be configured:
  - CHROME_EXTENSION_ID
  - CHROME_CLIENT_ID, CHROME_CLIENT_SECRET, CHROME_REFRESH_TOKEN
  - EDGE_PRODUCT_ID
  - EDGE_CLIENT_ID, EDGE_CLIENT_SECRET, EDGE_ACCESS_TOKEN_URL

**Steps**:
1. Configure all required secrets in GitHub repository settings
2. Push to main branch
3. Monitor deployment workflow
4. Check Chrome Web Store developer dashboard
5. Check Edge Add-ons developer dashboard

**Expected Results**:
- Extension uploads successfully to both stores
- Version matches the auto-bumped version
- No deployment errors

## Rollback Plan
If deployment fails:
1. Check GitHub Actions logs for specific errors
2. If store deployment fails, manually upload the zip from GitHub Release
3. Fix issues and create new commit to trigger deployment again
4. Version will automatically increment on next deployment

## Success Criteria
- [ ] All local npm scripts work correctly
- [ ] CI runs on every PR
- [ ] All CI checks must pass before merge
- [ ] CD runs on main branch pushes
- [ ] Version auto-increments
- [ ] GitHub Releases are created
- [ ] Extension can be deployed to stores (when secrets configured)