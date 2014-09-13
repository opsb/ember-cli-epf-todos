class TodosController < ApplicationController
	def index
		render json: Todo.all
	end

	def create
		todo = Todo.new(create_todo_params)

		if todo.save
			render json: todo
		else
			raise "not implemented"
		end
	end

	def create_todo_params
		params.require(:todo).permit(:title, :description, :client_id, :client_rev)
	end
end