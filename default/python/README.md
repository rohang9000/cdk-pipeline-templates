# Default CDK Pipeline Template (Python)

This template creates a standard CDK pipeline with GitHub source, CodeBuild for build and test, and EC2 deployment.

## Architecture

- **Source**: GitHub repository
- **Build**: AWS CodeBuild
- **Test**: AWS CodeBuild
- **Deploy**: EC2 deployment via CodeDeploy

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed: `npm install -g aws-cdk`
3. Python 3.8+ installed
4. GitHub personal access token with repository access

## Setup

After running `cdk init pipeline-default --language python`, follow these steps:

1. **Create and activate virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure GitHub authentication**:
   ```bash
   aws secretsmanager create-secret --name github-token --secret-string "your-github-personal-access-token"
   ```

4. **Update configuration**:
   - Edit `stacks/pipeline_stack.py`: Replace `OWNER/REPO` with your GitHub repository
   - Edit `app.py`: Update account and region (or use environment variables)

5. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```

6. **Deploy**:
   ```bash
   cdk deploy
   ```

## File Structure

```
├── app.py                    # CDK app entry point
├── stacks/
│   ├── __init__.py
│   ├── pipeline_stack.py     # Pipeline definition
│   └── app_stack.py          # Application stack
├── requirements.txt          # Python dependencies
├── cdk.json                 # CDK configuration
└── README.md                # This file
```

## Customization

- Modify build commands in the `ShellStep`
- Add additional test stages
- Configure different deployment targets
- Add manual approval steps
- Customize EC2 instance configuration

## Testing

Add your tests and update the test command in `pipeline_stack.py`:
```python
commands=[
    "pip install -r requirements.txt",
    "python -m pytest tests/ -v"  # Your test command
]
```