# Push to GitHub - Instructions

Due to permission restrictions in Cursor's terminal, please run these commands in your **Terminal app** (outside Cursor):

## Step 1: Navigate to the project
```bash
cd /Users/vikramramanathan/Desktop/Finance-Test-main
```

## Step 2: Initialize git repository (if not already initialized)
```bash
git init
git branch -M main
```

## Step 3: Add the remote repository
```bash
git remote add origin https://github.com/vikramr0908/Finance-Compliance-Test.git
```

If you get "remote origin already exists", update it:
```bash
git remote set-url origin https://github.com/vikramr0908/Finance-Compliance-Test.git
```

## Step 4: Add all files
```bash
git add .
```

## Step 5: Commit
```bash
git commit -m "Initial commit: Finance Compliance Dashboard with mock Supabase and Express backend"
```

## Step 6: Push to GitHub
```bash
git push -u origin main
```

## If you need to authenticate:
- GitHub may prompt for credentials
- Use a Personal Access Token (not password) if 2FA is enabled
- Or use SSH: `git remote set-url origin git@github.com:vikramr0908/Finance-Compliance-Test.git`

## Troubleshooting

If you get permission errors:
- Make sure you're running in Terminal.app (not Cursor's terminal)
- Check that you have write permissions to the directory

If the repository is at home directory level:
```bash
# Check where git thinks the repo is
git rev-parse --show-toplevel

# If it's pointing to home directory, initialize fresh repo
cd /Users/vikramramanathan/Desktop/Finance-Test-main
rm -rf .git  # Only if you want to start fresh
git init
```
