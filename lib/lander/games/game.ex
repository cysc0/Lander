defmodule Lander.Games.Game do
  use Ecto.Schema
  import Ecto.Changeset

  schema "games" do
    field(:score, :float)
    belongs_to(:user, Lander.Users.User)
    belongs_to(:course, Lander.Courses.Course)

    timestamps()
  end

  @doc false
  def changeset(game, attrs) do
    game
    |> cast(attrs, [:score])
    |> validate_required([:score])
  end

  def random_course do
  end

  def gravity do
    -0.000
  end

  def ship_width do
    16
  end

  def handle_vertical(ship, %{"s" => s, "w" => w}) when w == s do
    ship
  end

  def handle_vertical(ship, %{"s" => true}) do
    ship
    |> Map.put("dy", ship["dy"] - :math.sin(ship["angle"] * :math.pi() / 180) * 0.1)
    |> Map.put("dx", ship["dx"] - :math.cos(ship["angle"] * :math.pi() / 180) * 0.1)
  end

  def handle_vertical(ship, %{"w" => true}) do
    ship
    |> Map.put("dy", ship["dy"] + :math.sin(ship["angle"] * :math.pi() / 180) * 0.1)
    |> Map.put("dx", ship["dx"] + :math.cos(ship["angle"] * :math.pi() / 180) * 0.1)
  end

  def handle_horizontal(ship, %{"a" => a, "d" => d}) when a == d do
    ship
  end

  def handle_horizontal(ship, %{"a" => true}) do
    if ship["angle"] < 180 do
      ship
      |> Map.put("angle", ship["angle"] + 2)
    else
      ship
    end
  end

  def handle_horizontal(ship, %{"d" => true}) do
    if ship["angle"] > 0 do
      ship
      |> Map.put("angle", ship["angle"] - 2)
    else
      ship
    end
  end

  def move(ship, level) do
    ship
    |> Map.put("x", ship["x"] + ship["dx"])
    |> Map.put("y", ship["y"] + ship["dy"])
    |> Map.put("dy", ship["dy"] + gravity)
  end

  def extend_over(level, new_len) do
    old_len = Enum.count(level)
    # IO.puts("Here!!!")
    # IO.inspect(level)

    Enum.map(0..(new_len - 1), fn i ->
      index_in_old = i / (new_len - 1) * (old_len - 1)
      pct_of_fl = :math.ceil(index_in_old) - index_in_old
      pct_of_cl = 1 - pct_of_fl
      floor_avg = Enum.at(level, trunc(:math.floor(index_in_old))) * pct_of_fl
      ceil_avg = Enum.at(level, trunc(:math.ceil(index_in_old))) * pct_of_cl
      floor_avg + ceil_avg
    end)
  end

  def normalize_between(level, min, max) do
    width = max - min
    max_height = Enum.max(level)
    min_height = Enum.min(level)
    cond do
      max_height < max && min_height > min ->
        level
      max_height + min_height < max ->
        level
        |> Enum.map(fn x -> x + min end)
      true ->
        Enum.map(level, fn x ->
          (x - min_height) / (max_height - min_height) * width + min
        end)
    end
  end

  def tr(adjusted) do
    degrees = 45 - (90 - adjusted)
    degrees * :math.pi() / 180
  end

  def tl_(adjusted) do
    degrees = 135 - (90 - adjusted)
    degrees * :math.pi() / 180
  end

  def bl(adjusted) do
    degrees = 225 - (90 - adjusted)
    degrees * :math.pi() / 180
  end

  def br(adjusted) do
    degrees = 315 - (90 - adjusted)
    degrees * :math.pi() / 180
  end

  @doc """
  1. Consider the square ship, we want to find the bottom and two side lines of the ship, and along the y = ax + b
       line, see if the course goes above or at that line. If it does, we hit collision
  2. Now to get this line, we need to get all four corners of the ship
  3. Since an upright ship is considered "90 degrees" we need to draw a circle around the square ship so that
      it touches all of the points. The radius of this square can be found with the pyth. thm. and comes to
      sqrt(s^2 + s^2)
  4. That circle touches all four points. Remembering that our upright ship is at 90 degrees, that means that the angles
      of those points are as follows:
            a. the top right point is at a 45 deg. angle
            b. the top left point is at a 135 deg. angle
            c. the botom left point is at a 225 deg. angle
            d. the bottom right is at a 315 deg. angle
  5. NOTE: all of these angles have to be adjusted by (shipRotation - 90) degrees
      a. If we tild to the left by 45 degrees, our "top right" coordinate is at 0 degrees, or exactly where
          theta = 0 is. So we subtract the top left angle by (90 - 45) = 45, 45 - 45 = 0, and we get our answer
  6. Now that we have all our points, we find the eq. of the line using y = mx + b, where
        m' = (y1 - y2) / (x1 - x2)
        b' = y1 - (m' * x1)
  7. For all points x1..x2, we need to check that y(x1)..y(x2) is >= to the course(x1)..course(x2)

  And that's how you determine if a ship is even TOUCHING the ground
  """
  def did_collide(ship, level) do
    x = ship["x"]
    y = ship["y"]
    a = ship["angle"]
    # find angles
    # these are all in radians
    tr_r = tr(a)
    tl_r = tl_(a)
    bl_r = bl(a)
    br_r = br(a)
    # find radius
    r = :math.sqrt(ship_width * ship_width + ship_width * ship_width) / 2
    # now we need to find x, y. Add that result to the center x, y which is our "origin"
    tr_xy = %{:x => x + :math.cos(tr_r) * r, :y => y + :math.sin(tr_r) * r}
    tl_xy = %{:x => x + :math.cos(tl_r) * r, :y => y + :math.sin(tl_r) * r}
    bl_xy = %{:x => x + :math.cos(bl_r) * r, :y => y + :math.sin(bl_r) * r}
    br_xy = %{:x => x + :math.cos(br_r) * r, :y => y + :math.sin(br_r) * r}

    # now we gotta find the lines, if the x's are equal then we'll just set m=0 and b=9999999 (inf)
    #    to avoid / by zero err
    # line 1: top left to bottom left, or tl_xy -> bl_xy
    line1_collide =
      if abs(tl_xy.x - bl_xy.x) < 0.01 do
        false
      else
        line1m = (tl_xy.y - bl_xy.y) / (tl_xy.x - bl_xy.x)
        line1b = tl_xy.y - line1m * tl_xy.x

        Enum.any?(floor(tl_xy.x)..ceil(tl_xy.x), fn x ->
          Enum.at(level, x) > line1m * x + line1b
        end)
      end

    # line 2: bottom left to bottom right, or bl_xy -> br_xy
    line2_collide =
      if abs(bl_xy.x - br_xy.x) < 0.01 do
        false
      else
        line2m = (bl_xy.y - br_xy.y) / (bl_xy.x - br_xy.x)
        line2b = bl_xy.y - line2m * bl_xy.x

        Enum.any?(floor(bl_xy.x)..ceil(br_xy.x), fn x ->
          Enum.at(level, x) > line2m * x + line2b
        end)
      end

    # line 3: bottom right to top right, or br_xy -> tr_xy
    line3_collide =
      if abs(br_xy.x - tr_xy.x) < 0.01 do
        false
      else
        line3m = (br_xy.y - tr_xy.y) / (br_xy.x - tr_xy.x)
        line3b = br_xy.y - line3m * br_xy.x

        Enum.any?(floor(br_xy.x)..ceil(tr_xy.x), fn x ->
          Enum.at(level, x) > line3m * x + line3b
        end)
      end

    cond do
      line3_collide ->
        IO.puts("line 3 collide")

      line2_collide ->
        IO.puts("line 2 collide")

      line1_collide ->
        IO.puts("line 1 collide")

      true ->
        IO.puts("no collide")
    end

    line1_collide || line2_collide || line3_collide
  end
end
