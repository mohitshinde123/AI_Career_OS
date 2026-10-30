import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Industry } from '../models/Industry.js';

// The eight named industry areas come from the approved TalentBridge Blueprint v2.
// This seed inserts missing taxonomy records only; it never overwrites owner-edited records.
const industries = [
  { industryId: 'software-engineering', slug: 'software-engineering', name: 'Software Engineering', summary: 'Build scalable applications and shape the digital world.', description: 'Explore software engineering disciplines and the roles that design, build, test and maintain software systems.', iconKey: 'code', sortOrder: 10 },
  { industryId: 'data-science', slug: 'data-science', name: 'Data Science', summary: 'Turn data into insights and drive decisions.', description: 'Explore work involving data analysis, statistical methods, experimentation and data-informed decisions.', iconKey: 'database', sortOrder: 20 },
  { industryId: 'artificial-intelligence', slug: 'artificial-intelligence', name: 'Artificial Intelligence', summary: 'Build intelligent systems for a smarter tomorrow.', description: 'Explore roles focused on machine learning, intelligent systems and applied artificial intelligence.', iconKey: 'brain', sortOrder: 30 },
  { industryId: 'cybersecurity', slug: 'cybersecurity', name: 'Cybersecurity', summary: 'Protect systems, data and people from digital threats.', description: 'Explore security work across application, infrastructure, operations and risk.', iconKey: 'shield', sortOrder: 40 },
  { industryId: 'cloud-engineering', slug: 'cloud-engineering', name: 'Cloud Engineering', summary: 'Design and manage cloud infrastructure and services.', description: 'Explore the engineering of cloud platforms, infrastructure, reliability and services.', iconKey: 'cloud', sortOrder: 50 },
  { industryId: 'devops', slug: 'devops', name: 'DevOps', summary: 'Bridge development and operations for faster delivery.', description: 'Explore practices and roles that connect software delivery, automation and operational reliability.', iconKey: 'infinity', sortOrder: 60 },
  { industryId: 'product-management', slug: 'product-management', name: 'Product Management', summary: 'Turn ideas into products that create value.', description: 'Explore work involving product discovery, prioritization, strategy and cross-functional delivery.', iconKey: 'product', sortOrder: 70 },
  { industryId: 'ui-ux-design', slug: 'ui-ux-design', name: 'UI/UX Design', summary: 'Create seamless and meaningful user experiences.', description: 'Explore user research, interaction design, visual design, accessibility and design systems.', iconKey: 'design', sortOrder: 80 },
];

try {
  await connectDatabase();
  let inserted = 0;
  for (const industry of industries) {
    const result = await Industry.updateOne(
      { industryId: industry.industryId },
      { $setOnInsert: {
        ...industry,
        lifecycle: 'published',
        contentVersion: 1,
        reviewedAt: new Date(),
        sourceReferences: [{
          title: 'TalentBridge Blueprint v2 — approved industry scope',
          publisher: 'TalentBridge product specification',
          usageNotes: 'Industry category included in the owner-approved product blueprint; descriptions are editorial summaries, not market claims.',
        }],
      } },
      { upsert: true },
    );
    if (result.upsertedCount) inserted += 1;
  }
  console.log(`Industry catalogue ready. Inserted ${inserted} new records; existing records were preserved.`);
} finally {
  await disconnectDatabase();
}
