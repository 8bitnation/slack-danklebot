import * as exampleCommand from './exampleCommand';
import * as summary from './summary';
import * as stats from './stats';
import * as team from './team'
import * as debug from './debug';

export const commands = {
  [exampleCommand.command]: exampleCommand.handler,
  [summary.command]: summary.handler,
  [stats.command]: stats.handler,
  [team.command]: team.handler
};

export const routers = {
  '/team': team.router,
  '/debug': debug.router
};

