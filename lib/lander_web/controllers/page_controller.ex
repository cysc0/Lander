defmodule LanderWeb.PageController do
    use LanderWeb, :controller
    
    def index(conn, _params) do
      render conn, "index.html"
    end
  end
  