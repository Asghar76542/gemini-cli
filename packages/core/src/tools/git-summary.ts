/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { simpleGit } from 'simple-git';
import { BaseTool, ToolResult } from './tools.js';

export interface GitSummaryParams {
  /** Number of commits to include in the summary */
  count?: number;
}

export class GitSummaryTool extends BaseTool<GitSummaryParams, ToolResult> {
  static readonly Name = 'git_summary';

  constructor(private repoPath: string) {
    super(
      GitSummaryTool.Name,
      'GitSummary',
      'Returns the latest commit messages from the git repository.',
      {
        type: 'object',
        properties: {
          count: {
            type: 'integer',
            minimum: 1,
            description: 'How many commits to include. Defaults to 5.',
          },
        },
      },
    );
    this.repoPath = path.resolve(repoPath);
  }

  validateToolParams(params: GitSummaryParams): string | null {
    if (params.count !== undefined && params.count <= 0) {
      return 'count must be a positive integer';
    }
    return null;
  }

  getDescription(params: GitSummaryParams): string {
    const count = params.count ?? 5;
    return `summary of last ${count} commit(s)`;
  }

  async execute(
    params: GitSummaryParams,
    _signal: AbortSignal,
  ): Promise<ToolResult> {
    const error = this.validateToolParams(params);
    if (error) {
      return {
        llmContent: `Error: ${error}`,
        returnDisplay: `Error: ${error}`,
      };
    }
    const count = params.count ?? 5;
    try {
      const git = simpleGit(this.repoPath);
      const log = await git.log({ n: count });
      const lines = log.all.map((c) => `- ${c.hash.slice(0, 7)}: ${c.message}`);
      const content = `Recent commits:\n${lines.join('\n')}`;
      return {
        llmContent: content,
        returnDisplay: `${lines.length} commit(s)`,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        llmContent: `Error retrieving git summary: ${msg}`,
        returnDisplay: `Error: ${msg}`,
      };
    }
  }
}
