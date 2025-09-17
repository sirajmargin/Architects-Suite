import { Octokit } from '@octokit/rest';

export interface RepoConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
  diagramPaths: string[];
  excludePaths?: string[];
}

export interface DiagramChange {
  filename: string;
  path: string;
  content: string;
  action: 'added' | 'modified' | 'deleted';
  oldContent?: string;
}

export interface UpdateResult {
  success: boolean;
  updatedDiagrams: string[];
  errors: string[];
  commitSha?: string;
}

export class CICDBotService {
  private octokit: Octokit;
  private config: RepoConfig;

  constructor(config: RepoConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
    });
  }

  /**
   * Monitor repository for diagram changes
   */
  async monitorRepository(): Promise<void> {
    try {
      // Set up webhook listener for repository events
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`;
      
      await this.octokit.repos.createWebhook({
        owner: this.config.owner,
        repo: this.config.repo,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: process.env.GITHUB_WEBHOOK_SECRET
        },
        events: ['push', 'pull_request']
      });

    } catch (error) {
      console.error('Failed to set up repository monitoring:', error);
    }
  }

  /**
   * Process repository changes and update diagrams
   */
  async processChanges(commitSha: string): Promise<UpdateResult> {
    try {
      const changes = await this.detectDiagramChanges(commitSha);
      const updatedDiagrams: string[] = [];
      const errors: string[] = [];

      for (const change of changes) {
        try {
          await this.processDiagramChange(change);
          updatedDiagrams.push(change.filename);
        } catch (error) {
          errors.push(`Failed to process ${change.filename}: ${error}`);
        }
      }

      // If we made updates, commit them back
      if (updatedDiagrams.length > 0) {
        const newCommitSha = await this.commitUpdates(
          updatedDiagrams,
          `Auto-update diagrams: ${updatedDiagrams.join(', ')}`
        );
        
        return {
          success: true,
          updatedDiagrams,
          errors,
          commitSha: newCommitSha
        };
      }

      return {
        success: true,
        updatedDiagrams,
        errors
      };

    } catch (error) {
      return {
        success: false,
        updatedDiagrams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Detect diagram-related changes in a commit
   */
  private async detectDiagramChanges(commitSha: string): Promise<DiagramChange[]> {
    const { data: commit } = await this.octokit.repos.getCommit({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: commitSha
    });

    const changes: DiagramChange[] = [];

    for (const file of commit.files || []) {
      if (this.isDiagramFile(file.filename)) {
        let oldContent: string | undefined;
        
        // Get old content for modified files
        if (file.status === 'modified' && file.previous_filename) {
          try {
            const { data: oldFile } = await this.octokit.repos.getContent({
              owner: this.config.owner,
              repo: this.config.repo,
              path: file.previous_filename,
              ref: commit.parents[0]?.sha
            });
            
            if ('content' in oldFile) {
              oldContent = Buffer.from(oldFile.content, 'base64').toString();
            }
          } catch (error) {
            // File might not exist in previous commit
          }
        }

        changes.push({
          filename: file.filename,
          path: file.filename,
          content: file.patch || '',
          action: file.status as 'added' | 'modified' | 'deleted',
          oldContent
        });
      }
    }

    return changes;
  }

  /**
   * Check if a file is a diagram file
   */
  private isDiagramFile(filename: string): boolean {
    // Check if file is in configured diagram paths
    const isInDiagramPath = this.config.diagramPaths.some(path => 
      filename.startsWith(path)
    );

    // Check if file is excluded
    const isExcluded = this.config.excludePaths?.some(path => 
      filename.startsWith(path)
    ) || false;

    // Check file extensions that might contain diagrams
    const diagramExtensions = ['.md', '.mmd', '.mermaid', '.puml', '.plantuml'];
    const hasValidExtension = diagramExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext)
    );

    return isInDiagramPath && !isExcluded && hasValidExtension;
  }

  /**
   * Process a single diagram change
   */
  private async processDiagramChange(change: DiagramChange): Promise<void> {
    if (change.action === 'deleted') {
      // Handle diagram deletion
      await this.handleDiagramDeletion(change);
      return;
    }

    // Get the current file content
    const { data: fileData } = await this.octokit.repos.getContent({
      owner: this.config.owner,
      repo: this.config.repo,
      path: change.path
    });

    if ('content' in fileData) {
      const content = Buffer.from(fileData.content, 'base64').toString();
      await this.analyzeDiagramContent(change.path, content);
    }
  }

  /**
   * Analyze diagram content and generate updates
   */
  private async analyzeDiagramContent(filePath: string, content: string): Promise<void> {
    // Extract diagram code from markdown or other formats
    const diagramBlocks = this.extractDiagramBlocks(content);
    
    for (const block of diagramBlocks) {
      // Validate diagram syntax
      const validation = await this.validateDiagramSyntax(block.type, block.content);
      
      if (!validation.valid) {
        // Create an issue for invalid syntax
        await this.createIssueForInvalidDiagram(filePath, validation.errors);
      } else {
        // Generate updated documentation
        await this.generateDiagramDocumentation(filePath, block);
      }
    }
  }

  /**
   * Extract diagram blocks from file content
   */
  private extractDiagramBlocks(content: string): Array<{type: string, content: string}> {
    const blocks: Array<{type: string, content: string}> = [];
    
    // Match mermaid blocks
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = mermaidRegex.exec(content)) !== null) {
      blocks.push({
        type: 'mermaid',
        content: match[1].trim()
      });
    }

    // Match PlantUML blocks
    const plantumlRegex = /```plantuml\n([\s\S]*?)\n```/g;
    while ((match = plantumlRegex.exec(content)) !== null) {
      blocks.push({
        type: 'plantuml',
        content: match[1].trim()
      });
    }

    return blocks;
  }

  /**
   * Validate diagram syntax
   */
  private async validateDiagramSyntax(type: string, content: string): Promise<{valid: boolean, errors: string[]}> {
    const errors: string[] = [];
    
    try {
      switch (type) {
        case 'mermaid':
          // Basic mermaid syntax validation
          if (!content.trim()) {
            errors.push('Empty diagram content');
          }
          if (!content.includes('graph') && !content.includes('flowchart') && 
              !content.includes('sequenceDiagram') && !content.includes('classDiagram')) {
            errors.push('Invalid or missing diagram type declaration');
          }
          break;
          
        case 'plantuml':
          if (!content.includes('@startuml') || !content.includes('@enduml')) {
            errors.push('Missing @startuml or @enduml declarations');
          }
          break;
      }
    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create GitHub issue for invalid diagram
   */
  private async createIssueForInvalidDiagram(filePath: string, errors: string[]): Promise<void> {
    const title = `Invalid diagram syntax in ${filePath}`;
    const body = `
## Diagram Validation Failed

**File:** \`${filePath}\`

**Errors:**
${errors.map(error => `- ${error}`).join('\n')}

**Action Required:**
Please review and fix the diagram syntax. The CI/CD bot detected these issues during automatic validation.

**Help:**
- [Mermaid Documentation](https://mermaid-js.github.io/mermaid/)
- [PlantUML Documentation](https://plantuml.com/)

---
*This issue was automatically created by the Architects Suite CI/CD bot.*
    `;

    await this.octokit.issues.create({
      owner: this.config.owner,
      repo: this.config.repo,
      title,
      body,
      labels: ['diagram-validation', 'automated-issue']
    });
  }

  /**
   * Generate documentation for diagram
   */
  private async generateDiagramDocumentation(filePath: string, block: {type: string, content: string}): Promise<void> {
    // Generate metadata file
    const metadataPath = filePath.replace(/\.(md|mmd|mermaid)$/, '.diagram-meta.json');
    
    const metadata = {
      type: block.type,
      generatedAt: new Date().toISOString(),
      sourceFile: filePath,
      complexity: this.calculateDiagramComplexity(block.content),
      elements: this.countDiagramElements(block.content)
    };

    // Create or update metadata file
    await this.updateFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Calculate diagram complexity score
   */
  private calculateDiagramComplexity(content: string): number {
    const lines = content.split('\n').length;
    const nodes = (content.match(/\[[^\]]+\]/g) || []).length;
    const connections = (content.match(/-->/g) || []).length;
    
    return Math.round((lines + nodes + connections) / 10);
  }

  /**
   * Count diagram elements
   */
  private countDiagramElements(content: string): {nodes: number, edges: number, lines: number} {
    return {
      nodes: (content.match(/\[[^\]]+\]/g) || []).length,
      edges: (content.match(/-->/g) || []).length,
      lines: content.split('\n').length
    };
  }

  /**
   * Handle diagram deletion
   */
  private async handleDiagramDeletion(change: DiagramChange): Promise<void> {
    // Clean up associated metadata files
    const metadataPath = change.path.replace(/\.(md|mmd|mermaid)$/, '.diagram-meta.json');
    
    try {
      await this.octokit.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path: metadataPath,
        message: `Remove metadata for deleted diagram: ${change.filename}`,
        sha: await this.getFileSha(metadataPath)
      });
    } catch (error) {
      // File might not exist, which is okay
    }
  }

  /**
   * Update or create a file in the repository
   */
  private async updateFile(path: string, content: string): Promise<void> {
    let sha: string | undefined;
    
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path
      });
      
      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist, that's okay
    }

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.config.owner,
      repo: this.config.repo,
      path,
      message: `Auto-update: ${path}`,
      content: Buffer.from(content).toString('base64'),
      sha
    });
  }

  /**
   * Get file SHA
   */
  private async getFileSha(path: string): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      owner: this.config.owner,
      repo: this.config.repo,
      path
    });
    
    if ('sha' in data) {
      return data.sha;
    }
    
    throw new Error('Could not get file SHA');
  }

  /**
   * Commit all pending updates
   */
  private async commitUpdates(updatedFiles: string[], message: string): Promise<string> {
    // This is a simplified implementation
    // In practice, you'd batch multiple file updates into a single commit
    const { data } = await this.octokit.repos.createCommit({
      owner: this.config.owner,
      repo: this.config.repo,
      message,
      tree: '', // Would need to build tree with all changes
      parents: [] // Would need parent commit SHAs
    });

    return data.sha;
  }

  /**
   * Update bot configuration
   */
  updateConfig(newConfig: Partial<RepoConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.octokit = new Octokit({
      auth: this.config.token,
    });
  }
}