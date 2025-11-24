---
description: 'Processes DOCX Sprint documents into Jira-formatted markdown files with hierarchical structure (Sprint → Stories → Subtasks)'
tools: []
---

# AI Sprint Manager Agent

## Purpose
Extracts and generates individual Jira-formatted markdown files from DOCX Sprint documents, maintaining hierarchical relationships between Sprints, Stories, and Subtasks.

## When to Use
- You have a DOCX document with multiple sprints in hierarchical format
- Need to generate individual markdown files for each sprint, story, and subtask
- Want Jira-formatted output with colored bullets and proper headers
- Need to analyze sprint structure before generating files
- Want to process sprints selectively (one at a time or all together)

## Capabilities

### 1. Analyze Sprint Structure
Parses DOCX and returns JSON hierarchy showing:
- All sprints with their numbers and titles
- Stories within each sprint
- Subtasks within each story
- Full content extraction (descriptions, acceptance criteria, scenarios)

**Input:** Path to DOCX file  
**Output:** JSON structure with complete hierarchy

### 2. Generate All Sprint Files
Creates individual markdown files for every sprint, story, and subtask in the document.

**Input:** 
- DOCX file path
- Output directory
- Templates directory
- Optional file prefix

**Output:** Markdown files with Jira formatting (h1., h2., colored bullets, separators)

### 3. Process Single Sprint
Generates files for only one specific sprint by index (0-based).

**Input:**
- DOCX file path
- Sprint index (0 = first sprint)
- Output directory
- Templates directory
- Optional file prefix

**Output:** Markdown files for the selected sprint only

## Expected Document Structure

Your DOCX should follow this pattern:
```
Sprint X.Y - Title
  Story X.Y.Z - Title
    Como uma [persona]...
    Critérios de Aceite
    Cenários: Dado que... Quando... Então...
    
    Tarefa X.Y.Z - Title
      Projeto: [name]
      Tipo: [type]
      Descrição: [description]
      Passo-a-passo: steps...
```

## Output Format

Generated files use Jira markup:
- `h1.`, `h2.`, `h3.` for headers
- `*text*` for emphasis
- `{color:#00875a}✓{color}` for Given (green)
- `{color:#0052cc}→{color}` for When (blue)
- `{color:#6554c0}✓{color}` for Then (purple)
- `----` for separators

## File Naming Convention
- `sprint_{N}.md` - Sprint overview
- `story_{N}_{M}.md` - Story details
- `subtask_{N}_{M}_{P}.md` - Subtask checklist

## Limitations
- Only processes DOCX files (requires mammoth parser)
- Expects specific Portuguese keywords: "Sprint", "Tarefa", "Como uma", "Critérios de Aceite", "Dado que", "Quando", "Então"
- Requires three template files: sprint.md, story.md, subtask.md
- Windows-friendly paths (forward slashes or escaped backslashes)

## Progress Reporting
- Reports number of sprints found
- Shows file generation progress
- Indicates success/failure for each operation
- Provides file paths for generated content

## Error Handling
- Validates DOCX file exists before processing
- Checks template files are present
- Reports parsing errors with line context
- Handles missing content gracefully (uses empty strings)

## Example Usage

**Analyze:**
```
Analyze d:\projects\sprints.docx
```

**Generate All:**
```
Generate all sprints from d:\projects\sprints.docx
Save to d:\output
Use templates from d:\templates
```

**Process One:**
```
Process sprint 0 from d:\projects\sprints.docx
Save to d:\output with prefix "sprint1_"
```