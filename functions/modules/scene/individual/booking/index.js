const Markup = require('telegraf/markup');
const {Graph, GraphVertex, GraphEdge} = require('../../../data-structures');
const moment = require('moment');
require('moment/locale/uk');
moment.locale('uk');


class Booking extends GraphVertex{
    constructor(value) {
        super(value);
        this.db = value.firestore;
    }

    render(ctx) {
        let dateTime = moment(Date.parse(ctx.session.quote.timeslot.dateTime.toString()));
        // this.db.collection('timeslots').doc(ctx.session.timeslot.id).get().then((timeslot) => {
        //     ctx.deleteMessage();
        ctx.deleteMessage();
            return ctx.reply(`Перевір ще раз:
            
Локація:      ${ctx.session.quote.location.selected === "kharkiv" ? "Харків" : 'Львів'}
Вчитель:      ${ctx.session.quote.teacher.name}
Дата та час: ${dateTime.format('LL')} ${dateTime.format('LT')}
            `,
                Markup.inlineKeyboard([Markup.callbackButton('Так, усе вірно!🔥', 'booking:' + 'yes')]).extra()
            );
        // });

    }

    handle(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        this.db.collection('locations').doc(ctx.session.quote.location.selected).collection('bookings').add(
            {
                'teacher': ctx.session.quote.teacher.name,
                'datetime': ctx.session.quote.timeslot.dateTime,
                'firstname': ctx.session.quote.student.firstName,
                'lastname': ctx.session.quote.student.lastName,
                'username': ctx.session.quote.student.username
            }
        );
        ctx.scene.leave();
        //studentRef.add({id: id, firstName:firstName, lastName: lastName, username: username});
    }

    isFullfilled(ctx) {
        return ctx.session.quote[this.getKey()];
    }

    cleanUp(ctx) {
        ctx.session.quote[this.getKey()] = null;
    }

    requireInput() {
        return true;
    }

    getKey() {
        return 'booking';
    }
}

module.exports = Booking;
