# Security Policy

We take the security of the Palette Art Club web application seriously. This document outlines our supported versions, security best practices, vulnerability reporting procedure, and responsible disclosure policy.

## Supported Versions

Only the latest version of the application running on the active branch (usually `main`) is supported for security updates. 

| Version | Supported |
| ------- | --------- |
| 1.x.x   | Yes       |
| < 1.0.0 | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not open a public GitHub issue**. Instead, report it privately to our development team.

Please send an email to **palette@iitgn.ac.in** with the subject line `SECURITY VULNERABILITY: [Brief Description]`. 

Include the following information in your email:
- Description of the vulnerability and its potential impact.
- Steps to reproduce the issue (including proof-of-concept code or screenshots if applicable).
- Details of the environment where it was discovered (e.g. browser version, Node.js version, OS).

We will acknowledge receipt of your report within 48 hours and provide a timeline for resolution.

## Responsible Disclosure Policy

We appreciate the efforts of security researchers who help make our platform safer. To support a responsible disclosure process:
- Give us reasonable time to investigate and fix the issue before making any information public.
- Do not exploit the vulnerability (e.g. by accessing or deleting other users' data, or degrading performance).
- Do not perform Denial of Service (DoS) attacks, spam, or social engineering against our users or club members.

## Security Best Practices for Developers

If you are contributing to this codebase, please adhere to these security principles:
1. **Secret Management**: Never commit API keys, database passwords, or JWT secrets to the repository. Use environment variables and configure them via your hosting platform (Vercel, Render, Railway).
2. **Input Validation & Sanitization**: Always validate and sanitize user inputs on the backend (Express routes) to prevent SQL/NoSQL Injection, Cross-Site Scripting (XSS), and Path Traversal.
3. **Dependency Integrity**: Run `npm audit` regularly to check for vulnerable dependencies. Keep dependency packages updated.
4. **Authentication and Authorization**: Ensure routes that access private or admin functionality are protected using the `protect` and `authorize('admin')` middlewares respectively.
