const Markup = require('telegraf/markup');

class Location {
    constructor(firestore) {
        this.db = firestore;
        this.locationRef = this.db.collection('locations');
    }

    render(ctx) {
        this.locationRef.get().then((locations) => {
            let buttons = [];
            locations.forEach(
                location =>  buttons.push(
                    Markup.callbackButton(location.data().name === 'kharkiv'? 'Харків' : 'Львів', 'location:' + location.data().name)
                )
            );

            ctx.deleteMessage().then(()=>{
                ctx.reply(
                    "У якому місті будеш навчатися?",
                    Markup.inlineKeyboard(buttons).extra()
                );
            });

        }).catch((error) => {console.log(error)});
    }

    handle(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        ctx.session.location = ctx.match[1];
        console.log(ctx.session);
    }
}

module.exports = Location;
