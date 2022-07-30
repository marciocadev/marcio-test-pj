import { TypeScriptProject, TypeScriptProjectOptions } from 'projen/lib/typescript';

export class MarcioTestPj extends TypeScriptProject {
  constructor(options: TypeScriptProjectOptions) {
    super({
      github: false,
      ...options,
    });
  }
}