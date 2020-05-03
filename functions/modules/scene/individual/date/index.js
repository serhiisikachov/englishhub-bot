const Markup = require('telegraf/markup');

class Teacher {
    constructor(firebase) {
        this.db = firebase;
        this.timeslotRef = this.db.collection('locations').doc('kharkiv').collection('timeslots');
    }

    render(ctx) {
        let date = new Date(ctx.match[1]);

        this.timeslotRef.orderBy('dateTime').get().then((timeslots) => {
            let timeslotButtons = [];
            let uniqueDates = [];

            timeslots.forEach((timeslot) => {
                let timeslotDate = new Date(timeslot.data().dateTime);
                let date = `${timeslotDate.getFullYear()}-${timeslotDate.getMonth()}-${timeslotDate.getDate()}`;
                if (!uniqueDates.includes(date)) {
                    uniqueDates.push(date);
                }
            });

            uniqueDates.forEach((date) => {
                timeslotButtons.push(Markup.callbackButton(date, date));
            });

            ctx.deleteMessage();
            return ctx.reply(
                "Обирай дату",
                Markup.inlineKeyboard(timeslotButtons, {columns: 1}).extra()
            );
        }).catch((error) => {console.log(error)});
    }

    handle(ctx, next) {
        this.teacherRef.doc(ctx.match).get().then((teacher)=>{
            ctx.session.teacher = {"id": teacher.id, "name": teacher.data().name};
            next(ctx);
        });

    }
}

module.exports = Teacher;
