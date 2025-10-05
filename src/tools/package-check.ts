import { findVenv } from '../utils/venv-finder.js';
import { executePipCommand } from '../utils/pip-wrapper.js';
import type { PackageCheck } from '../types/index.js';

export function checkPackage(packageName: string, version?: string): PackageCheck {
  const venvInfo = findVenv();
  
  if (!venvInfo.found) {
    throw new Error('No virtual environment found');
  }
  
  try {
    const output = executePipCommand(venvInfo, ['show', packageName]);
    
    if (output.includes('WARNING: Package(s) not found')) {
      return {
        installed: false
      };
    }
    
    const versionMatch = output.match(/Version: (.+)/);
    const installedVersion = versionMatch ? versionMatch[1] : undefined;
    
    if (!installedVersion) {
      return {
        installed: false
      };
    }
    
    const matches = version ? checkVersionMatch(installedVersion, version) : true;
    
    return {
      installed: true,
      version: installedVersion,
      matches
    };
  } catch (error) {
    return {
      installed: false
    };
  }
}

function checkVersionMatch(installedVersion: string, requiredVersion: string): boolean {
  if (requiredVersion.startsWith('==')) {
    return installedVersion === requiredVersion.substring(2);
  }
  
  if (requiredVersion.startsWith('>=')) {
    return compareVersions(installedVersion, requiredVersion.substring(2)) >= 0;
  }
  
  if (requiredVersion.startsWith('<=')) {
    return compareVersions(installedVersion, requiredVersion.substring(2)) <= 0;
  }
  
  if (requiredVersion.startsWith('>')) {
    return compareVersions(installedVersion, requiredVersion.substring(1)) > 0;
  }
  
  if (requiredVersion.startsWith('<')) {
    return compareVersions(installedVersion, requiredVersion.substring(1)) < 0;
  }
  
  if (requiredVersion.startsWith('~=')) {
    return checkCompatibleVersion(installedVersion, requiredVersion.substring(2));
  }
  
  return installedVersion === requiredVersion;
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

function checkCompatibleVersion(installedVersion: string, requiredVersion: string): boolean {
  const installedParts = installedVersion.split('.').map(Number);
  const requiredParts = requiredVersion.split('.').map(Number);
  
  if (installedParts.length < 2 || requiredParts.length < 2) {
    return compareVersions(installedVersion, requiredVersion) >= 0;
  }
  
  if (installedParts[0] !== requiredParts[0]) {
    return false;
  }
  
  if ((installedParts[1] ?? 0) < (requiredParts[1] ?? 0)) {
    return false;
  }
  
  if ((installedParts[1] ?? 0) > (requiredParts[1] ?? 0)) {
    return true;
  }
  
  return compareVersions(installedVersion, requiredVersion) >= 0;
}
