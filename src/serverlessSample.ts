import { JsonFile, Project, TextFile } from 'projen';

export class ServerlessSample {
  constructor(project: Project) {
    this.configYaml(project);
  }

  schameJson(project: Project) {
    return new JsonFile(project, 'src/lambda/this.schameJson.json', {
      marker: false,
      committed: true,
      obj: {
        $schema: 'http://json-schema.org/draft-04/schema',
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
    });
  }

  configYaml(project: Project) {
    const obj = `LambdaHTTPExample:
  name: \${self:provider.stage}-\${self:service}-lambda-http-example
  handler: src/lambda/index.handler

  events:
    - http:
      method: post
      path: http/example
      request:
        schemas:
          application/json: \${file(src/lambda/schema.json)}

  vpc:
    securityGroupIds:
      - \${cf:\${self:provider.env}-network.LambdaSecurityGroup}
    subnetIds:
      - \${cf:\${self:provider.env}-network.PrivateSubnetA}
      - \${cf:\${self:provider.env}-network.PrivateSubnetB}
`;

    return new TextFile(project, 'src/lambda/config.yml', {
      marker: true,
      committed: true,
      lines: [obj],
    });
  }
}