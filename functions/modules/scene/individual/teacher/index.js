const Markup = require('telegraf/markup');
const {Graph, GraphVertex, GraphEdge} = require('../../../data-structures');

class Teacher extends GraphVertex {
    constructor(value) {
        super(value);
        this.db = value.firestore;
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

    handle(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
        return this.teacherRef.doc(ctx.match[1]).get().then((teacher)=>{
            ctx.session.quote[this.getKey()] = {"id": teacher.id, "name": teacher.data().name};
        });
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
        return 'teacher';
    }
}

module.exports = Teacher;
