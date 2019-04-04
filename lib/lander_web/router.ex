defmodule LanderWeb.Router do
    use LanderWeb, :router
    
    pipeline :browser do
      plug :accepts, ["html"]
      plug :fetch_session
      plug :fetch_flash
      plug :protect_from_forgery
      plug :put_secure_browser_headers
    end
    
    pipeline :api do
      plug :accepts, ["json"]
    end
    
    scope "/", LanderWeb do
      pipe_through :browser # Use the default browser stack
      
      get "/", PageController, :index
      get "/users", PageController, :index
      get "/users/*user", UserController, :show
      get "/courses", PageController, :index
      get "/courses/create", PageController, :index
    end
    
    # Other scopes may use custom stacks.
    scope "/api/v1", LanderWeb do
      pipe_through :api

      resources "/users", UserController, except: [:new, :edit]
      resources "/courses", CourseController
      post "/auth", AuthController, :authenticate
    end
  end