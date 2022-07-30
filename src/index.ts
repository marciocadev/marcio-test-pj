import { TypeScriptProject, TypeScriptProjectOptions } from 'projen/lib/typescript';

export class MarcioTestPj extends TypeScriptProject {
  constructor(options: TypeScriptProjectOptions) {
    const readme = `#${options.name}

Basic project
`;
    super({
      github: false,
      projenrcTs: true,
      readme: {
        filename: 'README.md',
        contents: readme,
      },
      ...options,
    });


  }
}