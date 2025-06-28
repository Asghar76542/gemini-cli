/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitSummaryTool } from './git-summary.js';
import { simpleGit } from 'simple-git';

vi.mock('simple-git');

const mockedSimpleGit = vi.mocked(simpleGit);

describe('GitSummaryTool', () => {
  beforeEach(() => {
    mockedSimpleGit.mockReturnValue({
      log: vi.fn().mockResolvedValue({
        all: [
          { hash: 'abcdef1', message: 'test commit 1' },
          { hash: 'abcdef2', message: 'test commit 2' },
        ],
      }),
    } as any);
  });

  it('getDescription includes count', () => {
    const tool = new GitSummaryTool('.');
    expect(tool.getDescription({ count: 3 })).toBe('summary of last 3 commit(s)');
  });

  it('execute returns commit summary', async () => {
    const tool = new GitSummaryTool('.');
    const result = await tool.execute({ count: 2 }, new AbortController().signal);
    expect(result.llmContent).toContain('abcdef1');
    expect(result.llmContent).toContain('test commit 1');
    expect(result.returnDisplay).toBe('2 commit(s)');
  });
});

