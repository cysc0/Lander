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

  def handle_vertical(ship, %{"s" => s, "w" => w}) when w == s do
    ship
  end

  def handle_vertical(ship, %{"s" => true}) do
    ship
    |> Map.put("dy", ship["dy"] + 0.1)
  end

  def handle_vertical(ship, %{"w" => true}) do
    ship
    |> Map.put("dy", ship["dy"] - 0.1)
  end

  def handle_horizontal(ship, %{"a" => a, "d" => d}) when a == d do
    ship
  end

  def handle_horizontal(ship, %{"a" => true}) do
    ship
    |> Map.put("dx", ship["dx"] - 0.1)
  end

  def handle_horizontal(ship, %{"d" => true}) do
    ship
    |> Map.put("dx", ship["dx"] + 0.1)
  end

  def move(ship) do
    ship
    |> Map.put("x", ship["x"] + ship["dx"])
    |> Map.put("y", ship["y"] + ship["dy"])
  end

end
