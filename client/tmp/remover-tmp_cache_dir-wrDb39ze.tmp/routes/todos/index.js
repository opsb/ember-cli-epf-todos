import Todo from 'todos/models/todo';

export default Ember.Route.extend({
	model: function(){
		console.log('querying server');
		return this.session.query('todo');
	},

	actions: {
		addTodo: function(){
			var self = this;
			var todo = this.session.create('todo', this.get("controller").getProperties("title", "description"));

			self.get("controller.model").pushObject(todo);

			self.session.flush().then(null, function(){
				self.get("controller.model").removeObject(todo);				
			});
		}
	}
});