/**
 * 搜索管理器，处理与Bing搜索API的交互
 */

// 定义搜索请求参数类型
export type SearchParams = {
  query: string;
  count?: number;
  offset?: number;
};

// 定义搜索结果类型
export type SearchResult = {
  webPages?: {
    value: Array<{
      name: string;
      url: string;
      snippet: string;
    }>;
    totalEstimatedMatches?: number;
  };
  error?: {
    message: string;
  };
};

/**
 * 执行Bing搜索查询
 * @param apiKey Bing搜索API密钥
 * @param params 搜索参数
 * @returns 搜索结果
 */
export const performSearch = async (
  apiKey: string,
  params: SearchParams
): Promise<SearchResult> => {
  try {
    if (!apiKey) {
      return {
        error: {
          message: "Bing Search API key not found.",
        },
      };
    }

    const { query, count = 5, offset = 0 } = params;
    const endpoint = "https://api.bing.microsoft.com/v7.0/search";
    const url = new URL(endpoint);
    url.searchParams.append("q", query);
    url.searchParams.append("count", count.toString());
    url.searchParams.append("offset", offset.toString());
    url.searchParams.append("responseFilter", "Webpages");
    url.searchParams.append("mkt", "en-US");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Search API responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as SearchResult;
  } catch (error) {
    console.error("Error in search manager:", error);
    return {
      error: {
        message: error.message || "An error occurred during search",
      },
    };
  }
};

/**
 * 格式化搜索结果为可读文本
 * @param results 搜索结果对象
 * @returns 格式化后的文本
 */
export const formatSearchResults = (results: SearchResult): string => {
  if (results.error) {
    return `Search Error: ${results.error.message}`;
  }

  if (!results.webPages || results.webPages.value.length === 0) {
    return "No search results found.";
  }

  const formattedResults = results.webPages.value.map((page, index) => {
    return `[${index + 1}] ${page.name}\n${page.url}\n${page.snippet}\n`;
  }).join("\n");

  return `Here are the search results for "${results.webPages.value[0].name.split(" - ")[0]}":\n\n${formattedResults}`;
};

/**
 * 搜索并返回格式化结果的便捷方法
 * @param query 搜索查询
 * @param count 结果数量
 * @returns 格式化的搜索结果
 */
export const searchAndFormatResults = async (
  query: string,
  count: number = 5
): Promise<string> => {
  // const apiKey = getBingSearchApiKey();
  const apiKey = "a8cd83a428d74de38f6e087412071184";
  const results = await performSearch(apiKey, { query, count });
  return formatSearchResults(results);
};
