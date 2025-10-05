import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import type { VenvInfo } from '../types/index.js';

export function getPipCommand(venvInfo: VenvInfo): string {
  if (!venvInfo.found) {
    return 'pip';
  }
  
  const possiblePaths = [
    join(venvInfo.path, 'bin', 'pip'),
    join(venvInfo.path, 'bin', 'pip3'),
    join(venvInfo.path, 'Scripts', 'pip.exe'),
    join(venvInfo.path, 'Scripts', 'pip3.exe')
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return 'pip';
}

export function getPythonCommand(venvInfo: VenvInfo): string {
  if (!venvInfo.found) {
    return 'python';
  }
  
  const possiblePaths = [
    join(venvInfo.path, 'bin', 'python'),
    join(venvInfo.path, 'bin', 'python3'),
    join(venvInfo.path, 'Scripts', 'python.exe'),
    join(venvInfo.path, 'Scripts', 'python3.exe')
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return 'python';
}

export function executeCommand(command: string, timeout = 30000): string {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      timeout,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.toString().trim();
  } catch (error) {
    throw new Error(`Command failed: ${command}. Error: ${error}`);
  }
}

export function executePipCommand(venvInfo: VenvInfo, args: string[]): string {
  const pipCommand = getPipCommand(venvInfo);
  const command = `${pipCommand} ${args.join(' ')}`;
  return executeCommand(command);
}

export function executePythonCommand(venvInfo: VenvInfo, args: string[]): string {
  const pythonCommand = getPythonCommand(venvInfo);
  const command = `${pythonCommand} ${args.join(' ')}`;
  return executeCommand(command);
}

