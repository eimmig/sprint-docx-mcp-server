# Sprint DOCX MCP Server

A GitHub Copilot agent that processes DOCX Sprint documents with hierarchical structure (Sprint → Stories → Subtasks) and generates Jira-formatted markdown files.

## Overview

This GitHub Copilot agent enables you to:
- **Analyze** DOCX Sprint documents and understand their hierarchical structure
- **Generate** individual Jira-formatted Markdown files for each Sprint, Story, and Subtask
- **Process** specific Sprints selectively for targeted workflows
- **Extract** complete content including descriptions, acceptance criteria, and scenarios

## Features

### 🤖 GitHub Copilot Integration

Use natural language commands in Copilot:
- "Analyze my Sprint DOCX document structure"
- "Generate markdown files for all sprints"
- "Process only the first sprint"

### 🔍 Three MCP Tools

1. **`analyze_sprint_document`** - Parse and analyze DOCX structure, returns JSON hierarchy
2. **`generate_sprint_files`** - Generate all Markdown files from DOCX with Jira formatting
3. **`process_single_sprint`** - Process a single Sprint by index (0-based)

### 📝 Jira-Formatted Output

Generated markdown files use Jira markup for better readability:
- `h1.`, `h2.`, `h3.` headers for structure
- Colored bullets for Given/When/Then scenarios
- Emphasized user stories with `*text*`
- Horizontal separators with `----`

### 📄 Document Structure Support

The server recognizes these patterns in DOCX files:
- **Sprint sections**: `Sprint X.X` (e.g., "Sprint 1.1", "Sprint 2.3")
- **Story sections**: Contains keywords like "User Story", "História de Usuário", "Como uma"
- **Subtask sections**: `Tarefa X.X.X` (e.g., "Tarefa 1.1.1", "Tarefa 2.3.4")
- **Acceptance criteria**: "Critérios de Aceite", "Cenários"
- **Scenarios**: "Dado que", "Quando", "Então" (Given/When/Then)

## Installation

### As a GitHub Copilot Agent

```bash
# Install globally
npm install -g sprint-docx-mcp-server
```

The `agent.json` will automatically register the agent with GitHub Copilot.

### For Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev
```

## Configuration

### VS Code Setup (MCP Server Mode)

Add to your `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "sprint-docx-processor": {
      "command": "sprint-docx-mcp-server"
    }
  }
}
```

### Claude Desktop Setup

Add to `claude_desktop_config.json`:

**Windows (Development):**
```json
{
  "mcpServers": {
    "sprint-docx-processor": {
      "command": "node",
      "args": ["d:\\UTFPR\\TCC\\AI Sprint Manager\\build\\index.js"]
    }
  }
}
```

**Global Installation:**
```json
{
  "mcpServers": {
    "sprint-docx-processor": {
      "command": "sprint-docx-mcp-server"
    }
  }
}
```

## Usage

### With GitHub Copilot in VS Code

After installing the agent, use the conversation starters or natural language:

**Using Conversation Starters:**
- Click "Analyze my Sprint DOCX document structure"
- Click "Generate markdown files for all sprints"
- Click "Process only the first sprint"

**Using Natural Language:**
```
Analyze the Sprint document at C:/projects/sprints.docx

Generate markdown files for all Sprints from C:/projects/sprints.docx, 
save to C:/output, using templates from C:/projects/templates

