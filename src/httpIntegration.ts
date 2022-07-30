import { existsSync } from 'fs';
import { JsonFile, Project, SourceCode, TextFile } from 'projen';

export class HttpIntegration {
  constructor(project: Project) {
    if (!existsSync('src/http-integration/schema.json')) {
      this.schemaJson(project);
    }

    if (!existsSync('src/http-integration/index.ts')) {
      this.sampleCode(project);
    }

    if (!existsSync('src/http-integration/config.yml')) {
      this.configYaml(project);
    }
  }

  sampleCode(project: Project) {
    const code = new SourceCode(project, 'src/http-integration/index.ts', {
      readonly: false,
      indent: 2,
    });

    code.line('import { APIGatewayProxyEvent, Context } from \'aws-lambda\';');
    code.line('import { Logger } from \'@aws-lambda-powertools/logger\';');
    code.line('');
    code.line('const logger = new Logger({ logLevel: \'INFO\', serviceName: \'Example\' });');
    code.line('');
    code.open('export const handler = async(event: APIGatewayProxyEvent, context: Context) => {');
    code.line('logger.addContext(context);');
    code.line('const body = JSON.parse(event.body ?? \'\');');
    code.line('');
    code.line('logger.info(\'Payload\', body);');
    code.line('');
    code.line('// some code here');
    code.line('');
    code.open('return {');
    code.line('statusCode: 200,');
    code.line('body: JSON.stringify(body, undefined, 2)');
    code.close('}');
    code.close('}');

    code.synthesize();
  }

  schemaJson(project: Project) {
    return new JsonFile(project, 'src/http-integration/schema.json', {
      marker: false,
      readonly: false,
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

    return new TextFile(project, 'src/http-integration/config.yml', {
      marker: false,
      committed: true,
      readonly: false,
      lines: [obj],
    });
  }
}