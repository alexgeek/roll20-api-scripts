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
    
    partition = function(array, n=2) {
        var clone = Array.from(array);
        return clone.length ? [clone.splice(0, n)].concat(partition(clone, n)) : [];
    },

    m = function(a, b) {
        return Object.assign({}, a, b);
    },

    s = function(style) {
        return _.map(m(style, styles.all), (v, k) => `${k}:${v};`).join('');
    },

    when = function(condition, t, f='') {
        if(condition) {
            return t;
        } else {
            return f;
        }
    },

    createTemplateHtml = function(contents) {
        const style = {
            "display": "block",
            "line-height": "1.25em",
            "font-size": "1.05em",
            "color": "#404040"
        };

        return `<div style="${s(style)}">${contents}</div>`;
    },

    createCharacterNameHtml = function(name) {
        const style = {
            "color": "#fdf6ec",
            "text-shadow": "1px 1px 0 #5b1110, -1px -1px 0 #5b1110, 1px -1px 0 #5b1110, -1px 1px 0 #5b1110, 1px 1px 0 #5b1110",
            "font-size": "1.2em",
            "letter-spacing": "0.05em",
            "box-sizing": "content-box"
        }

        return `<span style="${s(style)}">${name}</span>`;
    },

    createTemplateHeaderHtml = function(contents) {
        const style = {
            "background-color": "#002766",
            "color": "white",
            "font-size": "1.35em",
            "font-variant": "small-caps",
            "padding": "4px 0px 3px 0px",
            "text-align": "center",
            "text-transform": "capitalize"
        }

        return `<div style="${s(style)}">${contents}</div>`;
    },

    createTemplateSubHeaderHtml = function(contents) {
        const style = {
            "color": "#fdf6ec",
            "font-size": "0.7em",
            "font-style": "italic",
            "margin-top": "0.2em",
            "font-weight": "normal",
            "letter-spacing": "0.05em",
            "box-sizing": "content-box",
            "text-align": "center",
            "text-transform": "capitalize"
        }

        return `<div style="${s(style)}">${contents}</div>`;
    },

    createBackdropHtml = function(contents) {
        const style = m({
            "border": "0.2em solid #5b1110",
            "background-color": "#c4bdaf",
            "background-image": "url('https://imgsrv.roll20dev.net/?src=https%3A//raw.githubusercontent.com/Roll20/roll20-character-sheets/master/Pathfinder%2520Second%2520Edition%2520by%2520Roll20/images/background.png')",
            "background-size": "cover",
            "background-position": "center",
            "width": "100%"
        }, styles.div);

        return `<div style="${s(style)}">${contents}</div>`;
    },

    createDisplayHtml = function(contents) {
        const style = {
            "margin": "1em",
            "display": "block",
            "vertical-align": "top",
            "width,": "100%"
        };

        return `<div style="${s(style)}">${contents}</div>`;
    },

    createTitleHtml = function(contents) {
        const style = m({
            "border": "none",
            "border-bottom": "solid black 2px",
            "font-weight": "bold",
            "font-size": "1.2em",
            "text-transform": "uppercase",
            "width": "100%"
        }, styles.div);

        return `<div style="${s(style)}">${contents}</div>`;
    },

    createNameHtml = function(name) {
        const style = m({
            "float": "left"
        }, styles.span);

        return `<span style="${s(style)}">${name}</span>`;
    },

    createTraitsRowHtml = function(contents) {
        const style = {
            "width": "auto",
            "margin": "0.3em 0",
        };

        return `<div style="${s(style)})">${contents}</div>`;
    },

    createTraitHtml = function(name) {
        const style = {
            "text-transform": "uppercase",
            "background-color": "#5b1110",
            "border": "solid 0.1em #b39f75",
            "color": "white",
            "font-weight": "bold",
            "padding": "0 0.7em",
            "word-break": "break-word"
        };
        return `<span style="${s(style)}">${name}</span>`;
    },

    createRequirementsRowHtml = function(contents) {
        const style = {
            "width": "auto",
            "margin": "0.3em 0",
            "border": "none",
            "border-bottom": "solid black 1px"
        };

        return `<div style="${s(style)})"><strong>Requirements</strong> &nbsp; ${contents}</div>`;
    },

    createDescriptionRowHtml = function(contents) {
        const style = {
            "width": "auto",
            "margin": "0.3em 0",
            "border": "none",
            "border-bottom": "solid black 1px",
            "line-height": "150%"
        };

        return `<div style="${s(style)})">${contents}</div>`;
    },

    createHangingIndentParagraph = function(contents, indent=1 /* em */) {
        const style = {
            "text-indent": (-indent).toString() + "em",
            "padding-left": indent.toString() + "em",
            "margin-bottom": "0"
        };

        return `<p style="${s(style)}">${contents}</p>`;
    },

    createTable = function(header, rows) {
        const headerStyle = {
            "background-color": "#5e0000",
            "color": "white",
            "font-size": "1em"
        };

        var table = `<table style="${s(headerStyle)}">`;

        const rowStyles = [
            {
                "background-color": "#ede3c8",
                "color": "#1c0700"
            },
            {
                "background-color": "#f5efe0",
                "color": "#1c0700"
            }
        ];

        table += '<tr>';
        header.forEach(function(item) {
            var headerCellStyle = {
                "text-align": "center",
                "border": "0"
            }
            table += `<th style="${s(headerCellStyle)}">` + item + '</th>'
        })
        table += '</tr>';

        rows.forEach(function(row, index) {
            var rowStyle = rowStyles[index % 2];
            table += `<tr style="${s(rowStyle)}">`;
            row.forEach(function(col) {
                var cellStyle = {
                    "text-align": "center",
                    "font-size": "1em",
                    "padding": "2px",
                    "border": "0"
                }
                table += `<td style="${s(cellStyle)}">` + col + '</td>';
            });
            table += '</tr>';
        });

        table += '</table>'

        return table;
    },
    
    styles = {
        all: {
            "box-sizing": "border-box",
            "font-familty": "inherit"
        },
        div: {
            "display": "inline-block",
            "vertical-align": "top",
            "width,": "100%"
        },
        span: {
            "word-break": "break",
        }
    },

    activities = [
        { short: 'avoid', name: 'Avoid Notice' },
        { short: 'borrow', name: 'Borrow an arcane spell'},
        { short: 'coerce', name: 'Coerce' },
        { short: 'cover', name: 'Cover Tracks' },
        { short: 'decipher', name: 'Decipher Writing'},
        { short: 'defend', name: 'Defend' },
        { short: 'detect', name: 'Detect Magic' },
        { short: 'direct', name: 'Sense Direction' },
        { short: 'follow', name: 'Follow the Expert' },
        { short: 'hustle', name: 'Hustle' },
        { short: 'identify', name: 'Identify Alchemy' },
        { short: 'impersonate', name: 'Impersonate' },
        { short: 'impress', name: 'Make an Impression' },
        { short: 'info', name: 'Gather Information' },
        { short: 'investigate', name: 'Investigate' },
        { short: 'learn', name: 'Learn a Spell' },
        { short: 'refocus', name: 'Refocus' },
        { short: 'repair', name: 'Repair' },
        { short: 'repeat', name: 'Repeat a Spell' },
        { short: 'scout', name: 'Scout' },
        { short: 'search', name: 'Search' },
        { short: 'squeeze', name: 'Squeeze' },
        { short: 'track', name: 'Track' },
        { short: 'treat', name: 'Treat Wounds' },
    ],

    descriptions = [
        {
            name: 'Avoid Notice',
            description: 'You attempt a Stealth check to avoid notice while traveling \
            at half speed. If you have the Swift Sneak feat, you can move \
            at full Speed rather than half, but you still can’t use another \
            exploration activity while you do so. If you have the Legendary \
            Sneak feat, you can move at full Speed and use a second \
            exploration activity. If you’re Avoiding Notice at the start of \
            an encounter, you usually roll a Stealth check instead of a \
            Perception check both to determine your initiative and to see \
            if the enemies notice you (based on their Perception DCs, as \
            normal for Sneak, regardless of their initiative check results).'
        },
        {
            name: 'Borrow an arcane spell',
            description: 'If you’re an arcane spellcaster who prepares from a spellbook, \
            you can attempt to prepare a spell from someone else’s \
            spellbook. The GM sets the DC for the check based on the \
            spell’s level and rarity; it’s typically a bit easier than Learning \
            the Spell.'
            + createHangingIndentParagraph("<strong>Success</strong> \
            You prepare the borrowed spell as part of your normal spell preparation.")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            You fail to prepare the spell, but the spell slot \
            remains available for you to prepare a different \
            spell. You can’t try to prepare this spell \
            until the next time you prepare spells.")
        },
        {
            name: 'Coerce',
            description: 'With threats either veiled or overt, you attempt to bully a \
            creature into doing what you want. You must spend at least 1 \
            minute of conversation with a creature you can see and that \
            can either see or sense you. At the end of the conversation, \
            attempt an Intimidation check against the target’s Will DC, \
            modified by any circumstances the GM determines. The \
            attitudes referenced in the effects below are summarized in \
            the Changing Attitudes sidebar on page 246 and described in \
            full in the Conditions Appendix, starting on page 618.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            The target gives you the information you \
            seek or agrees to follow your directives so long as they \
            aren’t likely to harm the target in any way. The target \
            continues to comply for an amount of time determined by \
            the GM but not exceeding 1 day, at which point the target \
            becomes unfriendly (if they weren’t already unfriendly \
            or hostile). However, the target is too scared of you to \
            retaliate—at least in the short term.")
            + createHangingIndentParagraph("<strong>Success</strong> \
            As critical success, but once the target becomes \
            unfriendly, they might decide to act against you—for \
            example, by reporting you to the authorities or assisting \
            your enemies.")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            The target doesn’t do what you say, and if they were \
            not already unfriendly or hostile, they become unfriendly.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            The target refuses to comply, becomes hostile \
            if they weren’t already, and can’t be Coerced by you for at \
            least 1 week.")
        },
        {
            name: 'Cover Tracks',
            description: 'You cover your tracks, moving up to half your travel Speed, \
            using the rules on page 479). You don’t need to attempt a \
            Survival check to cover your tracks, but anyone tracking you \
            must succeed at a Survival check against your Survival DC if it \
            is higher than the normal DC to Track. <br /> \
            In some cases, you might Cover Tracks in an encounter. In \
            this case, Cover Tracks is a single action and doesn’t have the \
            exploration trait.'
        },
        {
            name: 'Decipher Writing',
            description: 'You attempt to decipher complicated writing or literature on an \
            obscure topic. This usually takes 1 minute per page of text, but \
            might take longer (typically an hour per page for decrypting \
            ciphers or the like). The text must be in a language you can \
            read, though the GM might allow you to attempt to decipher \
            text written in an unfamiliar language using Society instead.<br /> \
            The DC is determined by the GM based on the state or \
            complexity of the document. The GM might have you roll one \
            check for a short text or a check for each section of a larger text.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            You understand the true meaning of the text.")
            + createHangingIndentParagraph("<strong>Success</strong> \
            You understand the true meaning of the text. If it was \
            a coded document, you know the general meaning but might \
            not have a word-for-word translation.")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            You can’t understand the text and take a –2 circumstance \
            penalty to further checks to decipher it.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            You believe you understand the text on that \
            page, but you have in fact misconstrued its message.")
        },
        {
            name: 'Defend',
            description: 'You move at half your travel speed with your shield raised. If \
            combat breaks out, you gain the benefits of Raising a Shield \
            before your first turn begins.'
        },
        {
            name: 'Detect Magic',
            description: 'You cast detect magic at regular intervals. You move at half \
            your travel speed or slower. You have no chance of accidentally \
            overlooking a magic aura at a travel speed up to 300 feet per \
            minute, but must be traveling no more than 150 feet per minute \
            to detect magic auras before the party moves into them.'
        },
        {
            name: 'Sense Direction',
            description: 'Using the stars, the position of the sun, traits of the \
            geography or flora, or the behavior of fauna, you can stay \
            oriented in the wild. Typically, you attempt a Survival check \
            only once per day, but some environments or changes might \
            necessitate rolling more often. The GM determines the DC \
            and how long this activity takes (usually just a minute or so). \
            More unusual locales or those you’re unfamiliar with might \
            require you to have a minimum proficiency rank to Sense \
            Direction. Without a compass, you take a –2 item penalty to \
            checks to Sense Direction.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            You get an excellent sense of where you are. \
            If you are in an environment with cardinal directions, you \
            know them exactly. ")
            + createHangingIndentParagraph("<strong>Success</strong> \
            You gain enough orientation to avoid becoming \
            hopelessly lost. If you are in an environment with cardinal \
            directions, you have a sense of those directions")
        },
        {
            name: 'Follow the Expert',
            description: 'Choose an ally attempting a recurring skill check while exploring, \
            such as climbing, or performing a different exploration tactic \
            that requires a skill check (like Avoiding Notice). The ally must \
            be at least an expert in that skill and must be willing to provide \
            assistance. While Following the Expert, you match their tactic \
            or attempt similar skill checks. Thanks to your ally’s assistance, \
            you can add your level as a proficiency bonus to the associated \
            skill check, even if you’re untrained. Additionally, you gain \
            a circumstance bonus to your skill check based on your ally’s \
            proficiency (+2 for expert, +3 for master, and +4 for legendary). '
        },
        {
            name: 'Hustle',
            description: 'You strain yourself to move at double your travel speed. You can \
            Hustle only for a number of minutes equal to your Constitution \
            modifier × 10 (minimum 10 minutes). If you are in a group that is \
            Hustling, use the lowest Constitution modifier among everyone \
            to determine how fast the group can Hustle together.'
        },
        {
            name: 'Identify Alchemy',
            description: 'You can identify the nature of an alchemical item with 10 minutes \
            of testing using alchemist’s tools. If your attempt is interrupted \
            in any way, you must start over.'
            + createHangingIndentParagraph("<strong>Success</strong> \
            You identify the item and the means of activating it.")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            You fail to identify the item but can try again.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            You misidentify the item as another item of the GM’s choice.")
        },
        {
            name: 'Impersonate',
            description: 'You create a disguise to pass yourself off as someone or \
            something you are not. Assembling a convincing disguise takes \
            10 minutes and requires a disguise kit (found on page 290), but \
            a simpler, quicker disguise might do the job if you’re not trying \
            to imitate a specific individual, at the GM’s discretion. <br /> \
            In most cases, creatures have a chance to detect your \
            deception only if they use the Seek action to attempt \
            Perception checks against your Deception DC. If you attempt \
            to directly interact with someone while disguised, the GM \
            rolls a secret Deception check for you against that creature’s \
            Perception DC instead. If you’re disguised as a specific \
            individual, the GM might give creatures you interact with a \
            circumstance bonus based on how well they know the person \
            you’re imitating, or the GM might roll a secret Deception \
            check even if you aren’t directly interacting with others.'
            + createHangingIndentParagraph("<strong>Success</strong> \
            You trick the creature into thinking you’re the person \
            you’re disguised as. You might have to attempt a new check \
            if your behavior changes.")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            The creature can tell you’re not who you claim to be.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            The creature can tell you’re not who you claim to be, \
            and it recognizes you if it would know you without a disguise.")
        },
        {
            name: 'Make an Impression',
            description: 'With at least 1 minute of conversation, during which you engage \
            in charismatic overtures, flattery, and other acts of goodwill, \
            you seek to make a good impression on someone to make them \
            temporarily agreeable. At the end of the conversation, attempt \
            a Diplomacy check against the Will DC of one target, modified \
            by any circumstances the GM sees fit. Good impressions (or bad \
            impressions, on a critical failure) last for only the current social \
            interaction unless the GM decides otherwise.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            The target’s attitude toward you improves by two steps.")
            + createHangingIndentParagraph("<strong>Success</strong> \
            The target’s attitude toward you improves by one steps.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            The target’s attitude toward you decreases by one step.")
        },
        {
            name: 'Gather Information',
            description: 'You canvass local markets, taverns, and gathering places in \
            an attempt to learn about a specific individual or topic. The \
            GM determines the DC of the check and the amount of time it \
            takes (typically 2 hours, but sometimes more), along with any \
            benefit you might be able to gain by spending coin on bribes, \
            drinks, or gifts.' 
            + createHangingIndentParagraph("<strong>Success</strong> You collect information \
            about the individual or topic. The GM determines the specifics.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            You collect incorrect information about the individual or topic.")
        },
        {
            name: 'Investigate',
            description: 'You seek out information about your surroundings while traveling \
            at half speed. You use Recall Knowledge as a secret check to \
            discover clues among the various things you can see and engage \
            with as you journey along. You can use any skill that has a Recall \
            Knowledge action while Investigating, but the GM determines \
            whether the skill is relevant to the clues you could find.'
        },
        {
            name: 'Learn a Spell',
            description: '<strong>Requirements</strong> \
            You have a spellcasting class feature, and the \
            spell you want to learn is on your magical tradition’s spell list. <br /> \
            You can gain access to a new spell of your tradition from \
            someone who knows that spell or from magical writing like a \
            spellbook or scroll. If you can cast spells of multiple traditions, \
            you can Learn a Spell of any of those traditions, but you must \
            use the corresponding skill to do so. For example, if you were \
            a cleric with the bard multiclass archetype, you couldn’t use \
            Religion to add an occult spell to your bardic spell repertoire. <br /> \
            To learn the spell, you must do the following: \
            <ul> \
            <li>Spend 1 hour per level of the spell, during which you \
            must remain in conversation with a person who knows \
            the spell or have the magical writing in your possession.</li> \
            <li>Have materials with the Price indicated in Table 4–3. </li> \
            <li>Attempt a skill check for the skill corresponding to your \
            tradition (DC determined by the GM, often close to the \
            DC on Table 4–3). Uncommon or rare spells have higher \
            DCs; full guidelines for the GM appear on page 503.</li> \
            </ul> \
            If you have a spellbook, Learning a Spell lets you add the \
            spell to your spellbook; if you prepare spells from a list, it’s \
            added to your list; if you have a spell repertoire, you can select \
            it when you add or swap spells.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            You expend half the materials and learn the spell.")
            + createHangingIndentParagraph("<strong>Success</strong> \
            You expend the materials and learn the spell.")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            You fail to learn the spell but can try again after you \
            gain a level. The materials aren’t expended.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            As failure, plus you expend half the materials.") // TODO table
            + '<br />'
            + createTable(
                ["Spell Level", "Price", "Typical DC"],
                [
                    ["1st or cantrip", "2 gp", "15"],
                    ["2nd", "6 gp", "18"],
                    ["3rd", "16 gp", "20"],
                    ["4th", "36 gp", "23"],
                    ["5th", "70 gp", "26"],
                    ["6th", "140 gp", "28"],
                    ["7th", "300 gp", "31"],
                    ["8th", "650 gp", "34"],
                    ["9th", "1,500 gp", "36"],
                    ["10th", "7,000 gp", "41"],
                ]
            )
        },
        {
            name: 'Refocus',
            description: '<strong>Requirements</strong> \
            You have a focus pool, and you have spent at \
            least 1 Focus Point since you last regained any Focus Points. <br /> \
            You spend 10 minutes performing deeds to restore your \
            magical connection. This restores 1 Focus Point to your focus \
            pool. The deeds you need to perform are specified in the \
            class or ability that gives you your focus spells. These deeds \
            can usually overlap with other tasks that relate to the source \
            of your focus spells. For instance, a cleric with focus spells \
            from a good deity can usually Refocus while tending the \
            wounds of their allies, and a wizard of the illusionist school \
            might be able to Refocus while attempting to Identify Magic \
            of the illusion school.'
        },
        {
            name: 'Repair',
            description: '<strong>Requirements</strong> \
            You have a repair kit (page 291). \
            You spend 10 minutes attempting to fix a damaged item, placing \
            the item on a stable surface and using the repair kit with \
            The GM sets the DC, but it’s usually about the same \
            DC to Repair a given item as it is to Craft it in the first place. You \
            can’t Repair a destroyed item.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            You restore 10 Hit Points to the item, plus an \
            additional 10 Hit Points per proficiency rank you have in \
            Crafting (a total of 20 HP if you’re trained, 30 HP if you’re an \
            expert, 40 HP if you’re a master, or 50 HP if you’re legendary).")
            + createHangingIndentParagraph("<strong>Success</strong> \
            You restore 5 Hit Points to the item, plus an additional \
            5 per proficiency rank you have in Crafting (for a total of \
            10 HP if you are trained, 15 HP if you’re an expert, 20 HP if \
            you’re a master, or 25 HP if you’re legendary).")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            You deal 2d6 damage to the item. Apply the \
            item’s Hardness to this damage.") 
        },
        {
            name: 'Repeat a Spell',
            description: 'You repeatedly cast the same spell while moving at half speed. \
            Typically, this spell is a cantrip that you want to have in effect in \
            the event a combat breaks out, and it must be one you can \
            cast in 2 actions or fewer. In order to prevent fatigue due \
            to repeated casting, you’ll likely use this activity only when \
            something out of the ordinary occurs. <br /> \
            You can instead use this activity to continue Sustaining a \
            Spell or Activation with a sustained duration. Most such spells \
            or item effects can be sustained for 10 minutes, though some \
            specify they can be sustained for a different duration. '
        },
        {
            name: 'Scout',
            description: 'You scout ahead and behind the group to watch danger, moving \
            at half speed. At the start of the next encounter, every creature in \
            your party gains a +1 circumstance bonus to their initiative rolls.'
        },
        {
            name: 'Search',
            description: 'You Seek meticulously for hidden doors, concealed hazards, \
            and so on. You can usually make an educated guess as to which \
            locations are best to check and move at half speed, but if you \
            want to be thorough and guarantee you checked everything, you \
            need to travel at a Speed of no more than 300 feet per minute, or \
            150 feet per minute to ensure you check everything before you \
            walk into it. You can always move more slowly while Searching \
            to cover the area more thoroughly, and the Expeditious Search \
            feat increases these maximum Speeds. If you come across a \
            secret door, item, or hazard while Searching, the GM will attempt \
            a free secret check to Seek to see if you notice the hidden object \
            or hazard. In locations with many objects to search, you have to \
            stop and spend significantly longer to search thoroughly.'
        },
        {
            name: 'Squeeze',
            description: 'You contort yourself to squeeze through a space so small you \
            can barely fit through. This action is for exceptionally small \
            spaces; many tight spaces are difficult terrain (page 475) that \
            you can move through more quickly and without a check.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            You squeeze through the tight space in \
            1 minute per 10 feet of squeezing.")
            + createHangingIndentParagraph("<strong>Success</strong> \
            You squeeze through in 1 minute per 5 feet")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            You become stuck in the tight space. While \
            you’re stuck, you can spend 1 minute attempting another \
            Acrobatics check at the same DC. Any result on that \
            check other than a critical failure causes you \
            to become unstuck.") 
        },
        {
            name: 'Track',
            description: 'You follow tracks, moving at up to half your travel Speed, using \
            the rules on page 479). After a successful check to Track, you \
            can continue following the tracks at half your Speed without \
            attempting additional checks for up to 1 hour. In some cases, \
            you might Track in an encounter. In this case, Track is a single \
            action and doesn’t have the exploration trait, but you might \
            need to roll more often because you’re in a tense situation. <br /> \
            The GM determines how often you must attempt this check. \
            You attempt your Survival check when you start Tracking, \
            once every hour you continue tracking, and any time \
            something significant changes in the trail. The GM determines \
            the DCs for such checks, depending on the freshness of the \
            trail, the weather, and the type of ground.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            You find the trail or continue to follow the one you’re \
            already following.")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            You lose the trail but can try again after a 1-hour delay.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            You lose the trail and can’t try again for 24 hours.") 
        },
        {
            name: 'Treat Wounds',
            description: '<strong>Requirements</strong> You have healer’s tools (page 290).\
            You spend 10 minutes treating one injured living creature \
            (targeting yourself, if you so choose). The target is then \
            temporarily immune to Treat Wounds actions for 1 hour, but \
            this interval overlaps with the time you spent treating (so a \
            patient can be treated once per hour, not once per 70 minutes). <br /> \
            The Medicine check DC is usually 15, though the GM might \
            adjust it based on the circumstances, such as treating a patient \
            outside in a storm, or treating magically cursed wounds. If you’re \
            an expert in Medicine, you can instead attempt a DC 20 check \
            to increase the Hit Points regained by 10; if you’re a master of \
            Medicine, you can instead attempt a DC 30 check to increase \
            the Hit Points regained by 30; and if you’re legendary, you can \
            instead attempt a DC 40 check to increase the Hit Points regained \
            by 50. The damage dealt on a critical failure remains the same. <br /> \
            If you succeed at your check, you can continue treating the \
            target to grant additional healing. If you treat them for a total \
            of 1 hour, double the Hit Points they regain from Treat Wounds. \
            The result of your Medicine check determines how many \
            Hit Points the target regains.'
            + createHangingIndentParagraph("<strong>Critical Success</strong> \
            The target regains 4d8 Hit Points, and its \
            wounded condition is removed. ")
            + createHangingIndentParagraph("<strong>Failure</strong> \
            The target regains 2d8 Hit Points, and its wounded condition is removed.")
            + createHangingIndentParagraph("<strong>Critical Failure</strong> \
            The target takes 1d8 damage.") 
        }
    ],

    traits = [
        { name: 'Borrow an arcane spell', traits: ['concentrate'] },
        { name: 'Coerce', traits: [
                'auditory', 'concentrate', 'emotion',
                'linguistic', 'mental'
            ] 
        },
        { name: 'Cover Tracks', traits: ['concentrate', 'move'] },
        { name: 'Decipher Writing', traits: ['concentrate', 'secret']},
        { name: 'Detect Magic', traits: ['concentrate'] },
        { name: 'Sense Direction', traits: ['secret'] },
        { name: 'Follow the Expert', traits: ['auditory', 'concentrate', 'visual'] },
        { name: 'Hustle', traits: ['move'] },
        { name: 'Identify Alchemy', traits: ['concentrate', 'secret'] },
        { name: 'Impersonate', traits: ['concentrate', 'manipulate', 'secret'] },
        { name: 'Make an Impression', traits: ['auditory', 'concentrate', 'linguistic', 'mental'] },
        { name: 'Gather Information', traits: ['secret'] },
        { name: 'Investigate', traits: ['concentrate'] },
        { name: 'Learn a Spell', traits: ['concentrate']  },
        { name: 'Refocus', traits: ['concentrate'] },
        { name: 'Repair', traits: ['manipulate'] },
        { name: 'Repeat a Spell', traits: ['concentrate'] },
        { name: 'Scout', traits: ['concentrate'] },
        { name: 'Search', traits: ['concentrate'] },
        { name: 'Squeeze', traits: ['move'] },
        { name: 'Track', traits: ['concentrate', 'move'] },
        { name: 'Treat Wounds', traits: ['healing', 'manipulate'] },
    ],

    getTraitsForActivity = function(activity) {
        var t = traits.find(function(elem) {
            return elem.name == activity;
        });

        return t != undefined && t.traits != undefined ? t.traits.concat(['exploration']) : ['exploration'];
    },

    getActivityName = function(short) {
        const activity = activities.find(a => a.short == short);
        if(!activity) return short;
        else return activity.name;
    },

    createHelpMessage = function() {
        var help = createTitleHtml(createNameHtml("Usage"));

        help += '<p style="margin-top: 1em">The <em>!activity</em> command sets your activity for all characters you control:</p>'
        help += '<pre>!activity [activity] </pre>';
        help += '<p>The <em>!charactivity</em> command sets the activity for a single character you control:</p>'
        help += '<pre>!charactivity [character name] [activity] </pre>';
        help += '<p>You may provide your own activity or use one the shortcut names below: </p>';

        help += '<div style="width: 100%; display: block">'
        partition(activities, activities.length / 4).forEach(function(column, index) {
            help += '<ul style="float: left; margin-right: 20px; display: inline-block; *display: inline; zoom: 1">';
            column.forEach(function(item) {
                help += '<li><strong>' + item.short + '</strong>: <em>' + item.name + '</em></li>';
                /*help += '<li><strong><a href="!activity ' + item.short + '">' 
                + item.short + '</a></strong>: <em>' + item.name + '</em></li>';*/
             });
             help += '</ul>';
        })
        help += '</div>'

        help += '<div style="clear:both"></div>'
        help += '<p>Examples:<ul>';
        help += '<li><em>!activity defend</em></li>';
        help += '<li><em>!activity Build a Bonfire</em></li>';
        help += '</ul></p>';

        return help;
    },
    
    sendActivityHelpMessage = function(msg, showCurrent = true) {
        var help = createHelpMessage();

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
        var help = createHelpMessage();

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

    getActivityDescription = function(activity) {
        var d = descriptions.find(function(elem) {
            return elem.name == activity;
        });
        return d != undefined ? d.description : undefined;
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
        var message = ''; //"Selected activity <strong>'" + activity + "'</strong>";

        const characters = getCharactersControlledByPlayer(playerid);
        if(characters.length > 0) {
            characters.forEach(function(item, index) {
                setActivityAttribute(item.id, activity);
                message += createTemplateHtml(
                    createCharacterNameHtml( getCharacterName(item) )
                    +
                    createTemplateHeaderHtml(
                        createTemplateHeaderHtml("Activity"
                        +
                        createTemplateSubHeaderHtml(activity)
                        )
                    )
                )
            });
        }

        sendChat('player|'+playerid, message);
    },

    selectCharacterActivity = function(playerid, characters, activity) {
        var message = ''; // "Selected activity <strong>'" + activity + "'</strong>";

        if(characters.length > 0) {
            characters.forEach(function(item, index) {
                setActivityAttribute(item.id, activity);
                message += createTemplateHtml(
                    createCharacterNameHtml( getCharacterName(item) )
                    +
                    createTemplateHeaderHtml(
                        createTemplateHeaderHtml("Activity"
                        +
                        createTemplateSubHeaderHtml(activity)
                        )
                    )
                )

            });
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

    createCharacterActivityLinks = function(character) {
        var content = '<div style="width: 100%; display: block">'
        partition(activities, activities.length / 4).forEach(function(column, index) {
            content += '<ul style="float: left; margin-right: 20px; display: inline-block; *display: inline; zoom: 1">';
            column.forEach(function(item) {
                content += '<li style="font-size: 0.9em"><strong><a href="!charactivity ' + character + ' ' + item.short + '">' 
                + item.short + '</a></strong>: <em>' + item.name + '</em></li>';
             });
             content += '</ul>';
        })
        content += '</div>'
        content += '<div style="clear:both"></div>'
        return content
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
        
        var content = []
        currentActivities.forEach(function(item, index) {
            var description = getActivityDescription(item.name);
            if(description == undefined) {
                description = item.name;
            }
            content.push( 
                createTitleHtml(
                    createNameHtml(item.charactername + ' - ' + item.name)
                )
                +
                createTraitsRowHtml(
                    // ['exploration'].map(trait => createTraitHtml(trait)).join(' ')
                    getTraitsForActivity(item.name).map(trait => createTraitHtml(trait)).join(' ')
                )
                + createDescriptionRowHtml(description)
                + createCharacterActivityLinks(item.charactername)
            );
        });

        var notes = createBackdropHtml(
            createDisplayHtml(
                content.join('<br />')
                + '<br />'
                + createHelpMessage()
            )
        );
        
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
