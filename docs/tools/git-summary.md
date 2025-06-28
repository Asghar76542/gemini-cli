# Git Summary Tool (`git_summary`)

This document describes the `git_summary` tool for the Gemini CLI.

## Description

Use `git_summary` to display a concise list of recent Git commits from the current repository. This tool is helpful for quickly reviewing the latest changes without leaving the CLI.

### Arguments

`git_summary` takes one argument:

- `count` (integer, optional): The number of commits to include. Defaults to `3` when not provided.

## How to use `git_summary` with the Gemini CLI

When called, `git_summary` runs `git log -n <count>` and returns the commit hashes and messages for the most recent commits.

Usage:

```
git_summary(count=5)
```

### Example output

```
commit d4e5f6a Update documentation
commit 1a2b3c4 Fix issue with login flow
commit 789abcd Initial project setup
```
