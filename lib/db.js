
import { MongoClient, ObjectID } from 'mongodb';
import config from '../config';
import * as logger from 'winston';

let db;
export const team = {};

export async function init() {
    db = await MongoClient.connect(config.dbUrl);
    logger.info(`connected to ${config.dbUrl}`);

    // expose the collections
    team.events = db.collection('team.events');
    team.tokens = db.collection('team.tokens');
    team.users = db.collection('team.users');
}

export async function stats() {
    return await db.command({ 'dbStats' : 1});
}



