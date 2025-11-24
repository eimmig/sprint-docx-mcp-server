import { readSprintsFromDocx } from './build/docx-reader.js';
import { MarkdownTemplateProcessor } from './build/template-processor.js';
import { FileGenerator } from './build/file-generator.js';

async function main() {
  try {
    const docxPath = 'd:\\UTFPR\\TCC\\AI Sprint Manager\\input.docx';
    const outputDir = 'd:\\UTFPR\\TCC\\AI Sprint Manager\\output';
    const templatesDir = 'd:\\UTFPR\\TCC\\AI Sprint Manager';
    
    console.log('📖 Lendo documento DOCX...');
    const sprints = await readSprintsFromDocx(docxPath);
    
    console.log(`✅ Encontrados ${sprints.length} sprints`);
    
    // Processar apenas a Sprint 1 (índice 0)
    const sprint1 = [sprints[0]];
    
    console.log('📝 Carregando templates...');
    const templateProcessor = new MarkdownTemplateProcessor(templatesDir);
    await templateProcessor.loadTemplates();
    
    console.log('📁 Gerando arquivos...');
    const fileGenerator = new FileGenerator({
      outputDir,
      templateProcessor,
    });
    
    const generatedFiles = await fileGenerator.generateAllFiles(sprint1);
    
    console.log(`\n✅ Sucesso! ${generatedFiles.length} arquivos gerados:`);
    generatedFiles.forEach(file => console.log(`   - ${file}`));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
