const fs = require('fs');
const path = require('path');

// Modules to check (from App.tsx)
const modulesToCheck = [
  'src/components/modules/dashboard/PulseDashboard.tsx',
  'src/components/modules/core/dashboard/AnalyticsDashboard.tsx',
  'src/components/modules/automation/WorkflowEditor.tsx',
  'src/components/modules/automation/WebhookServer.tsx',
  'src/components/modules/infra/ServerManager.tsx',
  'src/components/modules/infra/DockerPilot.tsx',
  'src/components/modules/infra/UptimeMonitor.tsx',
  'src/components/modules/knowledge/Brain.tsx',
  'src/components/modules/knowledge/CourseTracker.tsx',
  'src/components/modules/knowledge/SnippetLibrary.tsx',
  'src/components/modules/finance/DocumentBuilder.tsx',
  'src/components/modules/finance/expenses/ExpenseManagerEnhanced.tsx',
  'src/components/modules/finance/invoices/history/InvoiceHistory.tsx',
  'src/components/modules/finance/products/ProductManager.tsx',
  'src/components/modules/finance/TaxVault.tsx',
  'src/components/modules/crm/clients/ClientManager.tsx',
  'src/components/modules/crm/pipeline/LeadsPipeline.tsx',
  'src/components/modules/communication/EmailClient.tsx',
  'src/components/modules/productivity/ProjectHub.tsx',
  'src/components/modules/productivity/tasks/TaskListEnhanced.tsx',
  'src/components/modules/productivity/tracker/TimeTracker.tsx',
  'src/components/modules/productivity/calendar/Calendar.tsx',
  'src/components/modules/productivity/documents/DocumentHub.tsx',
  'src/components/modules/legal/ContractWizard.tsx',
  'src/components/modules/hr/AssetInventory.tsx',
  'src/components/modules/hr/PayrollLite.tsx',
  'src/components/modules/marketing/MarketingDashboard.tsx',
  'src/components/modules/marketing/SEOToolkit.tsx',
  'src/components/modules/marketing/AdManager.tsx',
  'src/components/modules/marketing/NewsletterStudio.tsx',
  'src/components/modules/dev/DevHQ.tsx',
  'src/components/modules/ai/ResearchAgent.tsx',
  'src/components/modules/ai/VoiceCommand.tsx',
  'src/components/modules/dev/TraeCoder.tsx',
  'src/components/modules/core/settings/SettingsPanel.tsx',
  'src/components/modules/security/PasswordManager.tsx',
  'src/components/modules/system/SystemUpdate.tsx'
];

// Stores that might cause circular dependencies
const problematicStores = [
  'widget-registry',
  'widget-store',
  'theme-store',
  'auth-store'
];

console.log('🔍 Scanning for potential circular dependencies...\n');

let issuesFound = 0;

modulesToCheck.forEach(modulePath => {
  const fullPath = path.join(__dirname, '..', modulePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${modulePath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const imports = content.match(/import.*from\s+['"]@\/stores\/([\w-]+)['"]/g) || [];
  
  const storeImports = imports.map(imp => {
    const match = imp.match(/from\s+['"]@\/stores\/([\w-]+)['"]/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  const hasProblematicImports = storeImports.some(store => 
    problematicStores.includes(store)
  );
  
  if (hasProblematicImports) {
    console.log(`❌ ${modulePath}`);
    console.log(`   Imports: ${storeImports.join(', ')}`);
    console.log('');
    issuesFound++;
  }
});

console.log(`\n📊 Summary: ${issuesFound} modules with potential circular dependency issues`);

if (issuesFound > 0) {
  console.log('\n💡 These modules should use dynamic store loading like Dashboard.tsx');
}
