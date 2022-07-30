// import { NodePackage, NodePackageOptions } from 'projen/lib/javascript';
import { TypeScriptProject, TypeScriptProjectOptions } from 'projen/lib/typescript';
import { bitbucketPipelines } from './bitbucket';
import { HttpIntegration } from './httpIntegration';
import { serverlessYaml } from './serverlessYaml';

export class MarcioTestPj extends TypeScriptProject {
  constructor(options: TypeScriptProjectOptions) {
    const readme = `# ${options.name}

Basic project
`;
    super({
      github: false,
      projenrcTs: true,
      readme: {
        filename: 'README.md',
        contents: readme,
      },
      sampleCode: false,
      deps: [
        'projen',
        'serverless',
        'serverless-esbuild',
        '@types/aws-lambda',
        '@aws-lambda-powertools/logger',
      ],
      ...options,
    });

    this.removeUndesirebleScripts();

    this.addScripts();

    serverlessYaml(this);
    bitbucketPipelines(this);

    new HttpIntegration(this);
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
    //this.package.removeScript('eslint');
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