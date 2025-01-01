interface ImportMetaEnv {
    readonly VITE_BACKEND_API_URL: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_REACT_APP_ZEGO_APP_ID: string;
    readonly VITE_REACT_APP_ZEGO_SERVER_SECRET: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  