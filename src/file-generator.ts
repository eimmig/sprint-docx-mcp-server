import * as fs from 'fs/promises';
import * as path from 'path';
import { Sprint } from './docx-reader.js';
import { TemplateProcessor } from './template-processor.js';

export interface FileGenerationOptions {
  outputDir: string;
  filePrefix?: string;
  templateProcessor: TemplateProcessor;
}

/**
 * Generate individual markdown files for Sprint, Stories, and Subtasks
 */
export class FileGenerator {
  constructor(private options: FileGenerationOptions) {}
  
  /**
   * Generate all files from sprints data
   */
  async generateAllFiles(sprints: Sprint[]): Promise<string[]> {
    const generatedFiles: string[] = [];
    
    // Ensure output directory exists
    await fs.mkdir(this.options.outputDir, { recursive: true });
    
    for (let sprintIdx = 0; sprintIdx < sprints.length; sprintIdx++) {
      const sprint = sprints[sprintIdx];
      const sprintNumber = sprintIdx + 1;
      
      // Generate Sprint file
      const sprintFile = await this.generateSprintFile(sprint, sprintNumber, sprints.length);
      generatedFiles.push(sprintFile);
      
      // Generate Story files
      for (let storyIdx = 0; storyIdx < sprint.stories.length; storyIdx++) {
        const story = sprint.stories[storyIdx];
        const storyNumber = storyIdx + 1;
        
        const storyFile = await this.generateStoryFile(story, sprintNumber, storyNumber);
        generatedFiles.push(storyFile);
        
        // Generate Subtask files
        for (let subtaskIdx = 0; subtaskIdx < story.subtasks.length; subtaskIdx++) {
          const subtask = story.subtasks[subtaskIdx];
          const subtaskNumber = subtaskIdx + 1;
          
          const subtaskFile = await this.generateSubtaskFile(
            subtask,
            sprintNumber,
            storyNumber,
            subtaskNumber
          );
          generatedFiles.push(subtaskFile);
        }
      }
    }
    
    return generatedFiles;
  }
  
  /**
   * Generate Sprint markdown file
   */
  private async generateSprintFile(
    sprint: Sprint,
    sprintNumber: number,
    totalSprints: number
  ): Promise<string> {
    const content = this.options.templateProcessor.processSprintTemplate(
      sprint,
      sprintNumber,
      totalSprints
    );
    
    const filename = this.buildFilename('sprint', sprintNumber);
    const filepath = path.join(this.options.outputDir, filename);
    
    await fs.writeFile(filepath, content, 'utf-8');
    return filepath;
  }
  
  /**
   * Generate Story markdown file
   */
  private async generateStoryFile(
    story: any,
    sprintNumber: number,
    storyNumber: number
  ): Promise<string> {
    const content = this.options.templateProcessor.processStoryTemplate(
      story,
      sprintNumber,
      storyNumber
    );
    
    const filename = this.buildFilename('story', sprintNumber, storyNumber);
    const filepath = path.join(this.options.outputDir, filename);
    
    await fs.writeFile(filepath, content, 'utf-8');
    return filepath;
  }
  
  /**
   * Generate Subtask markdown file
   */
  private async generateSubtaskFile(
    subtask: any,
    sprintNumber: number,
    storyNumber: number,
    subtaskNumber: number
  ): Promise<string> {
    const content = this.options.templateProcessor.processSubtaskTemplate(
      subtask,
      sprintNumber,
      storyNumber,
      subtaskNumber
    );
    
    const filename = this.buildFilename('subtask', sprintNumber, storyNumber, subtaskNumber);
    const filepath = path.join(this.options.outputDir, filename);
    
    await fs.writeFile(filepath, content, 'utf-8');
    return filepath;
  }
  
  /**
   * Build filename with optional prefix
   */
  private buildFilename(type: string, ...numbers: number[]): string {
    const prefix = this.options.filePrefix || '';
    const numbersStr = numbers.join('_');
    return `${prefix}${type}_${numbersStr}.md`;
  }
}
