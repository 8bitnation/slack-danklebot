import * as exampleCommand from './exampleCommand';
import * as summary from './summary';
import * as stats from './stats';

const commands = {
  [exampleCommand.command]: exampleCommand.handler,
  [summary.command]: summary.handler,
  [stats.command]: stats.handler,
};

export default commands;

