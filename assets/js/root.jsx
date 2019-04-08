import React from 'react';
import ReactDOM from 'react-dom';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import _ from 'lodash';
import $ from 'jquery';
import { Provider } from 'react-redux';

import MapContainer from './map';
import socket from './socket';
import Lander from './lander'

export default function root_init(node) {
  let secret_api_maps = window.secret_api_maps;
  ReactDOM.render(<Root maps_api={secret_api_maps} />, node);
}

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_form: { email: "", password: "", newUser: false },
      signup_form: { email: "", password: "", newUser: true },
      session: null,
      users: this.fetchUsers(),
      courses: this.fetchCourses(),
      scores: [],
      maps_api_key: props.maps_api
    };
  };



  //////////////////////////////////// REQESTS /////////////////////////////////////

  fetchUsers() {
    $.ajax("/api/v1/users", {
      method: "get",
      contentType: "application/json; charset=UTF-8",
      success: (resp) => {
        let state1 = _.assign({}, this.state, { users: resp.data });
        this.setState(state1);
      }
    });
  };

  fetchCourses() {
    $.ajax("/api/v1/courses", {
      method: "get",
      contentType: "application/json; charset=UTF-8",
      success: (resp) => {
        let state1 = _.assign({}, this.state, { courses: resp.data });
        this.setState(state1);
      }
    });
  };

  fetchMyScores() {
    $.ajax("/api/v1/games", {
      method: "get",
      contentType: "application/json; charset=UTF-8",
      // data: JSON.stringify(this.state.session.user_id),
      data: ({id: 1}),
      success: (resp) => {
        let state1 = _.assign({}, this.state, { scores: resp.data });
        this.setState(state1);
      }
    });
  };

  ////////////////////////////////// LOGIN/LOGOUT //////////////////////////////////

  logout() {
    this.state.session = null;
    this.setState(this.state);
  }

  login() {
    $.ajax("/api/v1/auth", {
      method: "post",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(this.state.login_form),
      success: (resp) => {
        let state1 = _.assign({}, this.state, { session: resp.data });
        this.setState(state1);
        // window.location.href = "courses"
      }
    });
  };

  // enable login via pressing enter while textbox is focused
  enter_login(ev) {
    if (ev.keyCode == 13) { // keycode for enter key
      this.login();
    }
  }

  update_login_form(data) {
    let form1 = _.assign({}, this.state.login_form, data);
    let state1 = _.assign({}, this.state, { login_form: form1 });
    this.setState(state1);
  };

  signup() {
    $.ajax("/api/v1/auth", {
      method: "post",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(this.state.signup_form),
      success: (resp) => {
        let state1 = _.assign({}, this.state, { session: resp.data });
        this.setState(state1);
      }
    });
  };

  // enable login via pressing enter while textbox is focused
  enter_signup(ev) {
    if (ev.keyCode == 13) { // keycode for enter key
      this.signup();
    }
  }

  update_signup_form(data) {
    let form1 = _.assign({}, this.state.signup_form, data);
    let state1 = _.assign({}, this.state, { signup_form: form1 });
    this.setState(state1);
  };

  ////////////////////////////////////// ROOT //////////////////////////////////////

  render() {
    return <div>
      <Router>
        <div>
          <Header session={this.state.session} root={this} />
          <div className="row">&nbsp;</div>
          <Route path="/" exact={true} render={() =>
            <SignupForm session={this.state.session} root={this} />
          } />
          <Route path="/users" exact={true} render={() =>
            <Users users={this.state.users} root={this} />
          } />
          <Route path="/courses" exact={true} render={() =>
            <Courses courses={this.state.courses} root={this} />
          } />
          <Route path="/courses/create" exact={true} render={() =>
            <NewCourse root={this} secret_api_maps={this.state.maps_api_key} />
          } />
          <Route path="/play/:id" exact={true} render={(props) =>
            <Lander {...props} socket={socket} session={this.state.session} />
          } />
          <Route path="/myscores" exact={true} render={(props) =>
            <Scores session={this.state.session} root={this} />
          } />
        </div>
      </Router>
    </div>;
  }
}

///////////////////////////////////// HEADER /////////////////////////////////////

