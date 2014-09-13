class TodoSerializer < ActiveModel::Serializer
	attributes :id, :title, :description, :client_id, :client_rev

end