# Troubleshooting Guide

## Package Manager Support

### Supported Package Managers

✅ **Fully Supported:**
- **pip** - Traditional Python package manager
- **uv** - Fast Python package manager (recommended)
- **pipenv** - Python dependency management
- **conda** - Cross-platform package manager (basic support)

❌ **Not Supported:**
- **PDM (Python Dependency Manager)** - Not yet implemented
- **Poetry** - Limited support (detection only, no package operations)

### Environment Variable Configuration

The server uses environment variables to determine which package manager to use:

| Variable | Description | Priority |
|----------|-------------|----------|
| `UV_PATH` | Path to uv executable (forces uv usage) | Highest |
| `PIP_PATH` | Path to pip executable (forces pip usage) | High |
| `PYTHON_PATH` | Path to Python executable | Medium |
| `VIRTUAL_ENV` | Path to virtual environment | Medium |

**Priority Order:**
1. `UV_PATH` - If set, uses `uv pip` for all operations
2. `PIP_PATH` - If set, uses specified pip executable
3. Auto-detection - Detects package manager from project files

## Common Issues and Solutions

### Package Manager Issues

#### Issue: PDM environments not detected

**Symptoms**:
- PDM projects show as "venv" or "unknown"
- Cannot list packages in PDM environments

**Cause**: PDM is not yet supported by the MCP server

**Solutions**:
1. **Use pip instead**: Install packages with pip in the PDM environment
2. **Convert to uv**: Migrate from PDM to uv for better support
3. **Wait for PDM support**: PDM support is planned for future versions

#### Issue: Poetry environments show empty package list

**Symptoms**:
- Poetry projects are detected correctly
- `list_packages` returns empty list
- Other tools fail with Poetry environments

**Cause**: Poetry support is limited to detection only

**Solutions**:
1. **Use pip in Poetry environment**: 
   ```bash
   poetry run pip list
   ```
2. **Convert to uv**: Migrate from Poetry to uv for full support
3. **Use Poetry CLI directly**: Use Poetry commands outside of MCP

#### Issue: Conda environments have limited functionality

**Symptoms**:
- Conda environments are detected correctly
- Some package operations may fail
- Limited package listing functionality

**Cause**: Conda support is basic and may not work with all conda features

**Solutions**:
1. **Use conda CLI directly**: Use conda commands outside of MCP
2. **Convert to uv**: Migrate from Conda to uv for full support
3. **Use pip in conda environment**: Install packages with pip in the conda environment

### Virtual Environment Issues

#### Issue: "No virtual environment found"

**Symptoms**:
- Error message: "No virtual environment found"
- Tools fail to execute

**Causes**:
1. No virtual environment exists in the current directory
2. Virtual environment is not properly activated
3. Virtual environment is in a non-standard location

**Solutions**:

