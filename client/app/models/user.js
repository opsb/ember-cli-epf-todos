import User from 'todos/stubs/user';
import Todo from 'todos/stubs/todo';

export default User.reopen({
	typeKey: 'user',
	name: Ep.attr('string'),
	todos: Ep.hasMany('todo', {embedded: true})
});
