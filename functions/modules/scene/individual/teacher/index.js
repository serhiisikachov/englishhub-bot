const Markup = require('telegraf/markup');

class Teacher {
    constructor(firebase) {
        this.db = firebase;
        this.teacherRef = this.db.collection('locations').doc('kharkiv').collection('teachers');
    }

    render(ctx) {
        this.teacherRef.get().then((teachers) => {
            let teacherButtons = [];

            teachers.forEach((teacher) => {
               teacherButtons.push(Markup.callbackButton(teacher.data().name, `teacher:` + teacher.id))
            });

            ctx.deleteMessage();
            return ctx.reply(
                "Обирай вчителя",
                Markup.inlineKeyboard(teacherButtons, {columns: 2}).extra()
            );
        }).catch((error) => {console.log(error)});
    }

    async handle(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        return this.teacherRef.doc(ctx.match[1]).get().then((teacher)=>{
            console.log('finally');
            ctx.session.quote.teacher = {"id": teacher.id, "name": teacher.data().name};
        });
    }

    isFullfilled(ctx) {
        return ctx.session.quote.teacher;
    }

    cleanUp(ctx) {
        ctx.session.quote.teacher = null;
    }

    requireInput() {
        return true;
    }

    getKey() {
        return 'teacher';
    }
}

module.exports = Teacher;