Process only Sprint 0 from C:/projects/sprints.docx and save to C:/output
```

### Tool Parameters

#### 1. analyze_sprint_document

Returns JSON hierarchy of your Sprint document.

**Parameters:**
```typescript
{
  "docxPath": "C:/path/to/sprints.docx"
}
```

**Output Example:**
```json
[
  {
    "number": "1.0",
    "title": "User Authentication",
    "content": "Sprint description...",
    "stories": [
      {
        "number": "1.1.0",
        "title": "Login Page",
        "content": "Como uma usuário...",
        "subtasks": [
          {
            "number": "1.1.1",
            "title": "Design Login UI",
            "content": "Projeto: Frontend..."
          }
        ]
      }
    ]
  }
]
```

#### 2. generate_sprint_files

Generates all markdown files with Jira formatting.

**Parameters:**
```typescript
{
  "docxPath": "C:/path/to/sprints.docx",
  "outputDir": "C:/output",
  "templatesDir": "C:/templates",
  "filePrefix": "project_"  // optional
}
```

**Output:**
Creates files like:
- `project_sprint_1.md` - Sprint overview with story list
- `project_story_1_1.md` - Story with formatted content
- `project_subtask_1_1_1.md` - Subtask with checklist

#### 3. process_single_sprint

Processes one sprint by index (0-based).

**Parameters:**
```typescript
{
  "docxPath": "C:/path/to/sprints.docx",
  "sprintIndex": 0,  // 0 for first sprint, 1 for second, etc.
  "outputDir": "C:/output",
  "templatesDir": "C:/templates",
  "filePrefix": "sprint1_"  // optional
}
```

**Use Case:** Process sprints incrementally or reprocess specific sprints after changes.

## Document Structure Requirements

Your DOCX document should follow this hierarchical pattern:

```
Sprint 1.0 - Sprint Title
  Descrição do sprint...

  Story 1.1.0 - Story Title
    Como uma [persona]...
    
    Critérios de Aceite
    - Critério 1
    - Critério 2
    
    Cenários:
      Dado que [precondição]
      Quando [ação]
      Então [resultado esperado]
    
    Sub-Tarefas:
    
    Tarefa 1.1.1 - Subtask Title
      Projeto: [project name]
      Tipo: [task type]
      Descrição: [description]
      Passo-a-passo:
        1. First step
        2. Second step
        3. Third step
    
    Tarefa 1.1.2 - Another Subtask
      ...

  Story 1.2.0 - Another Story
    ...

Sprint 2.0 - Next Sprint
  ...
```

## Generated File Structure

### Sprint File (`sprint_1.md`)
```markdown
h1. Sprint 1.0 - User Authentication

h2. Informações Gerais
* *Sprint:* 1
* *Total Stories:* 3

h2. Stories
* story_1_1.md - Login Page
* story_1_2.md - Registration Form
* story_1_3.md - Password Recovery

----
```

### Story File (`story_1_1.md`)
```markdown
h1. Story 1.1.0 - Login Page

h2. Descrição

*Como uma usuário do sistema*
*Eu quero fazer login com email e senha*
*Para que possa acessar minha conta*

h3. Critérios de Aceite
* Campo de email validado
* Campo de senha com máscara
* Botão de login habilitado apenas com dados válidos

h3. Cenários

