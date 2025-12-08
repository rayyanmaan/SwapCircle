# Vercel NOT_FOUND Error - Complete Fix & Explanation

## 1. The Fix

### Option A: Set Root Directory in Vercel (Recommended)

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "General" → "Root Directory"
3. Set it to: `Backend`
4. Update `vercel.json` at the root to:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

### Option B: Use Vercel's `api` Directory Convention

Create an `api` directory at the root and move/symlink the Backend files, OR create a wrapper:

**Create `api/index.py` at repository root:**

```python
# This file acts as a bridge to Backend/main.py
import sys
from pathlib import Path

# Add Backend directory to Python path
backend_path = Path(__file__).resolve().parent.parent / "Backend"
sys.path.insert(0, str(backend_path))

# Import the FastAPI app from Backend
from main import app

# Export the app for Vercel
handler = app
```

**Update `vercel.json`:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

### Option C: Fix Python Path in vercel.json (Current Approach)

Update your current `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "Backend/main.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "Backend/main.py"
    }
  ]
}
```

**AND create `Backend/vercel.json`:**

```json
{
  "functions": {
    "main.py": {
      "runtime": "python3.12"
    }
  }
}
```

## 2. Root Cause Analysis

### What Was Happening vs. What Should Happen

**What the code was doing:**
- Your `main.py` uses relative imports: `from database.connection import ...`
- These imports assume `Backend/` is the current working directory
- When Vercel runs `Backend/main.py` from the repository root, Python's import system can't find `database`, `routes`, etc. because they're not in `sys.path`

**What it needed to do:**
- Python needs the `Backend` directory in its module search path (`sys.path`)
- OR the working directory needs to be `Backend/`
- OR imports need to be absolute from a package root

### What Triggered the Error

1. **Vercel's deployment process:**
   - Vercel clones your repo and runs from the repository root
   - It tries to execute `Backend/main.py` as specified in `vercel.json`
   - Python's current working directory is the repo root, not `Backend/`
   - When `main.py` tries `from database.connection import ...`, Python looks for `database` in the repo root, not in `Backend/`

2. **Python's import system:**
   - Python searches for modules in:
     - Current directory
     - Directories in `PYTHONPATH`
     - Standard library locations
   - Since `Backend/` isn't in any of these, imports fail → NOT_FOUND

### The Misconception

**The oversight:** Assuming that specifying `Backend/main.py` in `vercel.json` would make `Backend/` the working directory. In reality:
- Vercel executes the file, but doesn't change the working directory
- Python's import system is separate from the file execution path
- Relative imports are relative to the current working directory, not the file's location

## 3. Understanding the Concept

### Why This Error Exists

**Python's Module Search Path (`sys.path`):**
- Python maintains a list of directories to search for modules
- When you do `from database import ...`, Python searches these directories in order
- The current working directory is automatically in `sys.path`
- But subdirectories are NOT automatically added

**What it's protecting you from:**
- Accidental import of wrong modules (name collisions)
- Security issues (importing from unexpected locations)
- Unclear dependencies (making imports explicit)

### The Correct Mental Model

Think of Python imports like this:

```
When Python sees: from database.connection import connect_db

It searches in this order:
1. Current working directory → looks for database/connection.py
2. PYTHONPATH directories → looks for database/connection.py
3. Standard library → looks for database/connection.py
4. Site-packages → looks for database/connection.py

If not found → ModuleNotFoundError / ImportError
```

**For your structure:**
```
Repository Root/
├── Backend/          ← This needs to be in sys.path
│   ├── main.py
│   ├── database/
│   │   └── connection.py
│   └── routes/
└── Frontend/
```

**Solutions map to this model:**
- **Option A (Root Directory):** Makes `Backend/` the working directory → automatically in `sys.path` ✅
- **Option B (api/ wrapper):** Adds `Backend/` to `sys.path` explicitly ✅
- **Option C (vercel.json config):** Tells Vercel to treat `Backend/` as the root ✅

### How This Fits into Framework Design

**Vercel's design philosophy:**
- Serverless functions should be self-contained
- Each function has its own isolated environment
- The entry point should be clear and executable

**FastAPI's design:**
- Designed to work as a Python package or module
- Imports assume a consistent package structure
- Works best when the package root is in `sys.path`

