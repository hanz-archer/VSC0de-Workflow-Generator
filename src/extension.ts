import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TextEncoder } from 'util';

export function activate(context: vscode.ExtensionContext) {
    console.log('GitHub Workflow Generator is now active!');

    let disposable = vscode.commands.registerCommand('github-workflow-generator.createWorkflow', async () => {
        console.log('Creating GitHub Workflow...');  // Log to check if the command is triggered
        const workflowType = await vscode.window.showQuickPick(
            ['Django', 'Python', 'HTML/CSS with Firebase', 'PHP', 'Static Website'],
            { placeHolder: 'Select the type of project' }
        );

        if (!workflowType) {
            vscode.window.showErrorMessage('No project type selected.');
            return;
        }

        const workflowName = await vscode.window.showInputBox({
            placeHolder: 'Enter the name for your workflow (e.g., ci.yml, test.yml)',
            validateInput: (value) => (value.trim() === '' ? 'Workflow name cannot be empty' : null)
        });

        if (!workflowName) {
            vscode.window.showErrorMessage('Workflow name is required.');
            return;
        }

        const workflowContent = generateWorkflowContent(workflowType);
        const filePath = path.join(vscode.workspace.rootPath || '', '.github', 'workflows', workflowName);

        try {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, new TextEncoder().encode(workflowContent));
            vscode.window.showInformationMessage(`Workflow file created successfully: ${filePath}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error creating workflow file: ${error.message}`);
            } else {
                vscode.window.showErrorMessage('An unknown error occurred.');
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

function generateWorkflowContent(workflowType: string): string {
    switch (workflowType) {
        case 'Django':
            return `name: Django CI Workflow
on:
  push:
    branches:
      - main
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run migrations
        run: |
          python manage.py migrate
      - name: Run tests
        run: |
          python manage.py test
`;

        case 'Python':
            return `name: Python CI Workflow
on:
  push:
    branches:
      - main
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run tests
        run: |
          pytest
`;

        case 'HTML/CSS with Firebase':
            return `name: HTML/CSS with Firebase Deploy
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Firebase CLI
        run: |
          curl -sL https://firebase.tools | bash
      - name: Deploy to Firebase
        run: |
          firebase deploy --token #token
        env:
          FIREBASE_TOKEN: #ur token here
`;

        case 'PHP':
            return `name: PHP CI Workflow
on:
  push:
    branches:
      - main
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.0'
      - name: Install dependencies
        run: |
          composer install
      - name: Run tests
        run: |
          vendor/bin/phpunit
`;

        case 'Static Website':
            return `name: Deploy Static Website to GitHub Pages
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js (required for GitHub Pages)
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Build website (optional if using a build tool like webpack)
        run: |
          # You can add a build step if your site requires it, e.g., using npm run build
          echo "Build step if needed"
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: #Ur github token
          publish_dir: ./ # or the directory containing your static files
`;

        default:
            return '';
    }
}
