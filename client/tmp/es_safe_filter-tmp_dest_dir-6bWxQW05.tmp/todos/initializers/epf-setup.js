var Adapter = Ep.ActiveModelAdapter.extend({
	host: "http://localhost:3000"
});

export default {
  name: 'epf-setup',
  before: 'epf.container',
  initialize: function(container) {
    container.register('adapter:application', Adapter);
    window.container = container;
  }
};

