import { findVenv } from '../utils/venv-finder.js';
import { executePythonCommand } from '../utils/pip-wrapper.js';
import type { PythonVersion } from '../types/index.js';

export function getPythonVersion(): PythonVersion {
  const venvInfo = findVenv();
  
  if (!venvInfo.found) {
    throw new Error('No virtual environment found');
  }
  
  try {
    const output = executePythonCommand(venvInfo, ['--version']);
    const versionMatch = output.match(/Python (\d+\.\d+\.\d+)/);
    
    if (!versionMatch) {
      throw new Error('Could not parse Python version');
    }
    
    return {
      version: versionMatch[1] || 'unknown',
      path: venvInfo.path
    };
  } catch (error) {
    throw new Error(`Failed to get Python version: ${error}`);
  }
}
