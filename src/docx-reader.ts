import mammoth from 'mammoth';
import * as fs from 'fs/promises';

export interface Subtask {
  content: string;
}

export interface Story {
  title: string;
  content: string;
  subtasks: Subtask[];
}

export interface Sprint {
  title: string;
  description: string;
  stories: Story[];
}

/**
 * Parse Sprint section title (e.g., "Sprint 1.1" or "Sprint X.X")
 */
function parseSprintTitle(text: string): { isSprint: boolean; sprintNumber?: string } {
  const sprintPattern = /^Sprint\s+(\d+\.\d+)/i;
  const match = text.match(sprintPattern);
  
  if (match) {
    return { isSprint: true, sprintNumber: match[1] };
  }
  return { isSprint: false };
}

/**
 * Parse Story section title (e.g., "User Story:..." or containing "User Story")
 */
function parseStoryTitle(text: string): { isStory: boolean; title?: string } {
  const storyKeywords = ['user story', 'história de usuário', 'story'];
  const lowerText = text.toLowerCase();
  
  if (storyKeywords.some(keyword => lowerText.includes(keyword))) {
    return { isStory: true, title: text.trim() };
  }
  return { isStory: false };
}

/**
 * Parse Subtask section title (e.g., "Tarefa X.X.X")
 */
function parseSubtaskTitle(text: string): { isSubtask: boolean; taskNumber?: string } {
  const subtaskPattern = /^Tarefa\s+(\d+\.\d+\.\d+)/i;
  const match = text.match(subtaskPattern);
  
  if (match) {
    return { isSubtask: true, taskNumber: match[1] };
  }
  return { isSubtask: false };
}

/**
 * Read and parse DOCX file containing Sprints, Stories, and Subtasks
 */
export async function readSprintsFromDocx(filePath: string): Promise<Sprint[]> {
  try {
    // Read DOCX file
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    const fullText = result.value;
    
    // Split by lines
    const lines = fullText.split('\n').map(line => line.trim()).filter(line => line);
    
    const sprints: Sprint[] = [];
    let currentSprint: Sprint | null = null;
    let currentStory: Story | null = null;
    let currentSubtask: Subtask | null = null;
    let contentBuffer: string[] = [];
    
    for (const line of lines) {
      const sprintInfo = parseSprintTitle(line);
      const storyInfo = parseStoryTitle(line);
      const subtaskInfo = parseSubtaskTitle(line);
      
      // New Sprint detected
      if (sprintInfo.isSprint) {
        // Save previous subtask if exists
        if (currentSubtask && currentStory) {
          currentSubtask.content += '\n' + contentBuffer.join('\n').trim();
        }
        // If no subtasks, save buffer to story content
        else if (currentStory && contentBuffer.length > 0) {
          currentStory.content = contentBuffer.join('\n').trim();
        }
        
        contentBuffer = [];
        
        // Save previous story if exists
        if (currentStory && currentSprint) {
          currentSprint.stories.push(currentStory);
          currentStory = null;
          currentSubtask = null;
        }
        
        // Save previous sprint if exists
        if (currentSprint) {
          sprints.push(currentSprint);
        }
        
        // Start new sprint
        currentSprint = {
          title: line,
          description: '',
          stories: []
        };
      }
      // New Story detected
      else if (storyInfo.isStory && currentSprint) {
        // Save previous subtask if exists
        if (currentSubtask && currentStory) {
          currentSubtask.content += '\n' + contentBuffer.join('\n').trim();
          currentSubtask = null;
        }
        // If no subtasks, save buffer to story content
        else if (currentStory && contentBuffer.length > 0) {
          currentStory.content = contentBuffer.join('\n').trim();
        }
        
        contentBuffer = [];
        
        // Save previous story if exists
        if (currentStory && currentSprint) {
          currentSprint.stories.push(currentStory);
        }
        
        // Start new story
        currentStory = {
          title: storyInfo.title || line,
          content: '',
          subtasks: []
        };
      }
      // New Subtask detected
      else if (subtaskInfo.isSubtask && currentStory) {
        // Save previous subtask if exists
        if (currentSubtask) {
          currentSubtask.content += '\n' + contentBuffer.join('\n').trim();
        }
        // Save current story content if this is the first subtask
        else if (contentBuffer.length > 0) {
          currentStory.content = contentBuffer.join('\n').trim();
        }
        
        // Clear buffer after saving
        contentBuffer = [];
        
        // Start new subtask
        currentSubtask = {
          content: line
        };
        currentStory.subtasks.push(currentSubtask);
      }
      // Regular content line
      else {
        contentBuffer.push(line);
      }
    }
    
    // Save last subtask if exists
    if (currentSubtask && contentBuffer.length > 0) {
      currentSubtask.content += '\n' + contentBuffer.join('\n').trim();
      contentBuffer = [];
    }
    
    // Save last story and sprint
    if (currentStory && currentSprint) {
      // Only save buffer to story if story content is still empty (no subtasks were found)
      if (currentStory.content.length === 0 && contentBuffer.length > 0) {
        currentStory.content = contentBuffer.join('\n').trim();
      }
      currentSprint.stories.push(currentStory);
    }
    if (currentSprint) {
      sprints.push(currentSprint);
    }
    
    return sprints;
  } catch (error) {
    throw new Error(`Failed to read DOCX file: ${error instanceof Error ? error.message : String(error)}`);
  }
}
