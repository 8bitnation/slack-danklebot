import * as exampleCommand from './exampleCommand';
import * as summary from './summary';
import * as stats from './stats';

const commands = {
  [summary.command]: summary.handler,
  [exampleCommand.command]: exampleCommand.handler,
  [stats.command]: summary.handler,
};

export default commands;