h3. Cenário 1: Login com sucesso
* {color:#00875a}✓{color} Dado que estou na página de login
* {color:#0052cc}→{color} Quando insiro credenciais válidas
* {color:#6554c0}✓{color} Então sou redirecionado para o dashboard

----

h2. Sub-Tarefas
* subtask_1_1_1.md - Design Login UI
* subtask_1_1_2.md - Implement Authentication Logic
```

### Subtask File (`subtask_1_1_1.md`)
```markdown
h1. Tarefa 1.1.1 - Design Login UI

h2. Informações
* *Projeto:* Frontend
* *Tipo:* Design

h2. Descrição
Criar interface de login responsiva com validação

h2. Passo-a-passo
- [ ] Criar wireframe da tela
- [ ] Definir paleta de cores
- [ ] Implementar layout responsivo
- [ ] Adicionar validação de formulário
```

## Template Files

Create three template files in your templates directory:

### `sprint.md`
```markdown
h1. {sprint_title}

h2. Informações Gerais
* *Sprint:* {sprint_number}
* *Total Stories:* {story_count}

h2. Stories
{stories_list}

----
```

### `story.md`
```markdown
h1. {story_title}

h2. Descrição
{story_content}

h2. Sub-Tarefas
{subtasks_list}

----
```

### `subtask.md`
```markdown
h1. {subtask_title}

h2. Descrição
{subtask_content}
```

## Jira Formatting Reference

| Element | Syntax | Example |
|---------|--------|---------|
| Heading 1 | `h1. Text` | `h1. Sprint Title` |
| Heading 2 | `h2. Text` | `h2. Description` |
| Heading 3 | `h3. Text` | `h3. Acceptance Criteria` |
| Bold/Emphasis | `*text*` | `*Important*` |
| Green checkmark | `{color:#00875a}✓{color}` | Given statements |
| Blue arrow | `{color:#0052cc}→{color}` | When statements |
| Purple checkmark | `{color:#6554c0}✓{color}` | Then statements |
| Separator | `----` | Section divider |
| Bullet list | `* item` | `* First item` |
| Checklist | `- [ ] item` | `- [ ] Task to do` |

## File Naming Convention

Generated files follow this pattern:
```
{filePrefix}sprint_{N}.md
{filePrefix}story_{N}_{M}.md
{filePrefix}subtask_{N}_{M}_{P}.md
```

Where:
- `N` = Sprint number (1, 2, 3...)
- `M` = Story number within sprint (1, 2, 3...)
- `P` = Subtask number within story (1, 2, 3...)

Example output structure:
```
output/
├── sprint_1.md
├── story_1_1.md
├── story_1_2.md
├── subtask_1_1_1.md
├── subtask_1_1_2.md
├── subtask_1_2_1.md
├── sprint_2.md
├── story_2_1.md
└── ...
```

## Development

### Project Structure
```
sprint-docx-mcp-server/
├── src/
│   ├── index.ts              # MCP server & tool definitions
│   ├── docx-reader.ts        # DOCX parsing with content extraction
│   ├── template-processor.ts # Jira formatting & template processing
│   └── file-generator.ts     # File generation with unique naming
├── build/                    # Compiled JavaScript (ES modules)
├── agent.json                # GitHub Copilot agent configuration
├── .vscode/
│   └── mcp.json             # VS Code MCP configuration
├── templates/
│   ├── sprint.md            # Sprint template
│   ├── story.md             # Story template
│   └── subtask.md           # Subtask template
├── package.json
├── tsconfig.json
└── README.md
```

### Build Commands

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Prepare for publishing (auto-runs on install)
npm run prepare
```

### Technology Stack

- **TypeScript 5.7+** - Type-safe development with ES modules
- **MCP SDK 1.0.4** - Model Context Protocol integration
- **mammoth 1.8.0** - DOCX text extraction
- **zod 3.23.8** - Schema validation for tool parameters
- **Node.js 18+** - Runtime environment

## Troubleshooting

### Agent not appearing in Copilot

1. Ensure global installation: `npm install -g sprint-docx-mcp-server`
2. Verify `agent.json` exists in the package root
3. Restart VS Code completely

### Empty content in generated files

- Verify DOCX follows the hierarchical structure (Sprint → Story → Subtask)
- Check that stories contain keywords: "Como uma", "Critérios de Aceite"
- Ensure subtasks are labeled with "Tarefa X.X.X"

### Filename collisions (files overwriting)

- Use the `filePrefix` parameter to add unique prefixes
- Process sprints individually with `process_single_sprint`

### Template not found errors

- Verify `sprint.md`, `story.md`, `subtask.md` exist in `templatesDir`
- Use absolute paths for `templatesDir` parameter

### Windows path issues

- Use forward slashes: `C:/path/to/file.docx`
- Or escape backslashes: `C:\\path\\to\\file.docx`
- Always provide absolute paths in tool parameters

### Build errors

```bash
# Reinstall dependencies
npm install

# Clear build directory
Remove-Item -Recurse -Force build; npm run build
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Author

UTFPR TCC Project

## Support

- Issues: https://github.com/yourusername/sprint-docx-mcp-server/issues
- Documentation: https://github.com/yourusername/sprint-docx-mcp-server#readme

## Changelog

### 1.0.0 (Current)
- ✅ GitHub Copilot agent integration with `agent.json`
- ✅ Three MCP tools: analyze, generate_all, process_single
- ✅ Full content extraction from DOCX (sprints, stories, subtasks)
- ✅ Jira formatting with colored bullets and headers
- ✅ Unique file naming with sprint-based numbering
- ✅ Template system for customizable output
- ✅ Support for hierarchical Sprint/Story/Subtask structure
- ✅ Windows and cross-platform compatibility
npm run build
```

### DOCX parsing issues

- Verify DOCX file path is absolute
- Check DOCX file isn't corrupted
- Ensure document follows expected structure patterns

## Migration from Python Implementation

This TypeScript MCP server replaces the original Python + Gemini API implementation:

| **Python (Old)** | **TypeScript MCP (New)** |
|------------------|--------------------------|
| Direct Gemini API calls | Uses Copilot (no API quotas) |
| Limited by API rate limits | No external API limitations |
| Standalone script | MCP server (integrates with tools) |
| Manual execution | Natural language interface |

The core hierarchical processing logic remains the same, but the interface has evolved to leverage MCP's capabilities.

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.
