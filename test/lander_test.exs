defmodule LanderTest do
  use ExUnit.Case
  doctest Lander

  test "greets the world" do
    assert Lander.hello() == :world
  end
end
