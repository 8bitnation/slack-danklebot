# 8bN team bot overview

## accessing the bot service

Entering `/team` in a slack channel will return a message only visible to you with a link to the team bot web service.

The link will create a cookie called `8bn-team` with a token that will allow you to use the webservice for up to 12 hours.  When the token expires, you should recieve a warning with a message to re-issue the `/team` command and obtain a new token.

Upon opening the web service you will be presented with a list of channels from 8bN slack that are associated with the team bot.  The list you see will depend upon which of those channels you are currently subscribed to in slack.  The  list of channels handled by team bot are as follows:

* pc-pve-general
* pc-pvp-activities
* pc-pve-raids
* ps4-pve-general
* ps4-pvp-activities
* ps4-pve-raids
* xb1-pve-general
* xb1-pvp-activities
* xb1-pve-raids

## channels

Selecting a channel will expand or collapse it, showing or hiding any scheduled events.

If you issued the `/team` command in one of the channels associated with the bot above, when you first visit the bot service or refresh the page, that channel should already be expanded, showing any scheduled events for the channel.

You can create new events by selecting the `create new event` item at the bottom of the channel list.  **Note:** There is currently no option to edit events, we are working on it, but it's a little more tricky than first anticipated, so please bear with us.  If you have made a mistake with an event and no-one else has yet joined it, you can remove it by leaving it.

## events

Selecting an event will expand or collapse it, showing or hiding the names of any participants or alternates.

If you have not already joined an event, you should see an item at the bottom of the participants and alternates list that says `[ join ]`.  Select either one to join as a participant or an alternate.

If you have already joined the event, you should see `[ x ]` to the right of you name.  Select this to leave the event.

When the owner of an event leaves, ownership will be passed on to the next participant who joined the event.  If there are no other participants, then the event will be removed.  **Note:** this does not include alternates or reserved.

## timezones

The bot uses your timezone settings in slack to display any event times and dates in your local timezone.  It also uses your timezone settings to convert the time and date of any events you create from your local time.

What this means is that if your slack timezone is incorrect, you will see the wrong time for events created by others and any events you created will appear correct to you, but appear wrong to everyone else.
