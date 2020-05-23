const Markup = require('telegraf/markup');

class Teacher {
    constructor(value) {
        this.db = value.firestore;
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

    handle(ctx) {
        ctx.session.quote.date = true;
        ctx.scene.state.stepHistory.push(this.getKey());
    }


    isFullfilled(ctx) {
        return ctx.session.quote.date;
    }

    cleanUp(ctx) {
        ctx.session.quote.date = null;
    }

    requireInput() {
        return true;
    }

    getKey() {
        return 'date';
    }
}

module.exports = Teacher;
