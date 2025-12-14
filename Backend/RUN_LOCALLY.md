# Running the Backend Locally

## The Problem

When you run `uvicorn` from outside the `Backend` directory, Python can't find your modules because `Backend/` isn't in the Python path.

## Solution: Run from Backend Directory

**Always run uvicorn from the `Backend` directory:**

```bash
cd Backend
uvicorn main:app --reload
```

Or if you're in the repository root:

```bash
cd Backend && uvicorn main:app --reload
```

## Why This Works

When you run `uvicorn main:app` from the `Backend` directory:
- Python's current working directory is `Backend/`
- `Backend/` is automatically added to `sys.path`
- All your relative imports work: `from database.connection import ...`
- All your relative imports work: `from utils.constants import ...`

## Alternative: Use Python Module Syntax

If you must run from the repository root, use:

```bash
python -m uvicorn Backend.main:app --reload
```

But this requires the repository root to be in Python's path, which is more complex.

## Recommended Approach

**Always run from `Backend` directory** - it's simpler and matches how Vercel will run it (when root directory is set to `Backend`).

## Quick Start Script

Create a `run.sh` (Linux/Mac) or `run.bat` (Windows) in the `Backend` directory:

**run.bat (Windows):**
```batch
@echo off
cd /d %~dp0
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**run.sh (Linux/Mac):**
```bash
#!/bin/bash
cd "$(dirname "$0")"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Then you can just run:
```bash
cd Backend
./run.sh  # or run.bat on Windows
```



