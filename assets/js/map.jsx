// Used https://scotch.io/tutorials/react-apps-with-the-google-maps-api-and-google-maps-react
// as a guide to set up the wrapper for the google maps api (google-maps-react)

import React from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import _ from 'lodash';


// Some of this setup is a little weird, mainly because the contexts from the
// API wrapper and our components were intererfing. TODO: cleanup if time permits
class MapContainer extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    path: [],
    validPath: false,
    course_name: ""
  };

  onMarkerClick (props, marker, e) {
    let root = props.root;
    root.state.path.push([e.latLng.lat(), e.latLng.lng()]);
    if (root.state.path.length >= 2) {
      root.state.validPath = true;
    }
    root.setState(root.state);
  }

  postCourse(path) {
    let courseTitle = $("#courseTitle")[0].value;
    if (courseTitle == "" ) {
      alert("Enter a course title")
    } else {
      $.ajax("/api/v1/courses", {
        method: "post",
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify({course: 
                              {path: path,
                              name: courseTitle}
                              }),
        success: (resp) => {
          window.location.pathname = "/courses"
        }
      });
    }
  }

  getButton (root) {
    if (root.state.validPath) {
      return <div className="row" id="mapConfirm">
              <div className="col-8">
                <input type="text" id="courseTitle" placeholder="Enter a course title"></input>
              </div>
              <div className="col-4">
                <button className="btn btn-primary btn-sm btn-block" onClick={() => root.postCourse(root.state.path)}>Go!</button>
              </div>
            </div>
    } else {
      return <div className="row" id="mapConfirm">
              <div className="col-8">
                <input type="text" id="courseTitle" placeholder="Enter a course title"></input>
              </div>
              <div className="col-4">
                <button className="btn btn-primary btn-sm disabled btn-block">Go!</button>
              </div>
            </div>
    }
  }

  render() {
    let button = this.getButton(this)
    return (
      <div id="mapContainer">
        <div id="map" className="row">
          <Map
          google={this.props.google}
          zoom={14}
          root={this}
          onClick={this.onMarkerClick}
          initialCenter={{
            lat: 42.339634,
            lng: -431.090572
          }}
          />
        </div>
          {button}
      </div>
      );
    }
  }
  
  export default GoogleApiWrapper({
    apiKey: secret_api_maps
  })(MapContainer);
