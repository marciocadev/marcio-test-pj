import { Project, TextFile } from 'projen';

export function bitbucketPipelines(project: Project) {

  const bitbucketPipelinesObj = `definitions:
  steps:
    - step: &npm-test
        name: Validate
        image: node:14
        script:
            - NODE_ENV=dev npm install --unsafe-perm
            - npm test --if-present
    - step: &npm-install
        name: Build
        image: node:14
        caches:
            - node
        script:
            - NODE_ENV=production npm install --unsafe-perm
    - step: &sls-deploy
        name: Serverless Deploy
        caches:
            - node
        script:
          - pipe: atlassian/serverless-deploy:1.1.1
            variables:
              AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
              AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
              AWS_REGION: $AWS_REGION
              LOG_RETENTION: $LOG_RETENTION
              EXTRA_ARGS: "--stage $BITBUCKET_DEPLOYMENT_ENVIRONMENT --env $BITBUCKET_DEPLOYMENT_ENVIRONMENT --region $AWS_REGION --force"
              DEBUG: "true"
    - step: &tag
        name: Tag version
        script:
          - echo "Tag gerada a partir do build \${BITBUCKET_BUILD_NUMBER}" >> changes.txt
          - git add changes.txt
          - git commit -m "Promovendo o build \${BITBUCKET_BUILD_NUMBER}"
          - git tag -am "Release \${BITBUCKET_BUILD_NUMBER}" release-\${BITBUCKET_BUILD_NUMBER}
          - git push origin release-\${BITBUCKET_BUILD_NUMBER}

pipelines:
  branches:

    feature/*:
      - step: *npm-test
      - step: *npm-install
      - step: 
          <<: *sls-deploy
          name: Dev
          deployment: dev

    develop:
      - step: *npm-test
      - step: *npm-install
      - step: 
          <<: *sls-deploy
          name: Dev
          deployment: dev

    release/*:
      - step: *npm-install
      - step: 
          <<: *sls-deploy
          name: Stage
          deployment: hmg
          trigger: manual
      - step: 
          <<: *tag
          trigger: manual
      - step: 
          <<: *sls-deploy
          name: Production
          deployment: prd
          trigger: manual

    hotfix/*:
      - step: *npm-install
      - step: 
          <<: *sls-deploy
          name: Dev
          deployment: dev
      - parallel:
        - step: 
            <<: *sls-deploy
            name: Stage
            deployment: hmg
            trigger: manual
        - step: 
            <<: *tag
            trigger: manual
      - step: 
          <<: *sls-deploy
          name: Production
          deployment: prd
          trigger: manual
`;

  return new TextFile(project, 'bitbucket-pipelines.yml', {
    committed: true,
    marker: false,
    lines: [bitbucketPipelinesObj],
  });
}