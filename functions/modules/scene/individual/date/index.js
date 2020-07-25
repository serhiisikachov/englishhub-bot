const Markup = require('telegraf/markup');
const moment = require('moment');
require('moment/locale/uk');
moment.locale('uk');
const {Graph, GraphVertex, GraphEdge} = require('../../../data-structures');

class Date extends GraphVertex {
    constructor(value) {
        super(value);
        this.db = value.firestore;
    }

    async render(ctx) {
        let teacherId = ctx.session.quote.teacher.id;
        let limit = 10;
        let offset = 0;
        let editMessage = false;
        let total = 0;
        let timeslotRef = this.db.collection('locations').doc(ctx.session.quote.location.selected).collection('timeslots');
        let bookingRef = this.db.collection('locations').doc(ctx.session.quote.location.selected).collection('bookings');

        let bookings = await bookingRef
            .where('teacher', '==', ctx.session.quote.teacher.name)
            .get();

        let bookedSlots = [];
        bookings.forEach((booking) => {
            bookedSlots.push(booking.data().datetime);
        });
        timeslotRef.select().stream()
            .on('data', (snap) => {
                ++total;
            })
            .on("end", () => {
                timeslotRef
                    .where('teacher', '==', teacherId)
                    .limit(limit)
                    .offset(offset)
                    .orderBy('dateTime')
                    .get().then((timeslots) => {
                    let slotButtons = [];

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

                        slotButtons.push([Markup.callbackButton("<", `teacher-pag: ${back}`), Markup.callbackButton(">", `teacher-pag: ${forth}`)]);

                    }
                    if (editMessage) {
                        ctx.answerCbQuery('', false);
                        return ctx.editMessageReplyMarkup(Markup.inlineKeyboard(slotButtons, {columns: 2}))
                    }
                    ctx.deleteMessage();
                    return ctx.reply(
                        ctx.session.quote.teacher.name,
                        Markup.inlineKeyboard(slotButtons, {columns: 2}).extra()
                    );
                }).catch((error) => {
                    console.log(error)
                });
            });
    }

    handle(ctx) {
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
}

module.exports = Timeslot;
