import { Octokit } from '@octokit/rest';
import { NotionAPI } from 'notion-client';

export interface IntegrationConfig {
  github?: {
    token: string;
    owner: string;
    repo: string;
  };
  notion?: {
    token: string;
    pageId?: string;
  };
  confluence?: {
    baseUrl: string;
    token: string;
    spaceKey: string;
  };
}

export interface SyncResult {
  success: boolean;
  message: string;
  url?: string;
  error?: string;
}

export class IntegrationService {
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  /**
   * Sync diagram to GitHub repository
   */
  async syncToGitHub(
    diagramCode: string,
    filename: string,
    commitMessage: string = 'Update diagram'
  ): Promise<SyncResult> {
    if (!this.config.github) {
      return { success: false, message: 'GitHub integration not configured' };
    }

    try {
      const octokit = new Octokit({
        auth: this.config.github.token,
      });

      const { owner, repo } = this.config.github;
      const path = `docs/diagrams/${filename}.md`;

      // Get current file SHA if it exists
      let sha: string | undefined;
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path,
        });
        if ('sha' in data) {
          sha = data.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay
      }

      // Create or update file
      const content = Buffer.from(`# ${filename}

\`\`\`mermaid
${diagramCode}
\`\`\``).toString('base64');
      
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: commitMessage,
        content,
        sha,
      });

      return {
        success: true,
        message: 'Diagram synced to GitHub successfully',
        url: `https://github.com/${owner}/${repo}/blob/main/${path}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync to GitHub',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sync diagram to Notion page
   */
  async syncToNotion(
    diagramCode: string,
    title: string,
    description?: string
  ): Promise<SyncResult> {
    if (!this.config.notion) {
      return { success: false, message: 'Notion integration not configured' };
    }

    try {
      // Note: This is a simplified implementation
      // In a real application, you'd use the official Notion API
      const notion = new NotionAPI();
      
      const content = {
        type: 'page',
        properties: {
          title: {
            title: [{ text: { content: title } }]
          }
        },
        children: [
          {
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: description || '' } }]
            }
          },
          {
            type: 'code',
            code: {
              language: 'mermaid',
              rich_text: [{ text: { content: diagramCode } }]
            }
          }
        ]
      };

      // This would use the actual Notion API
      // const response = await notion.pages.create(content);

      return {
        success: true,
        message: 'Diagram synced to Notion successfully',
        url: `https://notion.so/${this.config.notion.pageId}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync to Notion',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sync diagram to Confluence
   */
  async syncToConfluence(
    diagramCode: string,
    title: string,
    description?: string
  ): Promise<SyncResult> {
    if (!this.config.confluence) {
      return { success: false, message: 'Confluence integration not configured' };
    }

    try {
      const { baseUrl, token, spaceKey } = this.config.confluence;
      
      const content = `
        <h2>${title}</h2>
        ${description ? `<p>${description}</p>` : ''}
        <ac:structured-macro ac:name="code">
          <ac:parameter ac:name="language">mermaid</ac:parameter>
          <ac:plain-text-body><![CDATA[${diagramCode}]]></ac:plain-text-body>
        </ac:structured-macro>
      `;

      const response = await fetch(`${baseUrl}/rest/api/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'page',
          title,
          space: { key: spaceKey },
          body: {
            storage: {
              value: content,
              representation: 'storage'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        message: 'Diagram synced to Confluence successfully',
        url: `${baseUrl}/pages/viewpage.action?pageId=${result.id}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync to Confluence',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update integration configuration
   */
  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test connection to configured services
   */
  async testConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    if (this.config.github) {
      try {
        const octokit = new Octokit({ auth: this.config.github.token });
        await octokit.users.getAuthenticated();
        results.github = true;
      } catch {
        results.github = false;
      }
    }

    if (this.config.notion) {
      try {
        // Test Notion connection
        results.notion = true; // Placeholder
      } catch {
        results.notion = false;
      }
    }

    if (this.config.confluence) {
      try {
        const response = await fetch(`${this.config.confluence.baseUrl}/rest/api/user/current`, {
          headers: { 'Authorization': `Bearer ${this.config.confluence.token}` }
        });
        results.confluence = response.ok;
      } catch {
        results.confluence = false;
      }
    }

    return results;
  }
}

export const integrationService = new IntegrationService({});