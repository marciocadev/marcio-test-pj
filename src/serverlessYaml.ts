import { Project, TextFile } from 'projen';

export function serverlessYaml(project: Project) {
  const yaml = `service: ${project.name}
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs14.x
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-2'}

custom:
  esbuild:
    bundle: true
    minify: true

plugins:
  - serverless-esbuild
`;

  return new TextFile(project, 'serverless.yml', {
    readonly: false,
    marker: false,
    committed: true,
    lines: [yaml],
  });
}