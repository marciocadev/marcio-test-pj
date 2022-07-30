import { existsSync } from 'fs';
import { JsonFile, Project } from 'projen';

export function vscodeSettings(project: Project) {
  if (existsSync('.vscode/settings.json')) {
    return;
  }

  return new JsonFile(project, '.vscode/settings.json', {
    marker: false,
    readonly: false,
    committed: true,
    obj: {
      'editor.tabSize': 2,
      'files.exclude': {
        '**/.git': true,
        '**/.svn': true,
        '**/.hg': true,
        '**/CVS': true,
        '**/.DS_Store': true,
        '**/Thumbs.db': true,
        '**/node_modules': true,
      },
      'editor.guides.bracketPairs': true,
      'editor.guides.bracketPairsHorizontal': true,
      'editor.guides.highlightActiveBracketPair': true,
      'editor.guides.highlightActiveIndentation': true,
      'editor.guides.indentation': true,
      'editor.bracketPairColorization.enabled': true,
    },
  });
}