#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readSprintsFromDocx } from "./docx-reader.js";
import { MarkdownTemplateProcessor } from "./template-processor.js";
import { FileGenerator } from "./file-generator.js";

// Create MCP server instance
const server = new McpServer({
  name: "sprint-docx-processor",
  version: "1.0.0",
});

/**
 * Tool 1: analyze_sprint_document
 * Analyzes a DOCX file and returns the hierarchical structure
 */
server.tool(
  "analyze_sprint_document",
  "Analyze a DOCX Sprint document and return its hierarchical structure (Sprints -> Stories -> Subtasks)",
  {
    docxPath: z.string().describe("Absolute path to the DOCX file containing Sprint data"),
  },
  async ({ docxPath }) => {
    try {
      const sprints = await readSprintsFromDocx(docxPath);
      
      const summary = {
        total_sprints: sprints.length,
        sprints: sprints.map((sprint, idx) => ({
          sprint_number: idx + 1,
          title: sprint.title,
          description: sprint.description,
          story_count: sprint.stories.length,
          stories: sprint.stories.map((story, storyIdx) => ({
            story_number: storyIdx + 1,
            title: story.title,
            content_length: story.content.length,
            subtask_count: story.subtasks.length,
          })),
        })),
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing document: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Tool 2: generate_sprint_files
 * Generate individual markdown files for all Sprints, Stories, and Subtasks
 */
server.tool(
  "generate_sprint_files",
  "Generate individual markdown files for each Sprint, Story, and Subtask from a DOCX document",
  {
    docxPath: z.string().describe("Absolute path to the DOCX file containing Sprint data"),
    outputDir: z.string().describe("Directory where markdown files will be generated"),
    templatesDir: z.string().describe("Directory containing sprint.md, story.md, and subtask.md template files"),
    filePrefix: z.string().optional().describe("Optional prefix for generated filenames"),
  },
  async ({ docxPath, outputDir, templatesDir, filePrefix }) => {
    try {
      // Parse DOCX
      const sprints = await readSprintsFromDocx(docxPath);
      
      // Load templates
      const templateProcessor = new MarkdownTemplateProcessor(templatesDir);
      await templateProcessor.loadTemplates();
      
      // Generate files
      const fileGenerator = new FileGenerator({
        outputDir,
        filePrefix,
        templateProcessor,
      });
      
      const generatedFiles = await fileGenerator.generateAllFiles(sprints);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              generated_files_count: generatedFiles.length,
              output_directory: outputDir,
              files: generatedFiles,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating files: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Tool 3: process_single_sprint
 * Process and generate files for a single Sprint by index
 */
server.tool(
  "process_single_sprint",
  "Process and generate markdown files for a single Sprint (and its Stories/Subtasks) by index",
  {
    docxPath: z.string().describe("Absolute path to the DOCX file containing Sprint data"),
    sprintIndex: z.number().describe("Zero-based index of the Sprint to process (0 for first Sprint)"),
    outputDir: z.string().describe("Directory where markdown files will be generated"),
    templatesDir: z.string().describe("Directory containing sprint.md, story.md, and subtask.md template files"),
    filePrefix: z.string().optional().describe("Optional prefix for generated filenames"),
  },
  async ({ docxPath, sprintIndex, outputDir, templatesDir, filePrefix }) => {
    try {
      // Parse DOCX
      const sprints = await readSprintsFromDocx(docxPath);
      
      if (sprintIndex < 0 || sprintIndex >= sprints.length) {
        throw new Error(`Invalid sprint index: ${sprintIndex}. Valid range: 0-${sprints.length - 1}`);
      }
      
      // Get single sprint
      const targetSprint = sprints[sprintIndex];
      
      // Load templates
      const templateProcessor = new MarkdownTemplateProcessor(templatesDir);
      await templateProcessor.loadTemplates();
      
      // Generate files for this sprint only
      const fileGenerator = new FileGenerator({
        outputDir,
        filePrefix,
        templateProcessor,
      });
      
      const generatedFiles = await fileGenerator.generateAllFiles([targetSprint]);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              sprint_number: sprintIndex + 1,
              sprint_title: targetSprint.title,
              generated_files_count: generatedFiles.length,
              output_directory: outputDir,
              files: generatedFiles,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error processing sprint: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Main entry point
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sprint DOCX MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
