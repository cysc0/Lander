alias Lander.Repo
alias Lander.Users.User
alias Lander.Games.Game
alias Lander.Courses.Course

user1 = %User{email: "kim@dot.com", admin: true, password_hash: Argon2.hash_pwd_salt("password")}
course1 = %Course{name: "A Course",
                  path: [0.0, 2.0, 4.0, 5.0, 1.0, 3.0, 4.0, 5.0, 6.0, 3.0, 2.0, 5.0]}
game1 = %Game{score: 30.2, user: user1, course: course1}
Repo.insert!(game1)