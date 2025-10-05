# API Documentation

## Overview

The MCP Python Venv Server provides comprehensive tools for managing Python virtual environments through the Model Context Protocol (MCP). This document describes all available tools and their usage.

## Core Tools

### `ping`
Test server connectivity.

**Input**: None  
**Output**: `"pong"`

**Example**:
```json
{
  "name": "ping",
  "arguments": {}
}
```

### `find_venv`
Find virtual environment in the current project.

**Input**:
- `projectPath` (optional): Project path to search for virtual environment

**Output**:
```json
{
  "found": true,
  "path": "/path/to/.venv",
  "type": "venv"
}
```

**Example**:
```json
{
  "name": "find_venv",
  "arguments": {
    "projectPath": "/path/to/project"
  }
}
```

### `get_python_version`
Get Python version from the virtual environment.

**Input**: None  
**Output**:
```json
{
  "version": "3.12.0",
  "path": "/path/to/.venv"
}
```

### `list_packages`
List all installed packages in the virtual environment.

**Input**:
- `sortBy` (optional): Sort packages by "name" or "version" (default: "name")

**Output**:
```json
{
  "packages": [
    {
      "name": "requests",
      "version": "2.31.0"
    }
  ]
}
```

### `check_package`
Check if a specific package is installed and matches version requirements.

**Input**:
- `packageName` (required): Name of the package to check
- `version` (optional): Version requirement (e.g., ">=1.0.0", "==2.1.0")

**Output**:
```json
{
  "installed": true,
  "version": "2.31.0",
  "matches": true
}
```

### `compare_requirements`
Compare installed packages with requirements files.

**Input**:
- `file` (optional): Specific requirements file to check

**Output**:
```json
{
  "missing": [
    {
      "name": "requests",
      "required_version": ">=2.31.0"
    }
  ],
  "extra": [
    {
      "name": "unused-package",
      "installed_version": "1.0.0"
    }
  ],
  "mismatched": [
    {
      "name": "package",
      "required": ">=2.0.0",
      "installed": "1.5.0"
    }
  ],
  "install_command": "pip install requests>=2.31.0"
}
```

## Advanced Tools

### `check_outdated`
Check for outdated packages in the virtual environment.

**Input**: None  
**Output**:
```json
{
  "outdated": [
    {
      "name": "requests",
      "current_version": "2.28.0",
      "latest_version": "2.31.0",
      "upgrade_type": "minor"
    }
  ],
  "upgrade_command": "pip install --upgrade requests"
}
```

### `suggest_venv_setup`
Get suggestions for setting up a virtual environment.

**Input**: None  
**Output**:
```json
{
  "has_venv": false,
  "python_available": true,
  "suggested_commands": [
    "python -m venv .venv",
    "source .venv/bin/activate",
    "pip install --upgrade pip"
  ],
  "tool_recommendations": [
    {
      "name": "venv",
      "reason": "Built into Python 3.3+, simple and reliable"
    }
  ]
}
```

### `get_venv_summary`
Get a comprehensive summary of the virtual environment.

**Input**: None  
**Output**:
```json
{
  "python_version": "3.12.0",
  "venv_path": "/path/to/.venv",
  "venv_type": "venv",
  "package_count": 25,
  "total_size": "150 MB",
  "requirements_status": "All requirements satisfied",
  "outdated_count": 3
}
```

### `get_dependency_tree`
Get dependency tree visualization for packages.

**Input**:
- `package` (optional): Specific package to analyze
- `depth` (optional): Maximum depth of dependency tree (default: 3)

**Output**:
```json
{
  "root": {
    "name": "requests",
    "version": "2.31.0",
    "dependencies": [
      {
        "name": "urllib3",
        "version": "2.0.0",
        "dependencies": []
      }
    ]
  },
  "circular_dependencies": [],
  "unused_dependencies": ["unused-package"]
}
```

## Environment Manager Tools

### `detect_environment_manager`
Detect which Python environment manager is being used.

**Input**:
- `projectPath` (optional): Project path to analyze

