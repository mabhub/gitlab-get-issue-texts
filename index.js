import { Gitlab } from '@gitbeaker/node';
import dotenv from 'dotenv';
dotenv.config();

const issueToMd = obj => [
  `# ${issue.title}`,
  `*Créé par \`${obj.author.username}\` le \`${obj.created_at}\`*`,
  obj.description
].join('\n\n');

const replyToMd = obj => [
  `*Par \`${obj.author.username}\` le \`${obj.created_at}\`*`,
  obj.body
].join('\n\n');


const PROJECT_ID = process.argv[2] || process.env.PROJECT_ID;
const ISSUE_ID = process.argv[3] || process.env.ISSUE_ID;

const api = new Gitlab({
  host: 'https://gitlab.makina-corpus.net',
  token: process.env.TOKEN,
});

const issue = await api.Issues.show(PROJECT_ID, ISSUE_ID);
const discussions = await api.IssueDiscussions.all(PROJECT_ID, ISSUE_ID);

const output = [issueToMd(issue)];

discussions.forEach(discussion => {
  const [first, ...replies] = discussion.notes;

  output.push('----');

  output.push(replyToMd(first));

  if (replies.length) output.push('<div style="padding-left: 3em;">');

  replies.forEach((reply) => {
    output.push('----');
    output.push(replyToMd(reply));
  });

  if (replies.length) output.push('</div>');
});

process.stdout.write(output.join('\n\n') + '\n\n');
