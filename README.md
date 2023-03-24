# Fragments

A cloud-based microservice for collecting fragments of text or images.
To start the server at `http://localhost:8080`, enter `npm run start` command.

# For Developers

To start the server for development, enter `npm run dev` command.
To start the server for debugging, enter `npm run debug` command. Alternatively, start VS Code Debugger and press F5 to do so.

To test, run `npm test`.
To test and watch changes to tests, run `npm test:watch`. This will rerun tests every tiem you save changes to tests.
To see test coverage, run `npm run coverage`.
To run hurl integration test, run `test:integration`.

Before you make a pull request, enter `npm run lint` to run **ESlint** to check for errors.
**Prettier** is used to enforce the coding style, each time a file is saved.
**PINO** logger is used for this project.
