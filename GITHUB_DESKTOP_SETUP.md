# Setting up GitHub Desktop

## Option 1: Add Existing Repository (Recommended)

1. **Open GitHub Desktop**
2. Click **File** → **Add Local Repository**
3. Navigate to: `/Users/vikramramanathan/Desktop/Finance-Test-main`
4. Click **Add Repository**

If GitHub Desktop says it's not a git repository, you'll need to initialize it first (see Option 2).

## Option 2: Initialize Git First, Then Add to GitHub Desktop

If the repository isn't initialized yet, run these commands in Terminal:

```bash
cd /Users/vikramramanathan/Desktop/Finance-Test-main
git init
git branch -M main
```

Then follow Option 1 above.

## Option 3: Clone/Publish from GitHub Desktop

1. **Open GitHub Desktop**
2. Click **File** → **New Repository**
3. Fill in:
   - **Name**: `Finance-Compliance-Test`
   - **Local Path**: `/Users/vikramramanathan/Desktop/`
   - **Git Ignore**: Node
   - **License**: None (or choose one)
4. Click **Create Repository**
5. Copy all files from `Finance-Test-main` to the new repository folder
6. In GitHub Desktop, you'll see all the files as changes
7. Write commit message: "Initial commit: Finance Compliance Dashboard"
8. Click **Commit to main**
9. Click **Publish repository** (top right)
10. Make sure it's set to publish to: `vikramr0908/Finance-Compliance-Test`

## Option 4: Connect Existing Local Repo to GitHub

If you already have a local git repository:

1. **Open GitHub Desktop**
2. **File** → **Add Local Repository**
3. Select: `/Users/vikramramanathan/Desktop/Finance-Test-main`
4. If prompted, click **Create a repository** or **Publish repository**
5. Choose: **vikramr0908/Finance-Compliance-Test** as the remote
6. Click **Publish Repository**

## Troubleshooting

### If GitHub Desktop can't find the repository:
- Make sure you're selecting the correct folder (`Finance-Test-main`)
- Check that `.git` folder exists (it might be hidden)

### If you get permission errors:
- Make sure GitHub Desktop has Full Disk Access:
  - System Settings → Privacy & Security → Full Disk Access
  - Add GitHub Desktop to the list

### If the remote URL is wrong:
1. In GitHub Desktop, go to **Repository** → **Repository Settings**
2. Click **Remote** tab
3. Change the URL to: `https://github.com/vikramr0908/Finance-Compliance-Test.git`
4. Click **Save**

## Quick Steps Summary

**Easiest method:**
1. Open GitHub Desktop
2. File → Add Local Repository
3. Select `/Users/vikramramanathan/Desktop/Finance-Test-main`
4. If not a git repo, GitHub Desktop will offer to initialize it
5. Commit all changes
6. Publish to `vikramr0908/Finance-Compliance-Test`
