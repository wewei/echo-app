interface WebViewPoolConfig {
  maxSize: number;
}

interface WebViewEntry {
  webview: HTMLElement;
  lastAccessed: number;
}

class WebViewPool {
  private static instance: WebViewPool;
  private pool: Map<string, WebViewEntry>;
  private config: WebViewPoolConfig;

  private constructor(config: WebViewPoolConfig) {
    this.pool = new Map();
    this.config = config;
  }

  static getInstance(config: WebViewPoolConfig): WebViewPool {
    if (!WebViewPool.instance) {
      WebViewPool.instance = new WebViewPool(config);
    }
    return WebViewPool.instance;
  }

  getWebView(tabId: string, url: string): HTMLElement {
    // 检查是否已存在对应的WebView
    const existingEntry = this.pool.get(tabId);
    if (existingEntry) {
      existingEntry.lastAccessed = Date.now();
      return existingEntry.webview;
    }

    // 如果池未满，创建新的WebView并加载URL
    if (this.pool.size < this.config.maxSize) {
      const webview = this.createWebView(tabId, url);
      this.pool.set(tabId, {
        webview,
        lastAccessed: Date.now()
      });
      return webview;
    }

    // 使用LRU策略找到最久未使用的WebView
    let oldestTabId: string | null = null;
    let oldestAccessed = Infinity;

    this.pool.forEach((entry, id) => {
      if (entry.lastAccessed < oldestAccessed) {
        oldestAccessed = entry.lastAccessed;
        oldestTabId = id;
      }
    });

    if (oldestTabId) {
      this.removeWebView(oldestTabId);
      const webview = this.createWebView(tabId, url);
      this.pool.set(tabId, {
        webview,
        lastAccessed: Date.now()
      });
      return webview;
    }

    throw new Error('WebViewPool is full and no WebView can be removed.');
  }

  private createWebView(tabId: string, url: string): HTMLElement {
    const webview = document.createElement('webview');
    webview.style.width = '100%';
    webview.style.height = '100%';
    (webview as any).dataset.tabId = tabId.toString();
    webview.src = url;
    return webview;
  }

  removeWebView(tabId: string) {
    this.pool.delete(tabId);
  }

  getTabIdFromWebView(webview: HTMLElement): string | undefined {
    return (webview as any).dataset.tabId;
  }
}

export default WebViewPool;
