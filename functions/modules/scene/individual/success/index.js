const {GraphVertex} = require('../../../data-structures');
const GoogleSheetExport = require('../../../google-sheet');
const moment = require('moment');
require('moment/locale/uk');
moment.locale('uk');

class Success extends GraphVertex {
    constructor(value) {
        super(value);

        this.googleSheetExport = new GoogleSheetExport();
        this.db = value.firestore;
    }

    render(ctx) {
        let dateTime = moment(Date.parse(ctx.session.quote.timeslot.dateTime.toString()));
        ctx.deleteMessage();
        ctx.reply(`Поздоровляю з реєстрацією!👻 Вже чекаю на тебе🧘
            
Локація:      ${ctx.session.quote.location.selected === "kharkiv" ? "Харків" : 'Львів'}
Вчитель:      ${ctx.session.quote.teacher.name}
Дата та час: ${dateTime.format('LL')} ${dateTime.format('LT')}
            `);

        let exportRow = [
            ctx.session.quote.student.firstName,
            ctx.session.quote.student.lastName,
            ctx.session.quote.student.username,
            '',
            `${dateTime.format('LL')} ${dateTime.format('LT')}`,
            ctx.session.quote.teacher.name
        ];
        this.googleSheetExport.exportNewBooking(exportRow)
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

    getKey() {
        return 'success';
    }
}

module.exports = Success;
