# GitHub Actions Workflows

This directory contains CI/CD workflows for the SwapCircle project.

## Workflows

### `backend-tests.yml`
Comprehensive test workflow that:
- Runs on push and pull requests to main/master/develop branches
- Tests against multiple Python versions (3.10, 3.11, 3.12)
- Generates test coverage reports
- Uploads coverage to Codecov (if configured)
- Uploads HTML coverage reports as artifacts

### `backend-tests-simple.yml`
Simplified test workflow that:
- Runs on push and pull requests to main/master/develop branches
- Tests against Python 3.11 only
- Runs tests without coverage reporting
- Faster execution for quick feedback

## Usage

The workflows automatically trigger when:
- Code is pushed to `main`, `master`, or `develop` branches
- Pull requests are opened/updated targeting `main`, `master`, or `develop`
- Only when files in the `Backend/` directory are changed

## Environment Variables

The workflows set the following environment variables for testing:
- `CORS_ORIGINS`: Set to `http://localhost:3000` for CORS configuration
- `MONGODB_URI`: Set to a dummy value (tests use mocks, so actual DB connection not needed)

## Coverage Reports

If using the full workflow (`backend-tests.yml`):
- Coverage XML reports are generated for Codecov integration
- HTML coverage reports are available as downloadable artifacts
- Coverage is only uploaded for Python 3.11 to avoid duplicates

## Customization

To customize the workflows:
1. Edit the workflow files in `.github/workflows/`
2. Adjust Python versions in the `matrix` section
3. Modify test commands as needed
4. Add additional steps for linting, formatting, or other checks

