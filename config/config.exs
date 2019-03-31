# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

config :lander, Lander.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "lander_repo",
  username: "user",
  password: "pass",
  hostname: "localhost"


# General application configuration
config :lander,
  ecto_repos: [Lander.Repo]

# Configures the endpoint
config :lander, LanderWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "ec7ahe0xeipah9As0vahrieWaoh4shah3xohW7duoxoh2oomahshieshahjeisha",
  render_errors: [view: LanderWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Lander.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix and Ecto
config :phoenix, :json_library, Jason
config :ecto, :json_library, Jason


# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
