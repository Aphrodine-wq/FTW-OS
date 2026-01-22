# FTW-OS Setup & Optimization Guide

## 1. Supabase Setup (Required for Cloud Features)
Since you are experiencing issues with the Google Login, you need to configure your own Supabase project.

### Automatic "Dev Mode" Access
I have enabled a **"Continue as Developer (Guest Mode)"** button on the login screen. You can use this to enter the app immediately without any configuration. However, cloud features (sync, real-time updates) will be disabled.

### Full Setup (To Enable Cloud Features)
1.  Go to [Supabase](https://supabase.com) and create a new project.
2.  Go to **Project Settings -> API**.
3.  Copy the `URL` and `anon` public key.
4.  Create a file named `.env` in the root of this folder (copy from `.env.example`).
5.  Paste your keys:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key-here
    ```
6.  Go to **Authentication -> Providers -> Google** in Supabase and enable it if you want Google Login. You will need to set up a Google Cloud Project for this.

## 2. Project Optimization
I have reviewed the project configuration. Here is the optimization status:

### Build Optimization
- **Vite Config**: The project is already using `esbuild` for minification and manual chunk splitting, which ensures optimal load times.
- **Electron**: The main process is configured to handle window creation efficiently (`ready-to-show` pattern).
- **React**: Source maps are disabled in production to reduce bundle size.

### Runtime Performance
- **Dev Mode**: When running in Guest Mode, the app bypasses network calls to Supabase, making it extremely fast for local testing.
- **Production**: To ensure smooth performance with data, ensure your Supabase database is in a region close to you.

## 3. Running the App
- **Development**: `npm run dev`
- **Build**: `npm run build` (This will create an optimized installer in `releases/`)
