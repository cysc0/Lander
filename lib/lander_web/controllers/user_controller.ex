defmodule LanderWeb.UserController do
  use LanderWeb, :controller

  alias Lander.Users
  alias Lander.Users.User

  action_fallback LanderWeb.FallbackController

  def index(conn, _params) do
    users = Users.list_users()
    render(conn, "scores_index.json", users: users)
  end

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Users.create_user(user_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.user_path(conn, :show, user))
      |> render("show.json", user: user)
    end
  end

  def show(conn, %{"user" => user_email}) do
    user = Users.get_user_email(List.first(user_email))
    render(conn, "show.html", user: user)
  end

  def update(conn, %{"id" => id, "user" => user_params}) do
    user = Users.get_user!(id)

    with {:ok, %User{} = user} <- Users.update_user(user, user_params) do
      render(conn, "show.json", user: user)
    end
  end

  def delete(conn, %{"id" => id}) do
    user = Users.get_user!(id)

    with {:ok, %User{}} <- Users.delete_user(user) do
      send_resp(conn, :no_content, "")
    end
  end
end
