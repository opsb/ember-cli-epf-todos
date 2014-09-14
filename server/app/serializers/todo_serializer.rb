class TodoSerializer < ActiveModel::Serializer
	embed :ids, include: true
	attributes :id, :title, :description, :client_id, :client_rev
	has_one :user
end