function Header(props) {
  // Header setup borrowed from Nat Tuck: https://github.com/NatTuck/husky_shop_spa
  let { root, session } = props;
  let session_info;
  let nav_bar;
  if (session == null) {
    session_info = <div className="form-inline">
      <table>
        <tbody>
          <tr>
            <td>
              <input type="email" placeholder="email" onKeyDown={(ev) => root.enter_login(ev)}
                className="sessionInfo sessionText" onChange={(ev) => root.update_login_form({ email: ev.target.value })} />
              <input type="password" placeholder="password" onKeyDown={(ev) => root.enter_login(ev)}
                className="sessionInfo sessionText" onChange={(ev) => root.update_login_form({ password: ev.target.value })} />
            </td>
            <td>
              <button className="btn btn-sm btn-secondary btn-block sessionInfo sessionGo" onClick={() => root.login()}>Login</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>;
    nav_bar = <div className="col-4" id="navLinks">
      <p>
        <Link to={"/users"} onClick={(ev) => root.fetchUsers()}>Users</Link>&nbsp;|&nbsp;
        <Link to={"/courses"} onClick={(ev) => root.fetchCourses()}>Courses</Link>&nbsp;|&nbsp;
        <Link to={"/myscores"} onClick={(ev) => root.fetchMyScores()}>My Scores</Link>
      </p>
    </div>;
  }
  else {
    session_info = <div>
      <table>
        <tbody>
          <tr>
            <td>
              <p className="sessionInfo sessionGreeting sessionText">Hello, {session.user_id}</p>
            </td>
            <td id="sessionLogOut">
              <Link to="/" className="btn btn-sm btn-secondary btn-block sessionInfo" onClick={() => root.logout()}>Logout</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    nav_bar = <div className="col-4" id="navLinks">
      <p>
        <Link to={"/users"} onClick={(ev) => root.fetchUsers()}>Users</Link>&nbsp;|&nbsp;
        <Link to={"/courses"} onClick={(ev) => root.fetchCourses()}>Courses</Link>&nbsp;|&nbsp;
        <Link to={"/myscores"} onClick={(ev) => root.fetchCourses()}>My Scores</Link>
      </p>
    </div>;
  }

  if (session == null) {
    return <div className="row">
      <div className="col-4" id="pageTitle">
        <Link to={"/"}><h1>Lander</h1></Link>
      </div>
      {nav_bar}
      <div className="col-4" id="sessionTable">
        {session_info}
      </div>
    </div>;
  } else {
    return <div>
      <div className="row">
        <div className="col-4" id="pageTitle">
          <Link to={"/"}><h1>Lander</h1></Link>
        </div>
        {nav_bar}
        <div className="col-4" id="sessionTable">
          {session_info}
        </div>
      </div>
    </div>;
  }
}

////////////////////////////////// LOGIN/LOGOUT //////////////////////////////////

function SignupForm(props) {
  let { root, session } = props;
  return <div className="card text-center">
    <div className="card-header">
      Sign Up
            </div>
    <div className="card-body">
      <input type="email" placeholder="email" onKeyDown={(ev) => root.enter_signup(ev)}
        onChange={(ev) => root.update_signup_form({ email: ev.target.value })} />
      <input type="password" placeholder="password" onKeyDown={(ev) => root.enter_signup(ev)}
        onChange={(ev) => root.update_signup_form({ password: ev.target.value })} />
    </div>
    <div className="card-footer text-muted">
      <Link to={"/mytasks"} className="btn btn-primary btn-block" onClick={() => root.signup()}>Go!</Link>
    </div>
  </div>
}

///////////////////////////////////// USERS //////////////////////////////////////

function Users(props) {
  let users = _.map(props.users, (user) => <User key={user.id} user={user} />);
  return <div>
    <div className="card-columns">
      {users}
    </div>
  </div>;
}

function User(props) {
  let { user } = props;
  let targetUrl = window.location.href + "/" + user.email;
  return <div className="card user-card">
    <div className="card-body">
      <h5 className="card-title">{user.email}</h5>
      {/* <p className="card-text">TODO: some text here? Maybe hi scores?</p> */}
    </div>
    <div className="card-footer">
      {/* <a href={targetUrl} className="btn btn-success btn-block btn-sm">TODO: spectate link</a> */}
    </div>
  </div>;
}

//////////////////////////////////// COURSES /////////////////////////////////////

function Courses(props) {
  let courses = _.map(props.courses, (c) => <Course key={c.id} course={c} root={props.root} />);
  return <div>
    <div className="card-columns">
      {courses}
    </div>
    <div className="row">
      <Link to={"/courses/create"} id="newcourse" className="btn btn-info btn-block">New Course</Link>
    </div>
  </div>;
}

function Course(props) {
  return <div className="card course-card">
    <div className="card-body">
      <h5 className="card-title">{props.course.name}</h5>
      {/* <p className="card-text">TODO: some text here? Maybe hi scores?</p> */}
    </div>
    <div className="card-footer">
      <Link to={`/play/${props.course.id}`} id="playcourse" className="btn btn-success btn-block btn-sm">Play</Link>
    </div>
  </div>;
}

function NewCourse(props) {
  return <div>
    <MapContainer secret_api_maps={props.secret_api_maps}></MapContainer>
  </div>;
}

///////////////////////////////////// SCORES /////////////////////////////////////

function Scores(props) {
  let {root, session} = props;
  let scores_values = root.state.scores;
  let scores = _.map(scores_values, (s) => <Score key={s.id} score={s.score} course={s.course_id} coursename={s.course_name} user={s.user_id} root={root} />)
  return <div>
    <div className="card-columns">
      {scores}
    </div>
  </div>;
}

function Score(props) {
  return <div className="card">
    <div className="card-body">
      <h5 className="card-title">{props.coursename}</h5>
      <p className="card-text">Score: {props.score}</p>
    </div>
    <div className="card-footer">
      <Link to={`/play/${props.course}`} id="playcourse" className="btn btn-success btn-block btn-sm">Play</Link>
    </div>
  </div>;
}