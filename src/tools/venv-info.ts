import { findVenv } from '../utils/venv-finder.js';
import type { VenvInfo } from '../types/index.js';

export function findVenvTool(projectPath?: string): VenvInfo {
  return findVenv(projectPath);
}

