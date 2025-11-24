import * as fs from 'fs/promises';
import * as path from 'path';
import { Sprint, Story, Subtask } from './docx-reader.js';

export interface TemplateProcessor {
  processSprintTemplate(sprint: Sprint, sprintNumber: number, totalSprints: number): string;
  processStoryTemplate(story: Story, sprintNumber: number, storyNumber: number): string;
  processSubtaskTemplate(subtask: Subtask, sprintNumber: number, storyNumber: number, subtaskNumber: number): string;
}

/**
 * Default template processor using markdown templates
 */
export class MarkdownTemplateProcessor implements TemplateProcessor {
  private sprintTemplate: string = '';
  private storyTemplate: string = '';
  private subtaskTemplate: string = '';
  
  constructor(
    private templatesDir: string
  ) {}
  
  async loadTemplates(): Promise<void> {
    try {
      this.sprintTemplate = await fs.readFile(
        path.join(this.templatesDir, 'sprint.md'),
        'utf-8'
      );
      this.storyTemplate = await fs.readFile(
        path.join(this.templatesDir, 'story.md'),
        'utf-8'
      );
      this.subtaskTemplate = await fs.readFile(
        path.join(this.templatesDir, 'subtask.md'),
        'utf-8'
      );
    } catch (error) {
      throw new Error(`Failed to load templates: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  processSprintTemplate(sprint: Sprint, sprintNumber: number, totalSprints: number): string {
    return this.sprintTemplate
      .replace(/\{sprint_title\}/g, sprint.title)
      .replace(/\{sprint_number\}/g, String(sprintNumber))
      .replace(/\{total_sprints\}/g, String(totalSprints))
      .replace(/\{sprint_description\}/g, sprint.description)
      .replace(/\{story_count\}/g, String(sprint.stories.length));
  }
  
  /**
   * Format story content with Jira markup
   */
  private formatStoryContent(content: string): string {
    let formatted = content;
    
    // Format "Como uma/um..." user story line
    formatted = formatted.replace(/^(Como uma?.*?)$/gm, '*$1*\n');
    
    // Format section headers
    formatted = formatted.replace(/^(Critérios de Aceite.*?)$/gm, '\nh3. $1\n');
    formatted = formatted.replace(/^(Cenário \d+:.*?)$/gm, '\n*$1*');
    
    // Format Given/When/Then lines
    formatted = formatted.replace(/^(Dado que.*?)$/gm, '* {color:#00875a}✓{color} $1');
    formatted = formatted.replace(/^(Quando.*?)$/gm, '* {color:#0052cc}→{color} $1');
    formatted = formatted.replace(/^(Então.*?)$/gm, '* {color:#6554c0}✓{color} $1');
    
    // Format "Sub-Tarefas" section
    formatted = formatted.replace(/^(Sub-Tarefas.*?)$/gm, '\n----\n\nh3. $1\n');
    
    return formatted.trim();
  }
  
  processStoryTemplate(story: Story, sprintNumber: number, storyNumber: number): string {
    const formattedContent = this.formatStoryContent(story.content);
    
    return this.storyTemplate
      .replace(/\{story_title\}/g, story.title)
      .replace(/\{sprint_number\}/g, String(sprintNumber))
      .replace(/\{story_number\}/g, String(storyNumber))
      .replace(/\{story_content\}/g, formattedContent)
      .replace(/\{subtask_count\}/g, String(story.subtasks.length));
  }
  
  processSubtaskTemplate(
    subtask: Subtask,
    sprintNumber: number,
    storyNumber: number,
    subtaskNumber: number
  ): string {
    return this.subtaskTemplate
      .replace(/\{subtask_content\}/g, subtask.content)
      .replace(/\{sprint_number\}/g, String(sprintNumber))
      .replace(/\{story_number\}/g, String(storyNumber))
      .replace(/\{subtask_number\}/g, String(subtaskNumber));
  }
}
