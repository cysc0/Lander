defmodule Lander.Users.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :admin, :boolean, default: false
    field :email, :string
    field :password_hash, :string
    has_many :games, Lander.Games.Game

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:admin, :password_hash, :email])
    |> validate_required([:admin, :password_hash, :email])
  end
end
