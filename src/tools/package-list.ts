import type { Package, PackageList } from '../types/index.js';
import { generateCacheKey, packageListCache } from '../utils/cache.js';
import { executePipCommand, executeCommand } from '../utils/pip-wrapper.js';
import { findVenv } from '../utils/venv-finder.js';
import { detectEnvironmentManager } from '../utils/manager-detector.js';

export function listPackages(sortBy: 'name' | 'version' = 'name'): PackageList {
  const venvInfo = findVenv();

  if (!venvInfo.found) {
    throw new Error('No virtual environment found');
  }

  const cacheKey = generateCacheKey('packages', venvInfo.path, sortBy);
  const cached = packageListCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    let output: string;
    
    // Detect environment manager and use appropriate command
    const managerInfo = detectEnvironmentManager(venvInfo.path);
    
    if (managerInfo.manager === 'uv') {
      // Use uv pip for uv-managed environments
      output = executeCommand('uv pip list --format=json');
    } else {
      // Use regular pip for other environments
      output = executePipCommand(venvInfo, ['list', '--format=json']);
    }
    
    const packages: Package[] = JSON.parse(output);

    packages.sort((a, b) => {
      if (sortBy === 'version') {
        return compareVersions(a.version, b.version);
      }
      return a.name.localeCompare(b.name);
    });

    const result = { packages };
    packageListCache.set(cacheKey, result);
    return result;
  } catch (error) {
    throw new Error(`Failed to list packages: ${error}`);
  }
}

function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

