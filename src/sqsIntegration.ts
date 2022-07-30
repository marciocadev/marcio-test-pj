import { existsSync } from 'fs';
import { Project, SourceCode, TextFile } from 'projen';

export class SQSIntegration {
  readonly indexPath = 'src/sqs-integration/index.ts';
  readonly configPath = 'src/sqs-integration/config.yml';
  readonly sqsCfnPath = 'cloudformation/sqs.yml';

  constructor(project: Project) {
    if (!existsSync(this.indexPath)) {
      this.sampleCode(project);
    }

    if (!existsSync(this.configPath)) {
      this.configYaml(project);
    }

    if (!existsSync(this.sqsCfnPath)) {
      this.sqsCfnYaml(project);
    }
  }

  sampleCode(project: Project) {
    const code = new SourceCode(project, this.indexPath, {
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

  configYaml(project: Project) {
    const obj = `LambdaSQSExample:
  name: \${self:provider.stage}-\${self:service}-lambda-sqs-example
  handler: src/sqs-integration/index.handler

  events:
    - sqs:
        arn:
          Fn::GetAtt:
              - ExampleQueue
              - Arn

  vpc:
    securityGroupIds:
      - \${cf:\${self:provider.env}-network.LambdaSecurityGroup}
    subnetIds:
      - \${cf:\${self:provider.env}-network.PrivateSubnetA}
      - \${cf:\${self:provider.env}-network.PrivateSubnetB}
`;

    return new TextFile(project, this.configPath, {
      marker: false,
      committed: true,
      readonly: false,
      lines: [obj],
    });
  }

  sqsCfnYaml(project: Project) {
    const obj = `Resources:
  ExampleQueue:
    Type: AWS::SQS::Queue
      Properties:
        QueueName: \${self:provider.stage}-\${self:service}-sqs-example
`;

    return new TextFile(project, this.sqsCfnPath, {
      marker: false,
      committed: true,
      readonly: false,
      lines: [obj],
    });
  }
}