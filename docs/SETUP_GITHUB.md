# GitHub setup

1. Create a repo at [https://github.com/new](https://github.com/new) (public is fine for sharing).
2. Do **not** initialize with README / `.gitignore` / license if this project folder already has them.
3. Add the remote and push:

```bash
cd /Users/amyzhao/Projects/FinTerms
git remote add origin https://github.com/YOUR_USERNAME/FinTerms.git
git push -u origin main
```

If `origin` already exists, use `git remote set-url origin …` instead of `add`.
