
import { LinearService } from './linear_client.js';

const linear = new LinearService();

const SEED_DATA = [
    {
        projectName: "agency-ops",
        tasks: [
            { title: "Audit 1Password Vault Permissions", priority: 1, description: "Ensure 'Private' vault is accessible or move keys to 'API-Keys'." },
            { title: "Configure new user onboarding script", priority: 2, description: "Automate shell setup, dotfiles, and SSH keys." },
            { title: "Review Server Security Hardening", priority: 2, description: "Check UFW firewall rules and SSH config." }
        ]
    },
    {
        projectName: "dashboard-daddy",
        tasks: [
            { title: "Initialize Next.js project structure", priority: 1, description: "Set up app router, tailwind, and basic layout." },
            { title: "Connect to Vercel for Deployment", priority: 1, description: "Link repo to Vercel and verify build pipeline." },
            { title: "Implement basic Auth (Supabase/NextAuth)", priority: 2, description: "Secure the dashboard." }
        ]
    },
    {
        projectName: "voice-agent-platform",
        tasks: [
            { title: "Database-backed configs", priority: 2 },
            { title: "Hot reloading", priority: 2 },
            { title: "Config versioning", priority: 3 },
            { title: "UI management interface", priority: 3 },
            { title: "Analytics integration", priority: 3 },
            { title: "Template system", priority: 4 },
            { title: "Validation schemas", priority: 4 }
        ]
    }
];

async function seed() {
    console.log("🚀 Executing Expert Setup Strategy...");
    const me = await linear.client.viewer;
    const teams = await me.teams();
    const team = teams.nodes[0];

    for (const data of SEED_DATA) {
        console.log(`\n📂 Project: ${data.projectName}`);

        // Find Project
        const projects = await team.projects({ filter: { name: { contains: data.projectName } } });
        if (projects.nodes.length === 0) {
            console.log(`  ❌ Project not found.`);
            continue;
        }
        const project = projects.nodes[0];

        // Create Issues
        for (const task of data.tasks) {
            // Check existence logic skipped for speed/simplicity in seed script - assumption is fresh or idempotent enough for now
            // Better: Check active issues in project with same title
            const exists = await project.issues({ filter: { title: { eq: task.title } } });
            if (exists.nodes.length > 0) {
                console.log(`  - [SKIP] "${task.title}" (Exists)`);
                continue;
            }

            try {
                await linear.client.createIssue({
                    teamId: team.id,
                    projectId: project.id,
                    title: task.title,
                    description: task.description || "Expert PM Recommended Task",
                    priority: task.priority,
                    assigneeId: me.id
                });
                console.log(`  ✅ Created: "${task.title}" (P${task.priority})`);
            } catch (e) {
                console.error(`  ❌ Failed: "${task.title}"`, e.message);
            }
        }
    }
    console.log("\n✨ Expert Setup Complete. You are ready to ship.");
}

seed();
