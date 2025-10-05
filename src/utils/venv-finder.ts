import { existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import type { VenvInfo } from '../types/index.js';

const VENV_DIRS = ['.venv', 'venv', '.virtualenv', 'env'];

export function findVenv(projectPath?: string): VenvInfo {
  // First check if VIRTUAL_ENV environment variable is set
  if (process.env['VIRTUAL_ENV']) {
    const venvPath = process.env['VIRTUAL_ENV'];
    if (existsSync(venvPath) && statSync(venvPath).isDirectory()) {
      const pythonPath = getPythonPath(venvPath);
      if (pythonPath && existsSync(pythonPath)) {
        return {
          found: true,
          path: venvPath,
          type: detectVenvType(venvPath)
        };
      }
    }
  }

  const searchPath = projectPath ? resolve(projectPath) : process.cwd();
  
  for (const venvDir of VENV_DIRS) {
    const venvPath = join(searchPath, venvDir);
    
    if (existsSync(venvPath) && statSync(venvPath).isDirectory()) {
      const pythonPath = getPythonPath(venvPath);
      if (pythonPath && existsSync(pythonPath)) {
        return {
          found: true,
          path: venvPath,
          type: detectVenvType(venvPath)
        };
      }
    }
  }
  
  return {
    found: false,
    path: '',
    type: ''
  };
}

function getPythonPath(venvPath: string): string {
  const possiblePaths = [
    join(venvPath, 'bin', 'python'),
    join(venvPath, 'bin', 'python3'),
    join(venvPath, 'Scripts', 'python.exe'),
    join(venvPath, 'Scripts', 'python3.exe')
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return '';
}

function detectVenvType(venvPath: string): string {
  if (existsSync(join(venvPath, 'pyvenv.cfg'))) {
    return 'venv';
  }
  
  if (existsSync(join(venvPath, 'Pipfile'))) {
    return 'pipenv';
  }
  
  if (existsSync(join(venvPath, 'poetry.lock'))) {
    return 'poetry';
  }
  
  if (existsSync(join(venvPath, 'conda-meta'))) {
    return 'conda';
  }
  
  if (existsSync(join(venvPath, 'uv.lock'))) {
    return 'uv';
  }
  
  return 'unknown';
}

