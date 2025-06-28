/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { BaseTool, ToolResult } from './tools.js';
import { SchemaValidator } from '../utils/schemaValidator.js';

const execAsync = promisify(exec);

export interface GitSummaryToolParams {
  /**
   * Optional path to the git repository. Defaults to current directory.
   */
  path?: string;

  /**
   * Number of commits to include in the summary. Defaults to 5.
   */
  limit?: number;
}

export class GitSummaryTool extends BaseTool<GitSummaryToolParams, ToolResult> {
  static readonly Name = 'git_summary';

  constructor() {
    super(
      GitSummaryTool.Name,
      'GitSummary',
      'Returns a short summary of recent git commits in a repository.',
      {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'Path to the git repository. Defaults to current directory.',
          },
          limit: {
            type: 'number',
            description: 'Number of commits to display. Defaults to 5.',
          },
        },
      },
    );
  }

  validateToolParams(params: GitSummaryToolParams): string | null {
    if (
      !SchemaValidator.validate(
        this.parameterSchema as Record<string, unknown>,
        params,
      )
    ) {
      return 'Parameters failed schema validation.';
    }

    if (params.limit !== undefined && params.limit <= 0) {
      return 'limit must be greater than 0';
    }

    return null;
  }

  async execute(
    params: GitSummaryToolParams,
    _signal: AbortSignal,
  ): Promise<ToolResult> {
    const validationError = this.validateToolParams(params);
    if (validationError) {
      return {
        llmContent: `Error: Invalid parameters provided. Reason: ${validationError}`,
        returnDisplay: 'Model provided invalid parameters.',
      };
    }

    const cwd = path.resolve(params.path || '.');
    const limit = params.limit ?? 5;

    try {
      const { stdout } = await execAsync(
        `git --no-pager log -n ${limit} --pretty=format:%h %s`,
        { cwd },
      );
      const output = stdout.trim();
      return { llmContent: output, returnDisplay: output };
    } catch (error: unknown) {
      return {
        llmContent: `Error running git: ${(error as Error).message}`,
        returnDisplay: 'Failed to run git command.',
      };
    }
  }
}

