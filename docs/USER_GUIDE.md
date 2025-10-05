# User Guide

## Installation

### Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- npm or yarn package manager

### Install the Server

```bash
npm install -g @pceuropa/mcp-server-python-venv
```

### Verify Installation

```bash
npx @pceuropa/mcp-server-python-venv --version
```

## Cursor Configuration

### Basic Setup

Add the following to your Cursor settings (`.cursor/settings.json`):

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"]
      }
    }
  }
}
```

### Advanced Configuration

For more control, you can specify additional options:

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "PYTHON_PATH": "/usr/bin/python3"
        }
      }
    }
  }
}
```

## Common Workflows

### 1. Setting Up a New Project

When starting a new Python project:

1. **Check if Python is available**:
   ```
   Use: suggest_venv_setup
   ```

2. **Create virtual environment** (if needed):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Unix/macOS
   .venv\Scripts\activate     # On Windows
   ```

3. **Get environment summary**:
   ```
   Use: get_venv_summary
   ```

### 2. Managing Dependencies

#### Check what's installed:
```
Use: list_packages
```

#### Check for outdated packages:
```
Use: check_outdated
```

#### Compare with requirements:
```
Use: compare_requirements
```

#### Check specific package:
```
Use: check_package
Arguments: {"packageName": "requests", "version": ">=2.31.0"}
```

### 3. Security and Quality Checks

#### Check for vulnerabilities:
```
Use: check_security
```

#### Check licenses:
```
Use: check_licenses
```

### 4. Environment Analysis

#### Get dependency tree:
```
Use: get_dependency_tree
Arguments: {"package": "requests", "depth": 2}
```

#### Detect environment manager:
```
Use: detect_environment_manager
```

### 5. Package Discovery

#### Search for packages:
```
Use: search_package
Arguments: {"query": "http client", "limit": 5}
```

### 6. Export Environment

#### Export to requirements.txt:
```
Use: export_environment
Arguments: {"format": "requirements"}
```

#### Export to pyproject.toml:
```
Use: export_environment
Arguments: {"format": "pyproject"}
```

## Environment Manager Support

### Poetry Projects

For Poetry projects, the server automatically detects:
- `pyproject.toml`
- `poetry.lock`

Use `get_poetry_info` to get detailed Poetry-specific information.

### Pipenv Projects

For Pipenv projects, the server detects:
- `Pipfile`
- `Pipfile.lock`

Use `get_pipenv_info` for Pipenv-specific details.

### Conda Environments

For Conda environments, the server detects:
- `environment.yml`
- Conda environment metadata

Use `get_conda_info` for Conda-specific information.

### UV Projects

UV projects are detected by:
- `uv.lock`
- `pyproject.toml` with UV configuration

## Troubleshooting

### Common Issues

#### "No virtual environment found"

**Cause**: No virtual environment detected in the current directory.

**Solutions**:
1. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

2. Navigate to a directory with an existing virtual environment

3. Use `suggest_venv_setup` to get setup recommendations

#### "Command failed" errors

**Cause**: Python or pip commands are not available or failing.

**Solutions**:
1. Ensure Python is installed and in PATH
2. Activate the virtual environment
3. Check if pip is installed and working

#### "Safety check failed"

**Cause**: The `safety` tool is not installed.

**Solutions**:
1. Install safety:
   ```bash
   pip install safety
   ```

2. Or install pip-audit as alternative:
   ```bash
   pip install pip-audit
   ```

#### Performance issues

**Cause**: Large virtual environments or slow network.

**Solutions**:
1. The server uses caching to improve performance
2. For large environments, consider using specific package queries
3. Security checks may be slower but are not cached

### Debug Mode

To enable verbose logging, set the environment variable:

```bash
export DEBUG=mcp-server-python-venv
```

## Best Practices

### 1. Regular Maintenance

- Run `check_outdated` weekly to keep packages updated
- Use `check_security` before deploying to production
- Review `check_licenses` for compliance requirements

### 2. Dependency Management

- Use `compare_requirements` to ensure consistency
- Export environments regularly with `export_environment`
- Use `get_dependency_tree` to understand complex dependencies

### 3. Environment Setup

- Use `detect_environment_manager` to understand project structure
- Follow `suggest_venv_setup` recommendations for new projects
- Use `get_venv_summary` for quick environment overview

### 4. Package Discovery

- Use `search_package` to find alternatives
- Check package information before installation
- Consider security and license implications

## Integration Examples

### CI/CD Pipeline

```yaml
- name: Check Python Environment
  run: |
    npx @pceuropa/mcp-server-python-venv check_security
    npx @pceuropa/mcp-server-python-venv check_licenses
```

### Development Workflow

1. Start development session
2. Run `get_venv_summary` to check environment
3. Use `list_packages` to see what's installed
4. Run `check_outdated` to see what needs updating
5. Use `compare_requirements` to ensure consistency

### Production Deployment

1. Run `check_security` for vulnerability scan
2. Use `check_licenses` for compliance check
3. Export environment with `export_environment`
4. Verify with `get_venv_summary`

## Support

For issues and questions:

- **GitHub Issues**: [Report bugs and request features](https://github.com/pceuropa/mcp-server-python-venv/issues)
- **Documentation**: Check the [API documentation](API.md)
- **Email**: info@pceuropa.net

## Contributing

We welcome contributions! Please see our contributing guidelines in the repository.
