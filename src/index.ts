import { TypeScriptProject, TypeScriptProjectOptions } from 'projen/lib/typescript';
import { bitbucketPipelines } from './bitbucket';
import { HttpIntegration } from './httpIntegration';
import { serverlessYaml } from './serverlessYaml';
import { SQSIntegration } from './sqsIntegration';
import { vscodeSettings } from './vscode';

export class MarcioTestPj extends TypeScriptProject {
  constructor(options: TypeScriptProjectOptions) {
    const readme = `# ${options.name}

Basic project
`;
    super({
      github: false,
      projenrcTs: true,
      licensed: false,
      readme: {
        filename: 'README.md',
        contents: readme,
      },
      sampleCode: false,
      // deps: [
      //   'serverless',
      //   'serverless-esbuild',
      //   '@types/aws-lambda',
      //   '@aws-lambda-powertools/logger',
      // ],
      ...options,
    });

    this.removeUndesirebleScripts();

    this.addScripts();

    vscodeSettings(this);
    serverlessYaml(this);
    bitbucketPipelines(this);

    new HttpIntegration(this);
    new SQSIntegration(this);
  }

  synth(): void {
    this.addDeps('serverless');
    this.addDeps('serverless-esbuild');
    this.addDeps('@types/aws-lambda');
    this.addDeps('@aws-lambda-powertools/logger');

    super.synth();
  }

  addScripts() {
    this.package.setScript('deploy', 'sls deploy');
    this.package.setScript('remove', 'sls remove');
    this.package.setScript('package', 'sls package');
  }

  removeUndesirebleScripts() {
    this.package.removeScript('build');
    this.package.removeScript('bump');
    this.package.removeScript('clobber');
    this.package.removeScript('default');
    this.package.removeScript('eject');
    this.package.removeScript('eslint');
    this.package.removeScript('package');
    this.package.removeScript('post-compile');
    this.package.removeScript('post-upgrade');
    this.package.removeScript('pre-compile');
    this.package.removeScript('release');
    this.package.removeScript('test');
    this.package.removeScript('test:update');
    this.package.removeScript('test:watch');
    this.package.removeScript('unbump');
    this.package.removeScript('upgrade');
    this.package.removeScript('watch');
    this.package.removeScript('projen');
  }
}