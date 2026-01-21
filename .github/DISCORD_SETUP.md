# Discord Webhook Setup Guide

This guide will help you set up Discord notifications for git changes in your repository.

## Step 1: Create a Discord Webhook

1. Open your Discord server (https://discord.gg/veQH5jxw)
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Give it a name (e.g., "GitHub Bot")
5. Choose the channel where you want notifications
6. Click **Copy Webhook URL**
7. Save this URL - you'll need it in the next step

## Step 2: Add Webhook URL to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DISCORD_WEBHOOK_URL`
5. Value: Paste the webhook URL you copied from Discord
6. Click **Add secret**

## Step 3: Test the Integration

1. Make a commit and push to your repository:
   ```bash
   git add .
   git commit -m "Test Discord notification"
   git push
   ```

2. Check your Discord channel - you should see a notification!

## What Gets Notified?

The workflow will send notifications for:
- ✅ Pushes to `main`, `master`, or `develop` branches
- ✅ Pull requests (opened, updated, closed)
- ✅ Manual workflow triggers

Each notification includes:
- Repository name
- Branch name
- Commit author
- Commit message
- Commit SHA and link
- List of changed files (up to 10)

## Troubleshooting

### No notifications appearing?

1. **Check GitHub Actions**: Go to your repo → **Actions** tab → Check if the workflow ran
2. **Check webhook URL**: Make sure `DISCORD_WEBHOOK_URL` secret is set correctly
3. **Check Discord permissions**: Ensure the webhook has permission to send messages
4. **Check branch names**: The workflow only triggers on `main`, `master`, or `develop` by default

### Want to customize?

Edit `.github/workflows/discord-notifications.yml` to:
- Add more branches
- Change notification format
- Add more event types
- Customize the message content

## Security Note

⚠️ **Never commit your webhook URL to the repository!** Always use GitHub Secrets.



