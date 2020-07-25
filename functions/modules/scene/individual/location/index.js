const Markup = require('telegraf/markup');
const {Graph, GraphVertex, GraphEdge} = require('../../../data-structures');

module.exports = Location;

class Location extends GraphVertex {
    constructor(value) {
        super(value);

        this.db = value.firestore;
        this.locationRef = this.db.collection('locations');
    }

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
                ).then((msg) => ctx.scene.state.messages.push(msg.message_id));
            });

        }).catch((error) => {
            console.log(error)
        });
    }

    handle(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        ctx.session.quote[this.getKey()] = {
            "selected": ctx.match[1]
        };

    }

    isFullfilled(ctx) {
        return ctx.session.quote[this.getKey()];
    }

    cleanUp(ctx) {
        ctx.session.quote[this.getKey()] = null;
    }

    getKey() {
        return 'location';
    }
}
