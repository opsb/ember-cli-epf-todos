import Todo from 'todos/stubs/todo';
import User from 'todos/stubs/user';

export default Todo.reopen({
	typeKey: 'todo',
	title: Ep.attr('string'),
	description: Ep.attr('string'),
	user: Ep.belongsTo('user', {embedded: true})
});
