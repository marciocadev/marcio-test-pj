import { JsonFile, Project, SourceCode, TextFile } from 'projen';

export class ServerlessSample {
  constructor(project: Project) {
    this.configYaml(project);
    this.schemaJson(project);
    this.sampleCode(project);
  }

  sampleCode(project: Project) {
    const code = new SourceCode(project, 'src/lambda/index.ts', {
      readonly: false,
      indent: 2,
    });

    code.line('import { APIGatewayProxyEvent, Content } from \'aws-lambda\';');
    code.line('import { Logger } from \'@aws-lambda-powertools/logger\';');
    code.line('');
    code.line('const logger = new Logger({ logLevel: \'INFO\', serviceName: \'Example\' });');
    code.line('');
    code.open('export const handler = async(event: APIGatewayProxyEvent, context: Context) => {');
    code.line('logger.addContext(context);');
    code.line('const body = JSON.parse(event.body ?? \'\'');
    code.line('');
    code.line('logger.info(\'Payload\' ,body);');
    code.line('');
    code.line('// some code here');
    code.open('return {');
    code.line('statusCode: 200,');
    code.line('body: JSON.stringfy(body, undefined, 2)');
    code.close('}');
    code.close('}');

    code.synthesize();
  }

  schemaJson(project: Project) {
    return new JsonFile(project, 'src/lambda/schema.json', {
      marker: false,
      committed: true,
      obj: {
        $schema: 'http://json-schema.org/draft-04/schema',
        type: 'object',
        required: ['intType'],
        properties: {
          intType: { type: 'integer' },
          objType: {
            type: 'object',
            properties: {
              numType: { type: 'number' },
              strType: { type: 'string' },
            },
          },
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