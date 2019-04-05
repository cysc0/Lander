defmodule LanderWeb.Plugs.RequireAuth do
  import Plug.Conn

  def init(args), do: args

  def call(conn, _args) do
    token = get_req_header(conn, "x-auth")
    # general structure of auth from Nat Tuck:
    #   https://github.com/NatTuck/husky_shop_spa/tree/1901-redux-done
    case Phoenix.Token.verify(LanderWeb.Endpoint, "user_id", token, max_age: 86400) do
      {:ok, user_id} ->
        assign(conn, :current_user, LanderWeb.Users.get_user!(user_id))
      {:error, err} ->
        conn
        |> put_resp_header("content-type", "application/json; charset=UTF-8")
        |> send_resp(:unprocessable_entity, Jason.encode!(%{"error" => err}))
        |> halt()
    end
  end
end
