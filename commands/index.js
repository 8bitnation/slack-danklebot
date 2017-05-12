import * as exampleCommand from './exampleCommand';

const commands = {
  [exampleCommand.command]: exampleCommand.handler,
};

export default commands;

