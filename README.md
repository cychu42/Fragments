# Fragments

A cloud-based microservice for collecting fragments of text or images.

To start the server at `http://localhost:8080`, enter `npm run start` command.

- Without `AWS_REGION` environment variable, this local copy would use in-memory database and storage. If set, AWS S3 handles data, and AWS DynamoDB handles metadata.

To start local docker containers for the server and dependent services, enter `npm run docker` command.

- This method would have `AWS_REGION` environment variable set, and thus AWS S3 (LocalStack) handles data, and AWS DynamoDB (DynamoDB Local) handles metadata.

# For Developers

To start the server for development, enter `npm run dev` command.
To start the server for debugging, enter `npm run debug` command. Alternatively, start VS Code Debugger and press F5 to do so.

To test, run `npm test`.
To test and watch changes to tests, run `npm test:watch`. This will rerun tests every tiem you save changes to tests.
To see test coverage, run `npm run coverage`.
To run hurl integration/E2E test, run `npm run test:e2e`. This will:

- run docker with build option: `npm run docker:build`,
- run setup script for local storage and database in docker: `setup:e2e`
- run E2E hurl tests: `npm run test:hurl`

You might need to enter `q` to stop veiwing the output of the setup script, for the test portion to start.

Before you make a pull request, enter `npm run lint` to run **ESlint** to check for errors.
**Prettier** is used to enforce the coding style, each time a file is saved.
**PINO** logger is used for this project.
