defmodule LanderWeb.GameView do
  use LanderWeb, :view
  alias LanderWeb.GameView

  def render("index.json", %{games: games}) do
    %{data: render_many(games, GameView, "game.json")}
  end

  def render("show.json", %{game: game}) do
    %{data: render_one(game, GameView, "game.json")}
  end

  def render("game.json", %{game: game}) do
    %{id: game.id,
      score: game.score,
      course_id: game.course_id,
      course_name: game.course.name,
      user_id: game.user_id,
      user_email: game.user.email}
  end
end