1. **Create a new virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Unix/macOS
   .venv\Scripts\activate     # On Windows
   ```

2. **Use the setup suggestion tool**:
   ```
   Use: suggest_venv_setup
   ```

3. **Check for existing virtual environments**:
   ```bash
   ls -la | grep -E "(venv|\.venv|env|\.env)"
   ```

4. **Navigate to the correct directory**:
   ```bash
   cd /path/to/your/project
   ```

#### Issue: Virtual environment not detected

**Symptoms**:
- Virtual environment exists but is not found
- `find_venv` returns `found: false`

**Causes**:
1. Virtual environment is in a non-standard location
2. Virtual environment is corrupted
3. Python executable is missing

**Solutions**:

1. **Check virtual environment structure**:
   ```bash
   ls -la .venv/bin/  # Should contain python, pip, etc.
   ```

2. **Recreate virtual environment**:
   ```bash
   rm -rf .venv
   python -m venv .venv
   source .venv/bin/activate
   ```

3. **Use custom path**:
   ```
   Use: find_venv
   Arguments: {"projectPath": "/custom/path/to/project"}
   ```

### Python and Pip Issues

#### Issue: "Python not found" or "pip not found"

**Symptoms**:
- Commands fail with "command not found"
- Python version detection fails

**Solutions**:

1. **Check Python installation**:
   ```bash
   python --version
   python3 --version
   which python
   which python3
   ```

2. **Install Python** (if missing):
   - **Ubuntu/Debian**: `sudo apt install python3 python3-pip`
   - **macOS**: `brew install python`
   - **Windows**: Download from python.org

3. **Check PATH environment variable**:
   ```bash
   echo $PATH  # Should include Python directories
   ```

4. **Use full path to Python**:
   ```bash
   /usr/bin/python3 -m venv .venv
   ```

#### Issue: Pip commands fail

**Symptoms**:
- "pip: command not found"
- Package listing fails

**Solutions**:

1. **Install pip**:
   ```bash
   python -m ensurepip --upgrade
   ```

2. **Use python -m pip**:
   ```bash
   python -m pip list
   python -m pip install package
   ```

3. **Check virtual environment activation**:
   ```bash
   which pip  # Should point to venv/bin/pip
   ```

### Package Management Issues

#### Issue: "Failed to list packages"

**Symptoms**:
- `list_packages` fails
- JSON parsing errors

**Solutions**:

1. **Check pip version**:
   ```bash
   pip --version
   ```

2. **Upgrade pip**:
   ```bash
   pip install --upgrade pip
   ```

3. **Check virtual environment**:
   ```bash
   pip list --format=json
   ```

4. **Reinstall packages**:
   ```bash
   pip install --force-reinstall -r requirements.txt
   ```

#### Issue: Requirements comparison fails

**Symptoms**:
- `compare_requirements` returns errors
- File parsing issues

**Solutions**:

1. **Check requirements file format**:
   ```bash
   cat requirements.txt
   ```

2. **Validate requirements syntax**:
   ```bash
   pip install -r requirements.txt --dry-run
   ```

3. **Check file encoding**:
   ```bash
   file requirements.txt
   ```

### Security Tool Issues

#### Issue: "Safety check failed"

**Symptoms**:
- `check_security` fails
- Safety tool not found

**Solutions**:

1. **Install safety**:
   ```bash
   pip install safety
   ```

2. **Use pip-audit as alternative**:
   ```bash
   pip install pip-audit
   ```

3. **Check tool availability**:
   ```bash
   safety --version
   pip-audit --version
   ```

4. **Manual security check**:
   ```bash
   pip list --outdated
   ```

#### Issue: License check fails

**Symptoms**:
- `check_licenses` returns empty results
- Package information missing

**Solutions**:

1. **Check package metadata**:
   ```bash
   pip show package-name
   ```

2. **Install package with metadata**:
   ```bash
   pip install --no-binary=:all: package-name
   ```

3. **Use alternative license check**:
   ```bash
   pip install pip-licenses
   pip-licenses
   ```

### Performance Issues

#### Issue: Slow response times

**Symptoms**:
- Tools take a long time to respond
- Timeout errors

**Solutions**:

1. **Check virtual environment size**:
   ```bash
   du -sh .venv
   ```

2. **Clear pip cache**:
   ```bash
   pip cache purge
   ```

3. **Use specific package queries**:
   ```
   Use: check_package
   Arguments: {"packageName": "specific-package"}
   ```

4. **Check network connectivity**:
   ```bash
   ping pypi.org
   ```

#### Issue: Memory usage high

**Symptoms**:
- High memory consumption
- System slowdown

**Solutions**:

1. **Limit dependency tree depth**:
   ```
   Use: get_dependency_tree
   Arguments: {"depth": 2}
   ```

2. **Use package-specific queries**:
   ```
   Use: get_dependency_tree
   Arguments: {"package": "specific-package"}
   ```

3. **Clear server cache** (restart Cursor)

### Environment Manager Issues

#### Issue: Poetry not detected

**Symptoms**:
- `get_poetry_info` fails
- Poetry projects not recognized

**Solutions**:

1. **Install Poetry**:
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. **Check Poetry installation**:
   ```bash
   poetry --version
   ```

3. **Initialize Poetry project**:
   ```bash
   poetry init
   ```

#### Issue: Pipenv not detected

**Symptoms**:
- `get_pipenv_info` fails
- Pipenv projects not recognized

**Solutions**:

1. **Install Pipenv**:
   ```bash
   pip install pipenv
   ```

2. **Check Pipenv installation**:
   ```bash
   pipenv --version
   ```

3. **Initialize Pipenv project**:
   ```bash
   pipenv install
   ```

#### Issue: Conda not detected

**Symptoms**:
- `get_conda_info` fails
- Conda environments not recognized

**Solutions**:

1. **Install Conda**:
   - Download from conda.io
   - Or use Miniconda/Anaconda

2. **Check Conda installation**:
   ```bash
   conda --version
   ```

3. **Activate Conda environment**:
   ```bash
   conda activate myenv
   ```

### Network and Connectivity Issues

#### Issue: Package search fails

**Symptoms**:
- `search_package` returns empty results
- Network timeout errors

**Solutions**:

1. **Check internet connectivity**:
   ```bash
   ping pypi.org
   ```

2. **Check firewall settings**:
   - Ensure outbound HTTPS is allowed
   - Check proxy settings

3. **Use alternative search**:
   - Visit pypi.org directly
   - Use pip search (if available)

#### Issue: Package installation fails

**Symptoms**:
- Packages cannot be installed
- Network errors during installation

**Solutions**:

1. **Check pip configuration**:
   ```bash
   pip config list
   ```

2. **Use different index**:
   ```bash
   pip install --index-url https://pypi.org/simple/ package
   ```

3. **Check proxy settings**:
   ```bash
   pip install --proxy http://proxy:port package
   ```

### Configuration Issues

#### Issue: Cursor not recognizing server

**Symptoms**:
- MCP server not available in Cursor
- Tools not appearing

**Solutions**:

1. **Check Cursor configuration**:
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

2. **Restart Cursor**:
   - Close and reopen Cursor
   - Check if server appears in MCP panel

3. **Check server installation**:
   ```bash
   npx @pceuropa/mcp-server-python-venv --version
   ```

4. **Check Node.js version**:
   ```bash
   node --version  # Should be 18+
   ```

#### Issue: Server crashes or hangs

**Symptoms**:
- Server stops responding
- Cursor shows connection errors

**Solutions**:

1. **Check server logs**:
   - Look in Cursor's developer console
   - Check for error messages

2. **Restart server**:
   - Restart Cursor
   - Or restart the MCP server process

3. **Check system resources**:
   ```bash
   top
   free -h
   ```

4. **Update server**:
   ```bash
   npm update -g @pceuropa/mcp-server-python-venv
   ```

## Debug Mode

Enable debug mode for detailed logging:

```bash
export DEBUG=mcp-server-python-venv
```

Or in Cursor configuration:

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "DEBUG": "mcp-server-python-venv"
        }
      }
    }
  }
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs** with debug mode enabled
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Error messages
   - System information
   - Steps to reproduce
   - Debug logs (if available)

4. **Contact support**:
   - Email: info@pceuropa.net
   - GitHub Issues: [Create an issue](https://github.com/pceuropa/mcp-server-python-venv/issues)

## System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **Python**: 3.8 or higher
- **Memory**: 512 MB RAM
- **Disk**: 100 MB free space

### Recommended Requirements

- **Node.js**: 20.0.0 or higher
- **Python**: 3.11 or higher
- **Memory**: 2 GB RAM
- **Disk**: 1 GB free space

### Supported Operating Systems

- **Linux**: Ubuntu 18.04+, CentOS 7+, Debian 9+
- **macOS**: 10.15 (Catalina) or higher
- **Windows**: Windows 10 or higher

### Supported Python Versions

- Python 3.8
- Python 3.9
- Python 3.10
- Python 3.11
- Python 3.12
- Python 3.13
