defmodule Lander.Repo do
    use Ecto.Repo,
      otp_app: :lander,
      adapter: Ecto.Adapters.Postgres
  end
  