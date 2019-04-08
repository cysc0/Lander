defmodule LanderWeb.UserChannel do
  use LanderWeb, :channel

  alias Lander.BackupAgent
  alias Lander.Games.Game
  alias Lander.Games.Games
  alias Lander.Courses.Courses
  alias Lander.BackupAgent
  alias Lander.Users
  alias Lander.Users.User

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
      %{
        :ship => ship,
        :particles => particles,
        :status => status,
        :fuel => fuel,
        :score => score,
        :level => level
      } = socket.assigns

    BackupAgent.put(socket.assigns[:name], socket.assigns)
    {:reply, {:ok, view}, socket}
  end

  def reply_spectator(socket) do
    view =
      %{
        :ship => ship,
        :particles => particles,
        :status => status,
        :fuel => fuel,
        :score => score,
        :level => level
      } = BackupAgent.get(socket.assigns[:name])

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
    level = socket.assigns[:level]

    {new_status, new_particles} =
      if abs(ship["dy"]) > 0.3 || abs(ship["dx"]) > 0.3 || Game.uneven_terrain(level, ship["x"]) ||
           abs(90 - ship["angle"]) > 5 do
        {"crashed", Game.add_explosion(particles, ship)}
      else
        {"landed", particles}
      end

    score =
      if new_status == "crashed" do
        0.0
      else
        max(1500 - socket.assigns[:ticks] + 5 * ship["dy"] + 5 * socket.assigns[:fuel], 0)
      end

    course = Courses.get_course!(socket.assigns[:course_id])
    user = Users.get_user!(socket.assigns[:user_id])

    Games.insert_score(%Game{
      :course_id => course.id,
      :user_id => user.id,
      :score => score
    })

    socket =
      socket
      |> assign(:status, new_status)
      |> assign(:particles, new_particles)
      |> assign(:score, score)

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

    role = socket.assigns[:role]

    collision_matrix = Game.did_collide(ship, level)
    did_collide = collision_matrix.right || collision_matrix.bottom || collision_matrix.left

    case {status, did_collide, role} do
      {_, _, "spectator"} ->
        reply_spectator(socket)

      {_, _, "none"} ->
        reply_spectator(socket)

      {"playing", true, _} ->
        handle_game_end(socket, collision_matrix)

      {"playing", false, _} ->
        new_ship =
          socket.assigns[:ship]
          |> Game.handle_vertical(keymap, fuel)
          |> Game.handle_horizontal(keymap)
          |> Game.move(level)

        new_particles =
          socket.assigns[:particles]
          |> Game.generate_particles(keymap, ship, fuel)
          |> Game.move_particles()

        new_ticks = socket.assigns[:ticks] + 1

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
          |> assign(:level, level)
          |> assign(:ticks, new_ticks)

        reply(socket)

      ## any other game status
      {_, _, _} ->
        new_particles =
          socket.assigns[:particles]
          |> Game.move_particles()

        socket =
          socket
          |> assign(:particles, new_particles)

        reply(socket)
    end
  end

  def handle_in("destroy", %{"x" => x}, socket) do
    game = BackupAgent.get(socket.assigns[:name])
    role = socket.assigns[:role]

    case role do
      "spectator" ->
        level =
          game.level
          |> Enum.with_index()
          |> Enum.map(fn {y, idx} ->
            if idx > x - 10 and idx < x + 10 do
              y = max(y - 10, 0)
            else
              y
            end
          end)

        game =
          game
          |> Map.put(:level, level)

        BackupAgent.put(socket.assigns[:name], game)
        reply_spectator(socket)

      _ ->
        reply_spectator(socket)
    end
  end

  def new_ship do
    %{
      "x" => 250,
      "y" => 450,
      "dx" => 1.2,
      "dy" => 0,
      "angle" => 90
    }
  end

  def handle_in("get_course", %{"id" => course_id, "session" => session}, socket) do
    {status, user_id} =
      Phoenix.Token.verify(LanderWeb.Endpoint, "user_id", session["token"], max_age: 86400)

    socket_name = socket.assigns[:name]

    case {Users.get_user(user_id), BackupAgent.get(socket_name)} do
      {%User{:email => ^socket_name}, _} ->
        course =
          Courses.get_path_from_id(course_id)
          |> Game.all_positive
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
          |> assign(:session, session)
          |> assign(:role, "player")
          |> assign(:ticks, 0)
          |> assign(:course_id, course_id)
          |> assign(:user_id, user_id)

        BackupAgent.put(socket.assigns[:name], socket.assigns)
        reply(socket)

      {session, nil} ->
        {:reply, {:error, %{}}, socket}

      {session, game} ->
        spectator_status =
          if session == nil do
            "none"
          else
            "spectator"
          end

        socket =
          socket
          |> assign(:level, game.level)
          |> assign(:ship, game.ship)
          |> assign(:particles, game.particles)
          |> assign(:status, game.status)
          |> assign(:fuel, game.fuel)
          |> assign(:score, game.score)
          |> assign(:session, session)
          |> assign(:role, spectator_status)

        reply_spectator(socket)
    end
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
