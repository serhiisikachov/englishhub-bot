const Markup = require('telegraf/markup');
const {Graph, GraphVertex, GraphEdge} = require('../../../data-structures');
const moment = require('moment');
require('moment/locale/uk');
moment.locale('uk');

class Success extends GraphVertex {
    constructor(value) {
        super(value);

        this.db = value.firestore;
    }

    render(ctx) {
        let dateTime = moment(Date.parse(ctx.session.quote.timeslot.dateTime.toString()));
        ctx.deleteMessage();
        return ctx.reply(`Поздоровляю з реєстрацією!👻 Вже чекаю на тебе🧘
            
Локація:      ${ctx.session.quote.location.selected === "kharkiv" ? "Харків" : 'Львів'}
Вчитель:      ${ctx.session.quote.teacher.name}
Дата та час: ${dateTime.format('LL')} ${dateTime.format('LT')}
            `)
    }

    handle(ctx) {
        return null;

    }

    isFullfilled(ctx) {
        return true;
    }

    cleanUp(ctx) {
        ctx.session.quote[this.getKey()] = null;
    }

    requireInput() {
        return true;
    }

    getKey() {
        return 'success';
    }
}

module.exports = Success;
