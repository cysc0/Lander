defmodule LanderWeb.CourseView do
  use LanderWeb, :view
  alias LanderWeb.CourseView

  alias Lander.Games.Games

  def render("index.json", %{courses: courses}) do
    %{data: render_many(courses, CourseView, "course.json")}
  end

  def render("show.json", %{course: course}) do
    %{data: render_one(course, CourseView, "course.json")}
  end

  def render("course.json", %{course: course}) do
    %{id: course.id,
      name: course.name,
      path: course.path}
  end

  def render("scores_index.json", %{courses: courses}) do
    %{data: render_many(courses, CourseView, "score.json")}
  end

  def render("score.json", %{course: course}) do
  hiScore = Games.best_game_on_course(course.id)
    %{id: course.id,
      name: course.name,
      path: course.path,
      hiScore: %{score: hiScore.score,  user: hiScore.user.email}}
  end
end
