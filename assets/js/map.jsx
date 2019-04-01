// Used https://scotch.io/tutorials/react-apps-with-the-google-maps-api-and-google-maps-react
// as a guide to set up the wrapper for the google maps api (google-maps-react)

import React from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import _ from 'lodash';


// Some of this setup is a little weird, mainly because the contexts from the
// API wrapper and our components were intererfing. TODO: cleanup if time permits
class MapContainer extends React.Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    path: [],
    validPath: false
  };

  onMarkerClick (props, marker, e) {
    let root = props.root;
    root.state.path.push({lat: e.latLng.lat(), lng: e.latLng.lng()});
    if (root.state.path.length >= 2) {
      root.state.validPath = true;
    }
    root.setState(root.state);
  }

  postCourse(path) {
    $.ajax("/api/v1/courses", {
      method: "post",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify({course: path}),
      success: (resp) => {
        // TODO: redirect to users play page for this course
      }
    });
  }

  getButton (root) {
    if (root.state.validPath) {
      return <button className="btn btn-primary btn-block" onClick={() => root.postCourse(root.state.path)}>Go!</button>
    } else {
      return <button className="btn btn-primary disabled btn-block">Go!</button>
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
        <div className="row" id="mapConfirm">
          {button}
        </div>
      </div>
      );
    }
  }
  
  export default GoogleApiWrapper({
    apiKey: ''
  })(MapContainer);
