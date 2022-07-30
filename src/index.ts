import { YamlFile } from 'projen';
// import { NodePackage, NodePackageOptions } from 'projen/lib/javascript';
import { TypeScriptProject, TypeScriptProjectOptions } from 'projen/lib/typescript';

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
      deps: [
        'serverless',
        'serverless-esbuild',
        '@types/aws-lambda',
        '@aws-lambda-powertools/logger',
      ],
      ...options,
    });

    this.package.removeScript('build');
    this.package.removeScript('bump');
    this.package.removeScript('clobber');
    //this.package.removeScript('default');
    this.package.removeScript('eject');
    //this.package.removeScript('eslint');
    this.package.removeScript('package');
    this.package.removeScript('post-compile');
    this.package.removeScript('post-upgrade');
    this.package.removeScript('pre-compile');
    this.package.removeScript('release');
    //this.package.removeScript('test');
    this.package.removeScript('test:update');
    this.package.removeScript('test:watch');
    this.package.removeScript('unbump');
    this.package.removeScript('upgrade');
    this.package.removeScript('watch');
    //this.package.removeScript('projen');

    this.package.setScript('deploy', 'sls deploy');
    this.package.setScript('remove', 'sls remove');
    this.package.setScript('package', 'sls package');
  }

  synth(): void {
    new YamlFile(this, 'bitbucket-pipelines.yml', {
      obj: {
        pipelines: {
          branches: [
            {
              'feature/*': [
                { step: '*npm-test' },
                { step: '*npm-install' },
                {
                  step: {
                    '<<': '*sls-deploy',
                    'name': 'Dev',
                    'deployment': 'dev',
                  },
                },
              ],
            },
            {
              develop: [
                { step: '*npm-test' },
                { step: '*npm-install' },
                {
                  step: {
                    '<<': '*sls-deploy',
                    'name': 'Dev',
                    'deployment': 'dev',
                  },
                },
              ],
            },
            {
              'release/*': [
                { step: '*npm-install' },
                {
                  step: {
                    '<<': '*sls-deploy',
                    'name': 'Stage',
                    'deployment': 'hmg',
                    'trigger': 'manual',
                  },
                },
                {
                  step: {
                    '<<': '*tag',
                    'trigger': 'manual',
                  },
                },
                {
                  step: {
                    '<<': '*sls-deploy',
                    'name': 'Production',
                    'deployment': 'prd',
                    'trigger': 'manual',
                  },
                },
              ],
            },
            {
              'hotfix/*': [
                { step: '*npm-install' },
                {
                  step: {
                    '<<': '*sls-deploy',
                    'name': 'Dev',
                    'deployment': 'dev',
                  },
                },
                {
                  parallel: [
                    {
                      step: {
                        '<<': '*sls-deploy',
                        'name': 'Stage',
                        'deployment': 'hmg',
                        'trigger': 'manual',
                      },
                    },
                    {
                      step: {
                        '<<': '*tag',
                        'trigger': 'manual',
                      },
                    },
                  ],
                },
                {
                  step: {
                    '<<': '*sls-deploy',
                    'name': 'Production',
                    'deployment': 'prd',
                    'trigger': 'manual',
                  },
                },
              ],
            },
          ],
        },
      },
    });

    super.synth();
  }
}