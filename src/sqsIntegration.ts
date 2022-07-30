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

    code.line('import { SQSEvent, Context } from \'aws-lambda\';');
    code.line('import { Logger } from \'@aws-lambda-powertools/logger\';');
    code.line('');
    code.line('const logger = new Logger({ logLevel: \'INFO\', serviceName: \'Example\' });');
    code.line('');
    code.open('export const handler = async(event: SQSEvent, context: Context) => {');
    code.line('logger.addContext(context);');
    code.line('');
    code.open('for (const record of event.Records) {');
    code.line('const payload = JSON.parse(record.body);');
    code.line('logger.info(\'Payload\', payload);');
    code.line('');
    code.line('// some code here');
    code.close('}');
    code.line('');
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