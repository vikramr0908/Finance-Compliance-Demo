# Setup New GitHub Repository

## Step 1: Create New Repo on GitHub

1. Go to: https://github.com/new
2. Choose a repository name (e.g., `Finance-Test` or `Finance-Compliance-Dashboard`)
3. Choose Public or Private
4. **DO NOT** check "Initialize with README" or add .gitignore/license
5. Click **Create repository**

## Step 2: Connect Local Repo to New GitHub Repo

**Run these commands in Terminal.app** (not Cursor's terminal):

```bash
# Navigate to project
cd /Users/vikramramanathan/Desktop/Finance-Test-main

# Remove old remote (if it still exists)
git remote remove origin

# Add new remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify remote is set correctly
git remote -v

# Push to new repo
git push -u origin main
```

## Example

If your GitHub username is `vikramr0908` and repo name is `Finance-Test`:

```bash
cd /Users/vikramramanathan/Desktop/Finance-Test-main
git remote remove origin
git remote add origin https://github.com/vikramr0908/Finance-Test.git
git push -u origin main
```

## If You Get Authentication Errors

GitHub may ask for credentials. Use:
- **Personal Access Token** (not password) if 2FA is enabled
- Or use SSH instead:
  ```bash
  git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
  ```

## Quick Alternative: Use GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Select: `/Users/vikramramanathan/Desktop/Finance-Test-main`
4. Repository → Repository Settings → Remote
5. Change URL to your new repo
6. Click Save
7. Push using GitHub Desktop UI
