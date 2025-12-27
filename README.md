
# ShiftGuard Pro 🛡️

A high-performance workforce tracking dashboard designed for 8-hour shift monitoring and real-time absence tracking for 66 workers.

## 🚀 Deployment to GitHub Pages

To publish this app on your own GitHub account:

1. **Create a GitHub Repository**: Name it `shiftguard-pro`.
2. **Setup Secrets**:
   - Navigate to your repo: **Settings** > **Secrets and variables** > **Actions**.
   - Create a **New repository secret**.
   - **Name**: `API_KEY`
   - **Value**: Your Google Gemini API Key.
3. **Upload Files**:
   ```bash
   git init
   git add .
   git commit -m "Initialize ShiftGuard Pro"
   git remote add origin https://github.com/YOUR_USERNAME/shiftguard-pro.git
   git push -u origin main
   ```
4. **Enable Pages Deployment**:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
   - The included workflow in `.github/workflows/deploy.yml` will handle the rest.

## 🛠️ Security Roles
- **Owner**: Full system access, registration logs, user management. (Code: `elzohery123`)
- **Admin**: Shift management, bulk actions, and reporting. (Code: `meti123`)
- **User**: Individual tracking and personal movement history.

---
*Authorized Personnel Only • v4.5.2*
