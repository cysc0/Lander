import React from 'react';
import ReactDOM from 'react-dom';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import _ from 'lodash';
import $ from 'jquery';
import { Provider } from 'react-redux';

import MapContainer from './map';

export default function root_init(node) {
  ReactDOM.render(<Root/>, node);
}

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_form: {email: "", password: "", newUser: false},
      signup_form: {email: "", password: "", newUser: true},
      session: null,
      users: this.fetchUsers(),
      courses: this.fetchCourses()
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
            <SignupForm session={this.state.session} root={this}/>
          } />
          <Route path="/users" exact={true} render={() =>
            <Users users={this.state.users} root={this}/>
          } />
          <Route path="/courses" exact={true} render={() =>
            <Courses courses={this.state.courses} root={this}/>
          } />
          <Route path="/courses/create" exact={true} render={() =>
            <NewCourse root={this}/>
          } />
        </div>
      </Router>
    </div>;
  }
}

///////////////////////////////////// HEADER /////////////////////////////////////

function Header(props) {
  // Header setup borrowed from Nat Tuck: https://github.com/NatTuck/husky_shop_spa
  let {root, session} = props;
  let session_info;
  let nav_bar;
  if (session == null) {
    session_info = <div className="form-inline">
      <input type="email" placeholder="email" onKeyDown={(ev) => root.enter_login(ev)}
             onChange={(ev) => root.update_login_form({email: ev.target.value})} />
      <input type="password" placeholder="password" onKeyDown={(ev) => root.enter_login(ev)}
             onChange={(ev) => root.update_login_form({password: ev.target.value})} />
      <button className="btn btn-sm btn-secondary" onClick={() => root.login()}>Login</button>
    </div>;
    nav_bar = <div className="col-4">
    <p>
      <Link to={"/users"} onClick={(ev) => root.fetchUsers()}>Users</Link>&nbsp;|&nbsp;
      <Link to={"/courses"} onClick={(ev) => root.fetchCourses()}>Courses</Link>
    </p>
  </div>;
  }
  else {
    session_info = <div>
      <p>Hello, {session.user_email}</p>
      <Link to="/" className="btn btn-sm btn-secondary" onClick={() => root.logout()}>Logout</Link>
    </div>
    nav_bar = <div className="col-4">
    <p>
      <Link to={"/users"} onClick={(ev) => root.fetchUsers()}>Users</Link>
    </p>
  </div>;
  }

  if (session == null) {
  return <div className="row">
    <div className="col-4">
      <Link to={"/"}><h1 id="pagetitle">Lander</h1></Link>
    </div>
      {nav_bar}
    <div className="col-4">
      {session_info}
    </div>
  </div>;
  } else {
    return <div>
      <div className="row">
        <div className="col-4">
          <Link to={"/"}><h1 id="pagetitle">Lander</h1></Link>
        </div>
        {nav_bar}
        <div className="col-4">
          {session_info}
        </div>
      </div>
      <div className="row">
      </div>
    </div>;
  }
}

////////////////////////////////// LOGIN/LOGOUT //////////////////////////////////

function SignupForm(props) {
  let {root, session} = props;
  return  <div className="card text-center">
            <div className="card-header">
              Sign Up
            </div>
            <div className="card-body">
              <input type="email" placeholder="email" onKeyDown={(ev) => root.enter_signup(ev)}
                onChange={(ev) => root.update_signup_form({email: ev.target.value})} />
              <input type="password" placeholder="password" onKeyDown={(ev) => root.enter_signup(ev)}
                onChange={(ev) => root.update_signup_form({password: ev.target.value})} />
            </div>
            <div className="card-footer text-muted">
              <Link to={"/mytasks"} className="btn btn-primary btn-block" onClick={() => root.signup()}>Go!</Link>
            </div>
          </div>
}

///////////////////////////////////// USERS //////////////////////////////////////

function Users(props) {
  let rows = _.map(props.users, (user) => <User key={user.id} user={user} />);
  return <div className="row">
    <div className="col-12">
      <table className="table table-striped table-bordered">
        <thead className="thead thead-dark">
          <tr>
            <th>Email</th>
            <th>Administrator</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  </div>;
}

function User(props) {
  let {user} = props;
  let targetUrl = window.location.href + "/" + user.email;
  return <tr>
    <td><a href={targetUrl}>{user.email}</a></td>
    <td>{user.admin ? "👍" : "👎"}</td>
  </tr>;
}

//////////////////////////////////// COURSES /////////////////////////////////////

function Courses(props) {
  let courses = _.map(props.courses, (c) => <Course key={c.id} course={c} root={props.root}/>);
  return <div>
    <div className="row">
      {courses}
    </div>
    <div className="row">
      <Link to={"/courses/create"} id="newcourse" className="btn btn-primary btn-block">New Course</Link>
    </div>
  </div>
}

function Course(props) {
  return props.course.name;
}

function NewCourse(props) {
  return <MapContainer></MapContainer>;
}