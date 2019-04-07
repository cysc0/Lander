defmodule LanderWeb.AuthController do
  use LanderWeb, :controller

  alias Lander.Users
  alias Lander.Users.User

  action_fallback LanderWeb.FallbackController

  def authenticate(conn, %{"email" => email, "password" => password, "newUser" => newUser}) when newUser == false do
    IO.inspect(email)
    IO.inspect(password)
    IO.inspect(newUser)
    with {:ok, %User{} = user} <- Users.authenticate_user(email, password) do
      resp = %{
        data: %{
          token: Phoenix.Token.sign(LanderWeb.Endpoint, "user_id", user.id),
          user_id: user.id,
          email: user.email
        }
      }

      conn
      |> put_resp_header("content-type", "application/json; charset=UTF-8")
      |> send_resp(:created, Jason.encode!(resp))
    end
  end

  def authenticate(conn, %{"email" => email, "password" => password, "newUser" => newUser}) when newUser == true do
    IO.inspect(email)
    IO.inspect(password)
    IO.inspect(newUser)
    emailTaken = Users.get_user_by_email(email)
    IO.inspect(emailTaken)
    if emailTaken == nil do
      with {:ok, %User{} = user} <- Users.create_user(%{email: email, password_hash: Argon2.hash_pwd_salt(password)}) do
        IO.write("wtf")
        resp = %{
          data: %{
            token: Phoenix.Token.sign(LanderWeb.Endpoint, "user_id", user.id),
            user_id: user.id,
            email: user.email
          }
        }

        conn
        |> put_resp_header("content-type", "application/json; charset=UTF-8")
        |> send_resp(:created, Jason.encode!(resp))
      end
    else
      {:error, "invalid user-identifier"}
    end
  end
end
