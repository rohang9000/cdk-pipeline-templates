# Contributing to CDK Pipeline Templates

Thank you for your interest in contributing to the CDK Pipeline Templates repository! This document provides guidelines for contributing new templates, improvements, and bug fixes.

## How to Contribute

### Adding New Templates

1. **Create Template Structure**
   ```
   NewTemplate/
   ├── typescript/
   ├── javascript/
   ├── python/
   ├── java/
   ├── csharp/
   └── go/
   ```

2. **Required Files per Language**
   - **TypeScript/JavaScript**: `package.json`, `cdk.json`, `tsconfig.json` (TS only), `bin/app.ts`, `lib/` directory
   - **Python**: `requirements.txt`, `cdk.json`, `app.py`, `stacks/` directory
   - **Java**: `pom.xml`, `cdk.json`, `src/main/java/` directory structure
   - **C#**: `*.csproj`, `cdk.json`, `src/` directory
   - **Go**: `go.mod`, `cdk.json`, `main.go`

3. **Template Requirements**
   - Complete working CDK application
   - Comprehensive README with setup instructions
   - Example configuration files
   - Security best practices implemented
   - Proper error handling and logging

### Template Standards

#### Code Quality
- Follow language-specific best practices
- Include proper error handling
- Use meaningful variable and resource names
- Add inline comments for complex logic
- Implement security best practices

#### Documentation
- Clear README with prerequisites
- Step-by-step setup instructions
- Configuration examples
- Troubleshooting section
- Architecture diagram (if complex)

#### Testing
- Include unit test examples
- Integration test patterns
- Validation scripts where applicable

### Submission Process

1. **Fork the Repository**
   ```bash
   git fork https://github.com/your-org/cdk-pipeline-templates
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-template-name
   ```

3. **Develop Template**
   - Follow the template structure
   - Implement in all supported languages
   - Test thoroughly

4. **Submit Pull Request**
   - Clear description of the template purpose
   - List of files added/modified
   - Testing performed
   - Screenshots or examples if applicable

### Review Process

1. **Automated Checks**
   - Code syntax validation
   - CDK synthesis tests
   - Security scanning

2. **Manual Review**
   - Code quality assessment
   - Documentation completeness
   - Template functionality verification

3. **Approval and Merge**
   - Maintainer approval required
   - Merge to main branch
   - Release notes updated

## Template Guidelines

### Naming Conventions
- Use PascalCase for template directories
- Use descriptive names that indicate the primary use case
- Avoid abbreviations unless widely understood

### Configuration
- Use environment variables for account/region
- Store secrets in AWS Secrets Manager
- Provide sensible defaults
- Make customization points clear

### Security
- Implement least-privilege IAM policies
- Enable encryption where applicable
- Use VPC security groups appropriately
- Avoid hardcoded credentials

### Performance
- Use appropriate instance types
- Implement caching strategies
- Optimize build times
- Consider cost implications

## Getting Help

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing templates for examples

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributions from developers of all skill levels and backgrounds.

## License

By contributing to this repository, you agree that your contributions will be licensed under the same license as the project.