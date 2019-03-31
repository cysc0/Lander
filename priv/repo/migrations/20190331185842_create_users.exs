defmodule Lander.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :admin, :boolean, default: false, null: false
      add :password_hash, :string, null: false
      add :email, :string, null: false

      timestamps()
    end

  end
end
