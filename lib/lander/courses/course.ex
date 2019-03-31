defmodule Lander.Courses.Course do
  use Ecto.Schema
  import Ecto.Changeset

  schema "courses" do
    field :path, {:array, :map}

    timestamps()
  end

  @doc false
  def changeset(course, attrs) do
    course
    |> cast(attrs, [:path])
    |> validate_required([:path])
  end
end
