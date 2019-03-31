defmodule Lander.Games.Game do
  use Ecto.Schema
  import Ecto.Changeset

  schema "games" do
    field :score, :float
    belongs_to :user, Lander.Users.User
    belongs_to :course, Lander.Courses.Course

    timestamps()
  end

  @doc false
  def changeset(game, attrs) do
    game
    |> cast(attrs, [:score])
    |> validate_required([:score])
  end
end
