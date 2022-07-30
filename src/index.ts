import { YamlFile } from 'projen';
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
        '#types/aws-lambda',
        '@aws-lambda-powertools/logger',
      ],
      ...options,
    });
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