**Output**:
```json
{
  "manager": "poetry",
  "config_files": ["/path/to/pyproject.toml", "/path/to/poetry.lock"],
  "env_path": "/path/to/.venv"
}
```

### `get_poetry_info`
Get Poetry project information and dependencies.

**Input**:
- `projectPath` (optional): Project path

**Output**:
```json
{
  "project_name": "my-project",
  "version": "0.1.0",
  "description": "My awesome project",
  "dependencies": [
    {
      "name": "requests",
      "version": "2.31.0"
    }
  ],
  "dev_dependencies": [],
  "python_version": "3.12.0",
  "virtual_env_path": "/path/to/.venv",
  "lock_file_exists": true
}
```

### `get_pipenv_info`
Get Pipenv project information and dependencies.

**Input**:
- `projectPath` (optional): Project path

**Output**:
```json
{
  "project_name": "my-project",
  "python_version": "3.12.0",
  "virtual_env_path": "/path/to/.venv",
  "dependencies": [
    {
      "name": "requests",
      "version": "2.31.0"
    }
  ],
  "dev_dependencies": [],
  "lock_file_exists": true
}
```

### `get_conda_info`
Get Conda environment information and packages.

**Input**:
- `projectPath` (optional): Project path

**Output**:
```json
{
  "environment_name": "my-env",
  "python_version": "3.12.0",
  "conda_version": "23.0.0",
  "packages": [
    {
      "name": "requests",
      "version": "2.31.0",
      "channel": "conda-forge"
    }
  ],
  "environment_file_exists": true,
  "environment_path": "/path/to/conda/envs/my-env"
}
```

## Security and Quality Tools

### `check_security`
Check for security vulnerabilities in installed packages.

**Input**: None  
**Output**:
```json
{
  "vulnerabilities": [
    {
      "package": "requests",
      "version": "2.28.0",
      "vulnerability": "CVE-2023-32681",
      "severity": "HIGH",
      "fix": "Upgrade to 2.31.0"
    }
  ],
  "scan_date": "2025-01-27T19:00:00.000Z"
}
```

### `check_licenses`
Check licenses of installed packages and identify potential issues.

**Input**: None  
**Output**:
```json
{
  "packages": [
    {
      "name": "requests",
      "version": "2.31.0",
      "license": "Apache 2.0",
      "category": "permissive"
    }
  ],
  "warnings": [
    "Found 1 copyleft packages: gpl-package"
  ]
}
```

### `search_package`
Search for packages on PyPI.

**Input**:
- `query` (required): Search query for package name or description
- `limit` (optional): Maximum number of results to return (default: 10)

**Output**:
```json
{
  "results": [
    {
      "name": "requests",
      "version": "latest",
      "description": "Python HTTP for Humans.",
      "author": "Kenneth Reitz",
      "downloads": 0
    }
  ],
  "total": 1
}
```

### `export_environment`
Export current environment to various formats.

**Input**:
- `format` (required): Export format: "requirements", "pyproject", or "conda"

**Output**:
```json
{
  "format": "requirements",
  "content": "requests==2.31.0\nurllib3==2.0.0\n"
}
```

## Error Handling

All tools return errors in the following format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: No virtual environment found"
    }
  ],
  "isError": true
}
```

## Performance Considerations

- Package listing and dependency analysis are cached for 5 minutes
- Virtual environment detection is cached for 10 minutes
- Security and license checks are not cached due to their critical nature
- Large dependency trees may take longer to process

## Supported File Formats

- **Requirements**: `requirements.txt`, `requirements-dev.txt`, `requirements-test.txt`
- **Poetry**: `pyproject.toml`, `poetry.lock`
- **Pipenv**: `Pipfile`, `Pipfile.lock`
- **Conda**: `environment.yml`
- **Setup**: `setup.py` (basic support)

## Version Specifiers

The server supports all standard Python version specifiers:
- `==` (exact match)
- `>=` (greater than or equal)
- `<=` (less than or equal)
- `>` (greater than)
- `<` (less than)
- `~=` (compatible release)
- `!=` (not equal)
