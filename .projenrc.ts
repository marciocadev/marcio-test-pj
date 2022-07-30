import { cdk } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Marcio Almeida',
  authorAddress: 'marciocadev@gmail.com',
  defaultReleaseBranch: 'main',
  name: 'marcio-test-pj',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/marciocadev/marcio-test-pj.git',

  release: true,
  publishTasks: true,
  deps: ['projen'],
  peerDeps: ['projen'],
});
project.synth();