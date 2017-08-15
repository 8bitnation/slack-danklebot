# DB collections

## team.tokens

    {
        id: slack ID,
        token: UUID or something like that
        expiry: timestamp   
    }

## team.events

    {
        id: unique event ID,
        owner: slack ID of creator,
        channel: slack channel ID,
        name: event description/name,
        time: timestamp for event,
        participants: [
            ... array of slack IDs
        ],
        alternates: [
            ... array of slack IDs
        ]
    }


## slack.users

    {
        id: slack ID,
        nick: nickname
    }

## slack.channels

    {
        id: slack channel ID,
        name: slack channel name
    }