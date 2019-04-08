defmodule LanderWeb.UserView do
  use LanderWeb, :view
  alias LanderWeb.UserView

  alias Lander.Users
  alias Lander.Games.Games

  def render("index.json", %{users: users}) do
    %{data: render_many(users, UserView, "user.json")}
  end

  def render("show.json", %{user: user}) do
    %{data: render_one(user, UserView, "user.json")}
  end

  def render("user.json", %{user: user}) do
    %{id: user.id,
      admin: user.admin,
      email: user.email}
  end

  def render("scores_index.json", %{users: users}) do
    %{data: render_many(users, UserView, "score.json")}
  end

  def render("score.json", %{user: user}) do
    hiScore = Games.best_game_by_user(user.id)
    if hiScore == nil do
      %{id: user.id,
        admin: user.admin,
        email: user.email,
        hiscore: nil}
    else
      %{id: user.id,
        admin: user.admin,
        email: user.email,
        hiscore: %{course: hiScore.course.name, score: hiScore.score}}
    end
  end
end
