const Markup = require('telegraf/markup');

class Location {
    constructor(firestore) {
        this.db = firestore;
        this.locationRef = this.db.collection('locations');
    }

    //render
    //handle
    //isFullfilled
    //cleanUp
    //requireInput
    //getKey
    render(ctx) {
        this.locationRef.get().then((locations) => {
            let buttons = [];
            locations.forEach(
                location => buttons.push(
                    Markup.callbackButton(location.data().name === 'kharkiv' ? 'Харків' : 'Львів', 'location:' + location.data().name)
                )
            );

            ctx.deleteMessage().then(() => {
                ctx.reply(
                    "У якому місті будеш навчатися?",
                    Markup.inlineKeyboard(buttons).extra()
                );
            });

        }).catch((error) => {
            console.log(error)
        });
    }

    handle(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        ctx.session.quote.location = ctx.match[1];
    }

    isFullfilled(ctx) {
        return ctx.session.quote.location;
    }

    cleanUp(ctx) {
        ctx.session.quote.location = null;
    }

    requireInput() {
        return true;
    }

    getKey() {
        return 'locations';
    }
}

module.exports = Location;
