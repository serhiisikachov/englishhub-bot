const Markup = require('telegraf/markup');

class Booking {
    constructor(firebase) {
        this.db = firebase;
    }

    renderConfirmation(ctx) {
        this.db.collection('timeslots').doc(ctx.session.timeslot.id).get().then((timeslot) => {
            console.log(timeslot.data());
            ctx.deleteMessage();
            return ctx.reply(`Перевір ще раз:
            
Локація:      ${ctx.session.location}
Вчитель:      ${ctx.session.teacher.name}
Дата та час: ${timeslot.data().dateTime}
            `,
                Markup.inlineKeyboard([Markup.callbackButton('Так, усе вірно!🔥', 'booking:' + 'yes')]).extra()
            );
        });

    }

    create(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        ctx.deleteMessage();
        ctx.scene.leave();
        //studentRef.add({id: id, firstName:firstName, lastName: lastName, username: username});
    }
}

module.exports = Booking;
