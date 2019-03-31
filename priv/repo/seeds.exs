alias Lander.Repo
alias Lander.Users.User
alias Lander.Games.Game
alias Lander.Courses.Course

user1 = %User{email: "kim@dot.com", admin: true, password_hash: Argon2.hash_pwd_salt("password")}
course1 = %Course{path: [%{x: 0, y: 0}, %{x: 1, y: 4}, %{x: 2, y: 2}, %{x: 3, y: 8}, %{x: 4, y: 0},
                         %{x: 5, y: 2}, %{x: 6, y: 4}, %{x: 7, y: 10}, %{x: 8, y: 12}, %{x: 9, y: 8}]}
game1 = %Game{score: 30.2, user: user1, course: course1}
Repo.insert!(game1)