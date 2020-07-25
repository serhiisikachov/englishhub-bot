const Markup = require('telegraf/markup');
const moment = require('moment');
require('moment/locale/uk');
moment.locale('uk');
const {GraphVertex} = require('../../../data-structures');

module.exports = Timeslot;

class Timeslot extends GraphVertex {
    constructor(value) {
        super(value);
        this.db = value.firestore;
    }

    async render(ctx) {
        this._initPagination(ctx);

        let slotButtons = await this._getSlotButtons(ctx);

        return ctx.reply(
            ctx.session.quote.teacher.name,
            Markup.inlineKeyboard(slotButtons, {columns: 2}).extra()
        );
    }

    async handle(ctx) {
        switch (ctx.match[1]) {
            case '<':
                await this._handlePagLeft(ctx);
                break;
            case '>':
                await this._handlePagRight(ctx);
                break;
            default:
                await this._hanldeTimeslot(ctx);
        }
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);

        return this.db.collection('locations').doc(ctx.session.quote.location.selected).collection('timeslots').doc(ctx.match[1]).get().then((timeslot) => {
            ctx.session.quote[this.getKey()] = {"id": timeslot.id, "dateTime": timeslot.data().dateTime};
        });
    }

    isFullfilled(ctx) {
        return ctx.session.quote[this.getKey()];
    }

    cleanUp(ctx) {
        ctx.session.quote[this.getKey()] = null;
    }

    getKey() {
        return 'timeslot';
    }

    _initPagination(ctx) {
        let limit = 10;
        let offset = 0;

        ctx.session.pag = ctx.session.pag || {};
        ctx.session.pag.timeslot = {
            'limit': limit,
            'offset': offset
        };

        return ctx.session.pag;
    }

    async _getBookedSlots(ctx) {
        let bookedSlots = [];
        let bookingRef = this.db.collection('locations').doc(ctx.session.quote.location.selected).collection('bookings');

        await bookingRef
            .where('teacher', '==', ctx.session.quote.teacher.name)
            .get().then((bookings) => {
                bookings.forEach((booking) => {
                    bookedSlots.push(booking.data().datetime);
                });
            });


        return bookedSlots;
    }

    async _getTotal() {
        let total = 0;

        await timeslotRef.select().stream()
            .on('data', (snap) => {
                ++total;
            });

        return total;
    }

    async _getSlotButtons(ctx) {
        let total = await this._getTotal();
        let teacherId = ctx.session.quote.teacher.id;

        let slotButtons = [];
        let timeslotRef = this.db.collection('locations').doc(ctx.session.quote.location.selected).collection('timeslots');
        let bookedSlots = await this._getBookedSlots(ctx);

        let timeslots = await timeslotRef
                .where('teacher', '==', teacherId)
                .limit(limit)
                .offset(offset)
                .orderBy('dateTime')
                .get();

        timeslots.forEach((timeslot) => {
            if (bookedSlots.includes(timeslot.data().dateTime)) {
                return;
            }

            let dateTime = moment(Date.parse(timeslot.data().dateTime.toString()));
            let buttonText = `${dateTime.format('DD.MM.YYYY')} ${dateTime.format('LT')}`;
            console.log(moment(Date.parse(timeslot.data().dateTime.toString())).format('L'));
            if (slotButtons[slotButtons.length - 1] && slotButtons[slotButtons.length - 1].length === 1) {
                slotButtons[slotButtons.length - 1].push(Markup.callbackButton(buttonText, 'timeslot:' + timeslot.id));
                return;
            }

            slotButtons.push([Markup.callbackButton(buttonText, 'timeslot:' + timeslot.id)]);
        });

        if (total > limit) {
            let back = offset - limit;
            let forth = offset + limit;

            if (back < 0) {
                back = total - (total % limit);
            }

            if (forth > total) {
                forth = 0;
            }

            slotButtons.push([Markup.callbackButton("<", `timeslot:<`), Markup.callbackButton(">", `timeslot:>`)]);

        }

        return slotButtons;
    }

    async _handlePagLeft(ctx) {
        let total = await this._getTotal();
        let back = ctx.session.pag.timeslot.offset - ctx.session.pag.timeslot.limit;
        if (back < 0) {
            back = total - (total % limit);
        }
    }
}

// if (!total) {
//     return ctx.reply(
//         "Вільних таймслотів поки що немає, спробуй пізніше 🙏");
// }



// if (editMessage) {
//     ctx.answerCbQuery('', false);
//     return ctx.editMessageReplyMarkup(Markup.inlineKeyboard(slotButtons, {columns: 2}))
// }
//        ctx.deleteMessage();
