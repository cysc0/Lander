defmodule Lander.Repo.Migrations.CreateCourses do
  use Ecto.Migration

  def change do
    create table(:courses) do
      add :name, :string
      add :path, {:array, :map}

      timestamps()
    end

  end
end
