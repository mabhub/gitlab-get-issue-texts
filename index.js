import { Gitlab } from '@gitbeaker/node';
import dotenv from 'dotenv';
dotenv.config();

const PROJECT_ID = process.argv[2] || process.env.PROJECT_ID;
const ISSUE_ID = process.argv[3] || process.env.ISSUE_ID;

const api = new Gitlab({
  host: 'https://gitlab.makina-corpus.net',
  token: process.env.TOKEN,
});

const issue = await api.Issues.show(PROJECT_ID, ISSUE_ID);
const comments = (await api.IssueNotes.all(PROJECT_ID, ISSUE_ID))
  .filter(({ system }) => !system)
  .sort((a, b) => a.created_at.localeCompare(b.created_at));

const output = `
# ${issue.title}

*Créé par \`${issue.author.username}\` le \`${issue.created_at}\`*

${issue.description}
` + comments.map(comment => `----

*Par \`${comment.author.username}\` le \`${comment.created_at}\`*

${comment.body}
`).join('\n');

process.stdout.write(output + '\n\n');
