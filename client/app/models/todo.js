export default Ep.Model.extend({
	typeKey: 'todo',
	title: Ep.attr('string'),
	description: Ep.attr('string'),
	user: Ep.belongsTo('user')
});
