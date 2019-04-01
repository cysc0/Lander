defmodule LanderWeb.CourseView do
  use LanderWeb, :view
  alias LanderWeb.CourseView

  def render("index.json", %{courses: courses}) do
    %{data: render_many(courses, CourseView, "course.json")}
  end

  def render("show.json", %{course: course}) do
    %{data: render_one(course, CourseView, "course.json")}
  end

  def render("course.json", %{course: course}) do
    %{id: course.id,
      path: course.path,
      name: course.name}
  end
end
