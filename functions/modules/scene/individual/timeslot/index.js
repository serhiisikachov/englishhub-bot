const Markup = require('telegraf/markup');
const moment = require('moment');

class Timeslot {
    constructor(firebase) {
        this.db = firebase;
        this.timeslotRef = this.db.collection('locations').doc('kharkiv').collection('timeslots');
    }

    renderByTeacher(ctx, offset = 0, editMessage = false) {
        let teacherId = ctx.session.teacher.id;
        let limit = 10;
        let total = 0;

        this.timeslotRef.select().stream()
            .on('data', (snap) => {
                ++total;
            })
            .on("end", () => {
                this.timeslotRef
                    .where('teacher', '==', teacherId)
                    .limit(limit)
                    .offset(offset)
                    .orderBy('dateTime')
                    .get().then((timelots) => {
                    let slotButtons = [];

                    timelots.forEach((timeslot) => {
                        let buttonText = timeslot.data().dateTime.toString();//moment(timeslot.data().dateTime.toString()).format('LLL');
                        if (slotButtons[slotButtons.length - 1] && slotButtons[slotButtons.length - 1].length === 1) {
                            slotButtons[slotButtons.length - 1].push(Markup.callbackButton(buttonText, 'timeslot:' + timeslot.id));
                            return;
                        }

                        slotButtons.push([Markup.callbackButton(buttonText, 'timeslot:' + timeslot.id)]);
                    });

                    let back = offset - limit;
                    let forth = offset + limit;

                    if (back < 0) {
                        back = total - (total % limit);
                    }

                    if (forth > total) {
                        forth = 0;
                    }

                    slotButtons.push([Markup.callbackButton("<", `teacher-pag: ${back}`), Markup.callbackButton(">", `teacher-pag: ${forth}`)]);
                    if (editMessage) {
                        ctx.answerCbQuery('', false);
                        return ctx.editMessageReplyMarkup(Markup.inlineKeyboard(slotButtons, {columns: 2}))
                    }
                    ctx.deleteMessage();
                    return ctx.reply(
                        "Обирай слот",
                        Markup.inlineKeyboard(slotButtons, {columns: 2}).extra()
                    );
                }).catch((error) => {
                    console.log(error)
                });
            });
    }

    renderByDate(ctx) {

    }

    handle(ctx, next) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        this.timeslotRef.doc(ctx.match[1]).get().then((timeslot)=>{
            ctx.session.timeslot = {"id": timeslot.id, "dateTime": timeslot.data().dateTime};
            next(ctx);
        });

    }
}

module.exports = Timeslot;
