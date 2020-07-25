const db = require('../../db').init();

module.exports = () => {
    return (ctx, next) => {
        let id = ctx.from.id;
        let firstName = ctx.from.first_name;
        let lastName = ctx.from.last_name;
        let username = ctx.from.username;

        //todo: move students inside location (Not sure it is needed)
        let studentRef = db.collection('students');
        let student = {firstName: firstName || '', lastName: lastName || '', username: username || ''};
        db.collection('students').where('id', '==', id).get().then((students) => {
            ctx.session.quote.student = student;
            if (students.docs.length) {
                students.forEach((student) => {
                    student.ref.update(ctx.session.quote.student);
                });

                return next();
            }
            studentRef.add(student);

            return next();
        });
    };
};
