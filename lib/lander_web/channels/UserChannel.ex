defmodule LanderWeb.UserChannel do
  use LanderWeb, :channel

  alias Lander.BackupAgent
  alias Lander.Games.Game
  alias Lander.Games.Games
  alias Lander.Courses.Courses
  alias Lander.BackupAgent

  def join("user:" <> name, payload, socket) do
    if authorized?(payload) do
      socket =
        socket
        |> assign(:name, name)

      {:ok, %{"join" => name}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def reply(socket) do
    view =
      %{:ship => ship, :particles => particles, :status => status, :fuel => fuel, :score => score} =
      socket.assigns

    BackupAgent.put(socket.assigns[:name], socket.assigns)
    {:reply, {:ok, view}, socket}
  end

  def handle_game_end(socket, %{:left => left, :right => right}) when left or right do
    socket =
      socket
      |> assign(:status, "crashed")
      |> assign(:particles, Game.add_explosion(socket.assigns[:particles], socket.assigns[:ship]))

    reply(socket)
  end

  def handle_game_end(socket, _collsion_matrix) do
    ship = socket.assigns[:ship]
    particles = socket.assigns[:particles]

    {new_status, new_particles} =
      if abs(ship["dy"]) > 0.3 || abs(ship["dx"]) > 0.3 do
        {"crashed", Game.add_explosion(particles, ship)}
      else
        {"landed", particles}
      end

    socket =
      socket
      |> assign(:status, new_status)
      |> assign(:particles, new_particles)

    reply(socket)
  end

  @doc """
  Ticks the ship, updating position and velocity if there's a key press

  ship: {
    "dx": fl,
    "dy": fl,
    "x", fl,
    "y", fl
  }

  Get fro
  keymap: {
    "w", bool,
    "a", bool,
    "s", bool,
    "d", bool
  }
  """
  def handle_in("tick", %{"keymap" => keymap}, socket) do
    %{:ship => ship, :level => level, :status => status, :fuel => fuel} =
      BackupAgent.get(socket.assigns[:name])

    collision_matrix = Game.did_collide(ship, level)
    did_collide = collision_matrix.right || collision_matrix.bottom || collision_matrix.left

    case {status, did_collide} do
      {"playing", true} ->
        handle_game_end(socket, collision_matrix)

      {"playing", false} ->
        new_ship =
          socket.assigns[:ship]
          |> Game.handle_vertical(keymap, fuel)
          |> Game.handle_horizontal(keymap)
          |> Game.move(level)

        new_particles =
          socket.assigns[:particles]
          |> Game.generate_particles(keymap, ship, fuel)
          |> Game.move_particles()

        new_fuel =
          if keymap["w"] do
            max(fuel - 1, 0)
          else
            fuel
          end

        socket =
          socket
          |> assign(:ship, new_ship)
          |> assign(:particles, new_particles)
          |> assign(:fuel, new_fuel)

        reply(socket)

      ## any other game status
      {_, _} ->
        new_particles =
          socket.assigns[:particles]
          |> Game.move_particles()

        socket =
          socket
          |> assign(:particles, new_particles)

        reply(socket)
    end
  end

  def new_ship do
    %{
      "x" => 250,
      "y" => 450,
      "dx" => 2,
      "dy" => 0,
      "angle" => 90
    }
  end

  def handle_in("get_course", %{"id" => course_id}, socket) do
    course =
      Courses.get_path_from_id(course_id)
      |> Game.extend_over(1000)
      |> Game.normalize_between(25, 200)

    socket =
      socket
      |> assign(:level, course)
      |> assign(:ship, new_ship)
      |> assign(:particles, [])
      |> assign(:status, "playing")
      |> assign(:fuel, 1000)
      |> assign(:score, -1)

    IO.inspect(socket)
    BackupAgent.put(socket.assigns[:name], socket.assigns)
    {:reply, {:ok, %{:level => course}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
