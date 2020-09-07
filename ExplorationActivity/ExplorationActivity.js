/* jshint undef: true */
/* globals
 state,
 sendChat,
 randomInteger,
 _,
 on
 */

var activity = activity || (function() {
    'use strict';
    
    let version = '0.1.0',
    
    activities = [
        { short: 'avoid', name: 'Avoid Notice' },
        { short: 'borrow', name: 'Borrow an arcane spell'},
        { short: 'coerce', name: 'Coerce' },
        { short: 'cover', name: 'Cover Tracks' },
        { short: 'decipher', name: 'Decipher Writing'},
        { short: 'defend', name: 'Defend' },
        { short: 'detect', name: 'Detect Magic' },
        { short: 'direct', name: 'Sense Directions' },
        { short: 'follow', name: 'Follow the Expert' },
        { short: 'hustle', name: 'Hustle' },
        { short: 'identify', name: 'Identify Alchemy' },
        { short: 'impersonate', name: 'Impersonate' },
        { short: 'impress', name: 'Make an Impression' },
        { short: 'info', name: 'Gather Information' },
        { short: 'investigate', name: 'Investigate' },
        { short: 'learn', name: 'Learn a Spell'},
        { short: 'refocus', name: 'Refocus' },
        { short: 'repair', name: 'Repair'},
        { short: 'repeat', name: 'Repeat a Spell' },
        { short: 'scout', name: 'Scout' },
        { short: 'search', name: 'Search' },
        { short: 'squeeze', name: 'Squeeze'},
        { short: 'track', name: 'Track' },
        { short: 'treat', name: 'Treat Wounds' },
    ],
    
    getActivityName = function(short) {
        const activity = activities.find(a => a.short == short);
        if(!activity) return short;
        else return activity.name;
    },
    
    sendActivityHelpMessage = function(msg, showCurrent = true) {
        var help = "";

        help += '<p><strong>Usage:</strong> <em>!activity [activity] </em> <br />';
        help += 'You may provide your own activity or use one the shortcut names below:';
        help += '<ul>';

        activities.forEach(function(item, index) {
           help += '<li><strong>' + item.short + '</strong>: <em>' + item.name + '</em></li>';
        });

        help += '</ul>';
        help += '</p>';

        help += '<p>Examples:<ul>';
        help += '<li><em>!activity defend</em></li>';
        help += '<li><em>!activity Build a Bonfire</em></li>';
        help += '</ul></p>';

        if(showCurrent) {
            const characters = getCharactersControlledByPlayer(msg.playerid);

            if(characters.length > 0) {

                help += '<p>Current exploration activities for your characters: <ul>';

                characters.forEach(function(item, index) {
                    const name = getCharacterName(item);
                    const activity = getActivityAttributeForCharacterById(item.id);
                    if(name && activity) {
                        help += '<li><strong>'+name+'</strong>: <em>'+activity.get('current')+'</em></li>';
                    } else if (!name) {
                        log("Missing name");
                    } else if (!activity) {
                        log("Missing activity for character '"+name+"'.");
                    }
                });

                help += '</ul></p>';
            }
        }

        sendChat('player|'+msg.playerid, help);
    },

    sendCharacterActivityHelpMessage = function(msg, showCurrent = true) {
        var help = "";

        help += '<p><strong>Usage:</strong> <em>!charactivity [player name] [activity] </em> <br />';
        help += 'You may provide your own activity or use one the shortcut names below:';
        help += '<ul>';

        activities.forEach(function(item, index) {
           help += '<li><strong>' + item.short + '</strong>: <em>' + item.name + '</em></li>';
        });

        help += '</ul>';
        help += '</p>';

        help += '<p>Examples:<ul>';
        help += '<li><em>!charactivity Friedrich defend</em></li>';
        help += '<li><em>!charactivity Lance Skypath Build a Bonfire</em></li>';
        help += '</ul></p>';

        if(showCurrent) {
            const characters = getCharactersControlledByPlayer(msg.playerid);

            if(characters.length > 0) {

                help += '<p>Current exploration activities for your characters: <ul>';

                characters.forEach(function(item, index) {
                    const name = getCharacterName(item);
                    const activity = getActivityAttributeForCharacterById(item.id);
                    if(name && activity) {
                        help += '<li><strong>'+name+'</strong>: <em>'+activity.get('current')+'</em></li>';
                    } else if (!name) {
                        log("Missing name");
                    } else if (!activity) {
                        log("Missing activity for character '"+name+"'.");
                    }
                });

                help += '</ul></p>';
            }
        }

        sendChat('player|'+msg.playerid, help);
    },

    getCharacterName = function(character) {
        return character.get("name");
    },

    getActivityAttributeForCharacterById = function(characterid) {
        return findObjs({
            type: 'attribute',
            characterid: characterid,
            name: 'exploration_activity'
        })[0];
    },

    getCharactersControlledByPlayer = function(playerid) {
        var characters = findObjs({
            _type: 'character',
            controlledby: playerid
        });
        var all = findObjs({
            _type: 'character',
            controlledby: 'all'
        });
        return characters.concat(all);
    },

    
    getCharacterNameFromCharacterId = function(id) {
        var character = findObjs({
            _type: 'character',
            _id: id
        })[0];
        return character.get('name');
    },

    getCurrentExplorationActivities = function() {
        var activityAttributes = findObjs({
            type: 'attribute',
            name: 'exploration_activity'
        });
        
        let activityMap = activityAttributes.map(function(item) {
            return { 
                short: item.get('current'),
                name: getActivityName(item.get('current')),
                characterid: item.get('_characterid'),
                charactername: getCharacterNameFromCharacterId(item.get('_characterid'))
            };
        });

        return activityMap;
    },

    setActivityAttribute = function(character, activity) {
        var activityAttribute = findObjs({
            type: 'attribute',
            characterid: character,
            name: 'exploration_activity'
        })[0];

        var changed = false;

        if(activityAttribute) {
            if(activityAttribute.get('current') != activity) {
                changed = true;
            }
            activityAttribute.set('current', activity);
        } else {
            log("Creating 'exploration_activity' attribute for character with id '"+character+"'.");
            activityAttribute = createObj('attribute', {
                characterid: character,
                name: 'exploration_activity',
                current: activity
            });

            changed = true;
        }

        if(changed) {
            createOrUpdateActivityHandout();
        }
    },

    selectActivity = function(playerid, activity) {
        var message = "Selected activity <strong>'" + activity + "'</strong>";

        const characters = getCharactersControlledByPlayer(playerid);
        if(characters.length > 0) {
            message += '<ul>'
            characters.forEach(function(item, index) {
                setActivityAttribute(item.id, activity);
                message += '<li><strong>' + getCharacterName(item) + '</strong>: <em>' + activity + '</em></li>';
            });
            message += '</ul>'
        }

        sendChat('player|'+playerid, message);
    },

    selectCharacterActivity = function(playerid, characters, activity) {
        var message = "Selected activity <strong>'" + activity + "'</strong>";

        if(characters.length > 0) {
            message += '<ul>'
            characters.forEach(function(item, index) {
                setActivityAttribute(item.id, activity);
                message += '<li><strong>' + getCharacterName(item) + '</strong>: <em>' + activity + '</em></li>';
            });
            message += '</ul>'
        }

        sendChat('player|'+playerid, message);
    },
    
    handleActivityCommand = function(msg, args) {
        if(args.length === 0) {
            sendActivityHelpMessage(msg);
            return;
        }
        
        const activity = activities.find(elem => elem.short == args[0]);

        if(activity) {
            selectActivity(msg.playerid, activity.name);
        } else {
            selectActivity(msg.playerid, args.join(' '));
        }
    },

    handleCharacterActivityCommand = function(msg, args) {
        if(args.length === 0) {
            sendCharacterActivityHelpMessage(msg);
            return;
        }

        const characters = getCharactersControlledByPlayer(msg.playerid);
        const joinedArgs = args.join(' ');
        const matches = characters.filter(function(character) {
            const name = character.get('name').toLowerCase();
            return joinedArgs.substr(0, name.length).toLowerCase() === name;
        });

        if(matches.length > 0) {
            matches.forEach(function(character) {
                const subCmd = joinedArgs.substr(character.get('name').length).trim(); 
                const subCmdSplit = subCmd.split(' ');

                if(subCmd.length === 0) {
                    sendChat('player|'+msg.playerid, "Missing activity in command.");
                } else {

                    const activity = activities.find(elem => elem.short == subCmdSplit[0]);

                    if(activity) {
                        selectCharacterActivity(msg.playerid, [character], activity.name)
                    } else {
                        selectCharacterActivity(msg.playerid, [character], subCmd)
                    }

                }
            });
        } else {
            sendChat('player|'+msg.playerid, "Could not find any characters matching that name.");
        }
    },

    handleAttributeChanged = function(obj) {
        if(obj.get('name') == 'exploration_activity') {
            createOrUpdateActivityHandout()
        }
    },

    createOrUpdateActivityHandout = function() {

        state.activityHandout = findObjs({
            type: 'handout',
            name: 'Exploration Activities'
        })[0];

        if(!state.activityHandout) {
            log("Creating activity handout.");
            state.activityHandout = createObj('handout', {
                name: "Exploration Activities",
                inplayerjournals: 'all',
                archived: false
            });
        }

        if(!state.activityHandout) {
            log("Cannot find/create handout.");
            return;
        }

        const currentActivities = getCurrentExplorationActivities();
        var notes = ''
        currentActivities.forEach(function(item, index) {
            notes += '<p><b>' + item.charactername + '</b>: ' + item.name + "</p>\n";
        });

        state.activityHandout.set('notes', notes);
    },
    
    init = function() {
        createOrUpdateActivityHandout();

        on('chat:message', function(msg) {
            
            if(msg.type !== 'api') return;
            
            const activityCmd = '!activity';
            const characterActivityCmd = '!charactivity';
            if(msg.content.substr(0, activityCmd.length) === activityCmd) {
                let args = msg.content.split(' ');
                args.shift();
                handleActivityCommand(msg, args);
            } else if(msg.content.substr(0, characterActivityCmd.length) === characterActivityCmd) {
                let args = msg.content.split(' ');
                args.shift();
                handleCharacterActivityCommand(msg, args);
            }
        });

        on('change:attribute:current', handleAttributeChanged);
    };
    
    return {
        init: init
    };
    
}());

on('ready', function() {
   'use strict';
   
   log('Exploration Activity Initialized.');
   
   activity.init();
});
