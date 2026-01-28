# How to Deploy to GitHub Pages

Since we are using Supabase (Cloud Database), you can host your Frontend anywhere! GitHub Pages is free and easy.

## 1. Preparation (Already Done ✅)
- We switched to `HashRouter` (adds `#` to URLs to prevent 404 errors).
- We configured the build to be portable.

## 2. One-Time Setup
1.  **Create a GitHub Repo**: Go to GitHub and create a new public repository (e.g., `daily-quest`).
2.  **Connect your Code**:
    Open your terminal in the project folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/daily-quest.git
    ```
3.  **Install Deploy Tool**:
    ```bash
    npm install --save-dev gh-pages
    ```

## 3. Deploying 🚀
Whenever you want to update the live site, just run:
```bash
npm run deploy
```
This command will:
1.  Build your app.
2.  Upload the `dist` folder to a special `gh-pages` branch on GitHub.
3.  Your site will be live at `https://YOUR_USERNAME.github.io/daily-quest/`!

## Important: Supabase URL
Your `.env` file is **not** uploaded to GitHub (for security).
- Go to your **GitHub Repo Settings** -> **Secrets and variables** -> **Actions** (or Pages).
- Actually, since this is a client-side React app, your Supabase Keys (`URL` and `ANON_KEY`) **ARE** visible to anyone who inspects the code. This is normal for Supabase.
- **Action**: You must manually create an `.env` file or set "Environment Variables" in your build pipeline if you were using a CI/CD.
- **Simpler Way for GH Pages**: Since the build runs *on your computer* before uploading, the `.env` file on your computer is used. So it just works! You don't need to do anything extra on GitHub.