**The mismatch:**
- Vercel expects a single entry point file
- Your code expects a package structure
- The bridge is either: change working directory OR modify `sys.path`

## 4. Warning Signs to Recognize

### Red Flags That Indicate This Issue

1. **Relative imports in entry point:**
   ```python
   # In main.py
   from database.connection import ...  # ⚠️ Assumes Backend/ is in path
   from routes.item_routes import ...  # ⚠️ Same assumption
   ```

2. **File structure with subdirectories:**
   ```
   Backend/
     main.py          ← Entry point
     database/        ← Imported modules
     routes/          ← Imported modules
   ```

3. **Vercel config pointing to nested file:**
   ```json
   {
     "src": "Backend/main.py"  // ⚠️ Working directory mismatch
   }
   ```

### Similar Mistakes to Avoid

1. **Assuming file location = working directory:**
   - ❌ "The file is in `Backend/`, so imports will work"
   - ✅ "The working directory must be `Backend/` OR `Backend/` must be in `sys.path`"

2. **Not testing deployment environment locally:**
   - ❌ Only testing with `python Backend/main.py` from repo root
   - ✅ Test with `cd Backend && python main.py` OR use `vercel dev`

3. **Mixing absolute and relative imports inconsistently:**
   - ❌ Some files use `from database import ...`, others use `from Backend.database import ...`
   - ✅ Choose one pattern and stick with it

### Code Smells

- **Import errors in deployment but not locally** → Path/environment mismatch
- **"Module not found" for clearly existing files** → `sys.path` issue
- **Different behavior between `python file.py` and `python -m module`** → Working directory difference

## 5. Alternative Approaches & Trade-offs

### Approach 1: Set Root Directory (Recommended)
**Pros:**
- ✅ Simplest solution
- ✅ No code changes needed
- ✅ Matches local development (`cd Backend && python main.py`)
- ✅ Clean separation of frontend/backend

**Cons:**
- ⚠️ Requires Vercel dashboard configuration
- ⚠️ Can't deploy frontend and backend from same repo easily

**When to use:** When backend and frontend are separate deployments

### Approach 2: `api/` Directory Wrapper
**Pros:**
- ✅ Follows Vercel conventions
- ✅ Can deploy both frontend and backend from same repo
- ✅ Explicit path manipulation (clear what's happening)

**Cons:**
- ⚠️ Requires creating wrapper file
- ⚠️ Adds indirection layer
- ⚠️ Slightly more complex

**When to use:** When you want to deploy monorepo or follow Vercel's standard structure

### Approach 3: Make Backend a Proper Python Package
**Create `Backend/setup.py`:**
```python
from setuptools import setup, find_packages

setup(
    name="swapcircle-backend",
    version="0.1.0",
    packages=find_packages(),
)
```

**Install in editable mode:**
```bash
pip install -e Backend/
```

**Pros:**
- ✅ Professional Python project structure
- ✅ Works everywhere (local, Vercel, Docker, etc.)
- ✅ Can be published as package

**Cons:**
- ⚠️ More setup complexity
- ⚠️ Requires build step
- ⚠️ Overkill for simple deployments

**When to use:** For production-grade applications or if you plan to distribute the package

### Approach 4: Modify Imports to be Absolute
**Change all imports in `Backend/main.py`:**
```python
# Instead of:
from database.connection import connect_db

# Use:
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database.connection import connect_db
```

**Pros:**
- ✅ Works regardless of working directory
- ✅ Self-contained solution

**Cons:**
- ⚠️ Requires modifying every file or adding path manipulation
- ⚠️ Less clean than other solutions
- ⚠️ Path manipulation can be fragile

**When to use:** Quick fix, but not recommended for long-term

## Recommended Solution

**Use Option A (Set Root Directory)** because:
1. It's the simplest and cleanest
2. Matches your local development workflow
3. Requires minimal changes
4. Most maintainable long-term

## Implementation Steps

1. **In Vercel Dashboard:**
   - Settings → General → Root Directory → Set to `Backend`

2. **Update root `vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "main.py"
       }
     ]
   }
   ```

3. **Test locally with Vercel CLI:**
   ```bash
   cd Backend
   vercel dev
   ```

4. **Redeploy** - The NOT_FOUND error should be resolved!

