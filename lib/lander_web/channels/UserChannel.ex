defmodule LanderWeb.UserChannel do
  use LanderWeb, :channel

  alias Lander.Games.Game
  alias Lander.Games.Games
  alias Lander.Courses.Courses

  def join("user:" <> name, payload, socket) do
    # IO.inspect(payload)

    if authorized?(payload) do
      socket =
        socket
        |> assign(:name, name)

      {:ok, %{"join" => name}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @doc """
  Ticks the ship, updating position and velocity if there's a key press

  ship: {
    "dx": fl,
    "dy": fl,
    "x", fl,
    "y", fl
  }

  keymap: {
    "w", bool,
    "a", bool,
    "s", bool,
    "d", bool
  }
  """
  def handle_in("tick", %{"ship" => ship, "keymap" => keymap, "level" => level}, socket) do
    if Game.did_collide(ship, level) do
      {:reply, {:ok, %{:ship => ship}}, socket}
    else
      newShip =
        ship
        |> Game.handle_vertical(keymap)
        |> Game.handle_horizontal(keymap)
        |> Game.move(level)

      {:reply, {:ok, %{:ship => newShip}}, socket}
    end
  end

  def handle_in("get_course", %{"id" => course_id}, socket) do
    course =
      Courses.get_path_from_id(course_id)
      |> Game.extend_over(1000)
      |> Game.normalize_between(25, 200)


    {:reply, {:ok, %{:level => course}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
